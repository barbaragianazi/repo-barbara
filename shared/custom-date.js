/* Calendário estilizado para <input type="date">. Mesma ideia do custom-select.js:
   o input nativo continua sendo o elemento real (mesmo id, .value em ISO yyyy-mm-dd,
   evento "change", min/max) — só o popup do navegador, que não pode ser estilizado,
   é trocado por este painel (cores/radius do design system, claro e escuro). */

(function () {
    var MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    var WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    function pad(n) { return String(n).padStart(2, '0'); }
    function toISO(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
    function fromISO(s) {
        if (!s) return null;
        var p = String(s).split('-');
        if (p.length !== 3) return null;
        var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
        return isNaN(d) ? null : d;
    }
    function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
    function sameDay(a, b) {
        return a && b && a.getFullYear() === b.getFullYear()
            && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }

    var active = null; // { input, wrapper, panel, viewDate, close } do calendário aberto

    function closeActive() {
        if (!active) return;
        active.panel.remove();
        active.wrapper.classList.remove('is-open');
        active = null;
    }

    // Alinha o painel pelo "anchor" (o popover que contém o campo, se houver
    // [data-cd-popover]; senão o próprio campo): borda esquerda por padrão, ou borda
    // direita quando data-cd-popover="right". Y sempre abaixo do campo clicado.
    function positionPanel(panel, input, anchor, align) {
        var box = anchor.getBoundingClientRect();
        var field = input.getBoundingClientRect();
        var pw = panel.offsetWidth || 272;
        var left = align === 'right' ? box.right - pw : box.left;
        left = Math.min(left, window.innerWidth - pw - 8);
        panel.style.left = Math.max(8, left) + 'px';

        var spaceBelow = window.innerHeight - field.bottom;
        if (spaceBelow < 340 && field.top > spaceBelow) {
            panel.style.top = 'auto';
            panel.style.bottom = (window.innerHeight - field.top + 6) + 'px';
        } else {
            panel.style.bottom = 'auto';
            panel.style.top = (field.bottom + 6) + 'px';
        }
    }

    function renderGrid(ctx) {
        var input = ctx.input;
        var min = fromISO(input.min);
        var max = fromISO(input.max);
        var selected = fromISO(input.value);
        var today = startOfDay(new Date());
        var y = ctx.viewDate.getFullYear();
        var m = ctx.viewDate.getMonth();
        var startOffset = new Date(y, m, 1).getDay();
        var daysInMonth = new Date(y, m + 1, 0).getDate();

        var cells = '';
        for (var i = 0; i < startOffset; i++) cells += '<span class="cd-day is-empty" aria-hidden="true"></span>';
        for (var d = 1; d <= daysInMonth; d++) {
            var date = new Date(y, m, d);
            var disabled = (min && date < min) || (max && date > max);
            var cls = 'cd-day';
            if (disabled) cls += ' is-disabled';
            if (sameDay(date, today)) cls += ' is-today';
            if (sameDay(date, selected)) cls += ' is-selected';
            cells += '<button type="button" class="' + cls + '"' + (disabled ? ' disabled' : '')
                + ' data-cd-day="' + toISO(date) + '"'
                + (sameDay(date, selected) ? ' aria-current="date"' : '') + '>' + d + '</button>';
        }

        ctx.panel.innerHTML =
            '<div class="cd-panel__head">'
            + '<button type="button" class="cd-nav" data-cd-prev aria-label="Mês anterior">'
            + '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"></path></svg></button>'
            + '<span class="cd-panel__title">' + MONTHS[m] + ' de ' + y + '</span>'
            + '<button type="button" class="cd-nav" data-cd-next aria-label="Próximo mês">'
            + '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"></path></svg></button>'
            + '</div>'
            + '<div class="cd-week">' + WEEKDAYS.map(function (w) { return '<span>' + w + '</span>'; }).join('') + '</div>'
            + '<div class="cd-grid">' + cells + '</div>'
            + '<div class="cd-panel__foot">'
            + '<button type="button" class="cd-link" data-cd-clear>Limpar</button>'
            + '<button type="button" class="cd-link" data-cd-today>Hoje</button>'
            + '</div>';
    }

    function commit(input, isoOrEmpty) {
        input.value = isoOrEmpty;
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function openCalendar(input, wrapper) {
        closeAllPanels();

        var selected = fromISO(input.value);
        var base = selected || new Date();
        var popover = input.closest('[data-cd-popover]');
        var ctx = {
            input: input,
            wrapper: wrapper,
            anchor: popover || wrapper,
            align: (popover && popover.getAttribute('data-cd-popover') === 'right') ? 'right' : 'left',
            panel: document.createElement('div'),
            viewDate: new Date(base.getFullYear(), base.getMonth(), 1)
        };
        ctx.panel.className = 'cd-panel';
        ctx.panel.setAttribute('role', 'dialog');
        ctx.panel.setAttribute('aria-label', 'Calendário');

        renderGrid(ctx);
        document.body.appendChild(ctx.panel);
        positionPanel(ctx.panel, input, ctx.anchor, ctx.align);
        wrapper.classList.add('is-open');
        requestAnimationFrame(function () {
            if (active === ctx) ctx.panel.classList.add('is-open');
        });

        // Segura o foco / impede o fechamento por clique-fora antes do clique resolver.
        ctx.panel.addEventListener('mousedown', function (e) { e.preventDefault(); });

        ctx.panel.addEventListener('click', function (e) {
            var t = e.target;
            if (t.closest('[data-cd-prev]')) {
                ctx.viewDate.setMonth(ctx.viewDate.getMonth() - 1);
                renderGrid(ctx);
                positionPanel(ctx.panel, ctx.input, ctx.anchor, ctx.align);
            } else if (t.closest('[data-cd-next]')) {
                ctx.viewDate.setMonth(ctx.viewDate.getMonth() + 1);
                renderGrid(ctx);
                positionPanel(ctx.panel, ctx.input, ctx.anchor, ctx.align);
            } else if (t.closest('[data-cd-today]')) {
                commit(input, toISO(startOfDay(new Date())));
                closeActive();
            } else if (t.closest('[data-cd-clear]')) {
                commit(input, '');
                closeActive();
            } else {
                var day = t.closest('[data-cd-day]');
                if (day && !day.disabled) {
                    commit(input, day.dataset.cdDay);
                    closeActive();
                }
            }
        });

        active = ctx;
    }

    function enhance(input) {
        if (input.dataset.cdEnhanced || input.type !== 'date') return;
        input.dataset.cdEnhanced = 'true';

        var wrapper = input.closest('.cd-field');
        if (!wrapper) {
            wrapper = document.createElement('span');
            wrapper.className = 'cd-field';
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);
        }

        function toggle() {
            if (input.disabled) return;
            (active && active.input === input) ? closeActive() : openCalendar(input, wrapper);
        }

        // Bloqueia o popup nativo; nosso painel assume o clique.
        input.addEventListener('mousedown', function (e) { e.preventDefault(); toggle(); });
        input.addEventListener('click', function (e) { e.preventDefault(); });
        input.addEventListener('keydown', function (e) {
            if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') {
                e.preventDefault();
                if (!(active && active.input === input)) openCalendar(input, wrapper);
            } else if (e.key === 'Escape' && active && active.input === input) {
                closeActive();
            }
        });
        // Se o valor mudar por fora (reset de filtros, etc.) e o painel estiver aberto, redesenha.
        input.addEventListener('change', function () {
            if (active && active.input === input) {
                var sel = fromISO(input.value) || new Date();
                active.viewDate = new Date(sel.getFullYear(), sel.getMonth(), 1);
                renderGrid(active);
            }
        });

        input._cdClose = function () { if (active && active.input === input) closeActive(); };
        input._cdIsOpen = function () { return !!(active && active.input === input); };
    }

    function closeAllPanels() { closeActive(); }

    document.addEventListener('mousedown', function (e) {
        if (!active) return;
        if (e.target.closest('.cd-panel')) return;
        if (e.target.closest('.cd-field') === active.wrapper) return;
        closeActive();
    });
    window.addEventListener('scroll', function (e) {
        var t = e.target;
        if (t && t.closest && t.closest('.cd-panel')) return;
        closeActive();
    }, true);
    window.addEventListener('resize', closeActive);

    function enhanceAll(root) {
        (root || document).querySelectorAll('input[type="date"]').forEach(enhance);
    }

    window.BipperCustomDate = { enhance: enhance, enhanceAll: enhanceAll, closeAll: closeAllPanels };

    document.addEventListener('DOMContentLoaded', function () {
        enhanceAll(document);
    });
})();
