# Design Reference - Portal Bipper

Guia principal de decisão visual. Documenta paleta, tipografia, espaçamentos, radius, sombras, botões, inputs, cards, modais, layout, responsividade e regras para criar novas telas mantendo consistência

Este documento registra os padroes visuais e tecnicos observados no projeto atual. Use-o como referencia obrigatoria ao criar novas telas em outro projeto, mantendo os mesmos tokens, componentes, proporcoes e comportamento responsivo.

Este arquivo e a fonte de decisao visual do sistema. Para reaproveitamento tecnico direto, use tambem os arquivos da pasta `shared/`:

- `shared/design-tokens.css`: variaveis globais, reset leve, tipografia base e estrutura essencial de pagina.
- `shared/base-components.css`: componentes reutilizaveis como botoes, inputs, cards, chips, listas, modais e grids.
- `shared/app-shell.css`: sidebar, topbar, perfil, notificacoes, seletor de marcas e responsividade do shell.
- `shared/app-shell.js`: comportamento compartilhado da sidebar, menu mobile e dropdown de marcas.
- `shared/master-page.html`: pagina mestre para iniciar novas telas com a mesma estrutura.
- `shared/brand-schema.json`: contrato documentado do arquivo de marcas.
- `shared/data/brands.json`: arquivo de marcas pronto para copiar junto com `shared/`.
- `shared/assets/logos/`: logos usados pelo JSON de marcas compartilhado.
- `shared/README.md`: instrucoes de uso em outro projeto.

## Como Usar Em Novos Projetos

1. Leia este documento antes de decidir cores, fontes, radius, sombras, espacamentos ou componentes.
2. Importe `shared/design-tokens.css` antes dos estilos da nova aplicacao.
3. Importe `shared/base-components.css` quando a nova tela precisar dos componentes deste sistema.
4. Importe `shared/app-shell.css` e `shared/app-shell.js` quando a tela precisar de sidebar, topbar e troca de marca.
5. Use `shared/master-page.html` como base quando a nova tela for uma tela de portal completa.
6. Use `shared/data/brands.json` ou adapte um novo JSON respeitando o contrato de `shared/brand-schema.json`.
7. Se houver troca dinamica de marca, aplique as cores da marca nas variaveis `--brand-primary`, `--brand-secondary`, `--brand-soft` e `--brand-primary-rgb`.
8. Crie estilos novos somente quando nao existir equivalente nos tokens ou componentes documentados aqui.

## Hierarquia De Decisao Visual

Ao construir novas telas, siga esta ordem:

1. Tokens oficiais: cores, tipografia, radius, sombras, medidas e breakpoints.
2. Componentes compartilhados: botoes, inputs, cards, chips, listas, modais e layout.
3. Padroes estruturais: sidebar/topbar/conteudo, grids e responsividade.
4. Ajustes locais da nova tela.
5. Novos componentes, somente quando os anteriores nao resolverem o caso.

Se houver conflito entre uma preferencia local e este documento, este documento vence.

## Paleta de Cores

### Tokens globais

```css
:root {
    --zoetis-orange: #ff6b00;
    --zoetis-orange-600: #e85900;
    --zoetis-teal: #00a7b5;
    --brand-primary: var(--zoetis-orange);
    --brand-secondary: var(--zoetis-orange-600);
    --brand-soft: #fff1e8;
    --brand-primary-rgb: 255, 107, 0;
    --ink: #0f172a;
    --text: #263447;
    --muted: #65758b;
    --line: #e5eaf0;
    --surface: #ffffff;
    --surface-2: #f8fafc;
    --surface-3: #eef4f8;
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
    --radius-xl: 28px;
    --radius-lg: 20px;
    --radius-md: 14px;
    --shadow-sm: 0 8px 22px rgba(15, 23, 42, .06);
    --shadow-md: 0 18px 60px rgba(15, 23, 42, .11);
    --sidebar: 280px;
    --sidebar-collapsed: 92px;
    --header: 78px;
    --max: 1680px;
}
```

### Marca padrao

- Primaria: `#ff6b00`
- Primaria 600/secundaria: `#e85900`
- Teal de apoio: `#00a7b5`
- Fundo suave de marca: `#fff1e8`

### Neutros

- Texto forte: `#0f172a`
- Texto padrao: `#263447`
- Texto secundario: `#65758b`
- Bordas: `#e5eaf0`, `rgba(226, 232, 240, .9)`, `rgba(226, 232, 240, .95)`
- Superficies: `#ffffff`, `#f8fafc`, `#eef4f8`
- Sidebar escura: gradiente `#101923` para `#07111b`

### Cores semanticas e acentos

- Sucesso: `#10b981`
- Aviso: `#f59e0b`
- Perigo: `#ef4444`
- Azul: `#2563eb` / suave `#eaf2ff`
- Rosa: `#db2777` / suave `#fdf2f8`
- Roxo: `#7c3aed` / suave `#f1ecff`
- Teal: `#00a7b5` / suave `#e8fbfd`

### Temas por marca

As marcas sao configuradas em `shared/data/brands.json` com `primary`, `secondary`, `surface`, `surfaceAlt`, `text`, `textLight`, `border`, gradientes suaves e logos. O `shared/app-shell.js` aplica dinamicamente:

- `--brand-primary`
- `--brand-secondary`
- `--brand-soft`
- `--brand-primary-rgb`
- aliases `--zoetis-orange`, `--zoetis-orange-600` e `--zoetis-teal`

