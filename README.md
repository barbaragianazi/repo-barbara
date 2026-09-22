# Repo Barbara

Repositorio front-end estatico para projetos avulsos, usando HTML, CSS e JS puros com shell visual compartilhado.

Este README e o ponto central da documentacao do projeto. Os demais arquivos Markdown existem como guias especificos:

- `shared/README.md`: uso pratico da pasta compartilhada.
- `shared/design.md`: referencia visual detalhada de tokens, componentes, layout e responsividade.

## Regras de trabalho

- Nunca fazer commit sem autorizacao explicita da Barbara.
- Nunca responder em ingles; todas as respostas devem ser em portugues.

## Estrutura

```text
.
├── index.html
├── css/
│   └── app.css
├── config/
│   ├── menu.json
│   └── projects.json        (gerado no build; nao editar a mao)
├── redesign-pagamentos/
│   ├── analise/
│   └── pagamento-acoes/
├── estruturas-de-vendas/
│   └── index.html
├── sonhos-zoetis/
│   └── index.html
├── scripts/
│   └── gerar-datas-projetos.js
├── server.js
├── package.json
├── vercel.json
└── shared/
    ├── README.md
    ├── design.md
    ├── design-tokens.css
    ├── base-components.css
    ├── app-shell.css
    ├── app-shell.js
    ├── custom-date.css
    ├── custom-date.js
    ├── custom-select.css
    ├── custom-select.js
    ├── brand-schema.json
    ├── data/
    │   ├── brands.json
    │   └── payments.js
    └── assets/
        ├── icones/
        └── logos/
```

## Fonte de verdade

- Shell, tokens, componentes, marcas e logos ficam em `shared/`.
- A pagina inicial e os projetos consomem `shared/app-shell.js`.
- O menu lateral fica em `config/menu.json`.
- As marcas ficam em `shared/data/brands.json`.
- Os logos ficam em `shared/assets/logos/`.
- O guia visual detalhado fica em `shared/design.md`.
- As instrucoes de reaproveitamento da pasta compartilhada ficam em `shared/README.md`.

## Como executar

Use o Live Server do VS Code na raiz do projeto ou rode:

```bash
node server.js
```

Depois valide:

- `/`
- `/sonhos-zoetis/`
- `/redesign-pagamentos/analise/`
- `/redesign-pagamentos/pagamento-acoes/`
- `/estruturas-de-vendas/`
- troca de marca pelo logo na sidebar
- menu lateral recolhido no desktop
- menu mobile com overlay
- console sem erros 404

## Arquivos principais

- `index.html`: hub inicial com cards dos projetos.
- `css/app.css`: estilos especificos do hub e ajustes locais dos projetos.
- `config/menu.json`: itens exibidos no menu lateral compartilhado.
- `server.js`: servidor local simples para testar arquivos JSON via `fetch`.
- `scripts/gerar-datas-projetos.js`: gera `config/projects.json` com a data do ultimo commit de cada projeto.
- `config/projects.json`: arquivo gerado no build; mapa `pasta-do-projeto -> data`. Nao editar a mao.
- `vercel.json`: define o passo de build da Vercel (`node scripts/gerar-datas-projetos.js`).
- `sonhos-zoetis/index.html`: tela do projeto Sonhos Zoetis.
- `redesign-pagamentos/`: telas de analise e pagamento de acoes.
- `estruturas-de-vendas/index.html`: esqueleto do projeto Estruturas de Vendas (tela placeholder; conteudo em rodadas futuras).
- `shared/design-tokens.css`: tokens globais de cor, tipografia, radius, sombra, medidas e estrutura base.
- `shared/base-components.css`: botoes, inputs, chips, cards, listas, modais, skeletons e grids reutilizaveis.
- `shared/app-shell.css`: sidebar, topbar, seletor de marca, perfil, notificacoes e estados responsivos.
- `shared/app-shell.js`: comportamento da sidebar, menu dinamico, perfil, mobile, dropdown de marcas e troca de marca.
- `shared/custom-select.*`: popup customizado para campos `<select>`.
- `shared/custom-date.*`: calendario customizado para campos `<input type="date">`.
- `shared/data/brands.json`: configuracao das marcas.
- `shared/brand-schema.json`: contrato para criar ou validar marcas.

