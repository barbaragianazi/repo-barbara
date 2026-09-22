(function () {
  'use strict';

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  const CLEAR_FILTERS_BTN = '<button type="button" class="btn btn-secondary clear-filters is-active" data-clear-field="__all">'
    + '<svg class="clear-filters__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21"></path>'
    + '<path d="m5.082 11.09 8.828 8.828"></path></svg>'
    + '<span>Limpar filtros</span></button>';

  const brlWhole = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  function isRealDate(value) {
    return value instanceof Date && !Number.isNaN(value.getTime());
  }

  function isoToDate(iso, endOfDay) {
    if (!iso) return null;
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return null;
    return endOfDay ? new Date(y, m - 1, d, 23, 59, 59, 999) : new Date(y, m - 1, d);
  }

  function create(config) {
    const table = config.table;
    if (!table) throw new Error('BipperGridColumnFilters: config.table obrigatorio');
    const onChange = typeof config.onChange === 'function' ? config.onChange : function () {};
    const parseBRL = config.parseBRL || ((v) => {
      const n = parseFloat(String(v).replace(/[^\d,-]/g, '').replace(/\.(?=\d{3})/g, '').replace(',', '.'));
      return Number.isFinite(n) ? n : 0;
    });
    const parseBRDate = config.parseBRDate || ((v) => new Date(v));
    const getValue = config.getValue || ((row, field) => row[field]);
    const chipsHost = config.chipsHost || null;
    const COLUMN_FILTERS = config.columns || [];
    const COLUMN_BY_FIELD = Object.fromEntries(COLUMN_FILTERS.filter(Boolean).map((cfg) => [cfg.field, cfg]));
    const COLUMN_LABELS = {};
    const state = { columnFilters: {}, sort: { field: null, dir: null }, lastRows: [] };

    function optionLabel(cfg, rawValue) {
      const base = cfg.labelFn ? cfg.labelFn(rawValue) : rawValue;
      return String(base == null || base === '' ? '—' : base);
    }

    function columnOptions(cfg) {
      const set = new Set((state.lastRows || []).map((item) => optionLabel(cfg, getValue(item, cfg.field))));
      return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));
    }

    function passesColumnFilters(item) {
      return Object.keys(state.columnFilters).every((field) => {
        const cfg = COLUMN_BY_FIELD[field];
        const f = state.columnFilters[field];
        if (!cfg || !f) return true;
        const raw = getValue(item, field);
        if (cfg.type === 'text') {
          return String(raw || '').toLowerCase().includes(String(f.text || '').toLowerCase());
        }
        if (cfg.type === 'list') {
          return f.values.includes(optionLabel(cfg, raw));
        }
        if (cfg.type === 'range') {
          const n = parseBRL(raw);
          if (f.min != null && n < f.min) return false;
          if (f.max != null && n > f.max) return false;
          return true;
        }
        if (cfg.type === 'date') {
          const d = parseBRDate(raw);
          const real = isRealDate(d);
          if (f.mode === 'scheduled' && !real) return false;
          if (f.mode === 'unscheduled') return !real;
          const from = isoToDate(f.from);
          const to = isoToDate(f.to, true);
          if (from && (!real || d < from)) return false;
          if (to && (!real || d > to)) return false;
          return true;
        }
        return true;
      });
    }

    function filterIsEmpty(cfg, f) {
      if (!cfg || !f) return true;
      if (cfg.type === 'text') return !String(f.text || '').trim();
      if (cfg.type === 'list') return !f.values || !f.values.length;
      if (cfg.type === 'range') return f.min == null && f.max == null;
      if (cfg.type === 'date') return !f.mode && !f.from && !f.to;
      return true;
    }

    function describeFilter(cfg, f) {
      if (cfg.type === 'text') return `contém "${f.text}"`;
      if (cfg.type === 'list') {
        return f.values.length <= 2
          ? f.values.join(', ')
          : `${f.values.slice(0, 2).join(', ')} +${f.values.length - 2}`;
      }
      if (cfg.type === 'range') {
        const lo = f.min != null ? brlWhole.format(f.min) : null;
        const hi = f.max != null ? brlWhole.format(f.max) : null;
        if (lo && hi) return `${lo} – ${hi}`;
        return lo ? `a partir de ${lo}` : `até ${hi}`;
      }
      if (cfg.type === 'date') {
        if (f.mode === 'unscheduled') return 'não agendados';
        const parts = [];
        if (f.mode === 'scheduled') parts.push('agendados');
        if (f.from) parts.push(`de ${f.from.split('-').reverse().join('/')}`);
        if (f.to) parts.push(`até ${f.to.split('-').reverse().join('/')}`);
        return parts.join(' ') || 'qualquer';
      }
      return '';
    }

    function hasActive() {
      return Boolean(Object.keys(state.columnFilters).length || state.sort.field);
    }

    function renderChips() {
      if (!chipsHost) return;
      const fields = Object.keys(state.columnFilters);
      if (!fields.length) {
        chipsHost.classList.remove('has-filters');
        chipsHost.innerHTML = '';
        return;
      }
      chipsHost.classList.add('has-filters');
      chipsHost.innerHTML = fields.map((field) => {
        const cfg = COLUMN_BY_FIELD[field];
        return `
          <button type="button" class="col-chip" data-clear-field="${field}" aria-label="Remover filtro ${escapeHtml(COLUMN_LABELS[field])}">
            <span class="col-chip__label">${escapeHtml(COLUMN_LABELS[field])}:</span>
            <span class="col-chip__value">${escapeHtml(describeFilter(cfg, state.columnFilters[field]))}</span>
            <span class="col-chip__x" aria-hidden="true">&times;</span>
          </button>`;
      }).join('') + CLEAR_FILTERS_BTN;
    }

    function syncIndicators() {
      table.querySelectorAll('thead th[data-col-field]').forEach((th) => {
        const field = th.dataset.colField;
        th.classList.toggle('has-filter', Boolean(state.columnFilters[field]));
        const sorted = state.sort.field === field ? state.sort.dir : null;
        th.classList.toggle('is-sorted', Boolean(sorted));
        const caret = th.querySelector('.th-sort__caret');
        if (caret) {
          caret.className = 'th-sort__caret fa-solid '
            + (sorted === 'asc' ? 'fa-sort-up' : sorted === 'desc' ? 'fa-sort-down' : 'fa-sort');
        }
      });
    }

    function setColumnFilter(field, value) {
      const cfg = COLUMN_BY_FIELD[field];
      if (filterIsEmpty(cfg, value)) delete state.columnFilters[field];
      else state.columnFilters[field] = value;
      renderChips();
      syncIndicators();
      onChange();
    }

    function clearAll() {
      state.columnFilters = {};
      state.sort = { field: null, dir: null };
      renderChips();
      syncIndicators();
      onChange();
    }

    function toggleSort(field) {
      if (state.sort.field !== field) state.sort = { field, dir: 'asc' };
      else if (state.sort.dir === 'asc') state.sort.dir = 'desc';
      else state.sort = { field: null, dir: null };
      syncIndicators();
      onChange();
    }

    function compareValues(cfg, a, b) {
      if (cfg && cfg.type === 'range') return parseBRL(a) - parseBRL(b);
      if (cfg && cfg.type === 'date') {
        const da = parseBRDate(a);
        const db = parseBRDate(b);
        return (isRealDate(da) ? da.getTime() : Infinity) - (isRealDate(db) ? db.getTime() : Infinity);
      }
      return String(a || '').localeCompare(String(b || ''), 'pt-BR', { numeric: true });
    }

    function sortRows(rows) {
      const { field, dir } = state.sort;
      if (!field) return rows;
      const cfg = COLUMN_BY_FIELD[field];
      const mult = dir === 'desc' ? -1 : 1;
      return [...rows].sort((a, b) => mult * compareValues(cfg, getValue(a, field), getValue(b, field)));
    }

    let colPopover;
    let colPopoverField = null;

    function ensurePopover() {
      if (colPopover) return colPopover;
      colPopover = document.createElement('div');
      colPopover.className = 'col-popover';
      colPopover.setAttribute('role', 'dialog');
      document.body.appendChild(colPopover);
      document.addEventListener('mousedown', (event) => {
        if (!colPopover.classList.contains('is-open')) return;
        if (event.target.closest('.col-popover') || event.target.closest('.col-filter-btn')) return;
        closeColumnPopover();
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && colPopover.classList.contains('is-open')) {
          event.stopPropagation();
          closeColumnPopover();
        }
      });
      window.addEventListener('resize', closeColumnPopover);
      const wrap = table.closest('.payments-table-wrap');
      if (wrap) wrap.addEventListener('scroll', closeColumnPopover);
      return colPopover;
    }

    function closeColumnPopover() {
      if (colPopover) colPopover.classList.remove('is-open');
      colPopoverField = null;
    }

    function openColumnPopover(cfg, anchorBtn) {
      const pop = ensurePopover();
      if (colPopoverField === cfg.field && pop.classList.contains('is-open')) {
        closeColumnPopover();
        return;
      }
      colPopoverField = cfg.field;
      pop.innerHTML = buildPopoverContent(cfg);
      pop.classList.add('is-open');
      wirePopover(cfg, pop);
      positionPopover(anchorBtn);
    }

    function positionPopover(anchorBtn) {
      const r = anchorBtn.getBoundingClientRect();
      const pop = colPopover;
      pop.style.visibility = 'hidden';
      pop.style.left = '0px';
      pop.style.top = '0px';
      const pw = pop.offsetWidth;
      const ph = pop.offsetHeight;
      const left = Math.max(12, Math.min(r.left, window.innerWidth - pw - 12));
      let top = r.bottom + 6;
      if (top + ph > window.innerHeight - 12) top = Math.max(12, r.top - ph - 6);
      pop.style.left = `${left}px`;
      pop.style.top = `${top}px`;
      pop.style.visibility = '';
    }

    function buildPopoverContent(cfg) {
      const current = state.columnFilters[cfg.field] || {};
      const head = `<div class="col-popover__head">${escapeHtml(COLUMN_LABELS[cfg.field] || '')}</div>`;
      let body = '';
      if (cfg.type === 'text') {
        body = `<input type="text" class="col-popover__input" data-role="text" placeholder="Contém…" value="${escapeHtml(current.text || '')}">`;
      } else if (cfg.type === 'list') {
        const chosen = new Set(current.values || []);
        body = `
          <input type="search" class="col-popover__input" data-role="search" placeholder="Buscar…">
          <label class="col-popover__check col-popover__check--all">
            <input type="checkbox" data-role="all"><span>Selecionar todos</span>
          </label>
          <div class="col-popover__list" data-role="list">
            ${columnOptions(cfg).map((opt) => `
              <label class="col-popover__check">
                <input type="checkbox" value="${escapeHtml(opt)}" ${chosen.has(opt) ? 'checked' : ''}><span>${escapeHtml(opt)}</span>
              </label>`).join('')}
          </div>`;
      } else if (cfg.type === 'range') {
        body = `
          <div class="col-popover__row">
            <label>Mín<input type="number" inputmode="decimal" data-role="min" value="${current.min != null ? current.min : ''}"></label>
            <label>Máx<input type="number" inputmode="decimal" data-role="max" value="${current.max != null ? current.max : ''}"></label>
          </div>`;
      } else if (cfg.type === 'date') {
        const mode = current.mode || 'any';
        const modes = cfg.scheduleModes ? `
          <div class="col-popover__modes" data-role="modes">
            <label><input type="radio" name="colDateMode-${cfg.field}" value="any" ${mode === 'any' ? 'checked' : ''}><span>Qualquer</span></label>
            <label><input type="radio" name="colDateMode-${cfg.field}" value="scheduled" ${mode === 'scheduled' ? 'checked' : ''}><span>Agendados</span></label>
            <label><input type="radio" name="colDateMode-${cfg.field}" value="unscheduled" ${mode === 'unscheduled' ? 'checked' : ''}><span>Não agendados</span></label>
          </div>` : '';
        body = `
          ${modes}
          <div class="col-popover__row" data-role="dates">
            <label>De<input type="date" data-role="from" value="${current.from || ''}"></label>
            <label>Até<input type="date" data-role="to" value="${current.to || ''}"></label>
          </div>`;
      }
      const foot = `
        <div class="col-popover__foot">
          <button type="button" class="col-popover__btn" data-role="clear">Limpar</button>
          <button type="button" class="col-popover__btn col-popover__btn--primary" data-role="apply">Aplicar</button>
        </div>`;
      return head + body + foot;
    }

    function wirePopover(cfg, pop) {
      const apply = () => {
        setColumnFilter(cfg.field, readPopover(cfg, pop));
        closeColumnPopover();
      };
      pop.querySelector('[data-role="apply"]').addEventListener('click', apply);
      pop.querySelector('[data-role="clear"]').addEventListener('click', () => {
        setColumnFilter(cfg.field, null);
        closeColumnPopover();
      });

      const textInput = pop.querySelector('[data-role="text"]');
      if (textInput) {
        textInput.focus();
        textInput.addEventListener('keydown', (event) => { if (event.key === 'Enter') apply(); });
      }

      if (cfg.type === 'list') {
        const search = pop.querySelector('[data-role="search"]');
        const list = pop.querySelector('[data-role="list"]');
        const allBox = pop.querySelector('[data-role="all"]');
        const boxes = () => [...list.querySelectorAll('input[type="checkbox"]')];
        const syncAll = () => {
          const visible = boxes().filter((b) => !b.closest('label').hidden);
          allBox.checked = visible.length > 0 && visible.every((b) => b.checked);
        };
        search.addEventListener('input', () => {
          const q = search.value.trim().toLowerCase();
          boxes().forEach((b) => { b.closest('label').hidden = Boolean(q) && !b.value.toLowerCase().includes(q); });
          syncAll();
        });
        allBox.addEventListener('change', () => {
          boxes().forEach((b) => { if (!b.closest('label').hidden) b.checked = allBox.checked; });
        });
        list.addEventListener('change', syncAll);
        syncAll();
      }

      if (cfg.type === 'date' && cfg.scheduleModes) {
        const modes = pop.querySelector('[data-role="modes"]');
        const dates = pop.querySelector('[data-role="dates"]');
        const syncDates = () => {
          dates.hidden = modes.querySelector('input:checked').value === 'unscheduled';
        };
        modes.addEventListener('change', syncDates);
        syncDates();
      }
    }

    function readPopover(cfg, pop) {
      if (cfg.type === 'text') {
        const text = pop.querySelector('[data-role="text"]').value.trim();
        return text ? { text } : null;
      }
      if (cfg.type === 'list') {
        const values = [...pop.querySelectorAll('[data-role="list"] input:checked')].map((b) => b.value);
        return values.length ? { values } : null;
      }
      if (cfg.type === 'range') {
        const min = pop.querySelector('[data-role="min"]').value;
        const max = pop.querySelector('[data-role="max"]').value;
        return (min || max) ? { min: min !== '' ? Number(min) : null, max: max !== '' ? Number(max) : null } : null;
      }
      if (cfg.type === 'date') {
        const modeEl = pop.querySelector('[data-role="modes"] input:checked');
        const mode = modeEl ? modeEl.value : 'any';
        if (mode === 'unscheduled') return { mode };
        const from = pop.querySelector('[data-role="from"]').value;
        const to = pop.querySelector('[data-role="to"]').value;
        const result = {};
        if (mode === 'scheduled') result.mode = 'scheduled';
        if (from) result.from = from;
        if (to) result.to = to;
        return Object.keys(result).length ? result : null;
      }
      return null;
    }

    function initColumnFilters() {
      const ths = table.querySelectorAll('thead th');
      COLUMN_FILTERS.forEach((cfg, index) => {
        const th = ths[index];
        if (!th || !cfg) return;
        const label = th.textContent.trim();
        COLUMN_LABELS[cfg.field] = label;
        th.dataset.colField = cfg.field;
        th.classList.add('is-filterable');
        th.innerHTML = `
          <span class="th-inner">
            <button type="button" class="th-sort" title="Ordenar por ${escapeHtml(label)}"><span class="th-sort__text">${escapeHtml(label)}</span><i class="th-sort__caret fa-solid fa-sort" aria-hidden="true"></i></button>
            <button type="button" class="col-filter-btn" aria-haspopup="dialog" aria-label="Filtrar ${escapeHtml(label)}"><i class="fa-solid fa-filter" aria-hidden="true"></i></button>
          </span>`;
        th.querySelector('.th-sort').addEventListener('click', () => toggleSort(cfg.field));
        th.querySelector('.col-filter-btn').addEventListener('click', (event) => {
          event.stopPropagation();
          openColumnPopover(cfg, event.currentTarget);
        });
      });

      if (chipsHost) {
        chipsHost.addEventListener('click', (event) => {
          const btn = event.target.closest('[data-clear-field]');
          if (!btn) return;
          if (btn.dataset.clearField === '__all') { clearAll(); return; }
          setColumnFilter(btn.dataset.clearField, null);
        });
      }
    }

    function apply(rows) {
      const list = Array.isArray(rows) ? rows : [];
      state.lastRows = list.slice();
      return sortRows(list.filter(passesColumnFilters));
    }

    initColumnFilters();
    syncIndicators();
    renderChips();

    return {
      apply,
      clear: clearAll,
      hasActive,
      state,
      closePopover: closeColumnPopover
    };
  }

  window.BipperGridColumnFilters = { create };
})();
