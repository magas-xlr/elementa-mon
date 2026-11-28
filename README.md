# Elementa-Mon

Jogo leve de pets elementais com batalhas de cartas, no estilo roguelite. Roda no navegador e como programa Windows (pronto para a Steam), com visual inspirado no HD-2D (personagens em pixel art num cenário 3D com profundidade de campo), trilha em síntese FM no espírito dos jogos de 16 bits e orçamento de desempenho inspirado no Nintendo 64.

![Three.js](https://img.shields.io/badge/Three.js-0.187-000000?style=for-the-badge&logo=threedotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## Como é o jogo

- Monte uma **equipe de até 3 pets** e um **deck de até 15 cartas** (habilidades + no máximo 1 invocação).
- Explore **3 andares gerados por seed**: mato alto com pets selvagens, baús, ponto de cura, treinadores e um portal. No fim do 3º andar está o chefe.
- **Batalha por turnos com cartas**: mana de três tipos (Corpo-a-corpo, Ilusão, Talento) que começa em 1/1/1 e cresce +1 por rodada no tipo que você escolher. Mão inicial de 4 cartas, compra 1 por turno até 5.
- **9 elementos** com a tabela de vantagens da wiki (linha = atacante). Dano = `max(1, round((poder + ataque) × multiplicador) − defesa)`; carta do mesmo elemento do pet ganha +1 de poder.
- Pets começam no **nível 1 com 10 de vida**, evoluem no nível 2 e chegam ao máximo no nível 3. Perdeu todos, a aventura acaba (**permadeath**), mas o **nível do jogador** continua e libera pets, cartas e cores de roupa.
- Telas: título, tutorial, montar equipe/deck, mundo, batalha, recompensas, inventário (poções e relíquias), personalização, status, configurações, derrota, vitória e créditos.
- Controles: teclado (WASD/setas, Enter, Esc), mouse, toque (direcional na tela) e **gamepad** (Steam Deck/controle padrão).
- **7 idiomas**: inglês, chinês simplificado, russo, espanhol, português, alemão e francês (segue o idioma do sistema e pode ser trocado nas Configurações).

As regras detalhadas e as decisões de interpretação estão em [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md).

## Rodando

Requisitos: Node.js 22.11+ e pnpm 9.

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

| Comando             | O que faz                                                 |
| ------------------- | --------------------------------------------------------- |
| `pnpm dev`          | Servidor de desenvolvimento (um único processo)           |
| `pnpm build`        | Typecheck + build de produção em `dist/`                  |
| `pnpm preview`      | Serve o build de produção                                 |
| `pnpm test`         | Testes das regras de negócio (Vitest)                     |
| `pnpm lint`         | ESLint                                                    |
| `pnpm format:check` | Prettier                                                  |
| `pnpm desktop`      | Build + abre a versão Windows (Electron)                  |
| `pnpm desktop:dist` | Gera `release/win-unpacked/Elementa-Mon.exe` para a Steam |

Durante o jogo, **F3** mostra FPS, resolução interna, triângulos e draw calls. Em **Configurações → Teste de som** dá para ouvir as cinco faixas.

## Tecnologia e por que ela

| Peça             | Escolha                                                                                                | Motivo                                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Motor 3D         | **Three.js** (tree-shaken)                                                                             | O mais leve dos motores completos: o jogo inteiro tem ~163 kB gzip. Babylon.js e PlayCanvas trazem física/editor que este jogo não precisa. |
| Linguagem/build  | TypeScript + Vite                                                                                      | Build em < 1 s, um único servidor de dev.                                                                                                   |
| Desktop / Steam  | **Electron**                                                                                           | Integração madura com Steamworks (`steamworks.js`) e overlay da Steam. Tauri foi descartado: WebView2 não tem overlay da Steam confiável.   |
| Modelos dos pets | **Blockbench** (recomendado) → glTF                                                                    | Leve, gratuito, feito para low-poly com animação e exportação glTF.                                                                         |
| Cenários         | **Crocotile 3D** (recomendado) → glTF; Blender para ajustes                                            | Monta cenários com tiles no estilo N64/PS1 e exporta glTF/glb.                                                                              |
| Arte atual       | Modelos procedurais renderizados como **sprites pixel art** + cenário toon; trilha **FM** (Mega Drive) | Zero arquivos de arte/áudio: download mínimo e tudo já funciona hoje.                                                                       |

### Orçamento "estilo Nintendo 64"

O alvo é a sensação e o custo de um jogo de N64, não o hardware real (JavaScript não roda num N64; um port de verdade exigiria reescrever em C com libdragon). Na prática:

- Resolução interna **320×240** (opções 360p/480p) ampliada com filtro _nearest_, sem antialiasing.
- Menos de **2 mil triângulos na tela** e ~10–35 draw calls (medido: mundo ≈ 1,3 mil, batalha do chefe ≈ 1,4 mil; antes dos sprites eram 11,5 mil e 7,7 mil).
- Pets, avatar, treinadores, árvores e mato são **sprites pixel art** (2 triângulos cada), gerados na hora a partir dos modelos low-poly toon: render ortográfico a 24 px por unidade, posterização e contorno de 1 px (`src/render/sprites.ts`). O avatar tem 4 direções.
- O chão usa texturas procedurais de 16 px por tile (grama, caminho, água), sem arquivos de imagem.
- Um único passe de pós-processamento na resolução interna faz **tilt-shift**, bloom, gradação quente e vinheta; dá para desligar em **Configurações → Efeitos HD-2D**.
- Nos objetos 3D (baús, portal, nuvens, colinas), o contorno "de tinta" reaproveita a mesma geometria (casco invertido inflado no vertex shader), sem guardar malha extra.
- Árvores e mato usam `InstancedMesh` em blocos 8×8 para o _frustum culling_ funcionar; névoa esconde o horizonte.
- Limite de 30 ou 60 FPS configurável.

## Versão Windows / Steam

```bash
pnpm desktop:dist
```

Gera `release/win-unpacked/` (o jogo em si ocupa ~640 kB dentro do `app.asar`; o resto é o runtime do Electron). Para ligar a Steam:

1. `pnpm add steamworks.js`
2. Defina `STEAM_APP_ID` (ou distribua `steam_appid.txt`) — conquistas e overlay passam a funcionar; sem isso o jogo roda normalmente.
3. Envie a pasta `win-unpacked` como depot pelo SteamPipe.

Teste rápido sem abrir a janela: `ELEMENTAMON_SMOKE=print.png pnpm exec electron .` salva um print após iniciar.

## Estrutura

```
src/
  game/data/     elementos, espécies, cartas, relíquias
  game/rules/    rng com seed, deck, batalha, progressão, mundo procedural (+ testes)
  game/state/    partida em andamento e save (localStorage)
  render/        engine (resolução baixa + limite de FPS), modelos low-poly, toon shading, sprites pixel art, texturas procedurais, pós-processamento, mundo, batalha
  music.ts       trilha em síntese FM (baixo slap, lead, metais, bateria) com sequenciador
  i18n/          traduções (pt é a fonte das chaves; en, zh, ru, es, de, fr)
  ui/            HTML das cartas (layout da wiki), navegação por teclado/gamepad, efeitos
  app.ts         máquina de telas
electron/        janela desktop, preload e Steamworks opcional
docs/            design do jogo; legacy-specs/ guarda as specs da versão anterior
```

## Licença

MIT — veja [LICENSE](LICENSE).
