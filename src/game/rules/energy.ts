import type { PetInstance } from './progression';
import type { WorldMap } from './world';

/**
 * Neighborhood Energy Grid & Nuclear Radiation System:
 * - 8 energy generation sources across neighborhoods:
 *   hidroeletrica, termoeletrica, solar, fotovoltaica, eolica, nuclear, hidrogenio, biocombustivel.
 * - ALL energy sources harm the environment to some degree (some far more, some far less).
 * - Spending prolonged time near a Nuclear power plant mutates party pets into the
 *   Radioactive (`radioativo`) type!
 */

export type EnergySourceId =
  | 'hidroeletrica'
  | 'termoeletrica'
  | 'solar'
  | 'fotovoltaica'
  | 'eolica'
  | 'nuclear'
  | 'hidrogenio'
  | 'biocombustivel';

export type ImpactLevel = 'baixo' | 'medio' | 'alto' | 'muito_alto';

export interface EnergySourceDef {
  id: EnergySourceId;
  name: string;
  icon: string;
  cost: number;
  /** Immediate environmental impact when installed (ALWAYS > 0 — no energy is 100% impact-free!). */
  ecoDamage: number;
  /** CO2 emitted to atmosphere. */
  co2Emitted: number;
  /** Methane (CH4) emitted to atmosphere (2.5x greenhouse multiplier). */
  methaneEmitted: number;
  /** Radiation emitted per hour near the plant (only Nuclear > 0). */
  radiationPerHour: number;
  impactLevel: ImpactLevel;
  desc: string;
}

export const ENERGY_SOURCES: Record<EnergySourceId, EnergySourceDef> = {
  eolica: {
    id: 'eolica',
    name: 'Energia Eólica',
    icon: '🌬️',
    cost: 75,
    ecoDamage: 4,
    co2Emitted: 1,
    methaneEmitted: 0,
    radiationPerHour: 0,
    impactLevel: 'baixo',
    desc: 'Agride bem menos, mas ainda gera ruído, fragmenta habitat e afeta aves migratórias.',
  },
  solar: {
    id: 'solar',
    name: 'Placas Solares',
    icon: '☀️',
    cost: 80,
    ecoDamage: 5,
    co2Emitted: 2,
    methaneEmitted: 0,
    radiationPerHour: 0,
    impactLevel: 'baixo',
    desc: 'Baixa emissão, mas exige mineração para painéis e gera resíduo eletrônico no descarte.',
  },
  fotovoltaica: {
    id: 'fotovoltaica',
    name: 'Usina Fotovoltaica',
    icon: '🔋',
    cost: 85,
    ecoDamage: 6,
    co2Emitted: 2,
    methaneEmitted: 0,
    radiationPerHour: 0,
    impactLevel: 'baixo',
    desc: 'Grandes fazendas de painéis ocupam solo natural e usam silício e metais pesados.',
  },
  hidrogenio: {
    id: 'hidrogenio',
    name: 'Usina de Hidrogênio',
    icon: '💧',
    cost: 95,
    ecoDamage: 7,
    co2Emitted: 3,
    methaneEmitted: 0,
    radiationPerHour: 0,
    impactLevel: 'baixo',
    desc: 'Quase zero fumaça local, porém consome muita água doce e energia na eletrólise.',
  },
  biocombustivel: {
    id: 'biocombustivel',
    name: 'Usina de Biocombustíveis',
    icon: '🌾',
    cost: 70,
    ecoDamage: 11,
    co2Emitted: 9,
    methaneEmitted: 3,
    radiationPerHour: 0,
    impactLevel: 'medio',
    desc: 'Exige grandes monoculturas que substituem mata nativa e ainda libera CO₂ e CH₄.',
  },
  hidroeletrica: {
    id: 'hidroeletrica',
    name: 'Usina Hidrelétrica',
    icon: '🌊',
    cost: 90,
    ecoDamage: 18,
    co2Emitted: 2,
    methaneEmitted: 16,
    radiationPerHour: 0,
    impactLevel: 'alto',
    desc: 'Inunda áreas verdes inteiras e libera muito Metano (CH₄), agravando o efeito estufa.',
  },
  nuclear: {
    id: 'nuclear',
    name: 'Usina Nuclear',
    icon: '☢️',
    cost: 120,
    ecoDamage: 16,
    co2Emitted: 1,
    methaneEmitted: 0,
    radiationPerHour: 20,
    impactLevel: 'alto',
    desc: 'Gera lixo radioativo perigoso! Pets que ficam muito tempo perto viram tipo Radioativo.',
  },
  termoeletrica: {
    id: 'termoeletrica',
    name: 'Usina Termoelétrica',
    icon: '🏭',
    cost: 60,
    ecoDamage: 24,
    co2Emitted: 28,
    methaneEmitted: 4,
    radiationPerHour: 0,
    impactLevel: 'muito_alto',
    desc: 'Barata de erguer, mas queima combustíveis fósseis e devasta o clima com CO₂ pesado.',
  },
};