Ao criar novas telas, use sempre `var(--brand-primary)`, `var(--brand-secondary)`, `var(--brand-soft)` e `rgba(var(--brand-primary-rgb), alpha)` para manter suporte a troca de marca.

### Contrato do `brands.json`

Cada marca deve seguir este modelo minimo:

```json
{
  "nome-da-marca": {
    "name": "Nome exibido",
    "group": "Marcas",
    "primary": "#F65C00",
    "secondary": "#CE5208",
    "surface": "#FFF7F2",
    "surfaceAlt": "#FFF1E8",
    "text": "#1F1F1F",
    "textLight": "#FFFFFF",
    "border": "#F2E2D8",
    "gradient-soft-1": "#F65C0029",
    "gradient-soft-2": "#CE520833",
    "gradient-soft-3": "#F65C004D",
    "logoLight": "shared/assets/logos/marca-light.svg",
    "logoDark": "shared/assets/logos/marca-dark.svg",
    "footerLogoLight": "shared/assets/logos/marca-light.svg",
    "footerLogoDark": "shared/assets/logos/marca-dark.svg",
    "footerLogoName": "Nome alternativo do logo"
  }
}
```

Campos obrigatorios para troca visual: `name`, `primary`, `secondary`, `surface`, `surfaceAlt`, `text`, `textLight`, `border`, `logoLight`, `logoDark`.

Campos opcionais: `group`, `gradient-soft-1`, `gradient-soft-2`, `gradient-soft-3`, `footerLogoLight`, `footerLogoDark`, `footerLogoName`.

Regras:

- `primary` controla acentos, botoes principais, badges e estados ativos.
- `secondary` compoe gradientes e reforcos de marca.
- `surfaceAlt` deve alimentar `--brand-soft`.
- `primary` deve ser convertido para RGB e aplicado em `--brand-primary-rgb`.
- Logos devem ter variantes clara e escura quando a marca permitir.
- Revendas podem usar `group: "Revendas"` para separar a exibicao no dropdown.

## Tipografia

- Familia principal: `"Nunito", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`, definida em `--font-family-base` e aplicada no `body` (`shared/design-tokens.css`).
- Corpo: texto em `var(--text)`, peso regular/medio, sem serifa.
- Titulos principais: `var(--ink)`, pesos altos, letter-spacing negativo leve.
- Micro-label em caixa alta (rotulo de campo, eyebrow de secao, metadado): usar a classe `.eyebrow-label` (`shared/base-components.css`) — `var(--fs-sm)`, `font-weight: 800`, `letter-spacing: .06em`, `text-transform: uppercase`, `var(--muted)`. Nao redeclarar esses valores localmente; se o contexto exigir tamanho menor (ex. card denso), documentar a excecao no lugar do uso.

### Escala de tamanho (`--fs-*`)

Todo `font-size` novo deve referenciar um destes tokens (`shared/design-tokens.css`, bloco `:root`) em vez de um valor px solto. Use a coluna "Uso tipico" para escolher o degrau certo antes de criar um novo.

| Token | Valor | Uso tipico |
|---|---|---|
| `--fs-2xs` | `10px` | contadores/badges minusculos |
| `--fs-xs` | `11px` | metadados, labels pequenos |
| `--fs-sm` | `12px` | micro-label uppercase, texto auxiliar |
| `--fs-md` | `13px` | texto auxiliar, corpo denso |
| `--fs-base` | `14px` | corpo padrao, valores de campo, botoes |
| `--fs-lg` | `15px` | corpo destacado |
| `--fs-xl` | `16px` | base do `body`, subtitulos pequenos |
| `--fs-2xl` | `18px` | titulo de card (extremo menor) |
| `--fs-3xl` | `22px` | titulo de card (extremo maior), subtitulo de secao |
| `--fs-4xl` | `24px` | titulo de secao (`.section-title h2`) |
| `--fs-5xl` | `34px` | numero/display grande |
| `--fs-hero` | `clamp(30px, 3vw, 36px)` | `<h1>` de hero — unico valor para todo hero do portal |

### Escala de `line-height` (`--lh-*`)

| Token | Valor | Uso tipico |
|---|---|---|
| `--lh-none` | `1` | numeros/icones de linha unica |
| `--lh-tight` | `1.04` | `<h1>` de hero |
| `--lh-snug` | `1.2` | titulos e subtitulos |
| `--lh-normal` | `1.35` | corpo/labels compactos |
| `--lh-comfortable` | `1.38` | variante de corpo em tabelas/listas densas |
| `--lh-base` | `1.5` | paragrafo de leitura |
| `--lh-relaxed` | `1.45` | texto auxiliar |
| `--lh-loose` | `1.55` | paragrafo mais espacado (cards de area) |

`--lh-normal` (`1.35`) e `--lh-comfortable` (`1.38`) sao quase identicos e coexistem hoje por causa de uso legado em componentes diferentes — nao foram fundidos num pass automatico para nao alterar renderização existente sem revisão visual. Ao criar um componente novo, prefira `--lh-normal` e trate `--lh-comfortable` como legado.

Valores pontuais que ficaram fora da escala (nao tokenizados de proposito, revisar caso a caso ao tocar no componente):

- `line-height: 1.1`, `1.18`, `1.3`, `1.32`, `1.08`, `1.05` — ajustes finos isolados, sem padrao claro de reuso.
- `font-size: 17px` em `css/app.css` (`.export-file-card__icon span` no breakpoint mobile) e `font-size: 19px` em `shared/base-components.css` (`.favorite-btn`, tamanho de icone) — ambos fora da escala de texto; o segundo tambem diverge da escala de icones documentada em "Boas Praticas" (`20px`/`21px`/`24px`/`27px`/`30px`).

