import { rarityName, speciesLore, speciesName } from '../../i18n';
import type { ManaType } from './cards';

/** Body plan used by the procedural low-poly model builder. */
export type BodyShape = 'quadrupede' | 'bipede' | 'ave' | 'bolha' | 'serpente';

export type Rarity = 'comum' | 'raro' | 'epico' | 'lendario';

export interface Stage {
  name: string;
  lore: string;
}

/**
 * A base species. Every species is neutral: element crystals found in the world give a pet its
 * element for the rest of the run (see run.ts applyCrystal), and the element tints the model.
 */
export interface Species {
  id: string;
  shape: BodyShape;
  /** Neutral body and detail colors (0xRRGGBB). */
  colors: { body: number; belly: number; detail: number };
  /** Base attack and defense at stage 1; each evolution adds to them. */
  attack: number;
  defense: number;
  rarity: Rarity;
  /** Player level needed to use this pet. */
  requiredLevel: number;
  /**
   * Favourite kind of affection when it is wild (capture by petting): corpo = belly rubs,
   * ilusao = playing, talento = grooming. The favourite fills the affection meter twice as fast.
   */
  likes: ManaType;
  /** Stage 1, 2 and 3 forms. */
  stages: [Stage, Stage, Stage];
}

export const SPECIES: readonly Species[] = [
  {
    id: 'pipo',
    shape: 'bolha',
    colors: { body: 0xf3d9a4, belly: 0xfff6e0, detail: 0xc98a4b },
    attack: 2,
    defense: 2,
    rarity: 'comum',
    requiredLevel: 1,
    likes: 'ilusao',
    stages: [
      { name: 'Pipo', lore: 'Uma bolinha macia que quica quando ouve música.' },
      { name: 'Pipão', lore: 'Infla as bochechas para parecer maior do que é.' },
      { name: 'Pipaltar', lore: 'Flutua devagar sobre os campos, como um balão vivo.' },
    ],
  },
  {
    id: 'casquinho',
    shape: 'quadrupede',
    colors: { body: 0xb9a27e, belly: 0xeadcc0, detail: 0x6f5d48 },
    attack: 2,
    defense: 3,
    rarity: 'comum',
    requiredLevel: 1,
    likes: 'corpo',
    stages: [
      { name: 'Casquinho', lore: 'Rola dentro da casca quando fica com vergonha.' },
      { name: 'Casqueiro', lore: 'Sua casca guarda as marcas de cada aventura.' },
      { name: 'Cascolosso', lore: 'Tão firme que pássaros fazem ninho nas suas costas.' },
    ],
  },
  {
    id: 'bicudo',
    shape: 'ave',
    colors: { body: 0xd8d2c4, belly: 0xffffff, detail: 0x8a8277 },
    attack: 3,
    defense: 1,
    rarity: 'comum',
    requiredLevel: 1,
    likes: 'talento',
    stages: [
      { name: 'Bicudo', lore: 'Bica tudo o que brilha para ver se é comida.' },
      { name: 'Bicanor', lore: 'Plana em círculos procurando o próximo desafio.' },
      { name: 'Bicaltivo', lore: 'Seu grito ecoa de um vale ao outro.' },
    ],
  },
  {
    id: 'pulinho',
    shape: 'bipede',
    colors: { body: 0xe7c3a0, belly: 0xfbe9d6, detail: 0x9b6b4a },
    attack: 3,
    defense: 1,
    rarity: 'comum',
    requiredLevel: 2,
    likes: 'ilusao',
    stages: [
      { name: 'Pulinho', lore: 'Não consegue ficar parado nem dormindo.' },
      { name: 'Saltarel', lore: 'Pula de telhado em telhado sem fazer barulho.' },
      { name: 'Saltimor', lore: 'Um único salto o leva acima das nuvens baixas.' },
    ],
  },
  {
    id: 'felpudo',
    shape: 'quadrupede',
    colors: { body: 0xcfc6d8, belly: 0xf4f0f8, detail: 0x7d7390 },
    attack: 3,
    defense: 2,
    rarity: 'raro',
    requiredLevel: 2,
    likes: 'talento',
    stages: [
      { name: 'Felpudo', lore: 'Seu pelo junta folhas, sementes e muita poeira.' },
      { name: 'Felpardo', lore: 'Escova o pelo por horas antes de qualquer batalha.' },
      { name: 'Felpentor', lore: 'Dizem que sua juba guarda o vento de mil viagens.' },
    ],
  },
  {
    id: 'rabisco',
    shape: 'serpente',
    colors: { body: 0xb7c8a6, belly: 0xe8f0dc, detail: 0x5f7350 },
    attack: 3,
    defense: 1,
    rarity: 'raro',
    requiredLevel: 3,
    likes: 'corpo',
    stages: [
      { name: 'Rabisco', lore: 'Desenha trilhas tortas na areia por onde passa.' },
      { name: 'Rabiscoral', lore: 'Enrola-se em pilares velhos para tirar sonecas.' },
      { name: 'Rabiscondor', lore: 'Seu corpo forma símbolos que ninguém sabe ler.' },
    ],
  },
  {
    id: 'orelhito',
    shape: 'bipede',
    colors: { body: 0xd9b8c4, belly: 0xf8e8ee, detail: 0x8c5a6c },
    attack: 2,
    defense: 2,
    rarity: 'raro',
    requiredLevel: 1,
    likes: 'talento',
    stages: [
      { name: 'Caputino', lore: 'Ouve uma folha caindo do outro lado do bosque.' },
      { name: 'Orelhudo', lore: 'Usa as orelhas como guarda-chuva e como leque.' },
      { name: 'Orelhaz', lore: 'Escuta até o que as pessoas só pensam em dizer.' },
    ],
  },
  {
    id: 'penugem',
    shape: 'ave',
    colors: { body: 0xe9e1cf, belly: 0xfffaf0, detail: 0xa89a7c },
    attack: 2,
    defense: 3,
    rarity: 'epico',
    requiredLevel: 4,
    likes: 'ilusao',
    stages: [
      { name: 'Penugem', lore: 'Um filhote tão leve que a brisa o carrega.' },
      { name: 'Penacho', lore: 'Ergue a crista para assustar quem chega perto.' },
      { name: 'Penárquio', lore: 'Guia bandos inteiros pelas rotas mais altas do céu.' },
    ],
  },
  {
    id: 'gosminha',
    shape: 'bolha',
    colors: { body: 0xc4d9cf, belly: 0xeef7f2, detail: 0x5f8676 },
    attack: 3,
    defense: 2,
    rarity: 'epico',
    requiredLevel: 4,
    likes: 'corpo',
    stages: [
      { name: 'Gosminha', lore: 'Gruda em tudo e solta um cheirinho de chuva.' },
      { name: 'Gosmar', lore: 'Muda de forma para passar por qualquer fresta.' },
      { name: 'Gosmalteza', lore: 'Absorve o que toca e aprende com cada coisa.' },
    ],
  },
  // --- 6 New Biodiversity Species across Diverse Habitats & Ecosystems ---
  {
    id: 'coralinho',
    shape: 'bolha',
    colors: { body: 0x6ec6d9, belly: 0xdff7fc, detail: 0xf27ea6 },
    attack: 2,
    defense: 3,
    rarity: 'comum',
    requiredLevel: 1,
    likes: 'talento',
    stages: [
      { name: 'Coralinho', lore: 'Filtra a água dos riachos e faz corais brilharem.' },
      { name: 'Recifito', lore: 'Carrega pequenas anêmonas simbióticas nas costas.' },
      { name: 'Abissal', lore: 'Guardião bioluminescente das nascentes cristalinas.' },
    ],
  },
  {
    id: 'esporo',
    shape: 'quadrupede',
    colors: { body: 0xb87b5e, belly: 0xf7e7d4, detail: 0x78c272 },
    attack: 2,
    defense: 2,
    rarity: 'comum',
    requiredLevel: 2,
    likes: 'ilusao',
    stages: [
      { name: 'Esporinho', lore: 'Solta esporos suaves que nutrem o solo úmido.' },
      { name: 'Cogumelão', lore: 'Seu chapéu protege filhotes da chuva na mata.' },
      { name: 'Micélio', lore: 'Conecta as raízes de toda a floresta em uma só rede.' },
    ],
  },
  {
    id: 'duna',
    shape: 'quadrupede',
    colors: { body: 0xe2b866, belly: 0xfff3d4, detail: 0xa66e2e },
    attack: 3,
    defense: 1,
    rarity: 'raro',
    requiredLevel: 2,
    likes: 'corpo',
    stages: [
      { name: 'Duninha', lore: 'Orelhas grandes dissipam o calor do deserto.' },
      { name: 'Mirageiro', lore: 'Encontra oásis escondidos sob dunas antigas.' },
      { name: 'Faraó', lore: 'Corre mais rápido que as tempestades de areia.' },
    ],
  },
  {
    id: 'floco',
    shape: 'ave',
    colors: { body: 0xd6eef8, belly: 0xffffff, detail: 0x689ec4 },
    attack: 2,
    defense: 3,
    rarity: 'raro',
    requiredLevel: 3,
    likes: 'talento',
    stages: [
      { name: 'Floquinho', lore: 'Plumagem espessa que resiste ao frio alpino.' },
      { name: 'Nevasca', lore: 'Desliza silencioso sobre picos congelados.' },
      { name: 'Boreal', lore: 'Suas asas refletem auroras nos céus gelados.' },
    ],
  },
  {
    id: 'vagalume',
    shape: 'ave',
    colors: { body: 0x4e5c82, belly: 0xfff49c, detail: 0x7fe8a8 },
    attack: 3,
    defense: 2,
    rarity: 'epico',
    requiredLevel: 3,
    likes: 'ilusao',
    stages: [
      { name: 'Pisca', lore: 'Ilumina clareiras noturnas para guiar viajantes.' },
      { name: 'Lanterna', lore: 'Dança em sincronia com o vento da madrugada.' },
      { name: 'Constelação', lore: 'Seu brilho rivaliza com as estrelas do céu.' },
    ],
  },
  {
    id: 'musgoso',
    shape: 'quadrupede',
    colors: { body: 0x5c8c54, belly: 0xd8ecc8, detail: 0x8a6440 },
    attack: 2,
    defense: 4,
    rarity: 'lendario',
    requiredLevel: 4,
    likes: 'talento',
    stages: [
      { name: 'Brotinho', lore: 'Um pequeno broto nasce onde suas patas pisam.' },
      { name: 'Tronco', lore: 'Chifres de madeira abrigam ninhos de pássaros.' },
      { name: 'Guardião', lore: 'Espírito ancestral que restaura ecossistemas feridos.' },
    ],
  },
];

