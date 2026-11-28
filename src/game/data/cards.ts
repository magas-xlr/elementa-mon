import { cardText, manaText, t } from '../../i18n';
import type { Element } from './elements';
import type { Rarity } from './species';

/** The three mana types from the wiki. */
export const MANA_TYPES = ['corpo', 'ilusao', 'talento'] as const;
export type ManaType = (typeof MANA_TYPES)[number];
export type ManaPool = Record<ManaType, number>;

export const MANA_INFO: Record<ManaType, { name: string; short: string; color: string }> = {
  corpo: { name: 'Corpo-a-corpo', short: 'C', color: '#e0623a' },
  ilusao: { name: 'Ilusão', short: 'I', color: '#8a5cf0' },
  talento: { name: 'Talento', short: 'T', color: '#2fb3a1' },
};

export type CardKind = 'habilidade' | 'invocacao';
export type CardElement = Element | 'neutro';

export type CardEffect =
  | { kind: 'dano'; power: number; area?: boolean }
  | { kind: 'escudo'; amount: number; area?: boolean }
  | { kind: 'cura'; amount: number; area?: boolean }
  | { kind: 'comprar'; amount: number }
  | { kind: 'fortalecer'; amount: number }
  /** Transforms an allied pet into an elemental form for this battle (+1 ATK, attacks inherit element). */
  | { kind: 'transformar'; element: Element }
  /** Summons a helper that hits a random enemy for `power` at the end of each player turn. */
  | { kind: 'invocar'; power: number; turns: number };

export interface CardDef {
  id: string;
  name: string;
  kind: CardKind;
  element: CardElement;
  cost: Partial<ManaPool>;
  effect: CardEffect;
  rarity: Rarity;
  requiredLevel: number;
  lore: string;
}

type CardInput = Omit<CardDef, 'kind' | 'rarity' | 'requiredLevel'> &
  Partial<Pick<CardDef, 'kind' | 'rarity' | 'requiredLevel'>>;

const card = (c: CardInput): CardDef => ({
  kind: 'habilidade',
  rarity: 'comum',
  requiredLevel: 1,
  ...c,
});