### Hierarquia documentada

- H1 de hero: `var(--fs-hero)`, `line-height: var(--lh-tight)`, `letter-spacing: -.04em`. As 4 telas do portal (`.home-title h1`, `.hello-world h1`, `.campaign-header h1`, `.payment-hero h1`) usavam 4 formulas de `clamp()` e 4 `line-height` diferentes ate essa unificacao — qualquer hero novo usa `var(--fs-hero)` direto, nunca um `clamp()` proprio.
- Titulos de secao: `var(--fs-4xl)`, `letter-spacing: -.03em`.
- Titulos de cards: `var(--fs-2xl)` a `var(--fs-3xl)`, `letter-spacing: -.02em` a `-.03em`.
- Labels/chips/metadados: `var(--fs-xs)` a `var(--fs-base)`, frequentemente com `font-weight: 700` a `900`.
- Textos auxiliares: `var(--fs-sm)` a `var(--fs-md)`, cor `var(--muted)`, `line-height` entre `var(--lh-relaxed)` e `var(--lh-loose)`.

## Espacamentos

- Conteudo central: `width: min(100% - 64px, var(--max))`, com `--max: 1680px`.
- Padding vertical do conteudo: `32px 0 28px`.
- Sidebar: `22px 16px`.
- Topbar: `0 32px`, altura `64px`.
- Hero: `28px`, mobile `22px`.
- Cards principais: `18px` a `22px`.
- Modais: `24px`.
- Gaps recorrentes: `10px`, `12px`, `14px`, `16px`, `18px`, `24px`.
- Toolbar: `margin: 24px 0`, grid com gap `14px`.
- Grids: metricas `16px`, cards de areas `18px`, cards compactos `16px`, insights `18px`.

## Bordas e Radius

### Tokens

```css
--radius-xl: 28px;
--radius-lg: 20px;
--radius-md: 14px;
```

### Uso recorrente

- Hero: `28px`.
- Cards gerais: `20px` a `24px`.
- Cards de area: `24px`.
- Botoes e inputs: `14px` a `17px`.
- Icon buttons: `14px`.
- Badges, pills e botoes de modal: `999px`.
- Icon containers: `14px`, `18px`, `20px`.
- Bordas leves: `1px solid var(--line)` ou `1px solid rgba(226, 232, 240, .9)`.

## Sombras

### Tokens

```css
--shadow-sm: 0 8px 22px rgba(15, 23, 42, .06);
--shadow-md: 0 18px 60px rgba(15, 23, 42, .11);
```

### Uso

- `--shadow-sm`: cards, inputs, botoes secundarios, topbar elements.
- `--shadow-md`: hover de modulo e elevacoes maiores.
- Sidebar: `16px 0 42px rgba(15, 23, 42, .13)`.
- Dropdown: `0 18px 48px rgba(15, 23, 42, .22)`.
- Modal: `0 30px 80px rgba(15, 23, 42, .22)`.
- Hover de botao primario: `0 18px 36px rgba(255, 107, 0, .32)`.

## Icones

### Estado atual (3 sistemas coexistindo)

