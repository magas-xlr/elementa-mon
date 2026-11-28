import { next, int, type RngState } from './rng';

export type HousingKind = 'casa' | 'apartamento';
export type HousingDamageKind = 'nenhum' | 'goteira' | 'infiltracao';

export interface ApartmentListing {
  id: string;
  name: string;
  floor: number;
  rentPerDay: number;
  buyPrice: number;
  ageDays: number;
  neighbors: string[];
  /** Living near a dam is much cheaper, but risks catastrophic flooding if the dam fails! */
  nearDam?: boolean;
}

export const APARTMENTS: readonly ApartmentListing[] = [
  {
    id: 'apt_barragem',
    name: 'Vila da Barragem (⚠️ Perto da Barragem — Muito Barato!)',
    floor: 0,
    rentPerDay: 8,
    buyPrice: 75,
    ageDays: 18,
    neighbors: ['Seu João da Barragem', 'Dona Clara (margem do reservatório)'],
    nearDam: true,
  },
  {
    id: 'apt_1',
    name: 'Residencial Brisa — 1º Andar',
    floor: 1,
    rentPerDay: 18,
    buyPrice: 180,
    ageDays: 4,
    neighbors: ['Dona Rosa (2º andar)', 'Seu Carlos (3º andar)'],
  },
  {
    id: 'apt_2',
    name: 'Residencial Brisa — 2º Andar',
    floor: 2,
    rentPerDay: 24,
    buyPrice: 240,
    ageDays: 12,
    neighbors: ['Lia (1º andar — abaixo)', 'Seu Carlos (3º andar — acima)'],
  },
  {
    id: 'apt_3',
    name: 'Edifício Horizonte — 3º Andar',
    floor: 3,
    rentPerDay: 32,
    buyPrice: 320,
    ageDays: 22,
    neighbors: ['Beto (2º andar — abaixo)', 'Dona Marta (1º andar)'],
  },
];

export interface MasonJob {
  paid: number;
  hoursRemaining: number;
  scammed: boolean;
  note: string;
}

export interface HousingState {
  kind: HousingKind;
  name: string;
  floor: number;
  owned: boolean;
  rentPerDay: number;
  /** Age of the building in days: older buildings suffer roof holes & infiltrations much more easily! */
  ageDays: number;
  /** Current structural issue: roof leak ('goteira') in houses or infiltration ('infiltracao') in apartments. */
  damage: HousingDamageKind;
  /** Neighbor complaint message when apartment infiltration leaks onto lower floors! */
  neighborComplaint: string | null;
  /** NPC neighbors living in the apartment building. */
  neighbors: string[];
  /** Relationship with the Mason (Pedreiro) (-5..+5). Affects price, speed, and scam risk! */
  masonRelation: number;
  /** Active repair job being done by the Mason (null when idle). */
  activeRepair: MasonJob | null;
  /** True when the player chose cheap housing near a dam (risk of flooding!). */
  nearDam?: boolean;
}

export function createHousingState(): HousingState {
  return {
    kind: 'casa',
    name: 'Casinha Inicial do Prado',
    floor: 0,
    owned: true,
    rentPerDay: 0,
    ageDays: 8,
    damage: 'nenhum',
    neighborComplaint: null,
    neighbors: [],
    masonRelation: 0,
    activeRepair: null,
  };
}

/** Moves the player into an apartment by renting or buying it. */
export function moveToApartment(
  housing: HousingState,
  aptId: string,
  mode: 'alugar' | 'comprar',
  wallet: number
): { ok: boolean; cost: number; msg: string } {
  const apt = APARTMENTS.find((a) => a.id === aptId);
  if (!apt) return { ok: false, cost: 0, msg: 'Apartamento não encontrado.' };
  const cost = mode === 'comprar' ? apt.buyPrice : apt.rentPerDay;
  if (wallet < cost) {
    return {
      ok: false,
      cost: 0,
      msg: `Saldo insuficiente! Precisa de ${cost} moedas para ${mode === 'comprar' ? 'comprar' : 'alugar'}.`,
    };
  }
  housing.kind = 'apartamento';
  housing.name = apt.name;
  housing.floor = apt.floor;
  housing.owned = mode === 'comprar';
  housing.rentPerDay = mode === 'comprar' ? 0 : apt.rentPerDay;
  housing.ageDays = apt.ageDays;
  housing.damage = 'nenhum';
  housing.neighborComplaint = null;
  housing.neighbors = [...apt.neighbors];
  housing.activeRepair = null;
  housing.nearDam = Boolean(apt.nearDam);
  return {
    ok: true,
    cost,
    msg: `🏢 Você se mudou para ${apt.name} (${mode === 'comprar' ? 'Comprado!' : `Aluguel ${apt.rentPerDay}/dia`})!${apt.nearDam ? ' ⚠️ Atenção: morar perto da barragem é barato, mas se ela romper pode inundar tudo!' : ''}`,
  };
}

