import { next, type RngState } from './rng';

export type RecyclingBin = 'papel' | 'plastico' | 'vidro' | 'organico' | 'comum';

export interface ApplianceDef {
  id: string;
  name: string;
  icon: string;
  price: number;
  waterUse: number;
  energyUse: number;
  /** Emits CO2 / carbon gas: 2.2x more devastating to the environment! */
  emitsCarbon?: boolean;
  /** Correct recycling bin if discarded. */
  correctBin: RecyclingBin;
  statusBonus: number;
  desc: string;
}

export const APPLIANCES: readonly ApplianceDef[] = [
  {
    id: 'chuveiro_eletrico',
    name: 'Chuveiro Elétrico Turbo',
    icon: '🚿',
    price: 45,
    waterUse: 4,
    energyUse: 5,
    correctBin: 'plastico',
    statusBonus: 6,
    desc: 'Conforto em casa, mas aumenta conta de água e energia (+4💧 +5⚡).',
  },
  {
    id: 'ar_condicionado',
    name: 'Ar-Condicionado Split',
    icon: '❄️',
    price: 95,
    waterUse: 1,
    energyUse: 9,
    emitsCarbon: true,
    correctBin: 'comum',
    statusBonus: 16,
    desc: 'Muito status (+16), alto consumo de energia (+9⚡) e gás carbono (CO₂)!',
  },
  {
    id: 'geladeira_duplex',
    name: 'Geladeira Duplex Inox',
    icon: '🧊',
    price: 80,
    waterUse: 1,
    energyUse: 6,
    correctBin: 'comum',
    statusBonus: 12,
    desc: 'Conserva comida (+12 Status · +6⚡ energia).',
  },
  {
    id: 'gerador_carbono',
    name: 'Gerador a Carvão (CO₂)',
    icon: '🏭',
    price: 35,
    waterUse: 2,
    energyUse: 2,
    emitsCarbon: true,
    correctBin: 'comum',
    statusBonus: 2,
    desc: '⚠️ Emite muito gás carbono (CO₂): extremamente devastador para o meio ambiente!',
  },
  {
    id: 'garrafa_vidro',
    name: 'Jarra de Vidro Artesanal',
    icon: '🫙',
    price: 20,
    waterUse: 0,
    energyUse: 0,
    correctBin: 'vidro',
    statusBonus: 4,
    desc: 'Item decorativo reciclável (lixeira correta: 🟢 Vidro).',
  },
  {
    id: 'revista_papel',
    name: 'Coleção de Revistas',
    icon: '📰',
    price: 15,
    waterUse: 0,
    energyUse: 0,
    correctBin: 'papel',
    statusBonus: 3,
    desc: 'Leitura de casa (lixeira correta: 🔵 Papel).',
  },
];

export const getAppliance = (id: string): ApplianceDef | undefined =>
  APPLIANCES.find((a) => a.id === id);

/** Per-biome water & energy tariffs paid to the local Prefeitura. */
export const BIOME_UTILITY_RATES: readonly { waterRate: number; energyRate: number }[] = [
  { waterRate: 2, energyRate: 2 },
  { waterRate: 5, energyRate: 3 }, // Desert: water is expensive!
  { waterRate: 2, energyRate: 3 },
  { waterRate: 1, energyRate: 3 }, // Forest: abundant water
  { waterRate: 3, energyRate: 6 }, // Neon City: pricey energy!
  { waterRate: 3, energyRate: 2 },
  { waterRate: 4, energyRate: 5 }, // Sky Fortress
];

export const RECYCLING_BIN_LABELS: Record<RecyclingBin, string> = {
  papel: '🔵 Papel',
  plastico: '🔴 Plástico',
  vidro: '🟢 Vidro',
  organico: '🟤 Orgânico',
  comum: '⚫ Lixo Comum',
};

export interface UtilityState {
  ownedItems: string[];
  billOwed: number;
  totalDonated: number;
  wrongDisposals: number;
}

export function createUtilityState(): UtilityState {
  return {
    ownedItems: ['garrafa_vidro'],
    billOwed: 0,
    totalDonated: 0,
    wrongDisposals: 0,
  };
}

