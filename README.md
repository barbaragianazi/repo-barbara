# Repo Barbara

Repositorio front-end estatico para projetos avulsos, usando HTML, CSS e JS puros com shell visual compartilhado.

## Estrutura

```text
.
├── index.html
├── css/
│   └── app.css
├── config/
│   └── menu.json
├── sonhos-zoetis/
│   └── index.html
├── server.js
└── shared/
    ├── design.md
    ├── design-tokens.css
    ├── base-components.css
    ├── app-shell.css
    ├── app-shell.js
    ├── data/
    │   └── brands.json
    └── assets/
        └── logos/
```

## Fonte de verdade

- Shell, tokens, componentes, marcas e logos ficam em `shared/`.
- A pagina inicial e os projetos consomem `shared/app-shell.js`.
- O menu lateral fica em `config/menu.json`.
- As marcas ficam em `shared/data/brands.json`.
- Os logos ficam em `shared/assets/logos/`.
- O guia visual fica em `shared/design.md`.

## Como executar

Use o Live Server do VS Code na raiz do projeto ou rode:

```bash
node server.js
```

Depois valide:

- `/`
- `/sonhos-zoetis/`
- troca de marca pelo logo na sidebar
- menu lateral recolhido no desktop
- menu mobile com overlay
- console sem erros 404

## Arquivos principais

- `index.html`: hub inicial com cards dos projetos.
- `css/app.css`: estilos especificos do hub e ajustes locais dos projetos.
- `config/menu.json`: itens exibidos no menu lateral compartilhado.
- `sonhos-zoetis/index.html`: primeira tela do projeto Sonhos Zoetis.
- `server.js`: servidor local simples para testar arquivos JSON via `fetch`.
- `shared/app-shell.js`: sidebar, menu mobile, menu dinamico e troca de marca.
- `shared/data/brands.json`: configuracao das marcas.

## Como adicionar ou alterar marcas

Edite `shared/data/brands.json` e adicione os logos correspondentes em `shared/assets/logos/`.

Ao usar uma tela fora da raiz, configure `assetPathPrefix` para que o shell resolva os caminhos dos logos corretamente.
