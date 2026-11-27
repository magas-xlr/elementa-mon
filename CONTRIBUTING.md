# Contribuindo com o Elementa-Mon

## Preparar o ambiente

```bash
pnpm install
pnpm dev
```

Os hooks do Husky rodam ESLint + Prettier nos arquivos alterados e validam a mensagem de commit.

## Fluxo

1. Crie um branch a partir de `main` (`feat/...`, `fix/...`).
2. Regras de jogo ficam em `src/game/` e **sempre** vêm com teste em Vitest (`*.test.ts` ao lado do arquivo). Esse código não importa Three.js nem DOM.
3. Rode `pnpm lint && pnpm test && pnpm build` antes de abrir o PR.
4. Mensagens de commit seguem Conventional Commits com assunto em _sentence case_, por exemplo `feat: Add ice cards`.

## Orçamento de desempenho

Toda mudança visual deve manter o jogo dentro do alvo "estilo N64" (veja o README): confira com **F3** que a cena continua perto de 5 mil triângulos e ~15 draw calls em 240p. Prefira uma malha unida por objeto, cores por vértice e `InstancedMesh` para elementos repetidos.

## Arte

Modelos novos: Blockbench (pets) ou Crocotile 3D (cenário), exportados em `.glb`, com texturas de até 64×64. Detalhes em [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md).
