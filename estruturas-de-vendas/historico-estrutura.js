/* Histórico da estrutura: modal com a linha do tempo de alterações de UMA estrutura
   (sem os filhos). Junta três fontes:
   - criação + alterações de campo (mock determinístico por estrutura, mais o que for
     salvo nesta sessão em sessionStorage);
   - trocas de responsável (vêm do histórico de responsáveis do formulário).
   O grid segue o padrão da tabela (shared/grid-column-filters): ordenar e filtrar por coluna,
   chips de filtro ativo e "Limpar filtros". Busca e período ficam na barra acima do grid.
   A exportação (PDF e Excel) respeita tudo que estiver filtrado. */
(function () {
  'use strict';

  var EXTRAS_KEY = 'bipperHistoricoEstruturaExtras';
  var MOCK_ANCHOR = new Date(2026, 8, 29, 10, 0, 0);
  var MOCK_USERS = ['Patrícia Nogueira', 'Henrique Duarte', 'Bárbara Gianazi', 'Marcos Teixeira', 'Juliana Prado'];
  var MOCK_TIPOS_POSICAO = ['BU Líder', 'Técnico', 'Comercial - Gerente Comercial', 'Marketing - Gerente de Produto', 'Solicitações - Solicitante'];
  var MOCK_CORES = ['#2563eb', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#0ea5e9'];
  var MOCK_CIDADES = ['Campinas', 'Santos', 'Ribeirão Preto', 'Sorocaba'];

  var LIB_XLSX = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
  var LIB_JSPDF = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  var LIB_AUTOTABLE = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';

  var TIPO_LABEL = {
    criacao: 'Criação',
    alteracao: 'Alteração',
    responsavel: 'Responsável',
    status: 'Status',
    hierarquia: 'Hierarquia'
  };

  // Ordem das colunas: o que mudou primeiro; quem e quando por último.
  var COLUMNS = [
    { field: 'tipo', label: 'Evento', type: 'list', width: '12%' },
    { field: 'campo', label: 'Campo', type: 'list', width: '15%' },
    { field: 'anterior', label: 'Valor anterior', type: 'text', width: '21%' },
    { field: 'novo', label: 'Valor novo', type: 'text', width: '24%' },
    { field: 'usuario', label: 'Usuário', type: 'list', width: '14%' },
    { field: 'data', label: 'Data e hora', type: 'date', width: '14%' }
  ];

  // Campos monitorados. `tipo` é o tipo de evento gerado quando o valor muda.
  var FIELDS = [
    { label: 'Descrição', tipo: 'alteracao', get: function (n) { return n.description; } },
    { label: 'Código SAP', tipo: 'alteracao', get: function (n) { return n.sap; } },
    { label: 'Status', tipo: 'status', get: function (n) { return n.ativo ? 'Ativo' : 'Inativo'; } },
    { label: 'Estrutura pai', tipo: 'hierarquia', get: function (n, ctx) { return ctx.nameOf(ctx.parentId); } },
    { label: 'País', tipo: 'alteracao', get: function (n) { return n.pais; } },
    { label: 'UF', tipo: 'alteracao', get: function (n) { return n.uf; } },
    { label: 'Cidade', tipo: 'alteracao', get: function (n) { return n.cidade; } },
    { label: 'CEP', tipo: 'alteracao', get: function (n) { return n.cep; } },
    { label: 'Endereço', tipo: 'alteracao', get: function (n) { return n.endereco; } },
    { label: 'Complemento', tipo: 'alteracao', get: function (n) { return n.complemento; } },
    { label: 'Bairro', tipo: 'alteracao', get: function (n) { return n.bairro; } },
    { label: 'Linha de Negócio', tipo: 'alteracao', get: function (n) { return n.linhaNegocio; } },
    { label: 'Tipo de Posição', tipo: 'alteracao', get: function (n) { return n.tipoPosicao; } },
    { label: 'Tipo de Acesso', tipo: 'alteracao', get: function (n) {
      var item = n.tipoAcessoList && n.tipoAcessoList[0];
      return item ? (item.label || item.value || item) : '';
    } },
    { label: 'Estrutura Técnica', tipo: 'alteracao', get: function (n, ctx) { return ctx.nameOf((n.estruturasTecnicaIds || [])[0]); } },
    { label: 'Estrutura de Venda', tipo: 'alteracao', get: function (n, ctx) { return ctx.nameOf((n.estruturasVendaIds || [])[0]); } },
    { label: 'Cor Destaque', tipo: 'alteracao', get: function (n) { return n.corDestaque; } },
    { label: 'Franquia', tipo: 'alteracao', get: function (n) { return n.franquia ? 'Sim' : 'Não'; } },
    { label: 'Marcas por ano', tipo: 'alteracao', get: function (n) {
      var marcas = n.marcas || [];
      if (!marcas.length) return '';
      var anos = marcas.reduce(function (sum, m) { return sum + (m.anos || []).length; }, 0);
      return marcas.length + (marcas.length === 1 ? ' marca' : ' marcas') + ' · ' + anos + (anos === 1 ? ' ano' : ' anos');
    } }
  ];

  function pad(n) { return String(n).padStart(2, '0'); }

  function stamp(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
      'T' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':00';
  }

  function formatDate(iso) { return iso ? iso.split('-').reverse().join('/') : ''; }

  function formatDateTime(value) {
    var parts = String(value || '').split('T');
    return formatDate(parts[0]) + (parts[1] ? ' ' + parts[1].slice(0, 5) : '');
  }

  function hash(text) {
    var h = 0;
    for (var i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
    return h;
  }

  function escapeHtml(text) {
    return String(text == null ? '' : text).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function normalize(text) {
    return String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  function slug(text) {
    return normalize(text).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'estrutura';
  }

  function show(value) { return value === '' || value == null ? '—' : String(value); }

  function readExtras() {
    try { return JSON.parse(sessionStorage.getItem(EXTRAS_KEY) || '{}') || {}; } catch (e) { return {}; }
  }

  function loadScript(url, isReady) {
    if (isReady()) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = url;
      script.onload = function () { resolve(); };
      script.onerror = function () { reject(new Error('Falha ao carregar ' + url)); };
      document.head.appendChild(script);
    });
  }

  // Escolhe, sem repetir, valores de `pool` diferentes de `exclude`.
  function pickFrom(pool, exclude, seed, count) {
    var rest = pool.filter(function (item) { return exclude.indexOf(item) === -1; });
    var out = [];
    for (var i = 0; i < count && rest.length; i++) out.push(rest.splice((seed + i * 7) % rest.length, 1)[0]);
    return out;
  }

  function create(opts) {
    var node = opts.node || null;
    var type = opts.type;
    var parentId = opts.parentId;
    var opener = opts.openButton || null;
    var respRecords = [];
    var storeKey = node ? type + ':' + node.id : '';
    var nameOf = opts.nameOf || function () { return ''; };
    var events = [];
    var filters = { tipo: 'all', q: '', de: '', ate: '' };
    var PAGE_SIZE = 10;
    var page = 1;
    var root = null;
    var gridFilters = null;
    var visible = [];

    // Eventos

    // Cada cadeia é uma sequência de valores que termina no valor atual da estrutura,
    // para o histórico nunca contradizer o que a tela mostra hoje.
    function mockChains(seed) {
      var chains = [];
      var cur;

      chains.push({ campo: 'Status', tipo: 'status', values: node.ativo ? ['Ativo', 'Inativo', 'Ativo'] : ['Inativo', 'Ativo', 'Inativo'] });

      if (node.tipoPosicao) {
        chains.push({ campo: 'Tipo de Posição', tipo: 'alteracao', values: pickFrom(MOCK_TIPOS_POSICAO, [node.tipoPosicao], seed, 2).concat(node.tipoPosicao) });
      }
      if (node.sap && node.sap.length > 2) {
        var last = node.sap.slice(-1);
        var letters = pickFrom(['X', 'Z', 'Q', 'K', 'W'], [last], seed, 2);
        chains.push({ campo: 'Código SAP', tipo: 'alteracao', values: letters.map(function (l) { return node.sap.slice(0, -1) + l; }).concat(node.sap) });
      }
      if (node.corDestaque) {
        cur = node.corDestaque.toLowerCase();
        chains.push({ campo: 'Cor Destaque', tipo: 'alteracao', values: pickFrom(MOCK_CORES, [cur], seed, 2).concat(node.corDestaque) });
      }
      if (node.cidade) {
        chains.push({ campo: 'Cidade', tipo: 'alteracao', values: pickFrom(MOCK_CIDADES, [node.cidade], seed, 2).concat(node.cidade) });
      }
      if (node.bairro) chains.push({ campo: 'Bairro', tipo: 'alteracao', values: ['Centro', node.bairro] });
      if (node.endereco) chains.push({ campo: 'Endereço', tipo: 'alteracao', values: ['Av. Paulista, 1000', node.endereco] });
      if (node.linhaNegocio) {
        chains.push({ campo: 'Linha de Negócio', tipo: 'alteracao', values: [node.linhaNegocio === 'Saúde Animal' ? 'Pecuária' : 'Saúde Animal', node.linhaNegocio] });
      }
      chains.push({ campo: 'Franquia', tipo: 'alteracao', values: [node.franquia ? 'Não' : 'Sim', node.franquia ? 'Sim' : 'Não'] });
      chains.push({ campo: 'Descrição', tipo: 'alteracao', values: [(node.description || '') + ' - Provisório', node.description || ''] });

      var parentName = nameOf(parentId);
      if (parentName && opts.randomName) {
        var before = opts.randomName(seed);
        if (before && before !== parentName) chains.push({ campo: 'Estrutura pai', tipo: 'hierarquia', values: [before, parentName] });
      }
      return chains;
    }

    function mockEvents(respEvents) {
      var seed = hash(storeKey);
      var chains = mockChains(seed);
      var rotate = seed % chains.length;
      chains = chains.slice(rotate).concat(chains.slice(0, rotate));

      var list = [];
      var oldestDays = 0;
      var total = 0;
      var limit = 9 + (seed % 4);

      chains.forEach(function (chain, i) {
        var steps = chain.values.length - 1;
        if (total + steps > limit) return;
        total += steps;
        var start = 40 + ((seed >> (i % 16)) % 260);
        var gap = 18 + ((seed >> ((i + 3) % 16)) % 40);
        start = Math.max(start, (steps - 1) * gap + 10);
        for (var j = 0; j < steps; j++) {
          var days = start - j * gap;
          var when = new Date(MOCK_ANCHOR.getTime() - days * 86400000);
          when.setHours(8 + ((seed >> (i + j)) % 10), (seed >> (i + j + 2)) % 60, 0, 0);
          if (days > oldestDays) oldestDays = days;
          list.push({
            data: stamp(when),
            usuario: MOCK_USERS[(seed + i + j) % MOCK_USERS.length],
            tipo: chain.tipo, campo: chain.campo,
            anterior: show(chain.values[j]), novo: show(chain.values[j + 1])
          });
        }
      });

      var earliest = new Date(MOCK_ANCHOR.getTime() - oldestDays * 86400000);
      if (respEvents.length) {
        var oldestResp = new Date(respEvents[respEvents.length - 1].data);
        if (oldestResp < earliest) earliest = oldestResp;
      }
      var created = new Date(earliest.getTime() - (15 + (seed % 60)) * 86400000);
      created.setHours(9 + (seed % 8), (seed >> 3) % 60, 0, 0);
      list.push({
        data: stamp(created),
        usuario: MOCK_USERS[seed % MOCK_USERS.length],
        tipo: 'criacao', campo: 'Estrutura', anterior: '—', novo: 'Estrutura criada'
      });
      return list;
    }

    function responsavelEvents() {
      var records = respRecords;
      return records.map(function (rec, index) {
        var older = records[index + 1];
        var vigencia = rec.dataFim
          ? formatDate(rec.dataInicio) + ' a ' + formatDate(rec.dataFim)
          : 'desde ' + formatDate(rec.dataInicio);
        return {
          data: rec.alteradoEm,
          usuario: rec.alteradoPor,
          tipo: 'responsavel', campo: 'Responsável',
          anterior: older ? older.responsavel : '—',
          novo: rec.responsavel + ' (vigência: ' + vigencia + ')'
        };
      });
    }

    function buildEvents() {
      var resp = responsavelEvents();
      var extras = readExtras()[storeKey] || [];
      events = mockEvents(resp).concat(resp, extras).sort(function (a, b) {
        return a.data < b.data ? 1 : a.data > b.data ? -1 : 0;
      });
    }

    // Grava o que mudou ao salvar (chamado por nova-estrutura.html). A troca de
    // responsável não entra aqui: já vem do histórico de responsáveis.
    function recordChanges(oldNode, oldParentId, newNode, newParentId) {
      var oldCtx = { parentId: oldParentId, nameOf: nameOf };
      var newCtx = { parentId: newParentId, nameOf: nameOf };
      var now = stamp(new Date());
      var added = [];
      FIELDS.forEach(function (field) {
        var before = field.get(oldNode, oldCtx) || '';
        var after = field.get(newNode, newCtx) || '';
        if (before === after) return;
        added.push({
          data: now, usuario: opts.currentUser, tipo: field.tipo,
          campo: field.label, anterior: show(before), novo: show(after)
        });
      });
      if (!added.length) return;
      var extras = readExtras();
      extras[storeKey] = added.concat(extras[storeKey] || []);
      try { sessionStorage.setItem(EXTRAS_KEY, JSON.stringify(extras)); } catch (e) { /* sem persistência */ }
    }

    // Barra acima do grid (busca + período). Os filtros por coluna vivem no motor compartilhado.

    function barRows() {
      var query = normalize(filters.q).trim();
      return events.filter(function (evt) {
        if (filters.tipo !== 'all' && evt.tipo !== filters.tipo) return false;
        var day = evt.data.slice(0, 10);
        if (filters.de && day < filters.de) return false;
        if (filters.ate && day > filters.ate) return false;
        if (!query) return true;
        return normalize([evt.usuario, evt.campo, evt.anterior, evt.novo, TIPO_LABEL[evt.tipo]].join(' ')).indexOf(query) > -1;
      });
    }

    // Grid

    function cellHtml(text) {
      var safe = escapeHtml(text);
      return '<span class="cell-clamp" data-full-text="' + safe + '">' + safe + '</span>';
    }

    function chipHtml(tipo) {
      return '<span class="structure-evt-chip structure-evt-chip--' + tipo + '"><i></i>' + TIPO_LABEL[tipo] + '</span>';
    }

    function rowHtml(evt) {
      return '<tr>' +
        '<td>' + chipHtml(evt.tipo) + '</td>' +
        '<td>' + cellHtml(evt.campo) + '</td>' +
        '<td>' + cellHtml(evt.anterior) + '</td>' +
        '<td>' + cellHtml(evt.novo) + '</td>' +
        '<td>' + cellHtml(evt.usuario) + '</td>' +
        '<td>' + cellHtml(formatDateTime(evt.data)) + '</td>' +
        '</tr>';
    }

    // Mesmo estado vazio da tabela principal (ícone, texto e botão "Limpar filtros").
    function emptyRowHtml() {
      return '<tr class="structure-evt-empty-row"><td colspan="' + COLUMNS.length + '">' +
        '<div class="structure-empty-state-wrap"><div class="table-empty-state">' +
        '<div class="table-empty-state__icon"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></div>' +
        '<strong class="table-empty-state__title">Nenhum resultado encontrado</strong>' +
        '<p class="table-empty-state__text">Não encontramos registros com os filtros aplicados. Ajuste a pesquisa ou limpe os filtros para ver outros resultados.</p>' +
        '<button class="btn btn-secondary clear-filters is-active table-empty-state__action" type="button" data-evt-empty-clear>' +
        '<svg class="clear-filters__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21"></path>' +
        '<path d="m5.082 11.09 8.828 8.828"></path></svg><span>Limpar filtros</span></button>' +
        '</div></div></td></tr>';
    }

    // Zera tudo: chip de evento, busca, período e filtros/ordem das colunas.
    function resetFilters() {
      filters = { tipo: 'all', q: '', de: '', ate: '' };
      root.querySelector('[data-evt-search]').value = '';
      root.querySelector('[data-evt-de]').value = '';
      root.querySelector('[data-evt-ate]').value = '';
      gridFilters.clear();
      renderList();
    }

    // Badges de tipo de evento (com contagem), logo acima do grid.
    function tipoChipsHtml() {
      var counts = { all: events.length };
      events.forEach(function (evt) { counts[evt.tipo] = (counts[evt.tipo] || 0) + 1; });
      var options = [{ id: 'all', label: 'Todos' }].concat(Object.keys(TIPO_LABEL).map(function (id) {
        return { id: id, label: TIPO_LABEL[id] };
      })).filter(function (tipo) { return tipo.id === 'all' || counts[tipo.id]; }); // tipo sem registro não vira filtro
      return options.map(function (tipo) {
        var active = filters.tipo === tipo.id;
        return '<button type="button" class="structure-evt-filter' + (active ? ' is-active' : '') + '" data-evt-tipo="' + tipo.id + '" aria-pressed="' + active + '">' +
          tipo.label + ' <span>' + (counts[tipo.id] || 0) + '</span></button>';
      }).join('');
    }

    function renderList(keepPage) {
      root.querySelector('[data-evt-tipos]').innerHTML = tipoChipsHtml();
      visible = gridFilters.apply(barRows());
      // "Limpar filtros" aparece logo após os chips sempre que houver algo filtrado ou ordenado.
      root.querySelector('[data-evt-clear]').hidden = !(filters.tipo !== 'all' || filters.q || filters.de || filters.ate || gridFilters.hasActive());
      // Qualquer mudança de filtro/busca/ordem volta para a página 1; só os botões do paginador usam keepPage.
      if (keepPage !== true) page = 1;
      var totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
      page = Math.min(page, totalPages);
      var start = (page - 1) * PAGE_SIZE;
      var pageRows = visible.slice(start, start + PAGE_SIZE);
      // O grid mantém sempre a mesma altura (10 linhas): o estado vazio ocupa o lugar das linhas.
      root.querySelector('[data-evt-body]').innerHTML = visible.length ? pageRows.map(rowHtml).join('') : emptyRowHtml();
      root.querySelector('[data-evt-page-summary]').textContent = visible.length
        ? 'Página ' + page + ' de ' + totalPages + ' | ' + (start + 1) + '-' + (start + pageRows.length) + ' de ' + visible.length +
          (visible.length === 1 ? ' registro' : ' registros') + (visible.length !== events.length ? ' (filtrados)' : '')
        : 'Nenhum registro';
      root.querySelector('[data-evt-prev]').disabled = page <= 1;
      root.querySelector('[data-evt-next]').disabled = page >= totalPages;
      root.querySelector('[data-evt-pages]').innerHTML = Array.from({ length: totalPages }, function (_, index) {
        var n = index + 1;
        return '<button class="' + (n === page ? 'is-active' : '') + '" type="button" data-evt-page="' + n + '">' + n + '</button>';
      }).join('');
      root.querySelectorAll('[data-evt-export], [data-evt-export-trigger]').forEach(function (button) {
        button.disabled = !visible.length;
      });
    }

    // Modal

    function build() {
      root = document.createElement('div');
      root.className = 'favorite-modal';
      root.setAttribute('role', 'dialog');
      root.setAttribute('aria-modal', 'true');
      root.setAttribute('aria-labelledby', 'estruturaHistoricoTitle');
      root.innerHTML =
        '<button class="favorite-modal__backdrop" type="button" aria-label="Fechar" data-evt-close></button>' +
        '<div class="favorite-modal__dialog favorite-modal__dialog--xl">' +
        '<button class="favorite-modal__close" type="button" aria-label="Fechar" data-evt-close>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button>' +
        '<h2 class="favorite-modal__title" id="estruturaHistoricoTitle">Histórico da estrutura</h2>' +
        '<p class="favorite-modal__description" data-evt-subtitle></p>' +
        '<div class="structure-evt-card">' +
        '<div class="structure-table-toolbar structure-evt-toolbar">' +
        '<label class="structure-search-field structure-evt-search"><input type="search" placeholder="Pesquisar no histórico" autocomplete="off" data-evt-search></label>' +
        '<label class="structure-evt-date"><span>De</span><input type="date" data-evt-de aria-label="Data inicial"></label>' +
        '<label class="structure-evt-date"><span>Até</span><input type="date" data-evt-ate aria-label="Data final"></label>' +
        '<div class="structure-evt-export">' +
        '<button type="button" class="btn btn-primary structure-evt-export-trigger" data-evt-export-trigger aria-haspopup="menu"><i class="fa-solid fa-file-export" aria-hidden="true"></i><span>Exportar</span></button>' +
        '<div class="structure-evt-export-popover" role="menu">' +
        '<button type="button" data-evt-export="xlsx" role="menuitem"><i class="fa-solid fa-file-excel" aria-hidden="true"></i><span>Excel</span></button>' +
        '<button type="button" data-evt-export="pdf" role="menuitem"><i class="fa-regular fa-file-pdf" aria-hidden="true"></i><span>PDF</span></button>' +
        '</div></div></div>' +
        '<div class="structure-evt-filters">' +
        '<div class="structure-evt-tipos" data-evt-tipos></div>' +
        '<div class="column-filters-active" data-evt-chips aria-live="polite"></div>' +
        '<button class="btn btn-secondary clear-filters is-active" type="button" data-evt-clear hidden>' +
        '<svg class="clear-filters__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21"></path>' +
        '<path d="m5.082 11.09 8.828 8.828"></path></svg><span>Limpar filtros</span></button>' +
        '</div>' +
        '<div class="structure-table-wrap payments-table-wrap structure-evt-wrap" data-evt-wrap>' +
        '<table class="structure-table payments-table structure-evt-table" data-evt-table>' +
        '<colgroup>' + COLUMNS.map(function (c) { return '<col style="width:' + c.width + '">'; }).join('') + '</colgroup>' +
        '<thead><tr>' + COLUMNS.map(function (c) { return '<th>' + c.label + '</th>'; }).join('') + '</tr></thead>' +
        '<tbody data-evt-body></tbody></table></div>' +
        '<div class="structure-pagination-bar" data-evt-pagination aria-label="Paginação do histórico">' +
        '<span data-evt-page-summary>Página 1 de 1</span>' +
        '<div class="structure-pagination-actions">' +
        '<button class="btn btn-secondary btn-sm" type="button" data-evt-prev>Anterior</button>' +
        '<div class="structure-page-buttons" data-evt-pages></div>' +
        '<button class="btn btn-secondary btn-sm" type="button" data-evt-next>Próxima</button>' +
        '</div></div>' +
        '</div>' +
        '<div class="favorite-modal__actions structure-evt-actions">' +
        '<button type="button" class="favorite-modal__btn" data-evt-close>Fechar</button></div>' +
        '</div>';
      document.body.appendChild(root);

      gridFilters = window.BipperGridColumnFilters.create({
        table: root.querySelector('[data-evt-table]'),
        chipsHost: root.querySelector('[data-evt-chips]'),
        columns: COLUMNS.map(function (column) {
          var cfg = { field: column.field, type: column.type };
          if (column.field === 'tipo') cfg.labelFn = function (value) { return TIPO_LABEL[value] || value; };
          return cfg;
        }),
        onChange: renderList
      });

      if (window.BipperCustomDate) window.BipperCustomDate.enhanceAll(root);

      root.addEventListener('click', function (event) {
        if (event.target.closest('[data-evt-close]')) { close(); return; }
        if (event.target.closest('[data-evt-empty-clear]')) { resetFilters(); return; }
        if (event.target.closest('[data-evt-clear]')) { resetFilters(); return; }
        var pageBtn = event.target.closest('[data-evt-page]');
        if (pageBtn) { page = Number(pageBtn.getAttribute('data-evt-page')); renderList(true); return; }
        if (event.target.closest('[data-evt-prev]')) { page -= 1; renderList(true); return; }
        if (event.target.closest('[data-evt-next]')) { page += 1; renderList(true); return; }
        var tipoChip = event.target.closest('[data-evt-tipo]');
        if (tipoChip) { filters.tipo = tipoChip.getAttribute('data-evt-tipo'); renderList(); return; }
        var exp = event.target.closest('[data-evt-export]');
        if (exp && !exp.disabled) exportAs(exp.getAttribute('data-evt-export'));
      });
      root.querySelector('[data-evt-search]').addEventListener('input', function (event) {
        filters.q = event.target.value;
        renderList();
      });
      ['de', 'ate'].forEach(function (name) {
        var input = root.querySelector('[data-evt-' + name + ']');
        function sync() { filters[name] = input.value; renderList(); }
        input.addEventListener('change', sync);
        input.addEventListener('input', sync);
      });
      document.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape' || !root.classList.contains('is-visible')) return;
        if (document.querySelector('.cd-panel.is-open, .col-popover.is-open')) return; // o Esc fecha só o painel aberto
        close();
      }, true);
    }

    // Mostra o histórico de uma estrutura. Sem argumento, reabre a do formulário (opts.node);
    // a tabela e a árvore passam { node, type, parentId, opener } a cada clique.
    function open(target) {
      if (target && target.node) {
        node = target.node;
        type = target.type || type;
        parentId = target.parentId;
        opener = target.opener || null;
        storeKey = type + ':' + node.id;
      }
      if (!node) return;
      var loading = opts.loadResponsavelRecords
        ? opts.loadResponsavelRecords(type, node.id)
        : Promise.resolve(opts.getResponsavelRecords ? opts.getResponsavelRecords() : []);
      loading.catch(function () { return []; }).then(function (records) {
        respRecords = records || [];
        present();
      });
    }

    function present() {
      if (!root) build();
      buildEvents();
      filters = { tipo: 'all', q: '', de: '', ate: '' };
      root.querySelector('[data-evt-search]').value = '';
      root.querySelector('[data-evt-de]').value = '';
      root.querySelector('[data-evt-ate]').value = '';
      root.querySelector('[data-evt-subtitle]').textContent = node.description || '';
      gridFilters.clear();
      renderList();
      root.classList.add('is-visible');
      window.setTimeout(function () { root.querySelector('.favorite-modal__close').focus(); }, 50);
    }

    function close() {
      if (!root) return;
      gridFilters.closePopover();
      root.classList.remove('is-visible');
      if (opener && document.contains(opener)) opener.focus();
    }

    // Exportação (respeita a busca, o período e os filtros/ordem das colunas)

    var HEADERS = COLUMNS.map(function (column) { return column.label; });

    function exportRows() {
      return visible.map(function (evt) {
        return [TIPO_LABEL[evt.tipo], evt.campo, evt.anterior, evt.novo, evt.usuario, formatDateTime(evt.data)];
      });
    }

    function filterSummary() {
      var parts = [];
      if (filters.tipo !== 'all') parts.push('Evento: ' + TIPO_LABEL[filters.tipo]);
      if (filters.q.trim()) parts.push('Busca: "' + filters.q.trim() + '"');
      if (filters.de) parts.push('De: ' + formatDate(filters.de));
      if (filters.ate) parts.push('Até: ' + formatDate(filters.ate));
      var colFilters = gridFilters.state.columnFilters;
      Object.keys(colFilters).forEach(function (field) {
        var column = COLUMNS.filter(function (c) { return c.field === field; })[0];
        var f = colFilters[field];
        var text = '';
        if (f.values) text = f.values.join(', ');
        else if (f.text) text = 'contém "' + f.text + '"';
        else text = [f.from ? 'de ' + formatDate(f.from) : '', f.to ? 'até ' + formatDate(f.to) : ''].join(' ').trim();
        parts.push(column.label + ': ' + text);
      });
      return parts.length ? parts.join(' · ') : 'Sem filtros (todos os registros)';
    }

    function generatedLine() {
      return 'Gerado em ' + formatDateTime(stamp(new Date())) + ' por ' + opts.currentUser;
    }

    function fileName(ext) {
      var now = new Date();
      var day = now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate());
      return 'historico-estrutura-' + slug(node.description) + '-' + day + '.' + ext;
    }

    function exportXlsx() {
      return loadScript(LIB_XLSX, function () { return window.XLSX; }).then(function () {
        var aoa = [
          ['Histórico da estrutura'],
          [node.description || ''],
          [filterSummary()],
          [generatedLine()],
          []
        ].concat([HEADERS], exportRows());
        var sheet = window.XLSX.utils.aoa_to_sheet(aoa);
        sheet['!cols'] = [{ wch: 14 }, { wch: 22 }, { wch: 34 }, { wch: 52 }, { wch: 22 }, { wch: 18 }];
        sheet['!autofilter'] = { ref: 'A6:F' + aoa.length };
        var book = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(book, sheet, 'Histórico');
        var data = window.XLSX.write(book, { bookType: 'xlsx', type: 'array' });
        var blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = fileName('xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      });
    }

    function exportPdf() {
      return loadScript(LIB_JSPDF, function () { return window.jspdf; })
        .then(function () { return loadScript(LIB_AUTOTABLE, function () { return window.jspdf.jsPDF.API.autoTable; }); })
        .then(function () {
          var doc = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
          var width = doc.internal.pageSize.getWidth();
          var height = doc.internal.pageSize.getHeight();
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(16);
          doc.setTextColor(15, 23, 42);
          doc.text('Histórico da estrutura', 40, 44);
          doc.setFontSize(12);
          doc.text(node.description || '', 40, 64);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(101, 117, 139);
          doc.text(filterSummary(), 40, 80);
          doc.text(generatedLine(), 40, 93);

          doc.autoTable({
            head: [HEADERS],
            body: exportRows(),
            startY: 106,
            margin: { left: 40, right: 40, bottom: 40 },
            theme: 'grid',
            styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 5, lineColor: [229, 234, 240], lineWidth: 0.5, textColor: [15, 23, 42], overflow: 'linebreak' },
            headStyles: { fillColor: [255, 107, 0], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: {
              0: { cellWidth: 68 }, 1: { cellWidth: 100 }, 2: { cellWidth: 'auto' },
              3: { cellWidth: 'auto' }, 4: { cellWidth: 100 }, 5: { cellWidth: 82 }
            },
            didDrawPage: function () {
              doc.setFontSize(8);
              doc.setTextColor(101, 117, 139);
              doc.text('Página ' + doc.internal.getNumberOfPages(), width - 40, height - 18, { align: 'right' });
            }
          });
          doc.save(fileName('pdf'));
        });
    }

    function exportAs(kind) {
      if (!visible.length) return;
      var run = kind === 'pdf' ? exportPdf : exportXlsx;
      run().then(function () {
        if (opts.toast) opts.toast('success', 'Arquivo ' + (kind === 'pdf' ? 'PDF' : 'Excel') + ' gerado com sucesso.');
      }).catch(function () {
        if (opts.toast) opts.toast('error', 'Não foi possível gerar o arquivo. Verifique a conexão e tente novamente.');
      });
    }

    if (opts.openButton) opts.openButton.addEventListener('click', function () { open(); });

    return { open: open, close: close, recordChanges: recordChanges };
  }

  // Histórico de responsáveis de uma estrutura (JSON mockado + trocas feitas nesta sessão no
  // formulário). Mesma regra do formulário: o registro novo encerra o vigente no dia anterior.
  var RESP_URL = 'data/historico-responsaveis.json';
  var RESP_EXTRAS_KEY = 'bipperHistoricoResponsaveisExtras';

  function dayBefore(iso) {
    var p = iso.split('-');
    return new Date(Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2]) - 1)).toISOString().slice(0, 10);
  }

  function loadResponsaveis(type, id) {
    var extras = [];
    try { extras = (JSON.parse(sessionStorage.getItem(RESP_EXTRAS_KEY) || '{}') || {})[type + ':' + id] || []; } catch (e) { extras = []; }
    return fetch(RESP_URL)
      .then(function (res) { return res.json(); })
      .then(function (data) { return (data[type] && data[type][id]) || []; })
      .catch(function () { return []; })
      .then(function (base) {
        if (!extras.length) return base;
        var limite = dayBefore(extras[extras.length - 1].dataInicio);
        var rest = base.map(function (rec, index) {
          if (index !== 0 || (rec.dataFim && rec.dataFim <= limite)) return rec;
          return Object.assign({}, rec, { dataFim: limite });
        });
        return extras.concat(rest);
      });
  }

  window.BipperHistoricoEstrutura = { create: create, loadResponsaveis: loadResponsaveis };
})();
