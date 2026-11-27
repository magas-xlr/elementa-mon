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
  'investida',
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

export function costTotal(cost: Partial<ManaPool>): number {
  return (cost.corpo ?? 0) + (cost.ilusao ?? 0) + (cost.talento ?? 0);
}

export function describeEffect(effect: CardEffect): string {
  switch (effect.kind) {
    case 'dano':
      return `Causa ${effect.power} de dano${effect.area ? ' a todos os inimigos' : ''}.`;
    case 'escudo':
      return `Dá ${effect.amount} de escudo${effect.area ? ' a toda a equipe' : ''}.`;
    case 'cura':
      return `Cura ${effect.amount} de vida${effect.area ? ' de toda a equipe' : ''}.`;
    case 'comprar':
      return `Compra ${effect.amount} cartas.`;
    case 'fortalecer':
      return `O pet ganha +${effect.amount} de ataque nesta batalha.`;
    case 'invocar':
      return `Invoca um aliado que causa ${effect.power} de dano por turno durante ${effect.turns} turnos.`;
  }
}