1. **SVG inline "linha"** — escrito a mao no HTML do shell (recolher menu, toggle de tema, hamburger, sininho, engrenagem) e na home. Estilo [Lucide](https://lucide.dev): `viewBox="0 0 24 24"`, traço, `stroke-width` 1.8.
2. **Registro `ICONS` do `app-shell.js`** — mapa `nome -> <path>` (sólido, `fill="currentColor"`) consumido via `createIcon(name)` e alimentado pelo campo `"icon"` de `config/menu.json`. É o sistema dos ícones da navegação lateral.
3. **Font Awesome 6.5.2 via CDN** — `<link>` para `cdnjs` + `<i class="fa-solid fa-...">`. Usado só dentro de `redesign-pagamentos/` (botões de exportar, modo foco, estados vazios de tabela, `shared/payment-detail-panel.js`).

**Padrão para ícone novo: SVG inline "linha" (opção 1).** Não adicionar dependência de Font Awesome em telas novas. O registro `ICONS` (opção 2) é só para navegação orientada a dados.

### Anatomia do SVG inline

```html
<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="..."></path>
</svg>
```

| Atributo | Regra |
|---|---|
| `viewBox="0 0 24 24"` | Sempre presente. É proporção, não tamanho. Todos os ícones do projeto usam a grade 24. |
| `class="icon"` | Sempre. O tamanho real (px) vem de uma regra `.<contexto> .icon` no CSS, nunca de `width`/`height` inline. |
| `fill` / `stroke` | Ícone de traço: `fill="none" stroke="currentColor"`. Ícone sólido: `fill="currentColor"` e sem `stroke`. **Nunca cor fixa** (`#000`, `#333`) — quebra em dark e na troca de marca. |
| `stroke-width="1.8"` | Padrão da casa (o Lucide exporta 2). |
| `stroke-linecap` / `stroke-linejoin` `="round"` | Sempre nos ícones de traço. |
| `aria-hidden="true"` | Quando há texto ao lado (ícone decorativo). |
| `width` / `height` / `xmlns` / `class="lucide ..."` | **Remover.** Vêm colados do site de origem e não têm função aqui. |

Ícone **sem** texto ao lado (só o ícone dentro do botão): manter `aria-hidden="true"` no `<svg>` e pôr `aria-label="Ação"` no `<button>`/`<a>` — padrão já usado nos `.icon-btn`.

### Receita para adicionar um ícone

1. Buscar em [lucide.dev](https://lucide.dev) (garante mesmo traço dos existentes). Evitar SVG Repo / Iconify avulsos, que misturam estilos e grades.
2. Copiar o SVG e limpar: remover `width`, `height`, `xmlns`, `class` de origem; trocar qualquer `stroke="#..."`/`fill="#..."` por `currentColor`; adicionar `class="icon"` e `aria-hidden="true"`.
3. Colar dentro do elemento (link, botão, título).
4. Se aquele contexto ainda não tem regra `.icon` no CSS, criar uma com o tamanho:

```css
.meu-contexto .icon { width: 16px; height: 16px; flex: 0 0 auto; }
```

### Escala de tamanho

Nav lateral `21px` · botões de topo (`.icon-btn`) `20px` · submenu de card `16px` · `.info-tip` `16px` · `.search-box` (posicionado absoluto). Ver também "Boas Praticas".

### Divergencias conhecidas

- `.clear-filters__icon` (em `redesign-pagamentos/*/index.html`) usa classe própria em vez de `.icon`, `stroke-width="2"` e ainda carrega `xmlns`/`width`/`height` — resquício da colagem original.
- Ícones inline do shell (hamburger, toggle de recolher, sininho, engrenagem) não têm `stroke-linecap`/`stroke-linejoin` e estão duplicados literalmente em `master-page.html` e nas telas. Consolidar quando tocar no shell.
- Font Awesome adiciona ~1 request de CSS + fonte de ícone só para as telas de pagamento; migrar para SVG inline é possível mas é trabalho à parte.

## Tooltips

Padrão único: **`::after` com `content: attr(data-tooltip)`** — bolha escura, `opacity 0 → 1` + leve translate no `:hover`/`:focus-visible`. Nunca usar o `title` nativo (lento, sem estilo, sem controle de posição).

Implementações existentes:
- **`.info-tip`** (`shared/base-components.css`) — o botão "?" de ajuda. Tooltip abaixo, alinhado à direita.
- **`.feature-with-info`** (`css/app.css`) — dica nos controles de modo de visualização. Aparece por `:hover` e `:has(:focus-visible)` (nunca `:focus-within`, que prende a dica depois do clique de mouse).
- **Menu lateral** (`shared/app-shell.css`) — `.nav-link` / `.nav-submenu__link`:
  - recolhido: `body.sidebar-collapsed .nav-link::after` mostra o rótulo sempre (o texto está escondido).
  - aberto: `.is-truncated::after` mostra o nome completo **só quando o rótulo cortou**. A marca `.is-truncated` é aplicada por `updateNavTruncation()` no `app-shell.js` (compara `scrollWidth × clientWidth`; roda em `app-shell:menu-ready`, `resize`, abrir/fechar submenu, `document.fonts.ready` e ao recolher a sidebar).

Cor da bolha: `#101923` (menu) / `#2d3748` (info-tip) — ambas com `color:#fff`, `border rgba(255,255,255,.12)`, `border-radius` 8–10px, `font-size: var(--fs-sm)`, `z-index` 20–95.

Para um elemento novo com tooltip: `position: relative` + `data-tooltip="..."` no elemento, e reaproveitar um dos blocos `::after` acima (não criar um 4º estilo).

## Teclas (keycap)

Para citar uma tecla numa dica de atalho ("Fechar Esc", "Segure Shift e role"), use o elemento semântico **`<kbd>`**. O estilo mora em `shared/base-components.css` e imita as teclas de terminal: fundo `--surface-2`, `border` com borda inferior de 2px (efeito de relevo), `border-radius: 6px`, `font-size: .82em`, `font-weight: 700`.

- `<kbd>Esc</kbd>` — sobre fundo claro (dicas inline, tours).
- `<kbd class="kbd--on-accent">Esc</kbd>` — sobre fundo colorido (header laranja do painel de detalhes): borda e fundo translúcidos em branco, texto `#fff`.
- `.kbd` (classe) existe só para quando não dá para trocar a tag; prefira sempre o `<kbd>`.

Usos atuais: `.detail-esc-hint` ("Fechar Esc" no `payment-detail-panel.js`) e `.compact-tour` ("Segure Shift…").

## Shell: perfil do usuário

O bloco de perfil (sidebar e topbar) é **injetado pelo `app-shell.js`**, não escrito em cada página. Na marcação, use só o placeholder:

```html
<div data-shell-profile></div>            <!-- sidebar: avatar + nome + cargo + e-mail -->
<div data-shell-profile="topbar"></div>   <!-- topbar: avatar + nome + cargo -->
```

Os dados vêm de `DEFAULT_PROFILE` no `app-shell.js`, sobrescritos por `window.BipperShellConfig.profile = { name, initials, role, email, topbarRole }`, e uma sessão logada (`applyAuthSession`) ainda tem prioridade. O `<small>` do e-mail tem `data-profile-email` para a sessão trocar só ele.

## Botoes

### Base `.btn`

- Sem borda nativa.
- `border-radius: 12px`.
- `padding: 12px 16px`.
- `font-weight: 500`.
- Layout `inline-flex`, centralizado, gap `9px`.
- Transicao curta: `.18s ease`.
- Hover com `translateY(-1px)` quando aplicavel.

### Variantes

- `.btn-primary`: fundo neutro `var(--btn-primary-bg)` (`#0e1014`, fixo nos dois temas), texto branco. E o botao primario padrao das telas.
- `.btn-primary-acent`: fundo `var(--brand-primary)` (cor do cliente ativo), texto branco. Deve existir no maximo um por tela (a acao de maior destaque); `app-shell.js` emite um `console.warn` se detectar mais de um.
- `.btn-secondary`: fundo branco, texto `#0f172a`, borda `var(--line)`, sombra no hover.
- `.icon-btn`: quadrado `42px`, radius `14px`, borda `var(--line)`, fundo branco, icone `20px`.
- `.favorite-btn`: `38px`, radius `13px`, estado ativo amarelo (`#f59e0b`, `#fffbeb`, `#fde68a`).
- `.filter-chip`: altura `40px`, pill, padding horizontal `16px`, contador interno circular.
- Botoes de modal: altura minima `46px`, pill, peso `700`; primario usa fundo escuro em estado positivo ou vermelho em estado negativo.

## Inputs

### Busca `.search-box`

- Container relativo com icone absoluto a esquerda.
- Input com `height: 40px`, `border: 1px solid var(--line)`, `border-radius: 12px`.
- Fundo branco, texto `#0f172a`, padding `0 18px 0 48px`.
- Sombra `var(--shadow-sm)`.
- Foco: borda teal `rgba(0, 167, 181, .5)` e ring `0 0 0 4px rgba(0, 167, 181, .12)`.

### Controles

- Toggle visual usa grupo flex (`.toggle-group`) com label forte e estado compacto.
- Checkbox visual customizado: `18px`, radius `5px`, borda `1.5px solid #94a3b8`.

### Selects e datas (popup nativo não estilizável)

O popup nativo de `<select>` e de `<input type="date">` não aceita CSS em nenhum navegador. Padrão do projeto: manter o elemento nativo como valor real e trocar **só o popup** por um painel nosso.

- **`<select>`** → `shared/custom-select.js` + `custom-select.css`. Envolve em `.cs-select`, abre `.cs-panel`. O `<select>` continua com o mesmo `id`/`.value`/evento `change`. Auto-aplica em `DOMContentLoaded`; para conteúdo criado depois: `window.BipperCustomSelect.enhanceAll(root)`.
- **`<input type="date">`** → `shared/custom-date.js` + `custom-date.css`. Envolve em `.cd-field`, abre `.cd-panel` (calendário: navegação de mês, hoje, limpar, respeita `min`/`max`). `.value` fica em ISO `yyyy-mm-dd`. `window.BipperCustomDate.enhanceAll(root)`. Se vários campos de data ficam num mesmo popover, ponha `data-cd-popover` no container — o calendário alinha por ele (todos abrem no mesmo X) em vez de por cada campo. Use `data-cd-popover="right"` para alinhar pela borda direita.

Não usar biblioteca de datepicker nem estilizar `::-webkit-calendar-picker-indicator` além de escondê-lo. Ambos os painéis usam os mesmos tokens (`--surface`, `--line`, `--radius-md`, `--shadow-md`) e funcionam em light/dark.

## Cards

### Cards de resumo `.summary-card`

- Fundo branco.
- Borda `rgba(226, 232, 240, .9)`.
- Radius `var(--radius-lg)`.
- Sombra `var(--shadow-sm)`.
- Padding `18px`.
- Titulo `18px`, `var(--ink)`.

### Cards metricos `.metric-card`

- Grid flex horizontal com icone.
- Fundo branco translúcido `rgba(255, 255, 255, .9)`.
- Borda leve, radius `20px`, padding `18px`.
- Min-height `132px`.
- Valor principal `34px`, peso visual alto, letter-spacing `-.04em`.
- Icone `54px`, radius `18px`, cor via `--accent`, fundo via `--soft`.

### Cards de area `.area-card`

- Fundo `rgba(255, 255, 255, .88)`.
- Borda `rgba(226, 232, 240, .95)`.
- Radius `24px`, padding `22px`, min-height `330px`.
- Barra superior decorativa com `linear-gradient(90deg, var(--accent), transparent)`.
- Icone `58px`, radius `20px`, cor `--accent`, fundo `--soft`.
- Acoes e modulos internos em lista com background `rgba(248, 250, 252, .9)`.

### Cards rapidos `.quick-card`

- Borda `var(--line)`, fundo branco, radius `18px`, padding `14px`.
- Grid: icone, conteudo, drag handle e remover.
- Icone `42px`, radius `14px`, background `color-mix(in srgb, var(--accent), white 87%)`.
- Hover eleva com `translateY(-2px)` e `var(--shadow-sm)`.
- Estado drag: `opacity: .45`; estado alvo: borda e inset shadow com `color-mix`.

### Card de projeto `.project-card` (hub inicial)

- Só na `index.html`. Fundo `var(--surface-2)`, borda `--line`, radius `var(--radius-lg)`, faixa superior `linear-gradient(90deg, var(--brand-primary), transparent)`.
- `strong` = nome (`--fs-3xl`), `small` = descrição curta (`--fs-2xs`, `--muted`).
- Mark `.project-card__mark`: 58px, radius 20px, `--brand-soft` / `--brand-primary`.
- `.project-card__meta`: linha de chips `.project-chip` com cliente, status, nº de telas e data da última alteração.
  - Status usa `.project-chip--status` + `is-progress` (âmbar) / `is-done` (verde) / `is-draft` (neutro), com bolinha `::before`. Cores vêm dos tokens semânticos (`--warning-soft`/`--success-soft`), então já funcionam nos dois temas.
- `.project-card__submenu`: links diretos para cada tela do projeto (pílulas).

## Tabelas e Listas

Nao ha tabela HTML tradicional no projeto. O padrao equivalente usa listas e grids:

- `.agenda-list`, `.todo-list`, `.activity-list`: grid com gap `12px`, sem bullets.
- Agenda: `grid-template-columns: 64px 1fr`, horario forte, conteudo com borda esquerda `3px solid var(--accent)`.
- Tarefas: `grid-template-columns: 22px 1fr auto`, padding vertical `10px`, divisorias `#edf2f7`.
- Atividades: `grid-template-columns: 42px 1fr`, icone circular/quadrado de `40px`.
- Listas de modulos: itens com grid `minmax(0, 1fr) auto`, radius `14px` a `16px`, truncamento com `white-space: nowrap`, `overflow: hidden`, `text-overflow: ellipsis`.

Para tabelas futuras, preferir a mesma linguagem: superficie branca, bordas leves, linhas com divisorias `#edf2f7`, texto compacto, badges pill e acoes por icone.

## Estados De Carregamento (Skeleton)

**Regra: toda transicao assincrona de conteudo mostra skeleton por padrao antes do conteudo final — mesmo quando os dados ja estao em memoria.** Troca de filtro, ordenacao, troca de aba, paginacao, troca de modo de visualizacao (ex.: cards/tabela) ou qualquer `render*()` que substitua uma area da tela deve passar por um estado skeleton, ainda que rapido (~150-200ms). Isso evita "pulo" de layout e confirma visualmente que a interacao foi registrada.

### Padrao compartilhado (`shared/base-components.css`)

Ja existe um sistema pronto e documentado no proprio arquivo (secao "Skeleton loading"), a ser usado como fonte unica:

- `.skeleton-shimmer`: aplique direto no elemento placeholder e defina so a forma localmente (`width`, `height`, `border-radius`). O shimmer em si (`background-image` com gradiente + `animation: skeletonShimmer`) ja vem pronto.
- `@keyframes skeletonShimmer`: anima `background-position` de `120% 0` para `-120% 0`. Nao redeclarar em outro arquivo.
- `.bp-page` + `.is-loading` / `.is-ready`: alterna entre `.bp-skeleton` (visivel durante loading) e `.bp-content-ready` (visivel quando pronto) sem JS extra alem de trocar a classe no elemento `.bp-page`.
- `.bp-skeleton__line`, `__pill`, `__hero`, `__grid`, `__filters`, `__categories`: formas prontas para os layouts mais comuns (linha de texto, pill, hero, grid de cards, barra de filtros).
- `.bp-transition` + `.is-transitioning` / `.is-entering`: para conteudo que so precisa de fade/translate leve na troca (sem forma de skeleton), nao para o caso geral de "troca de filtro".

```css
/* Placeholder solto, fora do padrao .bp-page/.bp-skeleton */
.meu-placeholder {
    display: block;
    width: 70%;
    height: 16px;
    border-radius: 999px;
}
```
```html
<span class="meu-placeholder skeleton-shimmer"></span>
```

### Duracao e fluxo em JS

- Renderize o skeleton **imediatamente** ao registrar a interacao (clique, change, etc.), depois troque para o conteudo final apos um pequeno delay (a base do projeto usa `~180ms` via `setTimeout`), mesmo que o dado ja esteja pronto em memoria — o delay e proposital, nao gargalo de rede.
- Guarde o id do timer numa variavel de escopo do modulo e de-a `clearTimeout` antes de agendar um novo (evita skeleton de uma interacao antiga sobrescrever o resultado de uma mais recente) e ao fechar/desmontar a tela.
- Mantenha barras de ferramenta, abas e controles de filtro **visiveis e clicaveis** durante o skeleton — sO a area de dados vira placeholder. Nao esconda o controle que o usuario acabou de usar.

### Divergencia conhecida neste projeto

`css/app.css` (Portal Bipper / Redesign Pagamentos) redefine `.skeleton-shimmer` com uma tecnica diferente (`position:relative` + pseudo-elemento `::after` deslizante + `color:transparent!important`, em vez do gradiente animado via `background-position` do arquivo compartilhado). Como `app.css` carrega depois de `base-components.css`, a versao local vence silenciosamente. Funciona, mas diverge do padrao documentado aqui. Ao tocar nessas telas novamente, avaliar migrar para o padrao compartilhado; ao criar um projeto novo, usar sempre a versao de `shared/base-components.css` e nao reintroduzir essa variante.

## Modais

### Estrutura `.favorite-modal`

- Overlay fixo `inset: 0`, z-index `120`, grid centralizado, padding `20px`.
- Estado fechado: `opacity: 0`, `pointer-events: none`.
- Estado aberto `.is-visible`: `opacity: 1`, `pointer-events: auto`.
- Backdrop: `rgba(15, 23, 42, .28)` com `backdrop-filter: blur(3px)`.
- Dialog: largura `min(100%, 648px)`, max-height `calc(100vh - 40px)`, overflow-y auto.
- Radius `24px`, background `#f8f8fb`, padding `24px`, sombra forte.
- Animacao: `translateY(18px) scale(.98)` para `translateY(0) scale(1)`.

### Variantes

- `.is-positive`: status verde claro `#b9f1ca`, acao primaria escura.
- `.is-negative`: status vermelho claro `#ffd8d3`, acao primaria `#d91429`.
- `.favorite-modal--customize`: dialog menor `min(100%, 560px)`, status com cor da marca.
- `.favorite-modal--list`: lista de modulos no corpo.

## Estrutura de Layout

- Shell principal: `.app-shell` em CSS Grid com sidebar fixa/sticky e area principal.
- Larguras:
  - `--sidebar: 280px`
  - `--sidebar-collapsed: 92px`
  - `--max: 1680px`
- Sidebar:
  - `position: sticky`, `height: 100vh`, fundo escuro em gradiente.
  - Estado recolhido via `body.sidebar-collapsed`.
  - Navegacao com links de `46px`, icones `21px`, active com linha interna da marca.
- Topbar:
  - `position: sticky`, altura `64px`, fundo branco translúcido com blur.
  - Acoes alinhadas a direita, perfil em pill/card branco.
- Conteudo:
  - Container central com `width: min(100% - 64px, var(--max))`.
  - Hero + quick stack em `.hero-grid`: `1fr 360px`, gap `24px`.
  - Metricas em 4 colunas.
  - Areas em 3 colunas ou modo compacto em 4 colunas.
  - Insights em grid `1.2fr / .8fr`.

## Padroes Responsivos

### Ate 1320px

- Hero vira uma coluna.
- Metricas: 2 colunas.
- Cards de area: 2 colunas.
- Modo compacto: 3 colunas.
- Insights: 1 coluna.

### Ate 980px

- Sidebar sai do grid e vira drawer fixo com `transform: translateX(-100%)`.
- `.app-shell` vira 1 coluna.
- Botao mobile aparece.
- Conteudo reduz para `width: min(100% - 32px, var(--max))`.
- Toolbar vira 1 coluna.
- Cards de area e modo compacto viram 1 coluna.
- Perfil esconde textos, mantendo avatar.

### Ate 640px

- Topbar com padding horizontal `16px`.
- `.env-pill` e primeiro icon button da topbar sao ocultados.
- Hero actions empilham em coluna.
- Metricas e quick list ficam em 1 coluna.
- Footer empilha.

## Classes CSS Reutilizaveis

- `.app-shell`, `.sidebar`, `.main`, `.topbar`, `.content`
- `.brand`, `.brand-dropdown`, `.brand-dropdown__item`
- `.nav-section`, `.nav-link`, `.nav-badge`
- `.mobile-menu`, `.sidebar-overlay`
- `.env-pill`, `.icon-btn`, `.notification-dot`, `.profile`, `.avatar`
- `.hero-grid`, `.hero`, `.hero__content`, `.eyebrow`, `.eyebrow-label`, `.hero-actions`
- `.btn`, `.btn-primary`, `.btn-primary-acent`, `.btn-secondary`
- `.quick-stack`, `.quick-card`, `.quick-empty-state`
- `.summary-card`, `.metrics-grid`, `.metric-card`, `.metric-icon`
- `.toolbar`, `.search-box`, `.toggle-group`, `.filter-panel`, `.filter-chip`
- `.section-title`, `.cards-layout`, `.area-card`, `.area-card__icon`
- `.module-list`, `.module-item`, `.module-category-tag`, `.more-modules-btn`
- `.favorite-btn`, `.open-link`, `.number-modules`, `.icon-xs`
- `.insights-grid`, `.performance`, `.mini-chart`
- `.agenda-list`, `.agenda-item`, `.todo-list`, `.activity-list`, `.activity-icon`
- `.checkbox`, `.priority`, `.priority.high`, `.priority.medium`, `.priority.low`
- `.favorite-modal`, `.favorite-modal__dialog`, `.favorite-modal__actions`, `.favorite-modal__btn`
- `.customize-list`, `.customize-item`, `.customize-eye`
- `.modal-module-list`, `.modal-module-item`
- `.footer`, `.hide`
- `<kbd>` / `.kbd`, `.kbd--on-accent`
- `.project-card`, `.project-card__mark`, `.project-card__meta`, `.project-chip` (+ `.project-chip--status` `is-progress`/`is-done`/`is-draft`), `.project-card__submenu`

## Arquivos Compartilhaveis

### `shared/design-tokens.css`

Use como primeira importacao CSS em projetos novos. Ele contem:

- `:root` oficial.
- Reset leve (`box-sizing`, links, botoes, inputs).
- Tipografia base.
- Fundo padrao do portal.
- Classes estruturais essenciais: `.app-shell`, `.main`, `.content`, `.section-title`, `.hide`.
- Breakpoint base para conteudo em `980px`.

### `shared/base-components.css`

Use depois dos tokens quando quiser reaproveitar componentes. Ele contem:

- Botoes: `.btn`, `.btn-primary`, `.btn-primary-acent`, `.btn-secondary`, `.icon-btn`.
- Inputs e toolbar: `.search-box`, `.toolbar`, `.toggle-group`.
- Chips: `.filter-panel`, `.filter-chip`.
- Cards: `.summary-card`, `.metric-card`, `.area-card`, `.quick-card`.
- Listas equivalentes a tabelas: agenda, tarefas, atividades e modulos.
- Modais: `.favorite-modal` e variantes principais.
- Grids responsivos: metricas, cards, insights e performance.
- Teclas: `<kbd>` / `.kbd` (+ `.kbd--on-accent` para fundo colorido).

### `shared/app-shell.css`

Use quando o novo projeto precisar da estrutura-mestre do portal. Ele contem:

- Sidebar esquerda com logo, dropdown de marcas, navegacao, badges e card inferior.
- Estado recolhido no desktop via `body.sidebar-collapsed`.
- Drawer mobile via `.sidebar.is-open`.
- Overlay de fechamento `.sidebar-overlay`.
- Topbar sticky com menu mobile, pill de ambiente, botoes de icone, notificacao e perfil do usuario.
- Responsividade em `980px` e `640px`.

### `shared/app-shell.js`

Use junto com `shared/app-shell.css`. Ele contem:

- Clique no botao mobile `#openMenu`.
- Clique no botao de recolher `#sidebarToggle`.
- Overlay `#sidebarOverlay` e tecla `Escape` para fechar menu mobile.
- Leitura do JSON de marcas definido em `.brand[data-brands-url]`.
- Montagem do dropdown `.brand-dropdown`.
- Clique no logo `.brand__logo-btn` para abrir/fechar o popup de marcas.
- Persistencia da marca ativa no `localStorage` com chave `lp_active_brand`.
- Aplicacao automatica de `--brand-primary`, `--brand-secondary`, `--brand-soft` e `--brand-primary-rgb`.
- Atualizacao de imagens com `[data-logo]` e `[data-footer-logo]`.
- Evento customizado `app-shell:brand-change` para telas que precisem reagir a troca de marca.

### `shared/master-page.html`

Use como ponto de partida para telas novas. Substitua apenas a area dentro de `.content` pelo conteudo especifico da nova tela, mantendo sidebar, topbar, scripts e imports.

### `shared/brand-schema.json`

Use para documentar e validar mentalmente a estrutura de novas marcas. O arquivo nao substitui `shared/data/brands.json`; ele descreve o contrato que novos projetos devem seguir.

## Boas Praticas Ja Usadas

- Centralizar identidade visual em variaveis CSS e trocar marca sem duplicar estilos.
- Usar `shared/data/brands.json` para separar configuracao visual de logica.
- Preferir componentes com classes BEM-like (`block__element`, `block--modifier`).
- Usar estados explicitos: `.is-active`, `.is-visible`, `.is-open`, `.is-hidden`, `.is-positive`, `.is-negative`.
- Usar atributos ARIA em botoes, modais e controles (`aria-label`, `aria-expanded`, `aria-hidden`, `aria-modal`, `aria-pressed`).
- Manter layout responsivo via poucos breakpoints claros: `1320px`, `980px`, `640px`.
- Criar componentes densos e funcionais, adequados a portal/dashboard, sem excesso de ornamentacao.
- Usar icones inline com tamanhos consistentes (`20px`, `21px`, `24px`, `27px`, `30px`). Padrao completo na secao "Icones".
- Preservar legibilidade com truncamento em textos longos de modulos.
- Evitar scroll da pagina quando sidebar mobile ou modal esta aberto usando classes no `body`.
- Mostrar skeleton (`.skeleton-shimmer` / `.bp-skeleton`, ver secao "Estados De Carregamento") em toda troca assincrona de conteudo, nao so no carregamento inicial da tela.
- Usar `minmax(0, 1fr)` em grids para evitar overflow.
- Usar `box-sizing: border-box` global.
- Aplicar `scroll-behavior: smooth`.
- Em novas telas, reutilizar tokens e classes antes de criar novos estilos. Quando um novo componente for necessario, seguir a mesma escala de cores, espacamentos, radius, sombras e estados.

## Regra Para Novas Telas

Antes de criar qualquer nova tela em outro projeto:

1. Importar `shared/design-tokens.css` ou replicar integralmente os tokens de `:root`.
2. Usar `var(--brand-primary)`, `var(--brand-secondary)`, `var(--brand-soft)` e `--brand-primary-rgb` para qualquer elemento de marca.
3. Montar a tela com a mesma estrutura geral: sidebar/topbar/conteudo quando for portal, ou container central com largura `min(100% - 64px, 1680px)`.
4. Importar `shared/base-components.css` quando a tela usar botoes, inputs, cards, chips, listas ou modais do sistema.
5. Importar `shared/app-shell.css` e `shared/app-shell.js` para telas com sidebar/topbar.
6. Comecar por `shared/master-page.html` quando a tela for uma pagina completa do portal.
7. Respeitar os breakpoints `1320px`, `980px` e `640px`.
8. Manter estados visuais com classes `is-*` e acessibilidade com atributos ARIA.
9. Nao introduzir uma nova paleta, nova tipografia ou novos radius/sombras sem necessidade clara.
10. Documentar qualquer excecao visual no projeto consumidor.
11. Toda troca assincrona de conteudo (filtro, ordenacao, aba, paginacao, modo de visualizacao) usa skeleton por padrao, com o padrao compartilhado de `shared/base-components.css` (`.skeleton-shimmer`, `.bp-skeleton`) — ver secao "Estados De Carregamento (Skeleton)". Nao reinventar a tecnica de shimmer por projeto.
12. Todo `font-size` e `line-height` novo usa os tokens `--fs-*` / `--lh-*` de `shared/design-tokens.css` (ver secao "Tipografia > Escala de tamanho"). Nao escrever um valor em `px` solto quando um token da escala resolve o caso; um `<h1>` de hero usa sempre `var(--fs-hero)`, nunca um `clamp()` proprio da tela.
