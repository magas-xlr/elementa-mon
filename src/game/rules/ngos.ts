import { SPECIES } from '../data/species';

/**
 * NGOs (ONGs), Permanent Species Extinction, Anti-Poaching Fines & Roguelike Prison Game Over:
 * - Multiple NGO types (Pet Protection, Reforestation, Zero Waste, Clean Water).
 * - Joining an NGO lets you recruit NPCs to boost restoration power!
 * - Killing all wild individuals of a species makes it EXTINCT forever (unless Pet NGO recovers it!).
 * - Killing too many wild pets triggers a heavy NGO fine; failing to pay -> ARRESTED (Prison Game Over),
 *   which in true roguelike fashion restarts the run while keeping your pets & items!
 */

export type NgoId = 'ong_pets' | 'ong_floresta' | 'ong_reciclagem' | 'ong_aguas';

export interface NgoDef {
  id: NgoId;
  name: string;
  icon: string;
  repName: string;
  focus: string;
  desc: string;
}

export const NGOS: readonly NgoDef[] = [
  {
    id: 'ong_pets',
    name: 'ONG Arca dos Elementa-Mons',
    icon: '🐾',
    repName: 'Marina (Protetora Animal)',
    focus: 'Recuperar espécies extintas e fiscalizar caça ilegal',
    desc: 'Tenta recuperar pets extintos quando tem membros suficientes e multa quem mata pets selvagens demais!',
  },
  {
    id: 'ong_floresta',
    name: 'ONG Floresta Viva',
    icon: '🌿',
    repName: 'Caio (Biólogo)',
    focus: 'Reflorestamento de biomas devastados',
    desc: 'Recupera +4% de saúde ambiental por dia conforme você recruta voluntários.',
  },
  {
    id: 'ong_reciclagem',
    name: 'ONG Lixo Zero',
    icon: '♻️',
    repName: 'Soraia (Recicladora)',
    focus: 'Coleta seletiva e caixas para vidro',
    desc: 'Fornece caixas para embalar vidro e ajuda a limpar lixo do chão.',
  },
  {
    id: 'ong_aguas',
    name: 'ONG Águas Limpas',
    icon: '💧',
    repName: 'Lucas (Hidrólogo)',
    focus: 'Preservação de rios e redução de taxas',
    desc: 'Ajuda a restaurar ecossistemas aquáticos e reduzir danos de energia/água.',
  },
];

export const INITIAL_SPECIES_POPULATION = 6;
export const POACHING_FINE_THRESHOLD = 4;
export const POACHING_FINE_AMOUNT = 85;

export interface NgoState {
  /** Has the NGO representative arrived to invite the player? */
  representativeArrived: boolean;
  /** NGOs the player has joined. */
  joinedNgos: NgoId[];
  /** Recruited NPC names per NGO. */
  recruits: Record<NgoId, string[]>;
  /** Remaining wild population per species (0 = EXTINCT forever!). */
  speciesPopulation: Record<string, number>;
  /** List of permanently extinct species IDs. */
  extinctSpecies: string[];
  /** Count of wild pets killed (triggers NGO anti-poaching fine!). */
  wildPetsKilled: number;
  /** Unpaid NGO poaching fine (if you can't pay -> Arrested / Prison Game Over!). */
  fineOwed: number;
  arrested: boolean;
}

export function createNgoState(): NgoState {
  const speciesPopulation: Record<string, number> = {};
  for (const sp of SPECIES) {
    speciesPopulation[sp.id] = INITIAL_SPECIES_POPULATION;
  }
  return {
    representativeArrived: false,
    joinedNgos: [],
    recruits: {
      ong_pets: [],
      ong_floresta: [],
      ong_reciclagem: [],
      ong_aguas: [],
    },
    speciesPopulation,
    extinctSpecies: [],
    wildPetsKilled: 0,
    fineOwed: 0,
    arrested: false,
  };
}

export function joinNgo(state: NgoState, id: NgoId): { ok: boolean; msg: string } {
  if (state.joinedNgos.includes(id)) return { ok: false, msg: 'Você já participa desta ONG.' };
  state.joinedNgos.push(id);
  const def = NGOS.find((n) => n.id === id)!;
  return {
    ok: true,
    msg: `${def.icon} Você entrou para a ${def.name}! Agora pode recrutar voluntários.`,
  };
}

