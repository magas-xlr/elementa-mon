import type { Point, WorldMap } from './world';
import { setTile, tileAt } from './world';

/**
 * Biosphere Simulation:
 * - Forest Fragmentation: harvesting wood removes that exact tree from the map; only replanting restores it!
 * - Endemism & Microendemism: biome-exclusive groups of pets, plants, trees & minerals + single-neighborhood exclusives!
 * - Niche Spawning: day-only, night-only, river/sea-only, volcano/desert-only species!
 * - Hydroelectric Dams: NOT clean energy — floods green areas & emits Methane (CH4) greenhouse gas!
 * - 4 Seasons (Primavera, Verão, Outono, Inverno): directly affects pets & plant growth!
 */

export type SeasonId = 'primavera' | 'verao' | 'outono' | 'inverno';

export interface SeasonProfile {
  id: SeasonId;
  name: string;
  icon: string;
  /** Multiplier on home garden plant growth speed. */
  plantGrowthMult: number;
  /** Extra seasonal temperature shift in °C (Verão heats up, Inverno cools down). */
  tempShiftC: number;
  /** Elemental bonus for pets matching this season. */
  favoredElements: readonly string[];
  desc: string;
}

export const SEASONS: Record<SeasonId, SeasonProfile> = {
  primavera: {
    id: 'primavera',
    name: 'Primavera',
    icon: '🌸',
    plantGrowthMult: 1.5,
    tempShiftC: 0,
    favoredElements: ['fada', 'terra'],
    desc: 'Plantas crescem 1.5× mais rápido e pets de Flora/Terra ficam mais felizes!',
  },
  verao: {
    id: 'verao',
    name: 'Verão',
    icon: '☀️',
    plantGrowthMult: 1.0,
    tempShiftC: 1.0,
    favoredElements: ['fogo', 'eletrico'],
    desc: 'Clima mais quente (+1.0°C) fortalece pets de Fogo/Elétrico e agrava o aquecimento global.',
  },
  outono: {
    id: 'outono',
    name: 'Outono',
    icon: '🍂',
    plantGrowthMult: 1.2,
    tempShiftC: -0.2,
    favoredElements: ['terra', 'venenoso'],
    desc: 'Época de colheita farta (+1 alimento bônus na horta) e pets de Terra mais resistentes.',
  },
  inverno: {
    id: 'inverno',
    name: 'Inverno',
    icon: '❄️',
    plantGrowthMult: 0.5,
    tempShiftC: -1.2,
    favoredElements: ['gelo', 'agua'],
    desc: 'Frio intenso desacelera plantas (0.5×) e fortalece pets de Gelo/Água!',
  },
};

const SEASON_ORDER: readonly SeasonId[] = ['primavera', 'verao', 'outono', 'inverno'];

/** Cycles through the 4 seasons every 7 in-game days! */
export function seasonForDay(day: number): SeasonProfile {
  const idx = Math.floor(Math.max(0, day - 1) / 7) % SEASON_ORDER.length;
  return SEASONS[SEASON_ORDER[idx]];
}

export interface BiomeEndemism {
  biomeIndex: number;
  endemicPets: readonly string[];
  endemicPlants: readonly string[];
  endemicTrees: readonly string[];
  endemicMinerals: readonly string[];
  /** Microendemic species found EXCLUSIVELY in this single neighborhood/biome! */
  microendemicPet: string;
  microendemicPlant: string;
}

