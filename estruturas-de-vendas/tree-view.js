/*
  Estrutura de Vendas — visão Árvore.

  Isolado de index.html de propósito: a Tabela não depende de nada daqui.
  O index.html cria uma instância (BipperStructureTree.create) passando os
  dados e callbacks; este módulo cuida de:
    - render da "Árvore hierárquica em linhas" (cartões aninhados);
    - render dos Flows horizontal e vertical (layout próprio, conectores em
      SVG, navegação por arraste, destaque do caminho até a raiz);
    - estado próprio de expansão (independente da Tabela) e filtro de nível;
    - botões de expandir/recolher/restaurar;
    - drawer lateral de detalhes da estrutura.
    - zoom (popover, Ctrl + roda) e "ajustar para caber" dos Flows;
    - PDF e menu de três pontinhos (só simulados por enquanto).
*/
(function () {
  'use strict';

  var MODE_LABELS = {
    lines: 'árvore em linhas',
    'flow-h': 'flow horizontal',
    'flow-v': 'flow vertical'
  };

  var TREE_LEVEL_COLORS = ['#2563eb', '#00a7b5', '#db2777', '#7c3aed'];

  var LOD_ZOOM = 0.5;

  var ICONS = {
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>',
    person: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"></path></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.7 7-11.5A7 7 0 0 0 5 9.5C5 14.3 12 21 12 21Z"></path><circle cx="12" cy="9.5" r="2.5"></circle></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="5" r="2"></circle><circle cx="5" cy="19" r="2"></circle><circle cx="19" cy="19" r="2"></circle><path d="M12 7v4"></path><path d="M5 17v-2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"></path></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M8 12h8"></path></svg>',
    focus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path></svg>',
    panel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M15 3v18"></path></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg>'
  };

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function create(opts) {
    var host = opts.host;
    var levelColors = opts.levelColors || TREE_LEVEL_COLORS;
    var formatCode = opts.formatCode || function (value) { return value; };
    var NOT_INFORMED = 'Não informado';

    var state = { mode: 'lines', level: 0, collapsed: new Set(), anchor: null, resetScroll: false, zoom: 1, fitAfterRender: false };
    var hoverId = null;

    var searchState = { active: false, query: '', matchedIds: new Set() };

    var levelSelect = document.getElementById('structureLevelFilter');
    var toolButtons = {
      'expand-all': document.querySelector('[data-tree-action="expand-all"]'),
      'collapse-all': document.querySelector('[data-tree-action="collapse-all"]'),
      restore: document.querySelector('[data-tree-action="restore"]'),
      fit: document.querySelector('[data-tree-action="fit"]'),
      'fit-width': document.querySelector('[data-tree-action="fit-width"]'),
      zoom: document.querySelector('[data-tree-action="zoom"]'),
      'download-pdf': document.querySelector('[data-tree-action="download-pdf"]'),
      more: document.querySelector('[data-tree-action="more"]')
    };
    var zoomPop = document.querySelector('[data-tree-pop="zoom"]');
    var morePop = document.querySelector('[data-tree-pop="more"]');
    var zoomValue = zoomPop.querySelector('[data-zoom-value]');
    var zoomOut = zoomPop.querySelector('[data-zoom-step="-1"]');
    var zoomIn = zoomPop.querySelector('[data-zoom-step="1"]');
    var renderedDepth = -1;

    function roots() { return opts.getRoots(); }

    function flatten() {
      var flat = [];
      (function walk(nodes, level) {
        nodes.forEach(function (node) {
          flat.push({ node: node, level: level });
          if (node.children && node.children.length) walk(node.children, level + 1);
        });
      })(roots(), 0);
      return flat;
    }

    function maxDepth() {
      return flatten().reduce(function (max, item) { return Math.max(max, item.level + 1); }, 0);
    }

    function expandableIds() {
      return flatten().filter(function (item) {
        return item.node.children && item.node.children.length;
      }).map(function (item) { return item.node.id; });
    }

    function defaultCollapsed() {
      return new Set(expandableIds());
    }

    function countDescendants(node) {
      if (!node.children || !node.children.length) return 0;
      return node.children.reduce(function (sum, child) { return sum + 1 + countDescendants(child); }, 0);
    }

    function directChildrenCount(node) {
      return (node.children || []).length;
    }

    function computeVisible() {
      var visibleIds = new Set();
      var matched = [];
      flatten().forEach(function (item) {
        if (state.level && item.level + 1 > state.level) return;
        if (opts.matches(item.node)) matched.push(item.node);
      });
      matched.forEach(function (node) {
        var current = node.id;
        while (current && !visibleIds.has(current)) {
          visibleIds.add(current);
          current = opts.getParentId(current);
        }
      });
      return { visibleIds: visibleIds, matched: matched };
    }

    function reveal() {
      if (!opts.hasSearch()) return;
      var computed = computeVisible();
      var matchedIds = new Set(computed.matched.map(function (node) { return node.id; }));
      computed.visibleIds.forEach(function (id) {
        if (!matchedIds.has(id)) state.collapsed.delete(id);
      });
    }


    function badgeLabel(node, level) {
      return 'Nível ' + (level + 1) + ' · ' + (node.sap || node.tipoPosicao || 'Estrutura');
    }

    function subordinatesLabel(node) {
      var count = directChildrenCount(node);
      if (count) return count + (count === 1 ? ' subordinado direto' : ' subordinados diretos');
      return 'Último nível da ramificação';
    }

    function toggleMarkup(node, expanded, hasChildren) {
      if (!hasChildren) return '<span class="structure-toggle structure-toggle--leaf" aria-hidden="true"></span>';
      var label = (expanded ? 'Recolher ' : 'Expandir ') + node.description;
      return '<button type="button" class="structure-toggle" data-toggle="' + esc(node.id) + '" aria-expanded="' + expanded + '" aria-label="' + esc(label) + '">' + ICONS.chevron + '</button>';
    }

    function hl(text) {
      var value = String(text == null ? '' : text);
      var query = searchState.query;
      if (!query) return esc(value);
      var lower = value.toLowerCase();
      var needle = query.toLowerCase();
      var html = '';
      var cursor = 0;
      for (var index = lower.indexOf(needle); index > -1; index = lower.indexOf(needle, cursor)) {
        html += esc(value.slice(cursor, index)) + '<mark class="structure-hl">' + esc(value.slice(index, index + needle.length)) + '</mark>';
        cursor = index + needle.length;
      }
      return html + esc(value.slice(cursor));
    }

    function markClass(id) {
      if (!searchState.active) return '';
      return searchState.matchedIds.has(id) ? ' is-match' : ' is-ancestor';
    }

    function metaItem(icon, text, html) {
      if (!text) return '';
      return '<span class="structure-tree-card__meta-item">' + icon + '<span data-tip-full="' + esc(text) + '">' + (html || esc(text)) + '</span></span>';
    }

    function personItem(node) {
      if (node.responsavel) return metaItem(ICONS.person, node.responsavel, hl(node.responsavel));
      return '<span class="structure-tree-card__meta-item is-empty" role="img" aria-label="Sem responsável">' + ICONS.person + '<span aria-hidden="true">—</span></span>';
    }

    function cardHtml(node, level, hasChildren, expanded) {
      var color = levelColors[level % levelColors.length];
      var detalhes = node.detalhes || {};
      var statusClass = 'structure-status' + (node.ativo ? '' : ' structure-status--inactive');
      var local = [detalhes.municipio, node.pais].filter(Boolean).join(' · ');

      return (
        '<article class="structure-tree-card' + (node.ativo ? '' : ' is-inactive') + markClass(node.id) + '" data-id="' + esc(node.id) + '" data-has-children="' + hasChildren + '" style="--level-color:' + color + '">' +
        '<header class="structure-tree-card__top">' +
        toggleMarkup(node, expanded, hasChildren) +
        '<span class="structure-tree-card__badge"><span class="structure-tree-card__badge-dot"></span>' + esc(badgeLabel(node, level)) + '</span>' +
        '<span class="structure-tree-card__top-end">' +
        '<span class="' + statusClass + '"><span class="structure-status__dot"></span><span>' + (node.ativo ? 'Ativo' : 'Inativo') + '</span></span>' +
        '<span class="structure-tree-card__code">#' + esc(formatCode(node.id)) + '</span>' +
        '<span class="structure-tree-card__actions">' +
        '<button type="button" class="structure-row-action" data-detail="' + esc(node.id) + '" aria-label="Ver detalhes de ' + esc(node.description) + '">' + ICONS.info + '</button>' +
        '<button type="button" class="structure-row-action" data-edit="' + esc(node.id) + '" aria-label="Editar ' + esc(node.description) + '">' + ICONS.edit + '</button>' +
        '</span>' +
        '</span>' +
        '</header>' +
        '<div class="structure-tree-card__body">' +
        '<div class="structure-tree-card__col">' +
        '<button type="button" class="structure-tree-card__name" data-detail="' + esc(node.id) + '" data-tip="Ver detalhes">' + hl(node.description) + '</button>' +
        '<span class="structure-tree-card__sub">' + hl(formatCode(node.id)) + ' · ' + hl(node.tipoPosicao || NOT_INFORMED) + '</span>' +
        '</div>' +
        '<div class="structure-tree-card__col">' +
        personItem(node) +
        metaItem(ICONS.user, detalhes.usuario) +
        '</div>' +
        '<div class="structure-tree-card__col">' +
        metaItem(ICONS.pin, local) +
        metaItem(ICONS.users, subordinatesLabel(node)) +
        '</div>' +
        '<button type="button" class="structure-tree-card__details" data-detail="' + esc(node.id) + '" aria-label="Ver detalhes">' +
        ICONS.panel + '<span>Ver detalhes</span></button>' +
        '</div>' +
        '</article>'
      );
    }

    function nodeHtml(node, level, visibleIds) {
      var children = (node.children || []).filter(function (child) { return visibleIds.has(child.id); });
      var hasChildren = children.length > 0;
      var expanded = !state.collapsed.has(node.id);
      var childrenHtml = (hasChildren && expanded)
        ? '<div class="structure-tree-children">' + children.map(function (child) { return nodeHtml(child, level + 1, visibleIds); }).join('') + '</div>'
        : '';
      return '<div class="structure-tree-node">' + cardHtml(node, level, hasChildren, expanded) + childrenHtml + '</div>';
    }


    var FLOW = { cardW: 216, cardH: 148, levelGap: 64, siblingGap: 20, rootGap: 56, pad: 40 };

    var FLOW_HINT_HTML = '<div class="structure-flow-hint">Clique e arraste para mover · Use Ctrl + roda do mouse para zoom · Duplo clique no fundo para ajustar</div>';

    
    function layoutItems(list, level, visibleIds) {
      return list.map(function (node) {
        var visibleChildren = (node.children || []).filter(function (child) { return visibleIds.has(child.id); });
        var expanded = !state.collapsed.has(node.id);
        return {
          node: node,
          level: level,
          childCount: visibleChildren.length,
          expanded: expanded,
          children: expanded ? layoutItems(visibleChildren, level + 1, visibleIds) : []
        };
      });
    }

    function flowLayout(rootItems, horizontal) {
      var cross = horizontal ? FLOW.cardH : FLOW.cardW;
      var main = horizontal ? FLOW.cardW : FLOW.cardH;
      var placed = [];

      function childrenTotal(item) {
        return item.children.reduce(function (sum, child) { return sum + child.span; }, 0) + FLOW.siblingGap * (item.children.length - 1);
      }

      function measure(item) {
        item.children.forEach(measure);
        item.span = item.children.length ? Math.max(cross, childrenTotal(item)) : cross;
      }

      function place(item, start, depth) {
        placed.push(item);
        item.main = depth * (main + FLOW.levelGap);
        if (item.children.length) {
          var cursor = start + (item.span - childrenTotal(item)) / 2;
          item.children.forEach(function (child) {
            place(child, cursor, depth + 1);
            cursor += child.span + FLOW.siblingGap;
          });
          item.cross = (item.children[0].cross + item.children[item.children.length - 1].cross) / 2;
        } else {
          item.cross = start + (item.span - cross) / 2;
        }
        item.x = FLOW.pad + (horizontal ? item.main : item.cross);
        item.y = FLOW.pad + (horizontal ? item.cross : item.main);
      }

      var cursor = 0;
      rootItems.forEach(function (rootItem) {
        measure(rootItem);
        place(rootItem, cursor, 0);
        cursor += rootItem.span + FLOW.rootGap;
      });

      var crossTotal = cursor - FLOW.rootGap;
      var mainTotal = placed.reduce(function (max, item) { return Math.max(max, item.main + main); }, 0);
      return {
        items: placed,
        width: (horizontal ? mainTotal : crossTotal) + FLOW.pad * 2,
        height: (horizontal ? crossTotal : mainTotal) + FLOW.pad * 2
      };
    }

    function flowEdgesHtml(items, horizontal) {
      var html = '';
      items.forEach(function (parent) {
        parent.children.forEach(function (child) {
          var d;
          if (horizontal) {
            var px = parent.x + FLOW.cardW, py = parent.y + FLOW.cardH / 2;
            var cx = child.x, cy = child.y + FLOW.cardH / 2;
            var midX = px + FLOW.levelGap / 2;
            d = 'M' + px + ' ' + py + 'H' + midX + 'V' + cy + 'H' + cx;
          } else {
            var qx = parent.x + FLOW.cardW / 2, qy = parent.y + FLOW.cardH;
            var dx = child.x + FLOW.cardW / 2, dy = child.y;
            var midY = qy + FLOW.levelGap / 2;
            d = 'M' + qx + ' ' + qy + 'V' + midY + 'H' + dx + 'V' + dy;
          }
          html += '<path class="structure-flow__edge" data-edge="' + esc(child.node.id) + '" d="' + d + '"></path>';
        });
      });
      return html;
    }

    function flowCardHtml(item) {
      var node = item.node;
      var color = levelColors[item.level % levelColors.length];
      var detalhes = node.detalhes || {};
      var statusClass = 'structure-status' + (node.ativo ? '' : ' structure-status--inactive');
      var local = [detalhes.municipio, node.pais].filter(Boolean).join(' · ');
      var hasChildren = item.childCount > 0;
      var handleLabel = (item.expanded ? 'Recolher ' : 'Expandir ') + node.description;

      var handle = hasChildren
        ? '<button type="button" class="structure-flow-handle" data-toggle="' + esc(node.id) + '" aria-expanded="' + item.expanded + '" aria-label="' + esc(handleLabel) + '">' + ICONS.chevron + '<span>' + item.childCount + '</span></button>'
        : '';

      return (
        '<article class="structure-flow-card' + (node.ativo ? '' : ' is-inactive') + markClass(node.id) + '" data-flow-id="' + esc(node.id) + '" data-has-children="' + hasChildren + '" style="left:' + item.x + 'px;top:' + item.y + 'px;width:' + FLOW.cardW + 'px;height:' + FLOW.cardH + 'px;--level-color:' + color + '">' +
        '<header class="structure-flow-card__top">' +
        '<span class="structure-tree-card__badge"><span class="structure-tree-card__badge-dot"></span><span class="structure-flow-card__badge-text" data-tip-full="' + esc(badgeLabel(node, item.level)) + '">' + esc(badgeLabel(node, item.level)) + '</span></span>' +
        '<span class="structure-tree-card__code">#' + hl(formatCode(node.id)) + '</span>' +
        '</header>' +
        '<button type="button" class="structure-flow-card__name" data-detail="' + esc(node.id) + '" data-tip="Ver detalhes" data-tip-full="' + esc(node.description) + '">' + hl(node.description) + '</button>' +
        '<div class="structure-flow-card__meta">' +
        personItem(node) +
        metaItem(ICONS.pin, local) +
        '</div>' +
        '<footer class="structure-flow-card__foot">' +
        '<span class="' + statusClass + '"><span class="structure-status__dot"></span><span>' + (node.ativo ? 'Ativo' : 'Inativo') + '</span></span>' +
        '<span class="structure-tree-card__actions">' +
        '<button type="button" class="structure-row-action" data-detail="' + esc(node.id) + '" aria-label="Ver detalhes de ' + esc(node.description) + '">' + ICONS.info + '</button>' +
        '<span class="structure-row-action" data-inert aria-hidden="true">' + ICONS.focus + '</span>' +
        '<button type="button" class="structure-row-action" data-edit="' + esc(node.id) + '" aria-label="Editar ' + esc(node.description) + '">' + ICONS.edit + '</button>' +
        '</span>' +
        '</footer>' +
        handle +
        '</article>'
      );
    }

    function flowViewport() {
      return host.querySelector('[data-flow-viewport]');
    }

    function flowCardEl(id) {
      return host.querySelector('[data-flow-id="' + window.CSS.escape(String(id)) + '"]');
    }

    function captureAnchor(id) {
      var viewport = flowViewport();
      var card = viewport && flowCardEl(id);
      if (!card) return null;
      var cardRect = card.getBoundingClientRect();
      var viewportRect = viewport.getBoundingClientRect();
      return { id: id, left: cardRect.left - viewportRect.left, top: cardRect.top - viewportRect.top };
    }

    function renderFlow(visibleRoots, visibleIds) {
      var horizontal = state.mode === 'flow-h';
      var previous = flowViewport();
      var previousScroll = previous ? { left: previous.scrollLeft, top: previous.scrollTop } : null;

      var layout = flowLayout(layoutItems(visibleRoots, 0, visibleIds), horizontal);
      host.innerHTML =
        '<div class="structure-flow structure-flow--' + (horizontal ? 'h' : 'v') + '" data-flow-viewport>' +
        '<div class="structure-flow__pan"><div class="structure-flow__sizer"><div class="structure-flow__world" style="width:' + layout.width + 'px;height:' + layout.height + 'px">' +
        '<svg class="structure-flow__edges" width="' + layout.width + '" height="' + layout.height + '" aria-hidden="true">' + flowEdgesHtml(layout.items, horizontal) + '</svg>' +
        layout.items.map(flowCardHtml).join('') +
        '</div></div></div></div>' + FLOW_HINT_HTML;
      flowSize = { width: layout.width, height: layout.height };
      applyZoom();

      var viewport = flowViewport();
      applyPadding();
      var anchorCard = state.anchor && flowCardEl(state.anchor.id);
      if (state.resetScroll || (!previousScroll && !anchorCard)) {
        positionOrigin();
      } else if (anchorCard) {
        var cardRect = anchorCard.getBoundingClientRect();
        var viewportRect = viewport.getBoundingClientRect();
        viewport.scrollLeft += (cardRect.left - viewportRect.left) - state.anchor.left;
        viewport.scrollTop += (cardRect.top - viewportRect.top) - state.anchor.top;
      } else {
        viewport.scrollLeft = previousScroll.left;
        viewport.scrollTop = previousScroll.top;
      }
      if (state.fitAfterRender) fitToView();
      state.anchor = null;
      state.resetScroll = false;
      state.fitAfterRender = false;
      hoverId = null;
    }

    var PAN_MARGIN = 100;
    var flowPad = { x: PAN_MARGIN, y: PAN_MARGIN };

    function applyPadding() {
      var viewport = flowViewport();
      var pan = host.querySelector('.structure-flow__pan');
      if (!viewport || !pan) return flowPad;
      flowPad = {
        x: Math.max(viewport.clientWidth - PAN_MARGIN, PAN_MARGIN),
        y: Math.max(viewport.clientHeight - PAN_MARGIN, PAN_MARGIN)
      };
      pan.style.padding = flowPad.y + 'px ' + flowPad.x + 'px';
      return flowPad;
    }

    function positionOrigin() {
      var viewport = flowViewport();
      var sizer = host.querySelector('.structure-flow__sizer');
      if (!viewport || !sizer) return;
      var free = viewport.clientWidth - sizer.offsetWidth;
      viewport.scrollLeft = flowPad.x - (free > 0 ? free / 2 : 0);
      viewport.scrollTop = flowPad.y;
    }

    var ZOOM = { min: 0.1, max: 2, step: 0.1 };
    var flowSize = { width: 0, height: 0 };

    function clampZoom(value) {
      return Math.min(ZOOM.max, Math.max(ZOOM.min, Math.round(value * 1000) / 1000));
    }

    function applyZoom() {
      var sizer = host.querySelector('.structure-flow__sizer');
      var world = host.querySelector('.structure-flow__world');
      if (!sizer || !world) return;
      sizer.style.width = flowSize.width * state.zoom + 'px';
      sizer.style.height = flowSize.height * state.zoom + 'px';
      world.style.transform = 'scale(' + state.zoom + ')';
      world.style.setProperty('--z', state.zoom);
      world.classList.toggle('is-lod', state.zoom < LOD_ZOOM);
    }

    function syncZoomUi() {
      zoomValue.textContent = Math.round(state.zoom * 100) + '%';
      zoomOut.disabled = state.zoom <= ZOOM.min;
      zoomIn.disabled = state.zoom >= ZOOM.max;
    }

    function setZoom(next, focal) {
      var viewport = flowViewport();
      var sizer = host.querySelector('.structure-flow__sizer');
      next = clampZoom(next);
      if (!viewport || !sizer || next === state.zoom) { syncZoomUi(); return; }
      var previous = state.zoom;
      var rect = viewport.getBoundingClientRect();
      var fx = focal ? focal.x - rect.left : viewport.clientWidth / 2;
      var fy = focal ? focal.y - rect.top : viewport.clientHeight / 2;
      var contentX = (viewport.scrollLeft + fx - sizer.offsetLeft) / previous;
      var contentY = (viewport.scrollTop + fy - sizer.offsetTop) / previous;
      state.zoom = next;
      applyZoom();
      viewport.scrollLeft = contentX * next + sizer.offsetLeft - fx;
      viewport.scrollTop = contentY * next + sizer.offsetTop - fy;
      syncZoomUi();
    }

    function fitToView(axis) {
      var viewport = flowViewport();
      if (!viewport || !flowSize.width) return;
      var fit = axis === 'width'
        ? Math.min(viewport.clientWidth / flowSize.width, 1)
        : Math.min(viewport.clientWidth / flowSize.width, viewport.clientHeight / flowSize.height, 1);
      state.zoom = clampZoom(Math.floor(fit * 100) / 100);
      applyZoom();
      syncZoomUi();
      positionOrigin();
    }

    var pops = {
      zoom: { button: toolButtons.zoom, panel: zoomPop },
      more: { button: toolButtons.more, panel: morePop }
    };

    function setPop(key, open) {
      pops[key].panel.hidden = !open;
      pops[key].button.setAttribute('aria-expanded', String(open));
    }

    function closePops(except) {
      Object.keys(pops).forEach(function (key) { if (key !== except) setPop(key, false); });
    }

    function anyPopOpen() {
      return Object.keys(pops).some(function (key) { return !pops[key].panel.hidden; });
    }

    function togglePop(key) {
      var open = pops[key].panel.hidden;
      closePops(key);
      setPop(key, open);
    }

    function highlightPath(id) {
      if (id === hoverId) return;
      hoverId = id;
      host.querySelectorAll('.is-path, .is-hover').forEach(function (element) {
        element.classList.remove('is-path', 'is-hover');
      });
      if (!id) return;

      var edges = host.querySelector('.structure-flow__edges');
      var chain = [];
      for (var current = id; current; current = opts.getParentId(current)) chain.push(current);
      chain.forEach(function (chainId, index) {
        var card = flowCardEl(chainId);
        if (card) card.classList.add(index === 0 ? 'is-hover' : 'is-path');
        var edge = edges && edges.querySelector('[data-edge="' + window.CSS.escape(String(chainId)) + '"]');
        if (edge) {
          edge.classList.add('is-path');
          edges.appendChild(edge);
        }
      });
    }

    function syncLevelOptions() {
      var depth = maxDepth();
      if (state.level > depth) state.level = 0;
      if (depth !== renderedDepth) {
        var options = ['<option value="0">Todos os níveis</option>'];
        for (var i = 1; i <= depth; i++) options.push('<option value="' + i + '">Até o nível ' + i + '</option>');
        levelSelect.innerHTML = options.join('');
        renderedDepth = depth;
      }
      levelSelect.value = String(state.level);
    }

    function syncTools(visibleIds) {
      var expandable = flatten().filter(function (item) {
        return visibleIds.has(item.node.id) && (item.node.children || []).some(function (child) { return visibleIds.has(child.id); });
      }).map(function (item) { return item.node.id; });
      toolButtons['expand-all'].disabled = expandable.every(function (id) { return !state.collapsed.has(id); });
      toolButtons['collapse-all'].disabled = !expandable.length || expandable.every(function (id) { return state.collapsed.has(id); });

      var canFlow = state.mode !== 'lines' && visibleIds.size > 0;
      toolButtons.fit.disabled = !canFlow;
      toolButtons['fit-width'].disabled = !canFlow;
      toolButtons.zoom.disabled = !canFlow;
      if (!canFlow) setPop('zoom', false);
      syncZoomUi();
    }

    function render() {
      syncLevelOptions();
      var computed = computeVisible();
      var visibleIds = computed.visibleIds;
      var visibleRoots = roots().filter(function (node) { return visibleIds.has(node.id); });

      searchState = {
        active: opts.hasSearch(),
        query: opts.getSearch(),
        matchedIds: new Set(computed.matched.map(function (node) { return node.id; }))
      };

      host.classList.toggle('is-flow', state.mode !== 'lines');
      if (!visibleRoots.length) {
        host.innerHTML = '';
      } else if (state.mode === 'lines') {
        host.innerHTML = visibleRoots.map(function (node) { return nodeHtml(node, 0, visibleIds); }).join('');
      } else {
        renderFlow(visibleRoots, visibleIds);
      }
      syncTools(visibleIds);
      return { empty: visibleRoots.length === 0 };
    }


    function toggleNode(id) {
      if (state.mode !== 'lines') state.anchor = captureAnchor(id);
      if (state.collapsed.has(id)) state.collapsed.delete(id);
      else state.collapsed.add(id);
      opts.rerender();
    }

    var modeToggle = document.querySelector('.structure-tree-mode-toggle');

    function syncModeButtons() {
      modeToggle.querySelectorAll('[data-tree-mode]').forEach(function (button) {
        var active = button.getAttribute('data-tree-mode') === state.mode;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    }

    function setMode(mode) {
      if (mode === state.mode || !MODE_LABELS[mode]) return;
      state.mode = mode;
      state.resetScroll = true;
      syncModeButtons();
      host.classList.toggle('is-flow', mode !== 'lines');
      opts.onFilterChange();
    }

    function expandAll() {
      state.collapsed.clear();
      if (state.mode !== 'lines') state.fitAfterRender = true;
      opts.rerender();
    }

    function collapseAll() {
      state.collapsed = new Set(expandableIds());
      opts.rerender();
    }

    function setLevel(value) {
      state.level = Number(value) || 0;
      opts.onFilterChange();
    }

    function restore() {
      state.level = 0;
      state.zoom = 1;
      state.resetScroll = true;
      state.collapsed = defaultCollapsed();
      closePops();
      opts.resetSharedFilters();
      opts.onFilterChange();
    }

    function resetForNewData() {
      state.level = 0;
      state.collapsed = defaultCollapsed();
    }

    function onEnter() {
      reveal();
    }


    var drawer = null;
    var drawerOpener = null;

    function field(label, value, span) {
      var empty = value === '' || value == null;
      return '<div class="structure-bento__field' + (span ? ' is-span-' + span : '') + '">' +
        '<span>' + esc(label) + '</span><strong' + (empty ? ' class="is-empty"' : '') + '>' + esc(empty ? NOT_INFORMED : value) + '</strong></div>';
    }

    function initials(name) {
      return String(name || '').split(' ').filter(Boolean).slice(0, 2).map(function (word) { return word[0].toUpperCase(); }).join('');
    }

    function drawerBodyHtml(node) {
      var levelIndex = 0;
      for (var cursor = opts.getParentId(node.id); cursor; cursor = opts.getParentId(cursor)) levelIndex += 1;
      var color = levelColors[levelIndex % levelColors.length];
      var parentId = opts.getParentId(node.id);
      var parent = parentId ? opts.getNode(parentId) : null;
      var detalhes = node.detalhes || {};
      var statusClass = 'structure-status' + (node.ativo ? '' : ' structure-status--inactive');
      var franchise = typeof node.franquia === 'boolean'
        ? '<span class="structure-drawer__tag"><i></i>' + (node.franquia ? 'É franquia' : 'Não é franquia') + '</span>'
        : '';

      return (
        '<div class="structure-drawer__head" style="--level-color:' + color + '">' +
        '<span class="structure-tree-card__badge"><span class="structure-tree-card__badge-dot"></span>' + esc(badgeLabel(node, levelIndex)) + '</span>' +
        '<span class="structure-drawer__code">Código #' + esc(formatCode(node.id)) + '</span>' +
        '<span class="' + statusClass + ' structure-drawer__status"><span class="structure-status__dot"></span><span>' + (node.ativo ? 'Ativo' : 'Inativo') + '</span></span>' + franchise +
        '</div>' +

        '<div class="structure-drawer__bento" style="--level-color:' + color + '">' +

        '<section class="structure-bento structure-bento--stat structure-bento--s2"><span>Filhos diretos</span><strong>' + (node.children || []).length + '</strong></section>' +
        '<section class="structure-bento structure-bento--stat structure-bento--s2"><span>Descendentes</span><strong>' + countDescendants(node) + '</strong></section>' +
        '<section class="structure-bento structure-bento--stat structure-bento--accent structure-bento--s2"><span>Nível atual</span><strong>' + (levelIndex + 1) + '</strong></section>' +

        '<section class="structure-bento structure-bento--s4"><h3 class="eyebrow-label structure-bento__title">Identificação</h3><div class="structure-bento__fields" style="--cols:3">' +
        field('Estrutura', node.description, 3) +
        field('Sigla', node.sap) +
        field('Código pai', parentId ? formatCode(parentId) : parentId) +
        field('Tipo de posição', node.tipoPosicao) +
        field('Estrutura pai', parent ? parent.description : 'Estrutura raiz', 2) +
        field('Linha de negócio', node.linhaNegocio) +
        '</div></section>' +

        '<section class="structure-bento structure-bento--s2"><h3 class="eyebrow-label structure-bento__title">Responsável</h3>' +
        '<div class="structure-bento__person"><span class="structure-avatar" aria-hidden="true">' + esc(initials(node.responsavel) || '—') + '</span>' +
        '<div><strong' + (node.responsavel ? '' : ' class="is-empty"') + '>' + esc(node.responsavel || NOT_INFORMED) + '</strong>' +
        '<span>' + esc(detalhes.usuario || 'Sem usuário') + '</span></div></div>' +
        '<div class="structure-bento__fields" style="--cols:1">' + field('Papel', detalhes.papel) + '</div>' +
        '</section>' +

        '<section class="structure-bento structure-bento--s6"><h3 class="eyebrow-label structure-bento__title">Localização</h3><div class="structure-bento__fields" style="--cols:4">' +
        field('Município', detalhes.municipio) +
        field('Estado', detalhes.estado) +
        field('País', node.pais) +
        field('CEP', detalhes.cep) +
        field('Endereço', detalhes.endereco, 2) +
        field('Latitude', detalhes.latitude) +
        field('Longitude', detalhes.longitude) +
        '</div></section>' +

        '</div>'
      );
    }

    function buildDrawer() {
      var root = document.createElement('div');
      root.className = 'structure-drawer-root';
      root.innerHTML =
        '<button type="button" class="structure-drawer-overlay" data-drawer-close tabindex="-1" aria-label="Fechar detalhes"></button>' +
        '<aside class="structure-drawer" role="dialog" aria-modal="true" aria-labelledby="structureDrawerTitle" tabindex="-1">' +
        '<header class="structure-drawer__header">' +
        '<h2 id="structureDrawerTitle"></h2>' +
        '<button type="button" class="structure-drawer__close" data-drawer-close aria-label="Fechar">' + ICONS.close + '</button>' +
        '</header>' +
        '<div class="structure-drawer__content" data-drawer-content></div>' +
        '<footer class="structure-drawer__footer">' +
        '<button type="button" class="structure-drawer__btn" data-drawer-close>Fechar</button>' +
        '<button type="button" class="structure-drawer__btn structure-drawer__btn--primary" data-drawer-edit>' + ICONS.edit + '<span>Editar estrutura</span></button>' +
        '</footer>' +
        '</aside>';
      document.body.appendChild(root);

      root.addEventListener('click', function (event) {
        if (event.target.closest('[data-drawer-close]')) { closeDrawer(); return; }
        if (event.target.closest('[data-drawer-edit]')) {
          var id = root.dataset.nodeId;
          closeDrawer();
          var node = opts.getNode(id);
          if (node) opts.onEdit(node);
        }
      });
      return root;
    }

    function openDrawer(node, opener) {
      if (!drawer) drawer = buildDrawer();
      drawerOpener = opener || null;
      drawer.dataset.nodeId = node.id;
      drawer.querySelector('#structureDrawerTitle').textContent = node.description;
      drawer.querySelector('[data-drawer-content]').innerHTML = drawerBodyHtml(node);
      drawer.querySelector('[data-drawer-content]').scrollTop = 0;
      drawer.classList.add('is-open');
      setPageInert(true);
      drawer.querySelector('.structure-drawer').focus({ preventScroll: true });
    }

    function setPageInert(value) {
      var page = document.querySelector('.app-shell');
      if (page) page.inert = value;
    }

    function closeDrawer() {
      if (!drawer || !drawer.classList.contains('is-open')) return;
      drawer.classList.remove('is-open');
      setPageInert(false);
      if (drawerOpener && document.contains(drawerOpener)) drawerOpener.focus({ preventScroll: true });
      drawerOpener = null;
    }

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      if (anyPopOpen()) {
        event.stopImmediatePropagation();
        closePops();
        return;
      }
      if (!drawer || !drawer.classList.contains('is-open')) return;
      event.stopImmediatePropagation();
      closeDrawer();
    }, true);

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab' || !drawer || !drawer.classList.contains('is-open')) return;
      var panel = drawer.querySelector('.structure-drawer');
      var items = Array.prototype.slice.call(panel.querySelectorAll('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      var active = document.activeElement;
      if (!panel.contains(active) || active === panel) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }, true);


    host.addEventListener('click', function (event) {
      if (event.target.closest('[data-inert]')) return;

      var toggle = event.target.closest('[data-toggle]');
      if (toggle) { toggleNode(toggle.getAttribute('data-toggle')); return; }

      var detail = event.target.closest('[data-detail]');
      if (detail) {
        var detailNode = opts.getNode(detail.getAttribute('data-detail'));
        if (detailNode) openDrawer(detailNode, detail);
        return;
      }

      var edit = event.target.closest('[data-edit]');
      if (edit) {
        var editNode = opts.getNode(edit.getAttribute('data-edit'));
        if (editNode) opts.onEdit(editNode);
        return;
      }

      var card = event.target.closest('.structure-tree-card, .structure-flow-card');
      if (card && card.getAttribute('data-has-children') === 'true') toggleNode(card.dataset.id || card.dataset.flowId);
    });

    var tip = document.createElement('div');
    tip.className = 'structure-tree-tip';
    tip.setAttribute('role', 'tooltip');
    document.body.appendChild(tip);

    function isClipped(element) {
      return element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1;
    }

    function hideTip() {
      tip.classList.remove('is-visible');
    }

    function showTip(element) {
      var full = element.getAttribute('data-tip-full');
      var text = (full && isClipped(element)) ? full : element.getAttribute('data-tip');
      if (!text) { hideTip(); return; }
      tip.textContent = text;
      tip.style.left = '0px';
      var rect = element.getBoundingClientRect();
      var width = tip.offsetWidth;
      var center = Math.min(Math.max(rect.left + rect.width / 2, width / 2 + 8), window.innerWidth - width / 2 - 8);
      var below = rect.bottom + 8 + tip.offsetHeight < window.innerHeight;
      tip.style.left = center + 'px';
      tip.style.top = (below ? rect.bottom + 8 : rect.top - 8 - tip.offsetHeight) + 'px';
      tip.classList.add('is-visible');
    }

    function tipTarget(event) {
      return event.target.closest ? event.target.closest('[data-tip], [data-tip-full]') : null;
    }

    host.addEventListener('mouseover', function (event) {
      var target = tipTarget(event);
      if (target) showTip(target); else hideTip();
    });
    host.addEventListener('focusin', function (event) {
      var target = tipTarget(event);
      if (target && event.target.matches && event.target.matches(':focus-visible')) showTip(target);
    });
    host.addEventListener('focusout', hideTip);
    host.addEventListener('mouseleave', hideTip);
    host.addEventListener('click', hideTip);
    host.addEventListener('scroll', hideTip, true);

    host.addEventListener('mouseover', function (event) {
      if (state.mode === 'lines') return;
      var card = event.target.closest('.structure-flow-card');
      highlightPath(card ? card.dataset.flowId : null);
    });
    host.addEventListener('mouseleave', function () { highlightPath(null); });

    var PAN_THRESHOLD = 4;
    var pan = null;
    var swallowClick = false;

    host.addEventListener('pointerdown', function (event) {
      if (state.mode === 'lines' || event.button !== 0 || !event.isPrimary) return;
      var viewport = event.target.closest('[data-flow-viewport]');
      if (!viewport) return;
      pan = { viewport: viewport, id: event.pointerId, x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop, active: false };
    });

    host.addEventListener('pointermove', function (event) {
      if (!pan || event.pointerId !== pan.id) return;
      var dx = event.clientX - pan.x;
      var dy = event.clientY - pan.y;
      if (!pan.active) {
        if (Math.sqrt(dx * dx + dy * dy) < PAN_THRESHOLD) return;
        pan.active = true;
        pan.viewport.classList.add('is-panning');
        try { pan.viewport.setPointerCapture(pan.id); } catch (error) { /* ponteiro sintético */ }
        hideTip();
        highlightPath(null);
      }
      pan.viewport.scrollLeft = pan.left - dx;
      pan.viewport.scrollTop = pan.top - dy;
    });

    function endPan(event) {
      if (!pan || event.pointerId !== pan.id) return;
      if (pan.active) {
        swallowClick = true;
        window.setTimeout(function () { swallowClick = false; }, 0);
      }
      pan.viewport.classList.remove('is-panning');
      pan = null;
    }
    host.addEventListener('pointerup', endPan);
    host.addEventListener('pointercancel', endPan);

    host.addEventListener('click', function (event) {
      if (!swallowClick) return;
      swallowClick = false;
      event.stopPropagation();
      event.preventDefault();
    }, true);

    if (window.ResizeObserver) {
      new window.ResizeObserver(function () {
        var viewport = flowViewport();
        if (!viewport) return;
        var previous = flowPad;
        var next = applyPadding();
        viewport.scrollLeft += next.x - previous.x;
        viewport.scrollTop += next.y - previous.y;
      }).observe(host);
    }

    host.addEventListener('wheel', function (event) {
      if (state.mode === 'lines' || !event.ctrlKey || !event.target.closest('[data-flow-viewport]')) return;
      event.preventDefault();
      var factor = Math.abs(event.deltaY) >= 50 ? (event.deltaY < 0 ? 1.1 : 1 / 1.1) : Math.exp(-event.deltaY * 0.01);
      setZoom(state.zoom * factor, { x: event.clientX, y: event.clientY });
    }, { passive: false });

    host.addEventListener('dblclick', function (event) {
      if (state.mode === 'lines' || !event.target.closest('[data-flow-viewport]') || event.target.closest('.structure-flow-card')) return;
      fitToView();
    });

    toolButtons.fit.addEventListener('click', function () { if (!this.disabled) fitToView(); });
    toolButtons['fit-width'].addEventListener('click', function () { if (!this.disabled) fitToView('width'); });
    toolButtons.zoom.addEventListener('click', function () { if (!this.disabled) togglePop('zoom'); });
    toolButtons.more.addEventListener('click', function () { togglePop('more'); });

    zoomPop.addEventListener('click', function (event) {
      var step = event.target.closest('[data-zoom-step]');
      if (step) { setZoom(state.zoom + Number(step.getAttribute('data-zoom-step')) * ZOOM.step); return; }
      if (event.target.closest('[data-zoom-reset]')) setZoom(1);
    });

    var MENU_MESSAGES = {
      upload: 'Upload de dados iniciado (simulação).',
      download: 'Download de dados iniciado (simulação).',
      colors: 'Cores atualizadas (simulação).',
      'coords-all': 'Atualização das coordenadas de todos os registros iniciada (simulação).',
      'coords-visible': 'Atualização das coordenadas dos registros exibidos iniciada (simulação).'
    };

    morePop.addEventListener('click', function (event) {
      var item = event.target.closest('[data-tree-menu]');
      if (!item) return;
      closePops();
      opts.toast('success', MENU_MESSAGES[item.getAttribute('data-tree-menu')]);
    });

    toolButtons['download-pdf'].addEventListener('click', function () {
      closePops();
      opts.toast('success', 'Download do PDF iniciado (simulação).');
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest('.structure-tree-popwrap')) closePops();
    });

    modeToggle.addEventListener('click', function (event) {
      var button = event.target.closest('[data-tree-mode]');
      if (button && !button.disabled) setMode(button.getAttribute('data-tree-mode'));
    });

    levelSelect.addEventListener('change', function () { setLevel(levelSelect.value); });
    toolButtons['expand-all'].addEventListener('click', function () { if (!this.disabled) expandAll(); });
    toolButtons['collapse-all'].addEventListener('click', function () { if (!this.disabled) collapseAll(); });
    toolButtons.restore.addEventListener('click', restore);

    resetForNewData();

    return {
      render: render,
      reveal: reveal,
      onEnter: onEnter,
      resetForNewData: resetForNewData,
      resetLevel: function () { state.level = 0; },
      getLevel: function () { return state.level; },
      openDrawer: openDrawer,
      closeDrawer: closeDrawer
    };
  }

  window.BipperStructureTree = { create: create };
})();