/** Advances building age, rain roof leaks / apartment infiltrations, and active Mason repair timer. */
export function tickHousing(
  housing: HousingState,
  rng: RngState,
  hoursPassed: number,
  daysPassed: number,
  isRaining: boolean
): { alerts: string[]; petMoodPenalty: number; rentDue: number } {
  const alerts: string[] = [];
  let petMoodPenalty = 0;
  let rentDue = 0;

  if (daysPassed > 0) {
    housing.ageDays += daysPassed;
    if (!housing.owned && housing.rentPerDay > 0) {
      rentDue = housing.rentPerDay * daysPassed;
    }
  }

  // Active Mason repair countdown
  if (housing.activeRepair) {
    housing.activeRepair.hoursRemaining = Math.max(
      0,
      housing.activeRepair.hoursRemaining - hoursPassed
    );
    if (housing.activeRepair.hoursRemaining === 0) {
      const wasScam = housing.activeRepair.scammed;
      housing.activeRepair = null;
      if (wasScam) {
        alerts.push('😠 O pedreiro te enrolou e fez um serviço malfeito! O problema voltou!');
      } else {
        housing.damage = 'nenhum';
        housing.neighborComplaint = null;
        alerts.push('👷 O pedreiro terminou o conserto! Sua moradia está novinha em folha!');
      }
    }
  }

  // Older buildings + rain cause roof leaks (goteira) or apartment infiltrations (infiltracao)!
  if (housing.damage === 'nenhum' && hoursPassed > 0) {
    const ageRisk = Math.min(0.35, housing.ageDays * 0.008);
    const rainMult = isRaining ? 2.8 : 0.45;
    if (next(rng) < ageRisk * rainMult * Math.min(2, hoursPassed)) {
      if (housing.kind === 'casa') {
        housing.damage = 'goteira';
        alerts.push(
          '🌧️ A chuva abriu buracos no telhado! Sua casa está com GOTEIRA — chame um pedreiro!'
        );
      } else {
        housing.damage = 'infiltracao';
        const downNeighbor = housing.neighbors[0] ?? 'o vizinho de baixo';
        housing.neighborComplaint =
          housing.floor >= 2
            ? `📢 ${downNeighbor} bateu na sua porta reclamando da infiltração pingando no teto dele! Chame um pedreiro!`
            : '💧 Infiltração nas paredes do apartamento! Chame um pedreiro!';
        alerts.push(housing.neighborComplaint);
      }
    }
  }

  // Ongoing leaks / infiltrations make pets grumpy!
  if (housing.damage !== 'nenhum') {
    petMoodPenalty = 4 * hoursPassed;
  }

  return { alerts, petMoodPenalty, rentDue };
}

/** Quotes the Mason's repair price based on your relationship with him. */
export function masonQuotePrice(housing: HousingState, basePrice = 35): number {
  const rel = housing.masonRelation;
  if (rel <= -3) return Math.round(basePrice * 1.85);
  if (rel < 0) return Math.round(basePrice * 1.4);
  if (rel >= 3) return Math.round(basePrice * 0.72);
  return basePrice;
}

/**
 * Hires the Mason (Pedreiro) to fix roof leaks or apartment infiltration.
 * Depending on your relationship with him, he can be cheap & fast (1-2h), normal (3-6h),
 * or expensive, slow (1-3 in-game days!), or even scam you!
 */
export function hireMason(
  housing: HousingState,
  rng: RngState,
  wallet: number,
  basePrice = 35
): { ok: boolean; cost: number; msg: string } {
  if (housing.damage === 'nenhum') {
    return { ok: false, cost: 0, msg: 'Sua moradia não precisa de conserto no momento!' };
  }
  if (housing.activeRepair) {
    return {
      ok: false,
      cost: 0,
      msg: `O pedreiro já está trabalhando (faltam ${housing.activeRepair.hoursRemaining}h do jogo).`,
    };
  }
  const cost = masonQuotePrice(housing, basePrice);
  if (wallet < cost) {
    return { ok: false, cost: 0, msg: `Saldo insuficiente! O pedreiro cobrou ${cost} moedas.` };
  }
  const rel = housing.masonRelation;
  let hours = int(rng, 3, 6);
  let scammed = false;
  let note = 'Serviço padrão em andamento.';
  if (rel >= 3) {
    hours = int(rng, 1, 2);
    note = 'Pedreiro amigo — serviço rápido e caprichado!';
  } else if (rel <= -2) {
    hours = int(rng, 24, 60); // 1 to 2.5 in-game days!
    scammed = next(rng) < 0.45;
    note = scammed
      ? 'Pedreiro desconfiado... parece que vai te enrolar dias!'
      : 'Pedreiro mal-humorado — vai demorar dias do jogo para terminar.';
  }
  housing.activeRepair = { paid: cost, hoursRemaining: hours, scammed, note };
  return {
    ok: true,
    cost,
    msg: `👷 Pedreiro contratado por ${cost} moedas! Previsão: ${hours}h do jogo. (${note})`,
  };
}
