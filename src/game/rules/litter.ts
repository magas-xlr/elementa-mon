/**
 * Ground Litter, Selective Recycling, Dedicated E-Waste/Battery/Glass Depot & Glass Packing Boxes:
 * - Leaving litter on the ground damages the environment daily.
 * - Pick up litter from the ground and dispose in the correct bin!
 * - Electronics, Batteries, and Glass have their OWN dedicated Special Depot (NOT normal bins!).
 * - Glass MUST be packed inside a cardboard Packing Box before disposal at the Glass Depot!
 */

export type LitterKind = 'papel' | 'plastico' | 'organico' | 'eletronico' | 'bateria' | 'vidro';
export type DisposalTarget =
  'lixeira_papel' | 'lixeira_plastico' | 'lixeira_organico' | 'deposito_especial';

export interface LitterDef {
  kind: LitterKind;
  name: string;
  icon: string;
  correctTarget: DisposalTarget;
  requiresBox?: boolean;
  groundEcoPenalty: number;
}

export const LITTER_DEFS: Record<LitterKind, LitterDef> = {
  papel: {
    kind: 'papel',
    name: 'Papel Amassado',
    icon: '📄',
    correctTarget: 'lixeira_papel',
    groundEcoPenalty: 1,
  },
  plastico: {
    kind: 'plastico',
    name: 'Garrafa Plástica',
    icon: '🧴',
    correctTarget: 'lixeira_plastico',
    groundEcoPenalty: 2,
  },
  organico: {
    kind: 'organico',
    name: 'Resto Orgânico',
    icon: '🍌',
    correctTarget: 'lixeira_organico',
    groundEcoPenalty: 1,
  },
  eletronico: {
    kind: 'eletronico',
    name: 'Placa Eletrônica Quebrada',
    icon: '📱',
    correctTarget: 'deposito_especial',
    groundEcoPenalty: 5,
  },
  bateria: {
    kind: 'bateria',
    name: 'Bateria Descarregada',
    icon: '🔋',
    correctTarget: 'deposito_especial',
    groundEcoPenalty: 6,
  },
  vidro: {
    kind: 'vidro',
    name: 'Caco / Garrafa de Vidro',
    icon: '🍾',
    correctTarget: 'deposito_especial',
    requiresBox: true,
    groundEcoPenalty: 3,
  },
};

export const PACKING_BOX_PRICE = 6;

export interface LitterState {
  /** Trash currently lying on the ground (damages biome ecology if not picked up!). */
  groundLitter: LitterKind[];
  /** Trash picked up by the player and carried in bag ready to recycle. */
  bagLitter: LitterKind[];
  /** Cardboard boxes owned for safely packing Glass before taking it to the Special Depot! */
  packingBoxes: number;
  recycledCount: number;
}

export function createLitterState(): LitterState {
  return {
    groundLitter: ['plastico', 'vidro', 'bateria'],
    bagLitter: [],
    packingBoxes: 1,
    recycledCount: 0,
  };
}

/** Picks up 1 piece of litter from the ground into the player's bag. */
export function pickupLitterFromGround(
  state: LitterState,
  index = 0
): { ok: boolean; kind?: LitterKind; msg: string } {
  if (index < 0 || index >= state.groundLitter.length) {
    return { ok: false, msg: 'Não há lixo no chão para recolher.' };
  }
  const [kind] = state.groundLitter.splice(index, 1);
  state.bagLitter.push(kind);
  const def = LITTER_DEFS[kind];
  return {
    ok: true,
    kind,
    msg: `✋ Recolheu ${def.icon} ${def.name} do chão! Leve à lixeira/depósito correto.`,
  };
}

/** Daily eco-damage caused by leaving uncollected trash on the ground. */
export function groundLitterEcoDamage(state: LitterState): number {
  return state.groundLitter.reduce((sum, k) => sum + LITTER_DEFS[k].groundEcoPenalty, 0);
}

/**
 * Recycles a carried litter item into a bin or the Special Depot:
 * - Electronics, batteries & glass MUST go to `deposito_especial`!
 * - Glass MUST consume 1 `packingBoxes` (cardboard box) to be safely packed!
 * - Wrong bin or unpacked glass damages the environment!
 */
export function recycleLitter(
  state: LitterState,
  bagIndex: number,
  target: DisposalTarget
): { ok: boolean; ecoDelta: number; msg: string } {
  if (bagIndex < 0 || bagIndex >= state.bagLitter.length) {
    return { ok: false, ecoDelta: 0, msg: 'Item de lixo inválido.' };
  }
  const kind = state.bagLitter[bagIndex];
  const def = LITTER_DEFS[kind];

  if (def.requiresBox && target === 'deposito_especial') {
    if (state.packingBoxes <= 0) {
      return {
        ok: false,
        ecoDelta: -3,
        msg: '📦 Vidros precisam ser bem embalados! Compre uma Caixa para Vidro antes de entregar no Depósito Especial (−3🌿)!',
      };
    }
    state.packingBoxes -= 1;
  }

  state.bagLitter.splice(bagIndex, 1);
  if (target === def.correctTarget) {
    state.recycledCount += 1;
    return {
      ok: true,
      ecoDelta: 2,
      msg: `♻️ ${def.icon} ${def.name} reciclado corretamente${def.requiresBox ? ' (embalado em 📦 caixa!)' : ''}! (+2🌿)`,
    };
  }
  const penalty = def.correctTarget === 'deposito_especial' ? -10 : -5;
  return {
    ok: true,
    ecoDelta: penalty,
    msg: `⚠️ Lixeira errada! ${def.icon} ${def.name} deveria ir em "${def.correctTarget}" (${penalty}🌿)!`,
  };
}
