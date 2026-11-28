import { BIOMES } from '../data/biomes';

/**
 * Organic Waste, Composting, City Landfills, Soil/Water Contamination,
 * Player Hydration (clean vs contaminated water), NGO Group Protests,
 * Environmental Militancy, Reusable Spent Items ("Bagaço") & 50-Item Inventory Cap!
 */

export const MAX_INVENTORY_ITEMS = 50;

export interface EnvironmentSimState {
  /** Organic scraps from consumed food & kitchen waste (usable for composting!). */
  organicWaste: number;
  /** Ready compost bags made from organic waste (boosts home garden!). */
  compost: number;
  /** Spent item remnants ("bagaço") that can be repaired & reused at 🔧 Casa de Reparo! */
  spentBagaco: string[];
  /** Accumulated landfill waste per city/biome (0..100). */
  cityLandfills: number[];
  /** Soil contamination per biome (0..100). */
  soilContamination: number[];
  /** Water contamination per biome (0..100). Drinking when >= 50 can poison/kill the player! */
  waterContamination: number[];
  /** Player hydration (0..100). Reaching 0 = death from dehydration! */
  playerHydration: number;
  /** Environmental militancy actions taken; being too pushy (>=3) hurts NPC relationships! */
  militancyLevel: number;
  /** Active government cleanup speed multiplier from NGO group protests at City Hall. */
  cleanupSpeedBonus: number;
}

export function createEnvironmentSimState(): EnvironmentSimState {
  const n = BIOMES.length;
  return {
    organicWaste: 2,
    compost: 0,
    spentBagaco: ['garrafa_usada'],
    cityLandfills: new Array(n).fill(10),
    soilContamination: new Array(n).fill(5),
    waterContamination: new Array(n).fill(5),
    playerHydration: 100,
    militancyLevel: 0,
    cleanupSpeedBonus: 1,
  };
}

/** Converts organic waste (including food scraps) into rich compost for your home garden! */
export function makeCompost(state: EnvironmentSimState): { ok: boolean; msg: string } {
  if (state.organicWaste < 2) {
    return {
      ok: false,
      msg: 'Você precisa de pelo menos 2 resíduos orgânicos para fazer compostagem.',
    };
  }
  state.organicWaste -= 2;
  state.compost += 1;
  return {
    ok: true,
    msg: '🌱 Compostagem pronta! Use na sua horta para acelerar a colheita orgânica!',
  };
}

/**
 * Player drinks water in the current biome:
 * - If water is heavily contaminated (>= 50%), high risk of fatal poisoning!
 * - Otherwise safely restores hydration (+45).
 */
export function drinkBiomeWater(
  state: EnvironmentSimState,
  biomeIndex: number,
  roll01: number
): { died: boolean; poisoned: boolean; msg: string } {
  const contam = state.waterContamination[biomeIndex] ?? 0;
  if (contam >= 50) {
    const fatal = contam >= 75 || roll01 < 0.55;
    if (fatal) {
      state.playerHydration = 0;
      return {
        died: true,
        poisoned: true,
        msg: '☠️ Você bebeu água gravemente contaminada pelo lixo e morreu envenenado!',
      };
    }
    state.playerHydration = Math.min(100, state.playerHydration + 15);
    return {
      died: false,
      poisoned: true,
      msg: '🤢 A água estava contaminada! Você passou muito mal — limpe o lixo antes que piore!',
    };
  }
  state.playerHydration = Math.min(100, state.playerHydration + 45);
  return {
    died: false,
    poisoned: false,
    msg: `💧 Você bebeu água limpa! Hidratação: ${state.playerHydration}%.`,
  };
}

/**
 * Updates daily landfill load, soil/water contamination from ground litter, and player hydration drain.
 * Returns { diedOfThirst, alerts }.
 */
