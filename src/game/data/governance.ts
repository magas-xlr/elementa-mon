import type { Element } from './elements';

export type PoliticalLean = 'esquerda' | 'direita';

export interface PrefeituraProfile {
  biomeIndex: number;
  name: string;
  /** Political orientation of this biome's City Hall (Esquerda vs Direita). */
  politicalLean: PoliticalLean;
  politicalLabel: string;
  /** Share of neighborhood residents leaning Left (0..100); remainder lean Right. */
  leftSharePct: number;
  /** Natural ecological resilience: HP recovered per day when biomeHealth >= 45%. */
  resiliencePerDay: number;
  /** Building permit (Alvará) fee in base Florins. */
  permitFee: number;
  /** Periodic IPTU property tax in base Florins. */
  iptuBase: number;
  /** Cost for the Prefeitura to run an environmental restoration program. */
  ecoRestoreFee: number;
  /** Elements taxed by local neighborhood environmental law in battles! */
  taxedElements: readonly Element[];
  /** Tax amount charged per battle use of a taxed element. */
  elementTaxFee: number;
  lawDescription: string;
  /** Base buyback multiplier if the Prefeitura seizes your house for unpaid IPTU. */
  seizureMultiplier: number;
}

export const PREFEITURAS: readonly PrefeituraProfile[] = [
  {
    biomeIndex: 0,
    name: 'Prefeitura de Vila da Brisa',
    politicalLean: 'esquerda',
    politicalLabel: 'Esquerda Ecológica',
    leftSharePct: 68,
    resiliencePerDay: 4,
    permitFee: 30,
    iptuBase: 18,
    ecoRestoreFee: 45,
    taxedElements: ['fogo'],
    elementTaxFee: 10,
    lawDescription: 'Lei Florestal: taxa de 10 FL ao usar pets ou cartas de Fogo no prado verde.',
    seizureMultiplier: 1.0,
  },
  {
    biomeIndex: 1,
    name: 'Prefeitura das Ruínas de Solis',
    politicalLean: 'direita',
    politicalLabel: 'Direita Tradicional',
    leftSharePct: 32,
    resiliencePerDay: 2,
    permitFee: 40,
    iptuBase: 24,
    ecoRestoreFee: 55,
    taxedElements: ['agua'],
    elementTaxFee: 12,
    lawDescription: 'Lei das Dunas: taxa de 12 DS ao gastar Água em batalhas no deserto.',
    seizureMultiplier: 1.15,
  },
  {
    biomeIndex: 2,
    name: 'Prefeitura do Vale das Molas',
    politicalLean: 'esquerda',
    politicalLabel: 'Esquerda Comunitária',
    leftSharePct: 62,
    resiliencePerDay: 3,
    permitFee: 35,
    iptuBase: 20,
    ecoRestoreFee: 50,
    taxedElements: ['terra'],
    elementTaxFee: 11,
    lawDescription: 'Lei Elástica: taxa de 11 BG ao usar Terra que endurece o solo elástico.',
    seizureMultiplier: 1.05,
  },
  {
    biomeIndex: 3,
    name: 'Prefeitura do Labirinto Verde',
    politicalLean: 'esquerda',
    politicalLabel: 'Esquerda Ambientalista',
    leftSharePct: 74,
    resiliencePerDay: 5,
    permitFee: 45,
    iptuBase: 26,
    ecoRestoreFee: 60,
    taxedElements: ['fogo', 'venenoso'],
    elementTaxFee: 14,
    lawDescription: 'Lei da Mata Densa: taxa de 14 DR ao usar Fogo ou Veneno na floresta.',
    seizureMultiplier: 1.2,
  },
  {
    biomeIndex: 4,
    name: 'Prefeitura Metropolitana Neon',
    politicalLean: 'direita',
    politicalLabel: 'Direita Liberal de Mercado',
    leftSharePct: 28,
    resiliencePerDay: 1,
    permitFee: 60,
    iptuBase: 36,
    ecoRestoreFee: 75,
    taxedElements: ['eletrico'],
    elementTaxFee: 16,
    lawDescription: 'Lei da Rede Elétrica: taxa de 16 NB por sobrecarga Elétrica em batalha.',
    seizureMultiplier: 1.35,
  },
  {
    biomeIndex: 5,
    name: 'Prefeitura do Ferro-Velho',
    politicalLean: 'esquerda',
    politicalLabel: 'Esquerda Sindical',
    leftSharePct: 64,
    resiliencePerDay: 1,
    permitFee: 28,
    iptuBase: 16,
    ecoRestoreFee: 50,
    taxedElements: ['agua'],
    elementTaxFee: 9,
    lawDescription: 'Lei Antiferrugem: taxa de 9 PC ao usar Água sobre as estruturas metálicas.',
    seizureMultiplier: 0.9,
  },
  {
    biomeIndex: 6,
    name: 'Prefeitura Imperial Celeste',
    politicalLean: 'direita',
    politicalLabel: 'Direita Conservadora',
    leftSharePct: 24,
    resiliencePerDay: 2,
    permitFee: 75,
    iptuBase: 45,
    ecoRestoreFee: 90,
    taxedElements: ['fogo'],
    elementTaxFee: 20,
    lawDescription: 'Lei das Geleiras: taxa de 20 CC ao usar Fogo que derrete os picos celestes.',
    seizureMultiplier: 1.5,
  },
];

export const prefeituraForBiome = (biomeIndex: number): PrefeituraProfile =>
  PREFEITURAS[Math.max(0, Math.min(PREFEITURAS.length - 1, biomeIndex))];

export type MaterialSource = 'certificada' | 'clandestina';

export interface MaterialBundle {
  source: MaterialSource;
  name: string;
  seller: string;
  icon: string;
  basePrice: number;
  ecoDamage: number;
  durability: number;
  desc: string;
}

export const MATERIAL_BUNDLES: Record<MaterialSource, MaterialBundle> = {
  certificada: {
    source: 'certificada',
    name: 'Madeira Certificada, Cimento & Tijolos',
    seller: 'Marcenaria Certificada',
    icon: '🪵',
    basePrice: 70,
    ecoDamage: 3,
    durability: 100,
    desc: 'Material legal e resistente: dano ambiental mínimo (−3🌿) e casa super segura!',
  },
  clandestina: {
    source: 'clandestina',
    name: 'Madeira & Tijolos Clandestinos (Beco)',
    seller: 'Lenhador Clandestino do Beco',
    icon: '🪓',
    basePrice: 26,
    ecoDamage: 24,
    durability: 42,
    desc: 'Muito barato, mas devasta o bioma (−24🌿) e a casa tem alto risco de desabar!',
  },
};
