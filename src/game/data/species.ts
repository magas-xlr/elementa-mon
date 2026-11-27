import type { Element } from './elements';

/** Body plan used by the procedural low-poly model builder. */
export type BodyShape = 'quadrupede' | 'bipede' | 'ave' | 'bolha' | 'serpente';

export type Rarity = 'comum' | 'raro' | 'epico' | 'lendario';

export interface Stage {
  name: string;
  lore: string;
}

export interface Species {
  id: string;
  element: Element;
  shape: BodyShape;
  /** Body and detail colors (0xRRGGBB). */
  colors: { body: number; belly: number; detail: number };
  /** Base attack and defense at stage 1; each evolution adds to them. */
  attack: number;
  defense: number;
  rarity: Rarity;
  /** Player level needed to use this pet. */
  requiredLevel: number;
  /** Stage 1, 2 and 3 forms. */
  stages: [Stage, Stage, Stage];
}

export const SPECIES: readonly Species[] = [
  {
    id: 'fagulho',
    element: 'fogo',
    shape: 'quadrupede',
    colors: { body: 0xe8552d, belly: 0xf6c177, detail: 0xffd23f },
    attack: 3,
    defense: 1,
    rarity: 'comum',
    requiredLevel: 1,
    stages: [
      { name: 'Fagulho', lore: 'Um lagartinho que acende a cauda quando fica feliz.' },
      { name: 'Labaréu', lore: 'Sua cauda vira uma tocha que nunca se apaga na chuva.' },
      { name: 'Vulcandro', lore: 'Dorme dentro de vulcões e acorda com o magma.' },
    ],
  },
  {
    id: 'gotelo',
    element: 'agua',
    shape: 'bolha',
    colors: { body: 0x3b8ee8, belly: 0xbfe3ff, detail: 0x1f5fb0 },
    attack: 2,
    defense: 2,
    rarity: 'comum',
    requiredLevel: 1,
    stages: [
      { name: 'Gotelo', lore: 'Uma gota curiosa que pula entre poças.' },
      { name: 'Ondaril', lore: 'Surfa nas próprias ondas e molha quem chega perto.' },
      { name: 'Marévolo', lore: 'Controla as marés de um lago inteiro.' },
    ],
  },
  {
    id: 'faiscar',
    element: 'eletrico',
    shape: 'bipede',
    colors: { body: 0xf2c62f, belly: 0xfff1a8, detail: 0x3a3a3a },
    attack: 3,
    defense: 0,
    rarity: 'comum',
    requiredLevel: 1,
    stages: [
      { name: 'Faiscar', lore: 'Suas orelhas soltam faíscas quando ele espirra.' },
      { name: 'Voltino', lore: 'Corre tão rápido que deixa um rastro de estática.' },
      { name: 'Trovardo', lore: 'Chama trovões batendo os pés no chão.' },
    ],
  },
  {
    id: 'torrao',
    element: 'terra',
    shape: 'quadrupede',
    colors: { body: 0x9a6b3c, belly: 0xd8b98a, detail: 0x6d6d6d },
    attack: 2,
    defense: 3,
    rarity: 'comum',
    requiredLevel: 2,
    stages: [
      { name: 'Torrão', lore: 'Parece uma pedra até você pisar nele.' },
      { name: 'Rochedo', lore: 'Carrega pedras nas costas como uma armadura.' },
      { name: 'Montauro', lore: 'Dizem que algumas montanhas são Montauros dormindo.' },
    ],
  },
  {
    id: 'flocolino',
    element: 'gelo',
    shape: 'ave',
    colors: { body: 0x8fe3f0, belly: 0xffffff, detail: 0x3fa7c4 },
    attack: 2,
    defense: 2,
    rarity: 'raro',
    requiredLevel: 2,
    stages: [
      { name: 'Flocolino', lore: 'Um passarinho que neva quando bate as asas.' },
      { name: 'Geleira', lore: 'Congela lagos para patinar ao amanhecer.' },
      { name: 'Glaciarca', lore: 'Reina sobre os picos gelados mais altos.' },
    ],
  },
  {
    id: 'peconhito',
    element: 'venenoso',
    shape: 'serpente',
    colors: { body: 0x9b4fc7, belly: 0xd9b3f0, detail: 0x7ad151 },
    attack: 3,
    defense: 1,
    rarity: 'raro',
    requiredLevel: 3,
    stages: [
      { name: 'Peçonhito', lore: 'Pequeno, mas suas manchas avisam: não toque.' },
      { name: 'Toxilha', lore: 'Deixa uma trilha de musgo roxo por onde passa.' },
      { name: 'Miasmor', lore: 'Sua névoa faz até as flores murcharem.' },
    ],
  },
  {
    id: 'mentelo',
    element: 'psiquico',
    shape: 'bipede',
    colors: { body: 0xe85fa8, belly: 0xf7c6e0, detail: 0x7a2c8f },
    attack: 3,
    defense: 1,
    rarity: 'raro',
    requiredLevel: 3,
    stages: [
      { name: 'Mentelo', lore: 'Adivinha o que você vai comer no almoço.' },
      { name: 'Psicorvo', lore: 'Levita enquanto medita sob a lua cheia.' },
      { name: 'Oraculux', lore: 'Vê todos os futuros possíveis ao mesmo tempo.' },
    ],
  },
  {
    id: 'vultinho',
    element: 'fantasma',
    shape: 'bolha',
    colors: { body: 0x6a5acd, belly: 0xc8c2f5, detail: 0x2b2066 },
    attack: 3,
    defense: 1,
    rarity: 'epico',
    requiredLevel: 4,
    stages: [
      { name: 'Vultinho', lore: 'Aparece nos cantos dos olhos e some quando você olha.' },
      { name: 'Assombro', lore: 'Ri baixinho dentro de casas abandonadas.' },
      { name: 'Espectrum', lore: 'Atravessa paredes, montanhas e até sonhos.' },
    ],
  },
  {
    id: 'petalo',
    element: 'fada',
    shape: 'ave',
    colors: { body: 0xf5a3d0, belly: 0xfff0f8, detail: 0x7ad1a8 },
    attack: 2,
    defense: 2,
    rarity: 'epico',
    requiredLevel: 4,
    stages: [
      { name: 'Pétalo', lore: 'Nasce dentro de flores que só abrem uma vez por ano.' },
      { name: 'Feérico', lore: 'Espalha pó brilhante que cura arranhões.' },
      { name: 'Encantária', lore: 'Guardiã dos bosques encantados.' },
    ],
  },
];

const BY_ID = new Map(SPECIES.map((s) => [s.id, s]));

export function getSpecies(id: string): Species {
  const species = BY_ID.get(id);
  if (!species) throw new Error(`Espécie desconhecida: ${id}`);
  return species;
}

/** Species a player of this level may put in the party. */
export function unlockedSpecies(playerLevel: number): Species[] {
  return SPECIES.filter((s) => s.requiredLevel <= playerLevel);
}
