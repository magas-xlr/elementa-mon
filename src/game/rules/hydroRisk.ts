import type { PetInstance } from './progression';
import { next, type RngState } from './rng';
import type { WorldMap } from './world';
import type { EnergyGridState } from './energy';

/**
 * Hydro-Climate Risk & Dam Safety System:
 * - Living near dams is much cheaper, but a dam failure floods the area and can permanently
 *   kill NPCs or leave them homeless!
 * - Prolonged Drought ("Estiagem") & Prolonged Heavy Rain ("Chuva Intensa"):
 *   - Heavy rain floods streets, proliferates diseases, ruins water storage & agriculture,
 *     and increases dam rupture risk.
 *   - Drought causes inadequate water storage, disease proliferation, ruins agriculture,
 *     and forces activating more expensive power sources like Termoelétrica!
 */

export type HydroWeatherRegime = 'normal' | 'estiagem' | 'chuva_intensa';

export const ANTHROPOCENE_MANIFESTO =
  'Elementa-Mon é filosoficamente baseado no Antropoceno — a era geológica em que consumo, energia, saneamento desigual e descuido humano/governamental remodelam permanentemente o planeta, o clima e todas as formas de vida.';

/** Per-neighborhood Basic Sanitation quality (0..100%): some districts have great sanitation, others critical! */
export const DEFAULT_BIOME_SANITATION: Record<number, number> = {
  0: 72, // Vila da Brisa — Regular/Bom
  1: 42, // Dunas de Solis — Precário
  2: 84, // Vale Elástico — Ótimo
  3: 58, // Floresta do Labirinto — Parcial
  4: 92, // Metrópole Neon — Avançado
  5: 22, // Ferro-Velho / Usina Nuclear — Crítico!
  6: 88, // Picos Celestes — Excelente
};

export function sanitationQualityLabel(score: number): string {
  if (score >= 80) return 'Ótimo';
  if (score >= 60) return 'Bom';
  if (score >= 40) return 'Precário';
  return 'Crítico (Esgoto a céu aberto!)';
}

export interface AnthropoceneReport {
  score: number;
  era: string;
  reflection: string;
}

/** Computes the philosophical Anthropocene Index (0..100) from the player's & world's ecological footprint! */
export function computeAnthropoceneIndex(params: {
  co2Atmosphere: number;
  methaneAtmosphere: number;
  choppedTreesCount: number;
  mudBiomesCount: number;
  avgSanitation: number;
  groundLitterCount: number;
}): AnthropoceneReport {
  const raw =
    params.co2Atmosphere * 0.4 +
    params.methaneAtmosphere * 0.9 +
    params.choppedTreesCount * 3 +
    params.mudBiomesCount * 22 +
    Math.max(0, 80 - params.avgSanitation) * 0.35 +
    params.groundLitterCount * 2;
  const score = Math.max(0, Math.min(100, Math.round(raw)));
  if (score < 25) {
    return {
      score,
      era: '🌿 Equilíbrio Holoceno',
      reflection: 'A presença humana ainda coexiste com os ciclos naturais do planeta.',
    };
  }
  if (score < 50) {
    return {
      score,
      era: '👣 Pegada Humana Crescente',
      reflection:
        'Consumo, obras e desigualdade de saneamento já deixam marcas visíveis no solo e no clima.',
    };
  }
  if (score < 75) {
    return {
      score,
      era: '🏭 Era do Antropoceno',
      reflection:
        'A atividade humana tornou-se a principal força geológica — cada escolha altera biomas inteiros.',
    };
  }
  return {
    score,
    era: '🌋 Colapso Geológico Antropocênico',
    reflection:
      'Lama, estufa, extinções e negligência governamental redesenharam irreversivelmente a Terra.',
  };
}

export interface HydroClimateState {
  regime: HydroWeatherRegime;
  regimeDays: number;
  /** Streets flooded by prolonged heavy rain or dam failure. */
  floodedStreets: number;
  /** Water storage condition ('inadequado' during drought rationing or flood contamination). */
  waterStorageStatus: 'adequado' | 'inadequado';
  /** Disease proliferation risk (0..100%). */
  diseaseRisk: number;
  /** Agricultural production multiplier (1.0 normal, 0.3 drought, 0.4 heavy rain/flood). */
  agricultureMultiplier: number;
  /** True when drought forces switching to expensive Termoelétrica emergency generation! */
  thermalFallbackActive: boolean;
  /** Multiplier on energy bills (1.8x when Termoelétrica fallback is active!). */
  energyTariffMultiplier: number;
  /** Structural pressure on local dam (0..100; >=80 risks catastrophic rupture!). */
  damRiskLevel: number;
  damBroken: boolean;
  /** Government neglect of dam safety (0..100; >=80 can trigger a dam explosion turning the whole biome into mud!). */
  governmentNeglect: number;
  /** Biomes completely transformed into a mud environment by a government-neglect dam explosion! */
  mudBiomes: number[];
  /** Basic sanitation quality (0..100%) per neighborhood/biome. */
  biomeSanitation: Record<number, number>;
  /** NPCs permanently killed by a dam failure (gone forever!). */
  deadNpcIds: string[];
  /** NPCs left homeless by a dam failure. */
  homelessNpcIds: string[];
}

