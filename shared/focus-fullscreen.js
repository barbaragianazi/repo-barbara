/* Faz o "Modo foco" das telas também entrar em tela cheia do navegador (o mesmo efeito
   do F11) e sair dela junto. O requestFullscreen só é aceito dentro de um clique do
   usuário, então enter() deve ser chamado a partir do handler do botão.

   Se o navegador negar (ou não suportar), o Modo foco continua funcionando normalmente,
   só sem a tela cheia.

   Uso:
     BipperFocusFullscreen.enter();                 // ao ativar o modo foco
     BipperFocusFullscreen.exit();                  // ao desativar
     BipperFocusFullscreen.onExit(function () {});  // usuário saiu da tela cheia (ex.: Esc)
*/
(function () {
    function enter() {
        var root = document.documentElement;
        if (document.fullscreenElement || !root.requestFullscreen) return;
        try {
            var result = root.requestFullscreen();
            if (result && result.catch) result.catch(function () { /* negado: segue sem tela cheia */ });
        } catch (e) { /* idem */ }
    }

    function exit() {
        if (!document.fullscreenElement || !document.exitFullscreen) return;
        try {
            var result = document.exitFullscreen();
            if (result && result.catch) result.catch(function () {});
        } catch (e) { /* idem */ }
    }

    // No Esc (ou F11) o navegador sai da tela cheia sem avisar a página por tecla;
    // o único sinal é o fullscreenchange.
    function onExit(callback) {
        document.addEventListener('fullscreenchange', function () {
            if (!document.fullscreenElement) callback();
        });
    }

    window.BipperFocusFullscreen = { enter: enter, exit: exit, onExit: onExit };
})();
