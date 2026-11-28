import { next, type RngState } from './rng';

/**
 * Global Warming, Extreme Heat Combat Effects, 4th-Wall Secret Climate-Denial Society,
 * Land Clearing ("Capinar Lote") & Mineral Extraction (Stone, Metal, Gold, Precious Gems)!
 */

export const EXTREME_HEAT_CO2_THRESHOLD = 54; // >= +3.0°C global anomaly!

export type MineralId = 'pedra' | 'metal' | 'ouro' | 'pedra_preciosa';

export interface MineralDef {
  id: MineralId;
  name: string;
  icon: string;
  sellPrice: number;
  weight: number;
}

export const MINERALS: readonly MineralDef[] = [
  { id: 'pedra', name: 'Pedra Bruta', icon: '🪨', sellPrice: 14, weight: 45 },
  { id: 'metal', name: 'Minério de Metal', icon: '⚙️', sellPrice: 28, weight: 30 },
  { id: 'ouro', name: 'Pepita de Ouro', icon: '🪙', sellPrice: 65, weight: 17 },
  { id: 'pedra_preciosa', name: 'Pedra Preciosa Rara', icon: '💎', sellPrice: 110, weight: 8 },
];

export const CONSPIRACY_SOCIETY = {
  name: 'Ordem do Termômetro Falso (Sociedade Secreta)',
  leaderName: 'Grão-Mestre Ignis-Fake',
  icon: '🕵️',
  quotes: [
    '"Aquecimento global?! Isso é tudo invenção dos pinguins! Está só um calorzinho gostoso de 48 graus na sombra!"',
    '"Espera aí... *olha direto para a câmera*... VOCÊ aí jogando! Sabe como ESTE JOGO foi feito?! Com ajuda de IA rodando em placas de vídeo com altíssimo consumo de energia elétrica e litros e mais litros de água para refrigeração dos servidores! E ainda vêm reclamar do meu gerador a carvão?! Hahaha!"',
    '"Se as suas cartas de Água evaporaram e seu pet de Gelo derreteu na batalha, é claramente falta de fé na nossa conspiração!"',
  ],
} as const;

export interface ClimateState {
  /** Atmospheric CO2 accumulation (0..120+). */
  co2Atmosphere: number;
  /** Atmospheric Methane (CH4) from hydroelectric reservoirs (2.5x stronger greenhouse effect than CO2!). */
  methaneAtmosphere: number;
  /** Number of lots the player cleared ("capinou"). */
  lotsCleared: number;
  /** Extracted minerals inventory (sellable for high profit). */
  minerals: Record<MineralId, number>;
  /** Times the player spoke with the Secret Climate-Denial Society leader. */
  conspiracyVisits: number;
}

export function createClimateState(): ClimateState {
  return {
    co2Atmosphere: 6,
    methaneAtmosphere: 0,
    lotsCleared: 0,
    minerals: {
      pedra: 0,
      metal: 0,
      ouro: 0,
      pedra_preciosa: 0,
    },
    conspiracyVisits: 0,
  };
}

/** Global temperature rise in °C based on CO2 + potent Methane (CH4 = 2.5x greenhouse multiplier!). */
export function globalTempDeltaC(state: ClimateState, seasonShiftC = 0): number {
  const effectiveGhg = state.co2Atmosphere + state.methaneAtmosphere * 2.5;
  return Number((effectiveGhg / 18 + seasonShiftC).toFixed(1));
}

/** True when global warming reaches extreme heat (>= +3.0°C): disables Water cards & Ice pets! */
export function isExtremeHeat(state: ClimateState, seasonShiftC = 0): boolean {
  return globalTempDeltaC(state, seasonShiftC) >= 3.0;
}

/** Adds CO2 to the atmosphere (from cars, coal generators, mining, land clearing). */
export function emitCo2(state: ClimateState, amount: number): void {
  state.co2Atmosphere = Math.max(0, Math.min(120, state.co2Atmosphere + amount));
}

/** Adds Methane (CH4) from hydroelectric dam reservoirs — strongly accelerates greenhouse warming! */
export function emitMethane(state: ClimateState, amount: number): void {
  state.methaneAtmosphere = Math.max(0, Math.min(80, state.methaneAtmosphere + amount));
}

/** Clears a plot of land ("capinar um lote"): prepares it for mining, hurts eco & emits CO2! */
export function clearLandLot(state: ClimateState): {
  ecoDamage: number;
  co2Added: number;
  msg: string;
} {
  state.lotsCleared += 1;
  emitCo2(state, 6);
  return {
    ecoDamage: 6,
    co2Added: 6,
    msg: `⛏️ Você capinou um lote (${state.lotsCleared} lote(s) aberto(s))! Impacto ambiental: −6🌿 e +6 CO₂ na atmosfera.`,
  };
}

/** Extracts minerals (stone, metal, gold, precious gems) from a cleared lot — profitable, but pollutes heavily! */
export function extractMinerals(
  state: ClimateState,
  rng: RngState
): { ok: boolean; mineral?: MineralDef; ecoDamage: number; co2Added: number; msg: string } {
  if (state.lotsCleared <= 0) {
    return {
      ok: false,
      ecoDamage: 0,
      co2Added: 0,
      msg: 'Você precisa capinar um lote primeiro antes de fazer extração mineral!',
    };
  }
  const roll = next(rng) * 100;
  let acc = 0;
  let found = MINERALS[0];
  for (const m of MINERALS) {
    acc += m.weight;
    if (roll <= acc) {
      found = m;
      break;
    }
  }
  state.minerals[found.id] = (state.minerals[found.id] ?? 0) + 1;
  emitCo2(state, 10);
  return {
    ok: true,
    mineral: found,
    ecoDamage: 10,
    co2Added: 10,
    msg: `${found.icon} Extraiu ${found.name} (vale ${found.sellPrice} moedas)! Impacto: −10🌿 e +10 CO₂ (Aquecimento Global: +${globalTempDeltaC(state)}°C)!`,
  };
}

/** Sells all extracted minerals for coins! */
export function sellAllMinerals(state: ClimateState): { coins: number; msg: string } {
  let coins = 0;
  for (const m of MINERALS) {
    const qty = state.minerals[m.id] ?? 0;
    if (qty > 0) {
      coins += qty * m.sellPrice;
      state.minerals[m.id] = 0;
    }
  }
  if (coins <= 0) return { coins: 0, msg: 'Nenhum minério extraído para vender.' };
  return { coins, msg: `💰 Vendeu todos os minérios extraídos por +${coins} moedas!` };
}

/** Returns the next 4th-wall-breaking line from the Secret Climate-Denial Society leader! */
export function talkToConspiracyLeader(state: ClimateState): string {
  const quote =
    CONSPIRACY_SOCIETY.quotes[state.conspiracyVisits % CONSPIRACY_SOCIETY.quotes.length];
  state.conspiracyVisits += 1;
  return `${CONSPIRACY_SOCIETY.icon} ${CONSPIRACY_SOCIETY.leaderName}: ${quote}`;
}