export function createHydroClimateState(): HydroClimateState {
  return {
    regime: 'normal',
    regimeDays: 0,
    floodedStreets: 0,
    waterStorageStatus: 'adequado',
    diseaseRisk: 5,
    agricultureMultiplier: 1.0,
    thermalFallbackActive: false,
    energyTariffMultiplier: 1.0,
    damRiskLevel: 10,
    damBroken: false,
    governmentNeglect: 15,
    mudBiomes: [],
    biomeSanitation: { ...DEFAULT_BIOME_SANITATION },
    deadNpcIds: [],
    homelessNpcIds: [],
  };
}

export const SANITATION_UPGRADE_COST = 55;

/** Invests in basic sanitation works for a neighborhood (+20% quality, lowers disease risk). */
export function improveBiomeSanitation(
  state: HydroClimateState,
  biomeIndex: number,
  wallet: number
): { ok: boolean; cost: number; msg: string } {
  const cur = state.biomeSanitation[biomeIndex] ?? 50;
  if (cur >= 100) {
    return { ok: false, cost: 0, msg: 'O saneamento básico deste bairro já está em 100%!' };
  }
  if (wallet < SANITATION_UPGRADE_COST) {
    return {
      ok: false,
      cost: 0,
      msg: `Saldo insuficiente (${SANITATION_UPGRADE_COST}) para obras de saneamento básico.`,
    };
  }
  const nextScore = Math.min(100, cur + 20);
  state.biomeSanitation[biomeIndex] = nextScore;
  state.diseaseRisk = Math.max(5, state.diseaseRisk - 15);
  return {
    ok: true,
    cost: SANITATION_UPGRADE_COST,
    msg: `🚰 Obras de Saneamento Básico concluídas! Qualidade do bairro subiu para ${nextScore}% (${sanitationQualityLabel(nextScore)}) e risco de doenças caiu!`,
  };
}

/**
 * Catastrophic Dam Explosion caused by Government Neglect:
 * - Transforms the ENTIRE biome's walkable terrain ('grama', 'matoAlto', 'caminho') into 'lama' (mud)!
 * - Devastates local sanitation, spikes disease risk, ruins agriculture, and harms local NPCs!
 */
export function triggerGovernmentDamExplosion(
  state: HydroClimateState,
  map: WorldMap,
  biomeIndex: number,
  npcIds: readonly string[],
  rng: RngState
): { mudTiles: number; killedNpcs: string[]; homelessNpcs: string[]; msg: string } {
  state.damBroken = true;
  state.governmentNeglect = 100;
  if (!state.mudBiomes.includes(biomeIndex)) state.mudBiomes.push(biomeIndex);
  state.biomeSanitation[biomeIndex] = Math.max(5, (state.biomeSanitation[biomeIndex] ?? 50) - 45);
  state.waterStorageStatus = 'inadequado';
  state.diseaseRisk = Math.min(100, state.diseaseRisk + 50);
  state.agricultureMultiplier = 0.1;

  let mudTiles = 0;
  for (let i = 0; i < map.tiles.length; i++) {
    if (
      map.biomes[i] === biomeIndex &&
      (map.tiles[i] === 'grama' || map.tiles[i] === 'matoAlto' || map.tiles[i] === 'caminho')
    ) {
      map.tiles[i] = 'lama';
      mudTiles += 1;
    }
  }

  const killedNpcs: string[] = [];
  const homelessNpcs: string[] = [];
  for (const id of npcIds) {
    if (state.deadNpcIds.includes(id)) continue;
    if (next(rng) < 0.5) {
      state.deadNpcIds.push(id);
      killedNpcs.push(id);
    } else {
      if (!state.homelessNpcIds.includes(id)) state.homelessNpcIds.push(id);
      homelessNpcs.push(id);
    }
  }

  return {
    mudTiles,
    killedNpcs,
    homelessNpcs,
    msg: `💥🟤 EXPLOSÃO DE BARRAGEM POR DESCUIDO DO GOVERNO! O bairro inteiro virou um mar de LAMA (${mudTiles} áreas soterradas)! Saneamento caiu para ${state.biomeSanitation[biomeIndex]}%!`,
  };
}