export const BIOME_ENDEMISM: readonly BiomeEndemism[] = [
  {
    biomeIndex: 0,
    endemicPets: ['pipo', 'casquinho', 'bicudo'],
    endemicPlants: ['Dente-de-Leão Dourado', 'Trevo da Brisa'],
    endemicTrees: ['Carvalho Musgoso', 'Bétula Prateada'],
    endemicMinerals: ['Quartzo Verde'],
    microendemicPet: 'coralinho',
    microendemicPlant: 'Lótus exclusiva do Riacho da Brisa',
  },
  {
    biomeIndex: 1,
    endemicPets: ['pulinho', 'duna'],
    endemicPlants: ['Cacto Solar', 'Flor de Areia'],
    endemicTrees: ['Palmeira de Solis'],
    endemicMinerals: ['Arenito Dourado', 'Ouro Solar'],
    microendemicPet: 'duna',
    microendemicPlant: 'Rosa-do-Deserto de Solis',
  },
  {
    biomeIndex: 2,
    endemicPets: ['felpudo', 'rabisco'],
    endemicPlants: ['Mola-Flor Elástica'],
    endemicTrees: ['Salgueiro Saltitante'],
    endemicMinerals: ['Borrachita Mineral'],
    microendemicPet: 'rabisco',
    microendemicPlant: 'Orquídea Elástica do Vale',
  },
  {
    biomeIndex: 3,
    endemicPets: ['musgoso', 'esporo'],
    endemicPlants: ['Samambaia Luminescente'],
    endemicTrees: ['Jequitibá Ancestral'],
    endemicMinerals: ['Esmeralda da Mata'],
    microendemicPet: 'esporo',
    microendemicPlant: 'Cogumelo-Fada do Labirinto',
  },
  {
    biomeIndex: 4,
    endemicPets: ['vagalume', 'orelhito'],
    endemicPlants: ['Hera Urbana'],
    endemicTrees: ['Bonsai Neon'],
    endemicMinerals: ['Silício Urbano'],
    microendemicPet: 'vagalume',
    microendemicPlant: 'Musgo Neon da Metrópole',
  },
  {
    biomeIndex: 5,
    endemicPets: ['gosminha', 'penugem'],
    endemicPlants: ['Erva-Ferrugem'],
    endemicTrees: ['Árvore Metálica'],
    endemicMinerals: ['Sucata de Titânio'],
    microendemicPet: 'gosminha',
    microendemicPlant: 'Líquen do Ferro-Velho',
  },
  {
    biomeIndex: 6,
    endemicPets: ['floco', 'penugem'],
    endemicPlants: ['Flor de Geada'],
    endemicTrees: ['Pinheiro Glacial'],
    endemicMinerals: ['Safira Celeste'],
    microendemicPet: 'floco',
    microendemicPlant: 'Cristal-Flor dos Picos Celestes',
  },
];

export type HabitatTag = 'qualquer' | 'rio' | 'mar' | 'vulcao' | 'floresta';

export interface SpeciesNiche {
  timeOfDay: 'qualquer' | 'dia' | 'noite';
  habitat: HabitatTag;
  /** If set, this species is microendemic to ONLY this specific biome index! */
  exclusiveBiome?: number;
}

export const SPECIES_NICHE: Record<string, SpeciesNiche> = {
  vagalume: { timeOfDay: 'noite', habitat: 'qualquer' },
  bicudo: { timeOfDay: 'dia', habitat: 'qualquer' },
  coralinho: { timeOfDay: 'qualquer', habitat: 'rio', exclusiveBiome: 0 },
  duna: { timeOfDay: 'dia', habitat: 'vulcao', exclusiveBiome: 1 },
  esporo: { timeOfDay: 'noite', habitat: 'floresta', exclusiveBiome: 3 },
  floco: { timeOfDay: 'qualquer', habitat: 'qualquer', exclusiveBiome: 6 },
};

/** Checks if a species can appear given current biome, day/night, and local habitat! */
export function canSpeciesAppear(
  speciesId: string,
  biomeIndex: number,
  isNightNow: boolean,
  habitat: HabitatTag
): boolean {
  const niche = SPECIES_NICHE[speciesId];
  if (!niche) return true;
  if (niche.exclusiveBiome !== undefined && niche.exclusiveBiome !== biomeIndex) return false;
  if (niche.timeOfDay === 'dia' && isNightNow) return false;
  if (niche.timeOfDay === 'noite' && !isNightNow) return false;
  if (niche.habitat !== 'qualquer' && niche.habitat !== habitat) return false;
  return true;
}

export interface BiosphereState {
  /** Coordinates of chopped trees (forest fragmentation — only returns if player replants!). */
  choppedTrees: Point[];
  /** Wood collected from chopping trees. */
  woodLogs: number;
  /** Tree saplings carried for replanting fragmented forests. */
  treeSaplings: number;
  /** Biomes where a Hydroelectric Dam was built (floods green areas & emits Methane!). */
  hydroDamsBuilt: number[];
}