/** Computes daily water & energy bill + environmental damage (carbon items hit 2.2x harder!). */
export function computeUtilityImpact(
  state: UtilityState,
  biomeIndex: number
): {
  bill: number;
  waterTotal: number;
  energyTotal: number;
  ecoDamage: number;
  carbonCount: number;
} {
  const rates =
    BIOME_UTILITY_RATES[Math.max(0, Math.min(BIOME_UTILITY_RATES.length - 1, biomeIndex))];
  let waterTotal = 2; // base home consumption
  let energyTotal = 2;
  let ecoDamage = 0;
  let carbonCount = 0;
  for (const id of state.ownedItems) {
    const def = getAppliance(id);
    if (!def) continue;
    waterTotal += def.waterUse;
    energyTotal += def.energyUse;
    const baseEco = Math.ceil((def.waterUse + def.energyUse) / 3);
    if (def.emitsCarbon) {
      carbonCount += 1;
      ecoDamage += Math.round(baseEco * 2.2) + 4;
    } else {
      ecoDamage += baseEco;
    }
  }
  const bill = waterTotal * rates.waterRate + energyTotal * rates.energyRate;
  return { bill, waterTotal, energyTotal, ecoDamage, carbonCount };
}

/**
 * Discards an owned item into one of the 5 recycling bins.
 * Wrong bin = damages the environment! Right bin = clean recycling (+1 eco!).
 */
export function discardItemInBin(
  state: UtilityState,
  itemId: string,
  bin: RecyclingBin
): { ok: boolean; correct: boolean; ecoDelta: number; msg: string } {
  const idx = state.ownedItems.indexOf(itemId);
  const def = getAppliance(itemId);
  if (idx < 0 || !def)
    return { ok: false, correct: false, ecoDelta: 0, msg: 'Item não encontrado.' };
  state.ownedItems.splice(idx, 1);
  if (def.correctBin === bin) {
    return {
      ok: true,
      correct: true,
      ecoDelta: 1,
      msg: `♻️ ${def.name} descartado na lixeira correta (${RECYCLING_BIN_LABELS[bin]})! (+1🌿)`,
    };
  }
  state.wrongDisposals += 1;
  const dmg = def.emitsCarbon ? -14 : -7;
  return {
    ok: true,
    correct: false,
    ecoDelta: dmg,
    msg: `⚠️ Descarte errado! ${def.name} deveria ir em ${RECYCLING_BIN_LABELS[def.correctBin]} — danificou o ambiente (${dmg}🌿)!`,
  };
}

/** Item lifecycle actions: sell, donate (karma/status), trade, or auction! */
export function disposeItemLifecycle(
  state: UtilityState,
  itemId: string,
  action: 'vender' | 'doar' | 'trocar' | 'leiloar',
  rng: RngState
): { ok: boolean; coinsGained: number; statusGain: number; receivedItemId?: string; msg: string } {
  const idx = state.ownedItems.indexOf(itemId);
  const def = getAppliance(itemId);
  if (idx < 0 || !def)
    return { ok: false, coinsGained: 0, statusGain: 0, msg: 'Item não encontrado.' };
  state.ownedItems.splice(idx, 1);

  if (action === 'vender') {
    const coins = Math.max(5, Math.round(def.price * 0.6));
    return {
      ok: true,
      coinsGained: coins,
      statusGain: 0,
      msg: `💰 Vendeu ${def.name} por ${coins} moedas!`,
    };
  }
  if (action === 'doar') {
    state.totalDonated += 1;
    return {
      ok: true,
      coinsGained: 0,
      statusGain: 8,
      msg: `🎁 Doou ${def.name} para a comunidade! (+8 Status positivo com NPCs!)`,
    };
  }
  if (action === 'trocar') {
    const others = APPLIANCES.filter((a) => a.id !== itemId);
    const swap = others[Math.floor(next(rng) * others.length)];
    state.ownedItems.push(swap.id);
    return {
      ok: true,
      coinsGained: 0,
      statusGain: 2,
      receivedItemId: swap.id,
      msg: `🔄 Trocou ${def.name} por ${swap.icon} ${swap.name}!`,
    };
  }
  // Leiloar (auction): variable bid from 0.5x to 1.45x base price!
  const mult = 0.5 + next(rng) * 0.95;
  const bid = Math.max(8, Math.round(def.price * mult));
  return {
    ok: true,
    coinsGained: bid,
    statusGain: 3,
    msg: `🔨 Leiloou ${def.name} pelo lance vencedor de ${bid} moedas!`,
  };
}
