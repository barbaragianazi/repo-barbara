/* Dropdown de seleção múltipla (checkboxes) no mesmo visual dos selects
   customizados (custom-select.css). Diferente do custom-select.js, não envolve
   um <select> nativo: o gatilho é um <button> dentro de um .cs-select e a lista
   de opções vem de um callback, então a página é dona dos dados.

   Marcação mínima (ver shared/design.md, "Multiselect"):
     <span class="cs-select"><button type="button" class="cs-multi-trigger">…</button></span>

   Uso:
     var picker = BipperCustomMultiselect.create({
         trigger: button,
         label: 'Personalizar colunas',           // aria-label do painel
         getOptions: function () {                 // na ordem exibida
             return [{ value: 'acoes', label: 'Ações', checked: true, locked: true },
                     { value: 'cidade', label: 'Cidade', checked: false }];
         },
         onToggle: function (value, checked) {},
         onReorder: function (value, targetValue, after) {},  // opcional: liga o arrastar
         resetLabel: 'Restaurar padrão',           // opcional: rodapé com botão
         isDefault: function () { return true; },  // desabilita o botão quando já é o padrão
         onReset: function () {}
     });
     picker.refresh();  // reconstrói a lista (ordem/opções mudaram)
     picker.update();   // só atualiza checkboxes/botão (estado mudou)
     picker.close();

   Opções `locked` ficam marcadas, desabilitadas e não podem ser arrastadas nem
   servir de alvo do arrastar. Fecha ao clicar fora, Esc, rolar a página ou redimensionar. */