export function recruitToNgo(
  state: NgoState,
  id: NgoId,
  npcName: string
): { ok: boolean; msg: string } {
  if (!state.joinedNgos.includes(id)) {
    return { ok: false, msg: 'Entre na ONG primeiro para poder recrutar pessoas!' };
  }
  const list = state.recruits[id];
  if (list.includes(npcName))
    return { ok: false, msg: `${npcName} já foi recrutado para esta ONG.` };
  list.push(npcName);
  return {
    ok: true,
    msg: `🤝 ${npcName} foi recrutado para a ONG! (Total: ${list.length} voluntários)`,
  };
}

/**
 * Records killing a wild pet in battle:
 * - Decrements species wild population (at 0, species becomes EXTINCT forever!).
 * - If player kills too many pets (>= 4), the Pet NGO issues a heavy fine!
 */
export function recordWildSpeciesKill(
  state: NgoState,
  speciesId: string
): { extinctNow: boolean; finedNow: boolean; msg?: string } {
  state.wildPetsKilled += 1;
  const cur = state.speciesPopulation[speciesId] ?? INITIAL_SPECIES_POPULATION;
  const nextPop = Math.max(0, cur - 1);
  state.speciesPopulation[speciesId] = nextPop;

  let extinctNow = false;
  if (nextPop === 0 && !state.extinctSpecies.includes(speciesId)) {
    state.extinctSpecies.push(speciesId);
    extinctNow = true;
  }

  let finedNow = false;
  if (state.wildPetsKilled % POACHING_FINE_THRESHOLD === 0) {
    state.fineOwed += POACHING_FINE_AMOUNT;
    finedNow = true;
  }

  const msgs: string[] = [];
  if (extinctNow) {
    msgs.push(
      `💀 EXTINÇÃO! Todos os pets selvagens da espécie "${speciesId}" foram extintos do mundo!`
    );
  }
  if (finedNow) {
    msgs.push(
      `🚨 A ONG Arca dos Elementa-Mons multou você em ${POACHING_FINE_AMOUNT} moedas por matar pets demais! Pague ou será PRESO!`
    );
  }
  return { extinctNow, finedNow, msg: msgs.length ? msgs.join(' ') : undefined };
}

/** Attempts to pay the NGO fine; if the player cannot afford it, they are ARRESTED (Prison Game Over!). */
export function resolveNgoFine(
  state: NgoState,
  wallet: number
): { paid: boolean; arrested: boolean; cost: number; msg: string } {
  if (state.fineOwed <= 0)
    return { paid: true, arrested: false, cost: 0, msg: 'Nenhuma multa pendente.' };
  if (wallet >= state.fineOwed) {
    const cost = state.fineOwed;
    state.fineOwed = 0;
    return { paid: true, arrested: false, cost, msg: `⚖️ Multa ambiental da ONG (${cost}) paga!` };
  }
  state.arrested = true;
  return {
    paid: false,
    arrested: true,
    cost: 0,
    msg: '🚔 Você não conseguiu pagar a multa da ONG e foi PRESO! (Game Over Roguelike — seus pets e itens continuam com você na próxima jornada!)',
  };
}

/** Pet NGO recovery program: requires membership + at least 2 recruits to recover 1 extinct species! */
export function recoverExtinctSpecies(
  state: NgoState,
  speciesId: string
): { ok: boolean; msg: string } {
  if (!state.joinedNgos.includes('ong_pets') || state.recruits.ong_pets.length < 2) {
    return {
      ok: false,
      msg: 'Participe da ONG Arca dos Elementa-Mons e recrute pelo menos 2 pessoas para recuperar espécies extintas!',
    };
  }
  const idx = state.extinctSpecies.indexOf(speciesId);
  if (idx < 0) return { ok: false, msg: 'Esta espécie não está extinta.' };
  state.extinctSpecies.splice(idx, 1);
  state.speciesPopulation[speciesId] = 3;
  return {
    ok: true,
    msg: `🐾🌱 A ONG Arca dos Elementa-Mons conseguiu recuperar a espécie "${speciesId}" da extinção!`,
  };
}