export function tickEnvironmentSim(
  state: EnvironmentSimState,
  biomeIndex: number,
  groundLitterCount: number,
  hoursPassed: number,
  daysPassed: number
): { diedOfThirst: boolean; alerts: string[] } {
  const alerts: string[] = [];
  if (hoursPassed > 0) {
    state.playerHydration = Math.max(0, state.playerHydration - hoursPassed * 4);
    if (state.playerHydration === 0) {
      return {
        diedOfThirst: true,
        alerts: ['💀 Você ficou tempo demais sem beber água e morreu de desidratação!'],
      };
    }
    if (state.playerHydration <= 20) {
      alerts.push('💧 Você está com muita sede! Beba água limpa antes de desidratar!');
    }
  }
  if (daysPassed > 0 && groundLitterCount >= 3) {
    const bump = Math.min(25, groundLitterCount * 4 * daysPassed);
    state.soilContamination[biomeIndex] = Math.min(
      100,
      (state.soilContamination[biomeIndex] ?? 0) + bump
    );
    state.waterContamination[biomeIndex] = Math.min(
      100,
      (state.waterContamination[biomeIndex] ?? 0) + Math.round(bump * 0.9)
    );
    state.cityLandfills[biomeIndex] = Math.min(
      100,
      (state.cityLandfills[biomeIndex] ?? 0) + Math.round(bump * 0.6)
    );
    alerts.push(
      `☣️ Muito lixo no chão contaminou o solo (${state.soilContamination[biomeIndex]}%) e a água (${state.waterContamination[biomeIndex]}%) da cidade!`
    );
  }
  return { diedOfThirst: false, alerts };
}

/**
 * Go to City Hall with your NGO group to complain about trash!
 * The more people protesting, the faster the government resolves the trash & contamination!
 */
export function protestWithNgoAtCityHall(
  state: EnvironmentSimState,
  biomeIndex: number,
  protestersCount: number,
  groundLitterCount: number
): { cleanedLitter: number; daysSaved: number; msg: string } {
  const power = Math.max(1, protestersCount);
  const cleanedLitter = Math.min(groundLitterCount, power);
  const contamDrop = Math.min(45, power * 10);
  state.soilContamination[biomeIndex] = Math.max(
    0,
    (state.soilContamination[biomeIndex] ?? 0) - contamDrop
  );
  state.waterContamination[biomeIndex] = Math.max(
    0,
    (state.waterContamination[biomeIndex] ?? 0) - contamDrop
  );
  state.cleanupSpeedBonus = Math.min(5, 1 + Math.floor(power / 2));
  return {
    cleanedLitter,
    daysSaved: power,
    msg: `📢 Protesto da ONG na Prefeitura com ${power} pessoa(s)! O governo agiu ${state.cleanupSpeedBonus}× mais rápido, removeu ${cleanedLitter} lixo(s) e reduziu a contaminação em −${contamDrop}%!`,
  };
}

/**
 * Environmental Militancy: raises eco health, BUT being overly pushy (>=3) annoys NPCs & hurts relationships!
 */
export function doEnvironmentalMilitancy(state: EnvironmentSimState): {
  ecoGain: number;
  npcBondPenalty: number;
  msg: string;
} {
  state.militancyLevel += 1;
  const annoying = state.militancyLevel >= 3;
  return {
    ecoGain: 4,
    npcBondPenalty: annoying ? -1 : 0,
    msg: annoying
      ? '📣 Você militou pela causa ambiental (+4🌿), mas foi chato demais e irritou os NPCs (−1 vínculo)!'
      : '🌱 Você fez militância ambiental consciente (+4🌿)!',
  };
}

/** Repairs a spent item remnant ("bagaço") at 🔧 Casa de Reparo so it can be reused instead of polluting! */
export function repairBagacoItem(
  state: EnvironmentSimState,
  index: number
): { ok: boolean; repairedName?: string; msg: string } {
  if (index < 0 || index >= state.spentBagaco.length) {
    return { ok: false, msg: 'Nenhum bagaço/item gasto selecionado.' };
  }
  const [name] = state.spentBagaco.splice(index, 1);
  return {
    ok: true,
    repairedName: name,
    msg: `🔧 Mestre Jonas consertou "${name}"! Item reutilizável recuperado sem gerar lixo!`,
  };
}