export function createBiosphereState(): BiosphereState {
  return {
    choppedTrees: [],
    woodLogs: 0,
    treeSaplings: 2,
    hydroDamsBuilt: [],
  };
}

/**
 * Harvests wood from a specific tree tile on the map:
 * - Permanently removes that tree (Forest Fragmentation!).
 * - Tree NEVER regrows unless the player replants a sapling!
 */
export function chopTreeOnMap(
  state: BiosphereState,
  map: WorldMap,
  x: number,
  y: number
): { ok: boolean; msg: string } {
  if (tileAt(map, x, y) !== 'arvore') {
    return { ok: false, msg: 'Não há árvore neste local para coletar madeira.' };
  }
  setTile(map, x, y, 'grama');
  state.choppedTrees.push({ x, y });
  state.woodLogs += 1;
  return {
    ok: true,
    msg: `🪓 Coletou 1 Madeira! A árvore sumiu (Fragmentação Florestal · ${state.choppedTrees.length} área(s) desmatada(s)) — só volta se você replantar!`,
  };
}

/** Replants a tree sapling on a previously fragmented/grass tile, reversing forest fragmentation! */
export function replantTreeOnMap(
  state: BiosphereState,
  map: WorldMap,
  x: number,
  y: number
): { ok: boolean; msg: string } {
  if (state.treeSaplings <= 0) {
    return { ok: false, msg: 'Você precisa de mudas de árvore para reflorestar!' };
  }
  if (tileAt(map, x, y) !== 'grama') {
    return { ok: false, msg: 'Só é possível replantar árvores em solo livre de grama.' };
  }
  state.treeSaplings -= 1;
  setTile(map, x, y, 'arvore');
  const idx = state.choppedTrees.findIndex((p) => p.x === x && p.y === y);
  if (idx >= 0) state.choppedTrees.splice(idx, 1);
  return {
    ok: true,
    msg: '🌳 Nova árvore plantada! Você combateu a fragmentação florestal (+5🌿)!',
  };
}

export const HYDRO_DAM_COST = 90;

/**
 * Builds a Hydroelectric Dam in a biome:
 * - NOT clean energy! Floods nearby green meadow tiles into water reservoir,
 * - Damages local biome ecology (-18) AND releases potent Methane (CH4) greenhouse gas!
 */
export function buildHydroelectricDam(
  state: BiosphereState,
  map: WorldMap,
  biomeIndex: number,
  wallet: number
): {
  ok: boolean;
  cost: number;
  floodedTiles: number;
  methaneEmitted: number;
  ecoDamage: number;
  msg: string;
} {
  if (state.hydroDamsBuilt.includes(biomeIndex)) {
    return {
      ok: false,
      cost: 0,
      floodedTiles: 0,
      methaneEmitted: 0,
      ecoDamage: 0,
      msg: 'Já existe uma Hidrelétrica neste bioma.',
    };
  }
  if (wallet < HYDRO_DAM_COST) {
    return {
      ok: false,
      cost: 0,
      floodedTiles: 0,
      methaneEmitted: 0,
      ecoDamage: 0,
      msg: `Saldo insuficiente (${HYDRO_DAM_COST}) para construir Hidrelétrica.`,
    };
  }
  state.hydroDamsBuilt.push(biomeIndex);
  // Flood up to 6 green meadow tiles in this biome into reservoir water!
  let floodedTiles = 0;
  for (let i = 0; i < map.tiles.length && floodedTiles < 6; i++) {
    if (map.biomes[i] === biomeIndex && map.tiles[i] === 'grama') {
      const x = i % map.width;
      const y = Math.floor(i / map.width);
      if (Math.abs(x - map.start.x) + Math.abs(y - map.start.y) > 4) {
        map.tiles[i] = 'agua';
        floodedTiles += 1;
      }
    }
  }
  return {
    ok: true,
    cost: HYDRO_DAM_COST,
    floodedTiles,
    methaneEmitted: 16,
    ecoDamage: 18,
    msg: `🌊⚡ Hidrelétrica construída! NÃO é energia limpa: inundou ${floodedTiles} áreas verdes (−18🌿) e liberou Metano (CH₄), agravando o efeito estufa!`,
  };
}
