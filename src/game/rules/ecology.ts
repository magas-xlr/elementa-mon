import type { Element } from '../data/elements';

export type WeatherKind = 'ameno' | 'chuva' | 'frio_extremo' | 'calor_extremo' | 'ventania';

export const WEATHER_META: Record<WeatherKind, { icon: string; name: string; labRisk: number }> = {
  ameno: { icon: '🌤️', name: 'Clima Ameno', labRisk: 0 },
  chuva: { icon: '🌧️', name: 'Chuva', labRisk: 0.06 },
  frio_extremo: { icon: '🥶', name: 'Frio Extremo', labRisk: 0.14 },
  calor_extremo: { icon: '🥵', name: 'Calor Extremo', labRisk: 0.14 },
  ventania: { icon: '💨', name: 'Ventania Forte', labRisk: 0.12 },
};

export interface LabCatalystDef {
  id: string;
  biomeIndex: number;
  name: string;
  icon: string;
  basePrice: number;
  ecoDamage: number;
}

/** Specific catalyst items required by certain biome Transmodification Labs! */
export const LAB_CATALYSTS: readonly LabCatalystDef[] = [
  {
    id: 'cat_ambar',
    biomeIndex: 1,
    name: 'Pó de Âmbar Solar',
    icon: '🟠',
    basePrice: 35,
    ecoDamage: 6,
  },
  { id: 'cat_mola', biomeIndex: 2, name: 'Óleo Elástico', icon: '🛢️', basePrice: 32, ecoDamage: 9 },
  {
    id: 'cat_seiva',
    biomeIndex: 3,
    name: 'Seiva do Labirinto',
    icon: '🧪',
    basePrice: 38,
    ecoDamage: 5,
  },
  {
    id: 'cat_chip',
    biomeIndex: 4,
    name: 'Chip Criogênico',
    icon: '💾',
    basePrice: 48,
    ecoDamage: 14,
  },
  {
    id: 'cat_plasma',
    biomeIndex: 5,
    name: 'Núcleo de Sucata',
    icon: '🔋',
    basePrice: 36,
    ecoDamage: 16,
  },
  {
    id: 'cat_eter',
    biomeIndex: 6,
    name: 'Essência Celeste',
    icon: '💎',
    basePrice: 60,
    ecoDamage: 10,
  },
];

export const labCatalystForBiome = (biomeIndex: number): LabCatalystDef | undefined =>
  LAB_CATALYSTS.find((c) => c.biomeIndex === biomeIndex);

export type LabOutcomeKind =
  | 'sucesso'
  | 'morte'
  | 'enfraquecido'
  | 'outra_especie'
  | 'mutante'
  | 'estatua'
  | 'doente'
  | 'geleca';

export interface EcoState {
  /** Environmental health per biome (0..100). Drops from shop over-production & destructive attacks! */
  biomeHealth: number[];
  /** Current world weather (affects Lab transmodification safety!). */
  weather: WeatherKind;
  /** Relationship with Lab scientists (-5..+5). Treating them poorly raises accident risk! */
  labRelation: number;
  /** Relationship with Shopkeepers (-5..+5). Horrible relation makes items rare & expensive! */
  shopRelation: number;
  /** How many times each shop item was bought (high demand triggers mass production -> eco damage!). */
  shopDemand: Record<string, number>;
  /** Dynamic stock levels per shop item (increases when shopkeepers ramp up production!). */
  shopStock: Record<string, number>;
  /** Decorative pet statues created by Lab accidents (displayed in your house/shop!). */
  statues: { id: string; name: string; speciesId: string; icon: string }[];
  /** Catalyst items carried for specific biome Labs. */
  catalysts: Record<string, number>;
  /** Biome indexes where NPCs have perished due to severe ecological collapse! */
  deadNpcBiomes: number[];
}

export function createEcoState(): EcoState {
  return {
    biomeHealth: [100, 100, 100, 100, 100, 100, 100],
    weather: 'ameno',
    labRelation: 1,
    shopRelation: 1,
    shopDemand: {},
    shopStock: {},
    statues: [],
    catalysts: {},
    deadNpcBiomes: [],
  };
}

/** Eco-damage score of a battle card (Fire & Toxic attacks are strong but devastate nature!). */
export function cardEcoDamage(cardId: string, element: Element | 'neutro'): number {
  if (cardId === 'nuvem-toxica') return 14;
  if (cardId === 'labareda' || cardId === 'fenix') return 12;
  if (cardId === 'evo_fogo' || cardId === 'brasa') return 6;
  if (cardId === 'relampago' || cardId === 'choque') return 5;
  if (cardId === 'ferroada') return 5;
  if (cardId === 'pedrada' || cardId === 'granizo') return 3;
  if (element === 'fogo' || element === 'venenoso') return 5;
  return 0;
}

/** Applies environmental damage to a biome and returns warning messages at key collapse thresholds. */
export function damageBiomeEcology(eco: EcoState, biomeIndex: number, amount: number): string[] {
  if (amount <= 0) return [];
  const prev = eco.biomeHealth[biomeIndex] ?? 100;
  const next = Math.max(0, Math.round(prev - amount));
  eco.biomeHealth[biomeIndex] = next;
  const msgs: string[] = [];
  if (prev > 15 && next <= 15) {
    if (!eco.deadNpcBiomes.includes(biomeIndex)) eco.deadNpcBiomes.push(biomeIndex);
    msgs.push('💀 Colapso ambiental! Moradores (NPCs) e pets morreram por causa da devastação!');
  } else if (prev > 30 && next <= 30) {
    msgs.push('🥀 Árvores, plantinhas e pets selvagens estão desaparecendo neste bioma!');
  } else if (prev > 60 && next <= 60) {
    msgs.push('🌫️ O bioma está ficando acinzentado pela poluição e produção excessiva!');
  }
  return msgs;
}

/** Shopkeeper price multiplier based on relationship (horrible relation = up to 2.2x more expensive!). */
export function shopRelationPriceFactor(shopRelation: number): number {
  if (shopRelation <= -4) return 2.2;
  if (shopRelation <= -2) return 1.65;
  if (shopRelation < 0) return 1.3;
  if (shopRelation >= 3) return 0.9;
  return 1.0;
}

/** Computes failure probability (0.04..0.88) for a Lab Transmodification based on all risk variables. */
export function computeLabAccidentChance(opts: {
  labRelation: number;
  hunger: number;
  happiness: number;
  beauty: number;
  hpRatio: number;
  weather: WeatherKind;
}): number {
  let risk = 0.05; // base 5% rare quirk even in ideal conditions (mostly succeeds!)
  if (opts.labRelation < 0) risk += Math.min(0.32, Math.abs(opts.labRelation) * 0.09);
  if (opts.hunger < 50) risk += (50 - opts.hunger) * 0.004;
  if (opts.happiness < 45) risk += (45 - opts.happiness) * 0.004;
  if (opts.beauty < 30) risk += 0.1;
  if (opts.hpRatio < 0.65) risk += (0.65 - opts.hpRatio) * 0.35;
  risk += WEATHER_META[opts.weather].labRisk;
  return Math.max(0.04, Math.min(0.88, risk));
}

export const MISHAP_OUTCOMES: readonly Exclude<LabOutcomeKind, 'sucesso'>[] = [
  'enfraquecido',
  'outra_especie',
  'mutante',
  'estatua',
  'doente',
  'geleca',
  'morte',
];