export const ENERGY_SOURCE_LIST: readonly EnergySourceDef[] = Object.values(ENERGY_SOURCES);

/** Default neighborhood power grid across the 7 biomes so each district uses a distinct source! */
export const DEFAULT_BIOME_ENERGY: Record<number, EnergySourceId> = {
  0: 'solar',
  1: 'fotovoltaica',
  2: 'eolica',
  3: 'biocombustivel',
  4: 'termoeletrica',
  5: 'nuclear',
  6: 'hidrogenio',
};

export interface EnergyGridState {
  biomePlants: Record<number, EnergySourceId>;
}

export function createEnergyGridState(): EnergyGridState {
  return {
    biomePlants: { ...DEFAULT_BIOME_ENERGY },
  };
}

export function energySourceForBiome(state: EnergyGridState, biomeIndex: number): EnergySourceDef {
  const id = state.biomePlants[biomeIndex] ?? 'solar';
  return ENERGY_SOURCES[id];
}

export function installBiomeEnergyPlant(
  state: EnergyGridState,
  biomeIndex: number,
  sourceId: EnergySourceId,
  wallet: number,
  map?: WorldMap
): {
  ok: boolean;
  cost: number;
  ecoDamage: number;
  co2Emitted: number;
  methaneEmitted: number;
  floodedTiles: number;
  msg: string;
} {
  const def = ENERGY_SOURCES[sourceId];
  if (state.biomePlants[biomeIndex] === sourceId) {
    return {
      ok: false,
      cost: 0,
      ecoDamage: 0,
      co2Emitted: 0,
      methaneEmitted: 0,
      floodedTiles: 0,
      msg: `Este bairro já opera com ${def.icon} ${def.name}.`,
    };
  }
  if (wallet < def.cost) {
    return {
      ok: false,
      cost: 0,
      ecoDamage: 0,
      co2Emitted: 0,
      methaneEmitted: 0,
      floodedTiles: 0,
      msg: `Saldo insuficiente (${def.cost}) para instalar ${def.name}.`,
    };
  }
  state.biomePlants[biomeIndex] = sourceId;
  let floodedTiles = 0;
  if (sourceId === 'hidroeletrica' && map) {
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
  }
  const extra =
    sourceId === 'hidroeletrica'
      ? ` Inundou ${floodedTiles} áreas verdes e liberou +${def.methaneEmitted} CH₄!`
      : sourceId === 'nuclear'
        ? ' ⚠️ Cuidado: pets que ficarem muito tempo perto desta usina podem virar Radioativos!'
        : '';
  return {
    ok: true,
    cost: def.cost,
    ecoDamage: def.ecoDamage,
    co2Emitted: def.co2Emitted,
    methaneEmitted: def.methaneEmitted,
    floodedTiles,
    msg: `${def.icon} ${def.name} instalada no bairro! Impacto ambiental: −${def.ecoDamage}🌿 · +${def.co2Emitted} CO₂.${extra}`,
  };
}

export const RADIATION_MUTATION_THRESHOLD = 100;

/**
 * Pets spending prolonged time in a neighborhood powered by a Nuclear plant accumulate
 * radiation exposure. Once exposure reaches 100, the pet mutates permanently into `radioativo`!
 */
export function exposePetsToNuclearRadiation(
  party: PetInstance[],
  hours: number,
  isNuclearBiome: boolean
): string[] {
  if (!isNuclearBiome || hours <= 0) return [];
  const alerts: string[] = [];
  const gain = Math.round(hours * ENERGY_SOURCES.nuclear.radiationPerHour);
  for (const pet of party) {
    if (pet.hp <= 0 || pet.element === 'radioativo') continue;
    pet.nuclearExposure = (pet.nuclearExposure ?? 0) + gain;
    if (pet.nuclearExposure >= RADIATION_MUTATION_THRESHOLD) {
      pet.element = 'radioativo';
      alerts.push(
        `☢️ RADIAÇÃO! Um pet ficou tempo demais perto da Usina Nuclear e virou tipo RADIOATIVO! (Hit-kill, mas drena 50% do HP de todos e 2 ataques nucleares matam a própria party!)`
      );
    }
  }
  return alerts;
}