export const CARDS: readonly CardDef[] = [
  // Neutral basics — the starter deck is built from these.
  card({
    id: 'investida',
    name: 'Investida',
    element: 'neutro',
    cost: { corpo: 1 },
    effect: { kind: 'dano', power: 2 },
    lore: 'Um encontrão sem cerimônia.',
  }),
  card({
    id: 'guarda',
    name: 'Guarda',
    element: 'neutro',
    cost: { talento: 1 },
    effect: { kind: 'escudo', amount: 3 },
    lore: 'Firme os pés e espere o golpe.',
  }),
  card({
    id: 'curativo',
    name: 'Curativo',
    element: 'neutro',
    cost: { talento: 1 },
    effect: { kind: 'cura', amount: 3 },
    lore: 'Folhas mascadas e um sopro de carinho.',
  }),
  card({
    id: 'foco',
    name: 'Foco',
    element: 'neutro',
    cost: { ilusao: 1 },
    effect: { kind: 'comprar', amount: 2 },
    lore: 'Respire fundo e veja o próximo passo.',
  }),
  card({
    id: 'grito',
    name: 'Grito de Guerra',
    element: 'neutro',
    cost: { corpo: 1, ilusao: 1 },
    effect: { kind: 'fortalecer', amount: 1 },
    rarity: 'raro',
    requiredLevel: 2,
    lore: 'O pet ganha +1 de ataque até o fim da batalha.',
  }),

  // Fogo
  card({
    id: 'brasa',
    name: 'Brasa',
    element: 'fogo',
    cost: { corpo: 1 },
    effect: { kind: 'dano', power: 3 },
    lore: 'Uma fagulha que arde mais do que parece.',
  }),
  card({
    id: 'labareda',
    name: 'Labareda',
    element: 'fogo',
    cost: { corpo: 2, talento: 1 },
    effect: { kind: 'dano', power: 3, area: true },
    rarity: 'raro',
    requiredLevel: 3,
    lore: 'Uma onda de fogo que varre o campo.',
  }),
  // Água
  card({
    id: 'jato',
    name: "Jato d'Água",
    element: 'agua',
    cost: { ilusao: 1 },
    effect: { kind: 'dano', power: 3 },
    lore: 'Pressão suficiente para derrubar um galho.',
  }),
  card({
    id: 'nevoa-calma',
    name: 'Névoa Calma',
    element: 'agua',
    cost: { talento: 2 },
    effect: { kind: 'cura', amount: 2, area: true },
    rarity: 'raro',
    requiredLevel: 2,
    lore: 'Uma garoa morna que acalma a equipe.',
  }),
  // Elétrico
  card({
    id: 'choque',
    name: 'Choque',
    element: 'eletrico',
    cost: { ilusao: 1 },
    effect: { kind: 'dano', power: 3 },
    lore: 'Dá um formigamento e deixa o pelo em pé.',
  }),
  card({
    id: 'relampago',
    name: 'Relâmpago',
    element: 'eletrico',
    cost: { ilusao: 2, corpo: 1 },
    effect: { kind: 'dano', power: 6 },
    rarity: 'raro',
    requiredLevel: 3,
    lore: 'Cai sempre no mesmo lugar: no inimigo.',
  }),
  // Terra
  card({
    id: 'pedrada',
    name: 'Pedrada',
    element: 'terra',
    cost: { corpo: 1 },
    effect: { kind: 'dano', power: 3 },
    lore: 'Simples, pesado e eficiente.',
  }),
  card({
    id: 'muralha',
    name: 'Muralha',
    element: 'terra',
    cost: { talento: 2 },
    effect: { kind: 'escudo', amount: 3, area: true },
    rarity: 'raro',
    requiredLevel: 2,
    lore: 'Uma parede de rocha brota do chão.',
  }),
  // Gelo
  card({
    id: 'granizo',
    name: 'Granizo',
    element: 'gelo',
    cost: { ilusao: 1, corpo: 1 },
    effect: { kind: 'dano', power: 2, area: true },
    requiredLevel: 2,
    lore: 'Pedrinhas de gelo para todo lado.',
  }),
  card({
    id: 'carapaca',
    name: 'Carapaça de Gelo',
    element: 'gelo',
    cost: { talento: 1 },
    effect: { kind: 'escudo', amount: 5 },
    rarity: 'raro',
    requiredLevel: 2,
    lore: 'Uma armadura fria e transparente.',
  }),
  // Venenoso
  card({
    id: 'ferroada',
    name: 'Ferroada',
    element: 'venenoso',
    cost: { corpo: 1 },
    effect: { kind: 'dano', power: 3 },
    requiredLevel: 3,
    lore: 'Pica e deixa a pele roxa.',
  }),
  card({
    id: 'nuvem-toxica',
    name: 'Nuvem Tóxica',
    element: 'venenoso',
    cost: { ilusao: 2 },
    effect: { kind: 'dano', power: 2, area: true },
    rarity: 'raro',
    requiredLevel: 3,
    lore: 'Ninguém respira tranquilo aqui dentro.',
  }),
  // Psíquico
  card({
    id: 'onda-mental',
    name: 'Onda Mental',
    element: 'psiquico',
    cost: { ilusao: 1 },
    effect: { kind: 'dano', power: 3 },
    requiredLevel: 3,
    lore: 'Uma dor de cabeça repentina.',
  }),
  card({
    id: 'premonicao',
    name: 'Premonição',
    element: 'psiquico',
    cost: { ilusao: 1 },
    effect: { kind: 'comprar', amount: 3 },
    rarity: 'epico',
    requiredLevel: 4,
    lore: 'Você já sabia que ia comprar estas cartas.',
  }),
  // Fantasma
  card({
    id: 'assombrar',
    name: 'Assombrar',
    element: 'fantasma',
    cost: { ilusao: 1 },
    effect: { kind: 'dano', power: 3 },
    requiredLevel: 4,
    lore: 'Um sussurro gelado na nuca.',
  }),
  card({
    id: 'pesadelo',
    name: 'Pesadelo',
    element: 'fantasma',
    cost: { ilusao: 2, talento: 1 },
    effect: { kind: 'dano', power: 7 },
    rarity: 'epico',
    requiredLevel: 4,
    lore: 'O pior sonho, em pleno dia.',
  }),
  // Fada
  card({
    id: 'po-de-fada',
    name: 'Pó de Fada',
    element: 'fada',
    cost: { talento: 1 },
    effect: { kind: 'cura', amount: 4 },
    requiredLevel: 4,
    lore: 'Brilha, cheira a flor e fecha feridas.',
  }),
  card({
    id: 'encanto',
    name: 'Encanto',
    element: 'fada',
    cost: { ilusao: 1 },
    effect: { kind: 'dano', power: 3 },
    requiredLevel: 4,
    lore: 'Tão bonito que machuca.',
  }),

  // Cartas de Evolução Elemental (transformam o pet em forma elemental durante a batalha!)
  card({
    id: 'evo_fogo',
    name: 'Forma de Fogo',
    element: 'fogo',
    cost: { corpo: 1 },
    effect: { kind: 'transformar', element: 'fogo' },
    rarity: 'raro',
    requiredLevel: 1,
    lore: 'O pet incendeia em chamas vivas e seus ataques ganham variação de Fogo até o fim da batalha.',
  }),
  card({
    id: 'evo_agua',
    name: 'Forma de Água',
    element: 'agua',
    cost: { ilusao: 1 },
    effect: { kind: 'transformar', element: 'agua' },
    rarity: 'raro',
    requiredLevel: 1,
    lore: 'O pet envolve-se em água cristalina e seus ataques ganham variação de Água na batalha.',
  }),
  card({
    id: 'evo_eletrico',
    name: 'Forma Elétrica',
    element: 'eletrico',
    cost: { ilusao: 1 },
    effect: { kind: 'transformar', element: 'eletrico' },
    rarity: 'raro',
    requiredLevel: 1,
    lore: 'Raios dourados crepitam ao redor do pet, eletrizando seus golpes na batalha.',
  }),
  card({
    id: 'evo_terra',
    name: 'Forma de Terra',
    element: 'terra',
    cost: { talento: 1 },
    effect: { kind: 'transformar', element: 'terra' },
    rarity: 'raro',
    requiredLevel: 1,
    lore: 'Rochas e musgo revestem o pet, dando força sísmica aos ataques na batalha.',
  }),
  card({
    id: 'evo_gelo',
    name: 'Forma de Gelo',
    element: 'gelo',
    cost: { ilusao: 1 },
    effect: { kind: 'transformar', element: 'gelo' },
    rarity: 'raro',
    requiredLevel: 2,
    lore: 'Cristais de geada envolvem o pet, congelando seus ataques até o fim do duelo.',
  }),

  // Invocações (max 1 per deck)
  card({
    id: 'fenix',
    name: 'Fênix Ancestral',
    kind: 'invocacao',
    element: 'fogo',
    cost: { corpo: 2, ilusao: 1, talento: 1 },
    effect: { kind: 'invocar', power: 3, turns: 3 },
    rarity: 'epico',
    requiredLevel: 2,
    lore: 'Renasce das cinzas para lutar ao seu lado por 3 turnos.',
  }),
  card({
    id: 'golem',
    name: 'Golem de Musgo',
    kind: 'invocacao',
    element: 'terra',
    cost: { corpo: 1, talento: 2 },
    effect: { kind: 'invocar', power: 2, turns: 4 },
    rarity: 'raro',
    requiredLevel: 1,
    lore: 'Lento, teimoso e leal por 4 turnos.',
  }),
  card({
    id: 'leviata',
    name: 'Leviatã do Lago',
    kind: 'invocacao',
    element: 'agua',
    cost: { ilusao: 2, talento: 2 },
    effect: { kind: 'invocar', power: 4, turns: 3 },
    rarity: 'lendario',
    requiredLevel: 5,
    lore: 'Emerge do fundo do lago por 3 turnos.',
  }),
];

