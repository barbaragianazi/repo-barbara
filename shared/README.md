# Shared Design Assets

Manual de uso da pasta `shared/`. Esta pasta funciona como um kit base do Portal Bipper para novos projetos.

## O que vem dentro

- `design.md`: guia principal de decisao visual.
- `design-tokens.css`: tokens oficiais de cor, tipografia, radius, sombra, medidas, reset leve e estrutura base.
- `base-components.css`: botoes, inputs, chips, cards, listas, modais e grids reutilizaveis.
- `app-shell.css`: sidebar, topbar, seletor de marca, perfil, notificacoes e estados responsivos.
- `app-shell.js`: comportamento da sidebar, menu (via `config/menu.json`), perfil do usuario, menu mobile, overlay, dropdown de marcas, persistencia da marca ativa e atualizacao de logos.
- `custom-select.js` + `custom-select.css`: troca o popup nativo de `<select>` por um painel estilizado.
- `custom-date.js` + `custom-date.css`: troca o popup nativo de `<input type="date">` por um calendario estilizado.
- `master-page.html`: pagina mestre copiavel para iniciar uma nova tela com shell completo.
- `brand-schema.json`: contrato para criar ou validar arquivos de marcas.
- `data/brands.json`: marcas prontas para uso no novo projeto.
- `assets/logos/`: logos usados por `shared/data/brands.json`.

## Passo a passo para um novo projeto

### 1. Copiar a pasta compartilhada

Copie a pasta inteira para o novo projeto:

```text
shared/
  design.md
  design-tokens.css
  base-components.css
  app-shell.css
  app-shell.js
  master-page.html
  brand-schema.json
  data/
    brands.json
  assets/
    logos/
```

Com essa organizacao, a pasta `shared/` ja carrega o guia, o JSON de marcas e os logos necessarios para a pagina mestre.

### 2. Comecar pela pagina mestre

Use `shared/master-page.html` como ponto de partida.

Na pratica, copie ou renomeie `shared/master-page.html` para `index.html` na raiz do novo projeto. Depois, troque apenas a area:

```html
<section class="content">
  <!-- conteudo especifico da nova tela -->
</section>
```

A sidebar, topbar, perfil, sininho, configuracoes e seletor de marca ja ficam prontos.

### 3. Importar os CSS na ordem certa

No `<head>` da nova pagina, mantenha esta ordem:

```html
<link rel="stylesheet" href="shared/design-tokens.css">
<link rel="stylesheet" href="shared/base-components.css">
<link rel="stylesheet" href="shared/app-shell.css">
```

Depois disso, se o novo projeto tiver estilos proprios, coloque por ultimo:

```html
<link rel="stylesheet" href="css/app.css">
```

### 4. Importar o JavaScript do shell

Antes de fechar o `body`, inclua:

```html
<script src="shared/app-shell.js"></script>
```

Esse arquivo cuida de:

- abrir/fechar sidebar no mobile;
- recolher sidebar no desktop;
- fechar menu com overlay e `Escape`;
- abrir popup de marcas ao clicar no logo;
- carregar `shared/data/brands.json`;
- aplicar cores da marca;
- atualizar logos.

### 5. Conferir o caminho do `brands.json`

No HTML da sidebar, o caminho padrao fica assim:

```html
<div class="brand" data-brands-url="shared/data/brands.json">
```

Se voce mudar a estrutura de pastas, ajuste esse caminho.

Se optar por manter um JSON customizado fora de `shared/`, por exemplo em `config/custom-brands.json`, use:

```html
<div class="brand" data-brands-url="config/custom-brands.json">
```

Nesse caso, lembre tambem de ajustar os caminhos dos logos dentro desse JSON.

### 6. Manter a estrutura minima do shell

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

Estes trechos sao **placeholders vazios** — o `app-shell.js` preenche:

```html
<div data-shell-menu data-menu-url="config/menu.json"></div>  <!-- menu lateral -->
<div data-shell-profile></div>                                 <!-- perfil na sidebar -->
<div data-shell-profile="topbar"></div>                        <!-- perfil na topbar -->
```

Nao escreva o HTML do menu nem do perfil a mao na pagina. O menu vem de `config/menu.json`; o usuario vem de `DEFAULT_PROFILE` no `app-shell.js`, ajustavel por `window.BipperShellConfig.profile = { name, initials, role, email, topbarRole }`.

Antes de fechar o `<body>`, defina qual tela e esta (para o menu marcar o item ativo):

```html
<script>
  window.BipperShellConfig = { app: 'inicio', active: '<key-do-item-no-menu.json>' };
</script>
<script src="shared/app-shell.js"></script>
```

### 7. Criar o conteudo novo dentro de `.content`

Para uma nova tela, use os componentes ja criados:

```html
<section class="content">
  <div class="section-title">
    <div>
      <h2>Titulo da tela</h2>
      <p>Descricao curta da area.</p>
    </div>
  </div>

  <div class="summary-card">
    Conteudo da tela
  </div>
</section>
```

### 8. Usar o `shared/design.md` como regra

Antes de criar qualquer coisa nova, consulte `shared/design.md`.

Ele define cores, tipografia, botoes, inputs, cards, modais, grids e regras responsivas. A ideia e: primeiro tentar usar o que ja existe; so criar CSS novo quando realmente precisar.

## Ordem de importacao

```html
<link rel="stylesheet" href="shared/design-tokens.css">
<link rel="stylesheet" href="shared/base-components.css">
<link rel="stylesheet" href="shared/app-shell.css">
<script src="shared/app-shell.js"></script>
```

## Troca de marca

Ao selecionar uma marca, a aplicacao consumidora atualiza no `document.documentElement`:

```css
--brand-primary
--brand-secondary
--brand-soft
--brand-primary-rgb
```

Use `primary` para gerar `--brand-primary-rgb` no formato `r, g, b`.

## Resumo pratico

Para comecar um novo projeto:

- Copie a pasta `shared/`.
- Copie ou renomeie `shared/master-page.html` para `index.html`.
- Ajuste caminhos apenas se mudar a estrutura sugerida.
- Troque apenas o conteudo dentro de `.content`.
- Use `shared/design.md` para decidir qualquer visual novo.