const BY_ID = new Map(SPECIES.map((s) => [s.id, s]));

export const isSpecies = (id: string): boolean => BY_ID.has(id);

export function getSpecies(id: string): Species {
  const species = BY_ID.get(id);
  if (!species) throw new Error(`Espécie desconhecida: ${id}`);
  return species;
}

const RARITY_PT: Record<Rarity, string> = {
  comum: 'Comum',
  raro: 'Raro',
  epico: 'Épico',
  lendario: 'Lendário',
};
export const rarityLabel = (r: Rarity): string => rarityName(r) ?? RARITY_PT[r];

/** Localized name of a stage (0–2); most languages keep the original proper noun. */
export const stageName = (sp: Species, stage: number): string =>
  speciesName(sp.id, stage) ?? sp.stages[stage].name;

/** Localized lore of a stage (0–2). */
export const stageLore = (sp: Species, stage: number): string =>
  speciesLore(sp.id, stage) ?? sp.stages[stage].lore;

/** The only pet a new adventure starts with; the others are found and caught while exploring. */
export const STARTER_SPECIES: readonly string[] = ['orelhito'];

export const isStarter = (id: string): boolean => STARTER_SPECIES.includes(id);

/** Species a player of this level may put in the party. */
export function unlockedSpecies(playerLevel: number): Species[] {
  return SPECIES.filter((s) => s.requiredLevel <= playerLevel);
}