(function () {
    var ICON_GRIP = '<i class="fa-solid fa-grip-vertical cs-columns-option__grip" aria-hidden="true"></i>';
    var ICON_LOCK = '<i class="fa-solid fa-lock cs-columns-option__grip" aria-hidden="true"></i>';

    var ICON_RESET = '<i class="fa-solid fa-arrow-rotate-left cs-columns-reset__icon" aria-hidden="true"></i>';

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
        });
    }

    function create(config) {
        var trigger = config.trigger;
        var wrapper = trigger.parentElement;
        var panel = null;
        var draggedValue = null;

        function options() {
            return config.getOptions() || [];
        }

        function updatePanelState() {
            if (!panel) return;
            var byValue = {};
            options().forEach(function (option) { byValue[option.value] = option; });
            panel.querySelectorAll('input[data-value]').forEach(function (input) {
                var option = byValue[input.getAttribute('data-value')];
                if (!option) return;
                input.checked = !!option.checked;
                input.closest('.cs-columns-option').setAttribute('aria-selected', String(!!option.checked));
            });
            var reset = panel.querySelector('[data-multi-reset]');
            if (reset && config.isDefault) reset.disabled = !!config.isDefault();
        }

        function renderList() {
            if (!panel) return;
            var list = panel.querySelector('.cs-columns-list');
            var scrollTop = list.scrollTop;
            var focused = document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute('data-value');
            list.innerHTML = options().map(function (option) {
                var draggable = !option.locked && config.onReorder;
                return '<li class="cs-panel__option cs-columns-option' + (option.locked ? ' is-locked' : '') + '" role="option"' +
                    (option.locked ? ' aria-disabled="true"' : '') + (draggable ? ' draggable="true"' : '') +
                    ' data-value="' + escapeHtml(option.value) + '">' +
                    (option.locked ? ICON_LOCK : (draggable ? ICON_GRIP : '<span class="cs-columns-option__grip"></span>')) +
                    '<label class="cs-columns-option__label"><input type="checkbox" data-value="' + escapeHtml(option.value) + '"' +
                    (option.locked ? ' disabled' : '') + '><span>' + escapeHtml(option.label) + '</span></label></li>';
            }).join('');
            list.scrollTop = scrollTop;
            updatePanelState();
            if (focused) {
                var again = list.querySelector('input[data-value="' + focused + '"]');
                if (again) again.focus();
            }
        }

        function position() {
            var rect = trigger.getBoundingClientRect();
            panel.style.minWidth = Math.max(rect.width, 250) + 'px';
            panel.style.fontSize = getComputedStyle(trigger).fontSize;
            var spaceBelow = window.innerHeight - rect.bottom;
            if (spaceBelow < 320 && rect.top > spaceBelow) {
                panel.style.top = 'auto';
                panel.style.bottom = (window.innerHeight - rect.top + 6) + 'px';
            } else {
                panel.style.bottom = 'auto';
                panel.style.top = (rect.bottom + 6) + 'px';
            }
            panel.style.left = Math.max(12, Math.min(rect.left, window.innerWidth - panel.offsetWidth - 12)) + 'px';
        }

        function close() {
            if (!panel) return;
            panel.remove();
            panel = null;
            trigger.setAttribute('aria-expanded', 'false');
            wrapper.classList.remove('is-open');
        }

        function open(focusFirst) {
            if (panel) return;
            panel = document.createElement('div');
            panel.className = 'cs-panel cs-panel--columns';
            panel.setAttribute('role', 'dialog');
            panel.setAttribute('aria-label', config.label || '');
            panel.innerHTML = '<ul class="cs-columns-list" role="listbox" aria-multiselectable="true"></ul>' +
                (config.resetLabel ? '<div class="cs-columns-footer"><button type="button" class="cs-columns-reset" data-multi-reset>' + ICON_RESET + '<span>' + escapeHtml(config.resetLabel) + '</span></button></div>' : '');
            document.body.appendChild(panel);
            trigger.setAttribute('aria-expanded', 'true');
            wrapper.classList.add('is-open');
            renderList();
            position();
            requestAnimationFrame(function () { if (panel) panel.classList.add('is-open'); });
            if (focusFirst) {
                var first = panel.querySelector('input[data-value]:not(:disabled)');
                if (first) first.focus();
            }
        }

        function clearDropMarks() {
            if (!panel) return;
            panel.querySelectorAll('.is-dragging, .is-drop-before, .is-drop-after').forEach(function (item) {
                item.classList.remove('is-dragging', 'is-drop-before', 'is-drop-after');
            });
        }

        function inPanel(target) {
            return !!(panel && target.closest && target.closest('.cs-panel--columns') === panel);
        }

        // Listeners no document (o painel vive no <body>); todos ignoram eventos
        // quando o painel está fechado.
        trigger.addEventListener('click', function (event) {
            if (panel) close();
            else open(event.detail === 0);
        });

        document.addEventListener('mousedown', function (event) {
            if (!panel || inPanel(event.target) || (event.target.closest && event.target.closest('button') === trigger)) return;
            close();
        });

        document.addEventListener('keydown', function (event) {
            if (event.key !== 'Escape' || !panel) return;
            event.stopPropagation();
            close();
            trigger.focus();
        }, true);

        window.addEventListener('scroll', function (event) {
            if (panel && !inPanel(event.target)) close();
        }, true);
        window.addEventListener('resize', close);

        document.addEventListener('change', function (event) {
            var input = event.target;
            if (!inPanel(input) || !input.matches('input[data-value]')) return;
            config.onToggle(input.getAttribute('data-value'), input.checked);
        });

        document.addEventListener('click', function (event) {
            if (!inPanel(event.target) || !event.target.closest('[data-multi-reset]')) return;
            if (config.onReset) config.onReset();
        });

        if (config.onReorder) {
            document.addEventListener('dragstart', function (event) {
                var item = inPanel(event.target) && event.target.closest('.cs-columns-option[draggable="true"]');
                if (!item) return;
                draggedValue = item.getAttribute('data-value');
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', draggedValue);
                item.classList.add('is-dragging');
            });

            document.addEventListener('dragover', function (event) {
                if (!panel || draggedValue === null) return;
                panel.querySelectorAll('.is-drop-before, .is-drop-after').forEach(function (other) {
                    other.classList.remove('is-drop-before', 'is-drop-after');
                });
                var item = inPanel(event.target) && event.target.closest('.cs-columns-option');
                if (!item || item.classList.contains('is-locked') || item.getAttribute('data-value') === draggedValue) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                var rect = item.getBoundingClientRect();
                item.classList.add(event.clientY > rect.top + rect.height / 2 ? 'is-drop-after' : 'is-drop-before');
            });

            document.addEventListener('drop', function (event) {
                var item = draggedValue !== null && inPanel(event.target) && event.target.closest('.cs-columns-option');
                if (!item || item.classList.contains('is-locked')) return;
                event.preventDefault();
                var value = draggedValue;
                var after = item.classList.contains('is-drop-after');
                draggedValue = null;
                clearDropMarks();
                config.onReorder(value, item.getAttribute('data-value'), after);
            });

            document.addEventListener('dragend', function () {
                if (draggedValue === null) return;
                draggedValue = null;
                clearDropMarks();
            });
        }

        return { open: open, close: close, refresh: renderList, update: updatePanelState, isOpen: function () { return !!panel; } };
    }

    window.BipperCustomMultiselect = { create: create };
})();
