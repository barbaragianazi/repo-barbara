/* Faz os <select> nativos abrirem um painel de opções estilizado (custom-select.css)
   em vez do popup nativo do navegador, que não pode ser estilizado (cor/radius) em
   nenhum browser. O <select> continua sendo o elemento real: mesmo id, mesmo .value,
   mesmo evento "change", mesma aparência fechada — só a lista aberta é trocada. */

(function () {
    function buildPanel(select, onPick) {
        var panel = document.createElement('ul');
        panel.className = 'cs-panel';
        panel.setAttribute('role', 'listbox');

        Array.prototype.forEach.call(select.options, function (opt) {
            var li = document.createElement('li');
            li.className = 'cs-panel__option';
            li.setAttribute('role', 'option');
            li.dataset.value = opt.value;
            li.textContent = opt.text;

            if (opt.disabled) li.setAttribute('aria-disabled', 'true');
            if (opt.value === select.value) {
                li.classList.add('is-selected');
                li.setAttribute('aria-selected', 'true');
            }

            li.addEventListener('mousedown', function (e) {
                e.preventDefault();
                if (opt.disabled) return;
                onPick(opt.value);
            });

            panel.appendChild(li);
        });

        return panel;
    }

    function position(panel, select) {
        var r = select.getBoundingClientRect();
        panel.style.minWidth = r.width + 'px';
        panel.style.fontSize = getComputedStyle(select).fontSize;

        var spaceBelow = window.innerHeight - r.bottom;
        if (spaceBelow < 220 && r.top > spaceBelow) {
            panel.style.top = 'auto';
            panel.style.bottom = (window.innerHeight - r.top + 6) + 'px';
        } else {
            panel.style.bottom = 'auto';
            panel.style.top = (r.bottom + 6) + 'px';
        }
        panel.style.left = r.left + 'px';
    }

    function enhance(select) {
        if (select.dataset.csEnhanced || select.multiple) return;
        select.dataset.csEnhanced = 'true';

        var wrapper = select.closest('.cs-select');
        if (!wrapper) {
            wrapper = document.createElement('span');
            wrapper.className = 'cs-select';
            select.parentNode.insertBefore(wrapper, select);
            wrapper.appendChild(select);
        }

        var panel = null;

        function closePanel() {
            if (!panel) return;
            panel.remove();
            panel = null;
            select.classList.remove('is-cs-open');
            wrapper.classList.remove('is-open');
        }

        function openPanel() {
            if (select.disabled) return;
            closeAllPanels();
            select.classList.add('is-cs-open');
            wrapper.classList.add('is-open');

            panel = buildPanel(select, function (value) {
                select.value = value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                closePanel();
            });

            document.body.appendChild(panel);
            position(panel, select);
            requestAnimationFrame(function () {
                if (panel) panel.classList.add('is-open');
            });
        }

        select.addEventListener('mousedown', function (e) {
            e.preventDefault();
            panel ? closePanel() : openPanel();
        });

        select.addEventListener('keydown', function (e) {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                panel ? closePanel() : openPanel();
            } else if (e.key === 'Escape') {
                closePanel();
            }
        });

        // Não fechamos no "blur": clicar/arrastar a barra de rolagem do painel
        // tira o foco do <select> e fechava a lista no meio do scroll. O clique
        // fora já é tratado pelo mousedown no document; Escape também fecha.

        select._csClose = closePanel;
        select._csIsOpen = function () { return !!panel; };
    }

    function closeAllPanels() {
        document.querySelectorAll('select[data-cs-enhanced]').forEach(function (select) {
            if (select._csIsOpen && select._csIsOpen()) select._csClose();
        });
    }

    document.addEventListener('mousedown', function (e) {
        if (e.target.tagName === 'SELECT') return;
        if (e.target.closest('.cs-panel')) return;
        closeAllPanels();
    });

    window.addEventListener('scroll', function (e) {
        // Rolar dentro do próprio painel não deve fechá-lo — só o scroll da
        // página/containers externos é que invalida a posição do painel.
        var t = e.target;
        if (t && t.closest && t.closest('.cs-panel')) return;
        closeAllPanels();
    }, true);
    window.addEventListener('resize', closeAllPanels);

    function enhanceAll(root) {
        (root || document).querySelectorAll('select').forEach(enhance);
    }

    window.BipperCustomSelect = { enhance: enhance, enhanceAll: enhanceAll };

    document.addEventListener('DOMContentLoaded', function () {
        enhanceAll(document);
    });
})();