## Como criar uma nova tela

1. Consulte `shared/design.md` antes de decidir cores, fontes, radius, sombras, espacamentos ou componentes.
2. Use `shared/master-page.html` como base para telas completas de portal.
3. Importe os CSS nesta ordem:

```html
<link rel="stylesheet" href="shared/design-tokens.css">
<link rel="stylesheet" href="shared/base-components.css">
<link rel="stylesheet" href="shared/app-shell.css">
<link rel="stylesheet" href="css/app.css">
```

4. Antes de fechar o `body`, configure a tela ativa e carregue o shell:

```html
<script>
  window.BipperShellConfig = { app: 'inicio', active: '<key-do-item-no-menu.json>' };
</script>
<script src="shared/app-shell.js"></script>
```

5. Troque apenas o conteudo dentro de `.content`.
6. Crie CSS novo somente quando nao existir equivalente em `shared/design-tokens.css` ou `shared/base-components.css`.

## Data de atualizacao dos projetos

O chip "Atualizado em dd/mm/aaaa" de cada card em `index.html` e dinamico.

- `scripts/gerar-datas-projetos.js` roda `git log -1 --format=%cs -- <pasta-do-projeto>` para cada projeto e escreve `config/projects.json`.
- "Projeto" = pasta de primeiro nivel que contem um `index.html` (direto ou aninhado), exceto pastas de infraestrutura (`config`, `css`, `scripts`, `shared`...).
- So conta commit que tocou em arquivo dentro da pasta do projeto. Mudanca apenas em `shared/` nao altera a data de nenhum projeto.
- `index.html` le `config/projects.json` via `fetch` e preenche cada chip pela chave `data-project` do card. Sem data, o chip fica oculto.

### Quando roda

- Na Vercel: automaticamente a cada deploy, pelo `buildCommand` do `vercel.json`. Como o deploy acontece depois do push, a data ja reflete o commit recem-enviado.
- Local: rode `npm run datas` (ou `node scripts/gerar-datas-projetos.js`) quando quiser atualizar o arquivo antes de testar no Live Server.

### Projeto novo

Nada a configurar no script: basta a pasta nova ter `index.html` e o card em `index.html` ter `data-project="nome-da-pasta"` com um chip `<span class="project-chip" data-updated hidden>`.

## Como adicionar ou alterar marcas

Edite `shared/data/brands.json` e adicione os logos correspondentes em `shared/assets/logos/`.

Cada marca deve ter, no minimo:

- `name`
- `primary`
- `secondary`
- `surface`
- `surfaceAlt`
- `text`
- `textLight`
- `border`
- `logoLight`
- `logoDark`

Ao usar uma tela fora da raiz, configure `assetPathPrefix` para que o shell resolva os caminhos dos logos corretamente.

## Padroes visuais resumidos

- Use sempre `var(--brand-primary)`, `var(--brand-secondary)`, `var(--brand-soft)` e `rgba(var(--brand-primary-rgb), alpha)` para elementos de marca.
- Use os tokens `--fs-*` e `--lh-*` para novos tamanhos de fonte e alturas de linha.
- Reaproveite `.btn`, `.icon-btn`, `.summary-card`, `.metric-card`, `.area-card`, `.search-box`, `.filter-chip`, `.favorite-modal`, `.skeleton-shimmer` e demais componentes compartilhados.
- Mantenha estados com classes `is-*`, como `.is-active`, `.is-visible`, `.is-open`, `.is-hidden`, `.is-positive` e `.is-negative`.
- Use atributos ARIA em botoes, modais e controles interativos.
- Respeite os breakpoints principais: `1320px`, `980px` e `640px`.
- Toda troca assincrona de conteudo deve usar skeleton ou transicao visual prevista em `shared/base-components.css`.
