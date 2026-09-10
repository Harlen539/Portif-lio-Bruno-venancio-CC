# Bruno Venâncio — portfólio

Portfólio responsivo desenvolvido em React com Vite. A interface preserva a identidade pixel art em preto, vermelho e branco, o menu de cassetes, as transições entre seções e o parallax ligado à rolagem nativa.

## Estrutura

- `front-end/src/components/`: cabeçalho, diálogo, rodapé e elementos reutilizáveis.
- `front-end/src/sections/`: seções principais do portfólio.
- `front-end/src/hooks/`: efeitos de entrada, seção ativa e movimento ligado à rolagem.
- `front-end/src/data/portfolio.js`: contatos e projetos.
- `front-end/src/data/translations.js`: textos PT/EN preparados para tradução.
- `front-end/public/assets/`: imagens, fontes e licenças.
- `front-end/styles.css` e `front-end/refinements.css`: identidade visual e responsividade.

## Desenvolvimento

```sh
cd front-end
npm install
npm run dev
```

Abra `http://localhost:8000`.

## Build de produção

```sh
cd front-end
npm run build
```

O resultado é gerado em `front-end/dist/`. O arquivo `hosting.json` da raiz já aponta para essa pasta.

## Conteúdo

Edite `front-end/src/data/portfolio.js` para preencher e-mail, GitHub, LinkedIn e projetos reais. Links externos são validados e abertos com `noopener noreferrer`.

O menu fecha por botão, link ou tecla Escape, prende o foco enquanto aberto e bloqueia a rolagem da página. As animações respeitam `prefers-reduced-motion`.