/**
 * Triggers a catastrophic Dam Rupture:
 * - Floods roads/meadows on the map into water tiles.
 * - Permanently kills some NPCs (`deadNpcIds`) and leaves others homeless (`homelessNpcIds`)!
 */
export function triggerDamBreak(
  state: HydroClimateState,
  map: WorldMap,
  biomeIndex: number,
  npcIds: readonly string[],
  rng: RngState
): { floodedTiles: number; killedNpcs: string[]; homelessNpcs: string[]; msg: string } {
  state.damBroken = true;
  state.damRiskLevel = 100;
  state.waterStorageStatus = 'inadequado';
  state.diseaseRisk = Math.min(100, state.diseaseRisk + 45);
  state.agricultureMultiplier = 0.25;

  let floodedTiles = 0;
  for (let i = 0; i < map.tiles.length && floodedTiles < 10; i++) {
    if (map.biomes[i] === biomeIndex && (map.tiles[i] === 'caminho' || map.tiles[i] === 'grama')) {
      const x = i % map.width;
      const y = Math.floor(i / map.width);
      if (Math.abs(x - map.start.x) + Math.abs(y - map.start.y) > 3) {
        map.tiles[i] = 'agua';
        floodedTiles += 1;
      }
    }
  }
  state.floodedStreets += floodedTiles;

  const killedNpcs: string[] = [];
  const homelessNpcs: string[] = [];
  for (const id of npcIds) {
    if (state.deadNpcIds.includes(id)) continue;
    const r = next(rng);
    if (r < 0.45) {
      state.deadNpcIds.push(id);
      killedNpcs.push(id);
    } else {
      if (!state.homelessNpcIds.includes(id)) state.homelessNpcIds.push(id);
      homelessNpcs.push(id);
    }
  }
  // Guarantee at least one visible NPC tragedy when NPCs exist in the dam zone
  if (npcIds.length > 0 && killedNpcs.length === 0 && homelessNpcs.length === 0) {
    const first = npcIds[0];
    state.homelessNpcIds.push(first);
    homelessNpcs.push(first);
  }

  return {
    floodedTiles,
    killedNpcs,
    homelessNpcs,
    msg: `🌊🚨 ROMPIMENTO DA BARRAGEM! Inundou ${floodedTiles} áreas! NPCs mortos para sempre: ${killedNpcs.length} · NPCs sem casa: ${homelessNpcs.length}!`,
  };
}

/**
 * Applies the daily consequences of the active Hydro-Climate regime:
 * - `estiagem`: inadequate water storage, disease proliferation, agriculture drops to 30%,
 *   and forces expensive Termoelétrica emergency power (1.8x tariff + CO2)!
 * - `chuva_intensa`: floods streets, inadequate water storage, disease proliferation (can sicken pets!),
 *   agriculture drops to 40%, and increases dam rupture risk!
 */