const BY_ID = new Map(CARDS.map((c) => [c.id, c]));

export function getCard(id: string): CardDef {
  const c = BY_ID.get(id);
  if (!c) throw new Error(`Carta desconhecida: ${id}`);
  return c;
}

export const STARTER_DECK: readonly string[] = [
  'investida',
  'investida',
  'evo_fogo',
  'guarda',
  'guarda',
  'curativo',
  'foco',
  'golem',
];

/** Card color by kind (wiki): habilidade = roxo, invocação = cinza. Pet colors live in the UI. */
export const CARD_COLORS = {
  habilidade: '#7b4bc4',
  invocacao: '#7d7d86',
  pet1: '#8a5a32',
  pet2: '#e08a2c',
  pet3: '#e870b0',
} as const;

/** Localized card name and lore (falls back to the Portuguese data). */
export const cardName = (c: CardDef | string): string => {
  const def = typeof c === 'string' ? getCard(c) : c;
  return cardText(def.id)?.[0] ?? def.name;
};
export const cardLore = (c: CardDef | string): string => {
  const def = typeof c === 'string' ? getCard(c) : c;
  return cardText(def.id)?.[1] ?? def.lore;
};
export const manaName = (m: ManaType): string => manaText(m)?.[0] ?? MANA_INFO[m].name;
export const manaShort = (m: ManaType): string => manaText(m)?.[1] ?? MANA_INFO[m].short;

export function costTotal(cost: Partial<ManaPool>): number {
  return (cost.corpo ?? 0) + (cost.ilusao ?? 0) + (cost.talento ?? 0);
}

export function describeEffect(effect: CardEffect): string {
  switch (effect.kind) {
    case 'dano':
      return t(effect.area ? 'fxDamageAll' : 'fxDamage', { n: effect.power });
    case 'escudo':
      return t(effect.area ? 'fxShieldAll' : 'fxShield', { n: effect.amount });
    case 'cura':
      return t(effect.area ? 'fxHealAll' : 'fxHeal', { n: effect.amount });
    case 'comprar':
      return t('fxDraw', { n: effect.amount });
    case 'fortalecer':
      return t('fxBuff', { n: effect.amount });
    case 'transformar':
      return `Transforma o pet em forma elemental (+1 ATK e ataques desse elemento na batalha).`;
    case 'invocar':
      return t('fxSummon', { n: effect.power, turns: effect.turns });
  }
}
