# Elementa-Mon — design do jogo

Este documento resume as regras de negócio e de produto implementadas em `src/game/` e as interpretações feitas onde a wiki deixava margem.

## Ciclo da partida

1. **Preparar**: escolher até 3 pets (espécies diferentes, liberadas pelo nível do jogador) e o deck.
2. **Explorar** 3 andares gerados por seed (`generateFloor`). O portal sempre é alcançável a partir do início (garantido por BFS e por teste).
3. **Encontros**: mato alto (12% por passo), treinadores (fale com Enter) e o chefe no portal do 3º andar.
4. **Recompensas**: XP de jogador, XP dos pets (evolução), escolha de 1 entre 3 cartas e, em batalhas selvagens, a chance de recrutar o pet derrotado se a equipe tiver vaga.
5. **Fim**: vencer o chefe (vitória) ou perder todos os pets (permadeath). O XP do jogador é salvo a cada batalha.

## Pets

- 9 espécies, uma por elemento, cada uma com 3 estágios (nome e lore próprios).
- Todo pet começa a aventura no **nível 1 com 10 de vida**. Nível 2 (2 XP) evolui para o estágio 2; nível 3 (5 XP) é o máximo.
- Cada estágio soma +5 de vida máxima, +1 de ataque e +1 de defesa.
- A equipe (até 3 pets) **não conta** no limite do deck — interpretação adotada para conciliar "deck de 15" com "3 pets + habilidades".

## Deck e cartas

- Até **15 cartas**, mínimo de 5, no máximo **1 invocação** e 3 cópias de cada carta.
- Cartas e pets exigem um **nível de jogador** mínimo.
- Cores (wiki): pet marrom, pet nível 2 laranja, pet nível 3 rosa, invocação cinza, habilidade roxa.
- Layout (wiki): ataque à esquerda, nome no centro, defesa à direita; elementos fortes/fracos; imagem; elemento; lore; raridade + nível exigido; custo de mana no rodapé.
- Efeitos: dano (alvo único ou área), escudo, cura, comprar cartas, fortalecer (+ataque) e invocar (aliado que ataca no fim de cada turno por N turnos).

## Batalha

- Mana de 3 tipos — **Corpo-a-corpo, Ilusão e Talento** — começando em 1/1/1. No início de cada nova rodada o jogador escolhe um tipo para crescer +1 (máx. 5 por tipo) e a mana enche.
- Mão inicial de **4 cartas**; compra **1 por turno** enquanto a mão tiver menos de 5. O descarte é reembaralhado quando o deck acaba.
- **Dano** = `max(1, round((poder + ataque do pet) × multiplicador) − defesa)`. Carta do mesmo elemento do pet: +1 de poder. Cartas neutras usam multiplicador 1.
- Escudo absorve dano e some no início do próximo turno do jogador.
- **IA inimiga**: cada inimigo vivo ataca o alvo com melhor multiplicador elemental; empate → menor vida.
- O poder base dos inimigos cresce com o andar; o chefe tem 3 pets no nível 3.

## Tabela elemental (linha = atacante, %)

|              | Fogo | Água | Elétrico | Terra | Gelo | Venenoso | Psíquico | Fantasma | Fada |
| ------------ | ---: | ---: | -------: | ----: | ---: | -------: | -------: | -------: | ---: |
| **Fogo**     |  100 |   30 |       70 |    50 |   40 |       60 |       80 |       90 |  110 |
| **Água**     |  150 |  100 |       50 |    60 |  130 |       80 |       70 |       80 |  120 |
| **Elétrico** |  130 |  150 |      100 |    60 |   90 |       80 |       75 |       80 |  100 |
| **Terra**    |  120 |  110 |       90 |   100 |   80 |       70 |      100 |      100 |   90 |
| **Gelo**     |  130 |   70 |      100 |   130 |  100 |      100 |      100 |       80 |   70 |
| **Venenoso** |   70 |   90 |       90 |   100 |  100 |      100 |       85 |       80 |  140 |
| **Psíquico** |   80 |   90 |       80 |   100 |   90 |       85 |      100 |      120 |   80 |
| **Fantasma** |  110 |  110 |      100 |   100 |  120 |       90 |       70 |      100 |  100 |
| **Fada**     |  100 |  130 |      100 |   100 |  130 |       60 |      120 |      100 |  100 |

## Progressão persistente

- XP de jogador: selvagem 3, treinador 5, chefe 15, andar concluído 5. Nível máximo 10.
- O nível libera espécies, cartas e cores de roupa/boné do avatar.
- Relíquias (dos baús) valem só para a aventura atual: +1 ataque, +1 defesa, +1 mana de cada tipo, mão inicial de 5, cura ao vencer.
- Save em `localStorage` (`elementamon.save.v1`), com fallback seguro se estiver corrompido ou bloqueado.

## Pipeline de arte para substituir os modelos procedurais

- Pets: Blockbench → glTF (`.glb`), ≤ 300 triângulos por estágio, textura ≤ 64×64 ou só cores por vértice.
- Cenários: Crocotile 3D → `.glb` por tile/bioma, mantendo o total visível perto de 5 mil triângulos.
- Carregar com `GLTFLoader` no lugar de `creatureGeometry`/`treeGeometry` em `src/render/models.ts`; o resto do jogo não muda.

## Direção de arte e som

- **Visual HD-2D (inspiração, sem copiar arte de outros jogos)**: personagens em pixel art dentro de um cenário 3D. Cada pet (espécie + estágio), o avatar (4 direções), os treinadores, as árvores e o mato são renderizados uma vez a partir dos modelos procedurais, em resolução baixa, com posterização e contorno de 1 px, e exibidos como billboards (`src/render/sprites.ts`). As miniaturas das cartas usam a mesma imagem. O chão tem texturas de 16 px geradas por bioma (`src/render/pixelTextures.ts`). Um passe final (`src/render/postfx.ts`) aplica tilt-shift, bloom, gradação quente e vinheta; a opção "Efeitos HD-2D" desliga.
- **Modelos toon (base dos sprites)**: `MeshToonMaterial` com rampa de 3 tons (sombra, meio-tom, luz), cores chapadas, olhos grandes com brilho, árvores "pirulito" e nuvens arredondadas, tudo com contorno escuro (`src/render/toon.ts`).
- **Trilha**: 5 faixas originais (abertura, campos, batalha, chefe e vitória) em síntese FM de 2 operadores, no espírito do chip YM2612 do Mega Drive: baixo "slap", lead com vibrato e eco curto, acordes de metais nos contratempos e bateria eletrônica. As melodias são próprias; o que lembra os jogos de 16 bits é o timbre e o andamento, não as notas.

## Idiomas

- 7 idiomas: inglês, chinês simplificado, russo, espanhol, português, alemão e francês. Na primeira abertura o jogo segue o idioma do sistema (inglês se não for nenhum desses); depois vale a escolha em **Configurações → Idioma**, salva no save.
- Textos em `src/i18n/`: `pt.ts` é a fonte das chaves de interface; cada idioma traz interface, tutorial, cartas, lore dos pets, relíquias, elementos, mana, raridades e cores. Os testes (`i18n.test.ts`) falham se faltar uma chave, uma carta ou um marcador `{n}`.
- Nomes de pets são nomes próprios e ficam iguais nos idiomas de alfabeto latino; chinês e russo têm versões próprias (`names`).
- Para adicionar texto novo: crie a chave em `pt.ts`, use `t('chave')` e traduza nos outros 6 arquivos.
