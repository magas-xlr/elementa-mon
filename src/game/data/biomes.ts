import { t, type UiKey } from '../../i18n';
import type { Element } from './elements';

/**
 * The seven regions of the open world. Each one is an original theme (no names, art or layouts
 * from other games): its own palette, ground, props, music variation, wild pets and crystals.
 * `tier` 0–6 drives enemy strength, so the world can be explored in any order but the far
 * regions hit harder.
 */
export type BiomeId =
  'prado' | 'ruinas' | 'molas' | 'labirinto' | 'cidade' | 'sucata' | 'fortaleza';

/** Ground look: soft grass, mowed striped lawn, or paved stone/metal tiles. */
export type GroundStyle = 'grama' | 'gramado' | 'pedra';

export interface Biome {
  id: BiomeId;
  tier: number;
  palette: {
    sky: number;
    ground: number;
    path: number;
    /** Liquid that blocks the way: water, lava, toxic sludge, open sky... */
    liquid: number;
    /** Hemisphere light tint (sky side). */
    light: number;
    /** Small decorations scattered on the ground. */
    deco: number[];
  };
  ground: GroundStyle;
  /** Wild species (all neutral base species) met in this biome's encounter patches. */
  wild: string[];
  /** Elements the wild pets may carry and the element crystals found here. */
  elements: Element[];
  /** Chance that a wild pet here is still neutral. */
  neutralChance: number;
  /** World music variation (see music.ts). */
  track: 'mundo' | 'mundo2' | 'mundo3' | 'mundo4' | 'mundo5' | 'mundo6' | 'mundo7';
  /** How densely the generator fills the region. */
  density: { patches: number; blockers: number; liquid: number };
}

export const BIOMES: readonly Biome[] = [
  {
    id: 'prado',
    tier: 0,
    // Sunny BotW-style verdant valley: azure sky, lush painterly grass, warm dirt trails.
    palette: {
      sky: 0x5ab8ff,
      ground: 0x58bd4a,
      path: 0xe3ca94,
      liquid: 0x38a2eb,
      light: 0xf4fbff,
      deco: [0xffffff, 0xffd84a, 0xff7fb4, 0xb896ff],
    },
    ground: 'grama',
    wild: ['pipo', 'casquinho', 'bicudo', 'orelhito'],
    elements: ['terra', 'fada'],
    neutralChance: 0.65,
    track: 'mundo',
    density: { patches: 8, blockers: 6, liquid: 2 },
  },
  {
    id: 'ruinas',
    tier: 1,
    palette: {
      sky: 0xffc99a,
      ground: 0xe6d8c3,
      path: 0xc7a98a,
      liquid: 0xff6a1f,
      light: 0xfff0dc,
      deco: [0xff9a3c, 0xffd23f, 0xc9b9a6],
    },
    ground: 'pedra',
    wild: ['casquinho', 'rabisco', 'pulinho'],
    elements: ['fogo', 'terra'],
    neutralChance: 0.35,
    track: 'mundo2',
    density: { patches: 8, blockers: 7, liquid: 4 },
  },
  {
    id: 'molas',
    tier: 2,
    palette: {
      sky: 0xffd6f0,
      ground: 0x8fd49a,
      path: 0xf2e2a8,
      liquid: 0x5fc8e8,
      light: 0xfff0fa,
      deco: [0xff5fa8, 0xffe066, 0x5fc8e8, 0xffffff],
    },
    ground: 'grama',
    wild: ['pulinho', 'pipo', 'orelhito'],
    elements: ['eletrico', 'psiquico'],
    neutralChance: 0.3,
    track: 'mundo3',
    density: { patches: 8, blockers: 8, liquid: 1 },
  },
  {
    id: 'labirinto',
    tier: 3,
    palette: {
      sky: 0x86c9c4,
      ground: 0x6f9a86,
      path: 0xa8b89a,
      liquid: 0x2a8fa8,
      light: 0xdaf6f2,
      deco: [0x9fe8d8, 0x4fa88a, 0xe0f4ff],
    },
    ground: 'pedra',
    wild: ['gosminha', 'rabisco', 'bicudo'],
    elements: ['agua', 'gelo'],
    neutralChance: 0.25,
    track: 'mundo4',
    density: { patches: 8, blockers: 10, liquid: 6 },
  },
  {
    id: 'cidade',
    tier: 4,
    palette: {
      sky: 0x34346e,
      ground: 0x545a80,
      path: 0x8a8fb8,
      liquid: 0x7a5aff,
      light: 0xb8b8ff,
      deco: [0xfff27a, 0x7af2ff, 0xff7ae0],
    },
    ground: 'pedra',
    wild: ['orelhito', 'felpudo', 'penugem'],
    elements: ['fantasma', 'psiquico'],
    neutralChance: 0.2,
    track: 'mundo5',
    density: { patches: 8, blockers: 9, liquid: 2 },
  },
  {
    id: 'sucata',
    tier: 5,
    palette: {
      sky: 0xc4b294,
      ground: 0x8a6a4a,
      path: 0x9a9a8a,
      liquid: 0x7ad151,
      light: 0xf0e4c8,
      deco: [0xb87333, 0x8a8a8a, 0xf2c62f],
    },
    ground: 'pedra',
    wild: ['gosminha', 'felpudo', 'casquinho'],
    elements: ['venenoso', 'eletrico'],
    neutralChance: 0.15,
    track: 'mundo6',
    density: { patches: 8, blockers: 9, liquid: 3 },
  },
  {
    id: 'fortaleza',
    tier: 6,
    palette: {
      sky: 0xcfe4ff,
      ground: 0xb8c4d8,
      path: 0xe8ecf4,
      liquid: 0xf4f8ff,
      light: 0xffffff,
      deco: [0x9ab8e8, 0xffffff, 0xf2c62f],
    },
    ground: 'pedra',
    wild: ['penugem', 'bicudo', 'felpudo', 'pulinho'],
    elements: [
      'fogo',
      'agua',
      'eletrico',
      'terra',
      'gelo',
      'venenoso',
      'psiquico',
      'fantasma',
      'fada',
    ],
    neutralChance: 0.1,
    track: 'mundo7',
    density: { patches: 7, blockers: 7, liquid: 5 },
  },
];

const NAME_KEYS: Record<BiomeId, UiKey> = {
  prado: 'biomePrado',
  ruinas: 'biomeRuinas',
  molas: 'biomeMolas',
  labirinto: 'biomeLabirinto',
  cidade: 'biomeCidade',
  sucata: 'biomeSucata',
  fortaleza: 'biomeFortaleza',
};

export const biomeName = (b: Biome | number): string =>
  t(NAME_KEYS[(typeof b === 'number' ? BIOMES[b] : b).id]);
