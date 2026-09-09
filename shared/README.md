# Shared

Guia pratico da pasta `shared/`. A documentacao central do projeto fica no `README.md` da raiz; este arquivo resume apenas como reaproveitar os assets compartilhados.

## Regras de trabalho

- Nunca fazer commit sem autorizacao explicita da Barbara.
- Nunca responder em ingles; todas as respostas devem ser em portugues.

## O que vem dentro

- `design.md`: referencia visual detalhada.
- `design-tokens.css`: tokens globais de cor, tipografia, radius, sombra, medidas, reset leve e estrutura base.
- `base-components.css`: botoes, inputs, chips, cards, listas, modais, skeletons e grids reutilizaveis.
- `app-shell.css`: sidebar, topbar, seletor de marca, perfil, notificacoes e estados responsivos.
- `app-shell.js`: menu dinamico, sidebar, perfil, menu mobile, dropdown de marcas, persistencia e troca de logos.
- `custom-select.js` + `custom-select.css`: popup customizado para `<select>`.
- `custom-date.js` + `custom-date.css`: calendario customizado para `<input type="date">`.
- `master-page.html`: pagina mestre copiavel para iniciar uma nova tela com shell completo.
- `brand-schema.json`: contrato para criar ou validar marcas.
- `data/brands.json`: marcas prontas para uso.
- `data/payments.js`: dados compartilhados das telas de pagamentos.
- `assets/logos/`: logos usados pelo arquivo de marcas.
- `assets/icones/`: icones de arquivos e acoes reutilizaveis.

## Como usar em uma nova tela

1. Consulte `shared/design.md` antes de criar visual novo.
2. Use `shared/master-page.html` como ponto de partida para telas completas de portal.
3. Importe os CSS na ordem abaixo:

```html
<link rel="stylesheet" href="shared/design-tokens.css">
<link rel="stylesheet" href="shared/base-components.css">
<link rel="stylesheet" href="shared/app-shell.css">
```

4. Se a tela tiver estilos proprios, importe por ultimo:

```html
<link rel="stylesheet" href="css/app.css">
```

5. Antes de fechar o `body`, defina a tela ativa e carregue o shell:

```html
<script>
  window.BipperShellConfig = { app: 'inicio', active: '<key-do-item-no-menu.json>' };
</script>
<script src="shared/app-shell.js"></script>
```

6. Troque apenas o conteudo dentro de `.content`.
7. Crie CSS novo somente quando tokens e componentes compartilhados nao resolverem o caso.

## Estrutura minima do shell

A nova tela precisa preservar estes IDs/classes para o comportamento funcionar:

```html
<aside class="sidebar" id="sidebar">
<button id="sidebarToggle">
<button id="openMenu">
<button id="sidebarOverlay">
<div class="brand">
<button class="brand__logo-btn">
<div class="brand-dropdown">
```

Estes placeholders sao preenchidos pelo `app-shell.js`:

```html
<div data-shell-menu data-menu-url="config/menu.json"></div>
<div data-shell-profile></div>
<div data-shell-profile="topbar"></div>
```

Nao escreva o HTML do menu nem do perfil manualmente na pagina. O menu vem de `config/menu.json`; o perfil padrao vem de `DEFAULT_PROFILE` no `app-shell.js`.

## Marcas

O caminho padrao do arquivo de marcas fica no HTML da sidebar:

```html
<div class="brand" data-brands-url="shared/data/brands.json">
```

Se mudar a estrutura de pastas, ajuste esse caminho e tambem os caminhos dos logos dentro do JSON.

Ao selecionar uma marca, a aplicacao atualiza:

```css
--brand-primary
--brand-secondary
--brand-soft
--brand-primary-rgb
```

Use `primary` para gerar `--brand-primary-rgb` no formato `r, g, b`.

## Resumo rapido

- O `README.md` da raiz explica o projeto inteiro.
- Este arquivo explica somente a pasta `shared/`.
- O `shared/design.md` e a fonte detalhada de decisao visual.
- Para uma tela nova, comece pela master page, importe os arquivos compartilhados e altere apenas `.content`.