export function applyHydroRegimeEffects(
  state: HydroClimateState,
  rng: RngState,
  daysPassed: number,
  map: WorldMap,
  biomeIndex: number,
  npcIds: readonly string[],
  party: PetInstance[],
  energyGrid?: EnergyGridState
): { alerts: string[]; extraCo2: number; extraEcoDamage: number } {
  const alerts: string[] = [];
  let extraCo2 = 0;
  let extraEcoDamage = 0;
  if (daysPassed <= 0) return { alerts, extraCo2, extraEcoDamage };

  state.regimeDays += daysPassed;
  // Poor local sanitation increases disease proliferation every day!
  const localSan = state.biomeSanitation[biomeIndex] ?? 50;
  if (localSan < 50) {
    state.diseaseRisk = Math.min(100, state.diseaseRisk + 12 * daysPassed);
  }
  // Government neglect of dam maintenance builds up over time and can trigger a mud explosion!
  state.governmentNeglect = Math.min(100, state.governmentNeglect + 10 * daysPassed);
  if (!state.mudBiomes.includes(biomeIndex) && state.governmentNeglect >= 85 && next(rng) < 0.35) {
    const exp = triggerGovernmentDamExplosion(state, map, biomeIndex, npcIds, rng);
    alerts.push(exp.msg);
  }

  if (state.regime === 'estiagem') {
    state.waterStorageStatus = 'inadequado';
    state.agricultureMultiplier = 0.3;
    state.diseaseRisk = Math.min(100, state.diseaseRisk + 20 * daysPassed);
    state.thermalFallbackActive = true;
    state.energyTariffMultiplier = 1.8;
    extraCo2 += 12 * daysPassed;
    extraEcoDamage += 6 * daysPassed;
    if (energyGrid) energyGrid.biomePlants[biomeIndex] = 'termoeletrica';
    alerts.push(
      `🏜️ ESTIAGEM (${state.regimeDays} dia(s) sem chuva): armazenamento de água inadequado, produção agrícola em 30%, risco de doenças (${state.diseaseRisk}%) e Termoelétrica mais cara acionada (tarifa 1.8×)!`
    );
  } else if (state.regime === 'chuva_intensa') {
    state.waterStorageStatus = 'inadequado';
    state.agricultureMultiplier = 0.4;
    state.diseaseRisk = Math.min(100, state.diseaseRisk + 28 * daysPassed);
    state.thermalFallbackActive = false;
    state.energyTariffMultiplier = 1.0;
    state.damRiskLevel = Math.min(100, state.damRiskLevel + 25 * daysPassed);

    // Flood up to 2 street ('caminho') tiles per heavy-rain day!
    let newlyFlooded = 0;
    for (let i = 0; i < map.tiles.length && newlyFlooded < 2 * daysPassed; i++) {
      if (map.biomes[i] === biomeIndex && map.tiles[i] === 'caminho') {
        const x = i % map.width;
        const y = Math.floor(i / map.width);
        if (Math.abs(x - map.start.x) + Math.abs(y - map.start.y) > 4) {
          map.tiles[i] = 'agua';
          newlyFlooded += 1;
        }
      }
    }
    state.floodedStreets += Math.max(1, newlyFlooded);
    alerts.push(
      `🌧️ CHUVA INTENSA (${state.regimeDays} dia(s)): ruas alagadas (${state.floodedStreets}), água contaminada/armazenamento inadequado, produção agrícola em 40% e proliferação de doenças (${state.diseaseRisk}%)!`
    );

    // Dam rupture check if pressure gets critical!
    if (!state.damBroken && state.damRiskLevel >= 80) {
      const br = triggerDamBreak(state, map, biomeIndex, npcIds, rng);
      alerts.push(br.msg);
    }
  } else {
    state.waterStorageStatus = 'adequado';
    state.agricultureMultiplier = 1.0;
    state.diseaseRisk = Math.max(5, state.diseaseRisk - 10 * daysPassed);
    state.thermalFallbackActive = false;
    state.energyTariffMultiplier = 1.0;
    state.damRiskLevel = Math.max(10, state.damRiskLevel - 5 * daysPassed);
  }

  // High disease proliferation risk can make party pets sick!
  if (state.diseaseRisk >= 45) {
    for (const pet of party) {
      if (pet.hp > 0 && !pet.sick && next(rng) < state.diseaseRisk / 200) {
        pet.sick = true;
        alerts.push(
          '🤒 Proliferação de doenças (água inadequada/alagamento) deixou um pet doente!'
        );
      }
    }
  }

  return { alerts, extraCo2, extraEcoDamage };
}

/** Daily tick: may shift between Normal, Estiagem (prolonged drought), and Chuva Intensa (heavy rain). */
export function tickHydroClimate(
  state: HydroClimateState,
  rng: RngState,
  daysPassed: number,
  map: WorldMap,
  biomeIndex: number,
  npcIds: readonly string[],
  party: PetInstance[],
  energyGrid?: EnergyGridState
): { alerts: string[]; extraCo2: number; extraEcoDamage: number } {
  if (daysPassed <= 0) return { alerts: [], extraCo2: 0, extraEcoDamage: 0 };
  if (state.regimeDays >= 3 || state.regime === 'normal') {
    const roll = next(rng);
    if (roll < 0.28) {
      if (state.regime !== 'estiagem') state.regimeDays = 0;
      state.regime = 'estiagem';
    } else if (roll < 0.56) {
      if (state.regime !== 'chuva_intensa') state.regimeDays = 0;
      state.regime = 'chuva_intensa';
    } else {
      if (state.regime !== 'normal') state.regimeDays = 0;
      state.regime = 'normal';
    }
  }
  return applyHydroRegimeEffects(
    state,
    rng,
    daysPassed,
    map,
    biomeIndex,
    npcIds,
    party,
    energyGrid
  );
}
