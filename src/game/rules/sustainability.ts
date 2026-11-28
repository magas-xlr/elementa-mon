import { BIOMES } from '../data/biomes';
import { STORY_NPCS } from '../data/npcs';

/**
 * Environmental Sustainability, Governance & Auditing:
 * - Urban & Rural environmental maintenance
 * - Per-neighborhood Natural Preservation Reserves (Preservação Natural)
 * - RSA (Responsabilidade Socioambiental) laws enforced on BOTH Protagonist & NPCs
 * - Raw Material ESG (Environmental, Social, Governance) scoring
 * - Cleaner Production (Produção Mais Limpa / P+L) verification
 * - Shop vs Factory waste generation ranking (lowest-waste audit)
 */

export type MaintenanceZone = 'urbano' | 'rural';

export interface RsaLaw {
  id: string;
  code: string;
  title: string;
  desc: string;
  fine: number;
}

export const RSA_LAWS: readonly RsaLaw[] = [
  {
    id: 'rsa_01',
    code: 'RSA-01',
    title: 'Limite de Emissão de Carbono (CO₂)',
    desc: 'Protagonista e NPCs devem limitar geradores/veículos de alto CO₂.',
    fine: 25,
  },
  {
    id: 'rsa_02',
    code: 'RSA-02',
    title: 'Coleta Seletiva & Descarte Correto',
    desc: 'Obrigatório separar orgânicos, recicláveis e usar o Depósito Especial.',
    fine: 20,
  },
  {
    id: 'rsa_03',
    code: 'RSA-03',
    title: 'Preservação de Fauna & Reservas',
    desc: 'Proibida a caça predatória e a devastação de habitats naturais.',
    fine: 30,
  },
];

export interface RawMaterialEsg {
  id: string;
  name: string;
  icon: string;
  /** Environmental, Social & Governance scores (0..100). */
  e: number;
  s: number;
  g: number;
  cleanerProduction: boolean;
}

export const RAW_MATERIALS_ESG: readonly RawMaterialEsg[] = [
  {
    id: 'bambu_organico',
    name: 'Bambu Orgânico Local',
    icon: '🎋',
    e: 95,
    s: 90,
    g: 88,
    cleanerProduction: true,
  },
  {
    id: 'madeira_certificada',
    name: 'Madeira Certificada',
    icon: '🪵',
    e: 90,
    s: 88,
    g: 92,
    cleanerProduction: true,
  },
  {
    id: 'plastico_reciclado',
    name: 'Polímero Reciclado',
    icon: '♻️',
    e: 80,
    s: 82,
    g: 80,
    cleanerProduction: true,
  },
  {
    id: 'cimento_verde',
    name: 'Cimento Baixo-Carbono',
    icon: '🧱',
    e: 72,
    s: 80,
    g: 82,
    cleanerProduction: true,
  },
  {
    id: 'madeira_clandestina',
    name: 'Madeira Clandestina',
    icon: '🪓',
    e: 15,
    s: 20,
    g: 10,
    cleanerProduction: false,
  },
  {
    id: 'carvao_mineral',
    name: 'Carvão Mineral (CO₂)',
    icon: '🪨',
    e: 8,
    s: 30,
    g: 25,
    cleanerProduction: false,
  },
];

export function esgScoreOf(m: RawMaterialEsg): { score: number; grade: string } {
  const score = Math.round((m.e + m.s + m.g) / 3);
  const grade =
    score >= 85 ? 'A+' : score >= 75 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D';
  return { score, grade };
}

export interface ProducerWasteProfile {
  id: string;
  name: string;
  kind: 'loja' | 'fabrica';
  icon: string;
  /** Grams of waste generated per unit produced/sold (lower = cleaner!). */
  wastePerUnit: number;
  esgScore: number;
  cleanerProduction: boolean;
}

export const PRODUCERS_WASTE_AUDIT: readonly ProducerWasteProfile[] = [
  {
    id: 'reparo',
    name: 'Casa de Reparo (Mestre Jonas)',
    kind: 'loja',
    icon: '🔧',
    wastePerUnit: 2,
    esgScore: 96,
    cleanerProduction: true,
  },
  {
    id: 'horta_emporio',
    name: 'Empório Orgânico & Sementes',
    kind: 'loja',
    icon: '🍎',
    wastePerUnit: 8,
    esgScore: 89,
    cleanerProduction: true,
  },
  {
    id: 'livraria',
    name: 'Livraria Elemental (Papel Reciclado)',
    kind: 'loja',
    icon: '📚',
    wastePerUnit: 12,
    esgScore: 84,
    cleanerProduction: true,
  },
  {
    id: 'minhaloja',
    name: 'Minha Lojinha',
    kind: 'loja',
    icon: '🏪',
    wastePerUnit: 18,
    esgScore: 76,
    cleanerProduction: true,
  },
  {
    id: 'boutique',
    name: 'Boutique & Salão',
    kind: 'loja',
    icon: '👗',
    wastePerUnit: 26,
    esgScore: 68,
    cleanerProduction: false,
  },
  {
    id: 'fabrica_doces',
    name: 'Fábrica de Ultraprocessados',
    kind: 'fabrica',
    icon: '🏭',
    wastePerUnit: 74,
    esgScore: 28,
    cleanerProduction: false,
  },
  {
    id: 'montadora_v12',
    name: 'Fábrica Montadora de Carros V12',
    kind: 'fabrica',
    icon: '🚗',
    wastePerUnit: 120,
    esgScore: 18,
    cleanerProduction: false,
  },
];

/** Returns shops & factories sorted from LOWEST waste generation to highest! */
export function rankLowestWasteProducers(filterKind?: 'loja' | 'fabrica'): ProducerWasteProfile[] {
  const list = filterKind
    ? PRODUCERS_WASTE_AUDIT.filter((p) => p.kind === filterKind)
    : [...PRODUCERS_WASTE_AUDIT];
  return list.sort((a, b) => a.wastePerUnit - b.wastePerUnit);
}

/** Verifies whether an item/material meets Cleaner Production (Produção Mais Limpa) criteria. */
export function verifyCleanerProduction(
  ecoDamage: number,
  emitsCarbon = false
): {
  certified: boolean;
  label: string;
} {
  const certified = !emitsCarbon && ecoDamage <= 4;
  return {
    certified,
    label: certified ? '🌿 Selo Produção Mais Limpa (P+L)' : '⚠️ Alto Impacto Ambiental',
  };
}

export interface SustainabilityState {
  urbanMaintenance: number[];
  ruralMaintenance: number[];
  /** True if a Natural Preservation Reserve has been established in this neighborhood/biome. */
  naturalReserves: boolean[];
  /** RSA compliance score (0..100) for the Protagonist. */
  playerRsaScore: number;
  /** RSA compliance score (0..100) for every NPC (all NPCs must comply too!). */
  npcRsaScores: Record<string, number>;
  /** Total RSA fines issued to non-compliant NPCs. */
  npcRsaFinesIssued: number;
}

export function createSustainabilityState(): SustainabilityState {
  const n = BIOMES.length;
  const npcRsaScores: Record<string, number> = {};
  for (const npc of STORY_NPCS) {
    npcRsaScores[npc.id] = npc.alignment.includes('Evil') ? 52 : 84;
  }
  return {
    urbanMaintenance: new Array(n).fill(50),
    ruralMaintenance: new Array(n).fill(50),
    naturalReserves: new Array(n).fill(false),
    playerRsaScore: 85,
    npcRsaScores,
    npcRsaFinesIssued: 0,
  };
}

export const MAINTENANCE_COST = 20;
export const RESERVE_COST = 65;

/** Performs urban or rural environmental maintenance in the current biome. */
export function performMaintenance(
  state: SustainabilityState,
  biomeIndex: number,
  zone: MaintenanceZone,
  wallet: number
): { ok: boolean; cost: number; ecoGain: number; msg: string } {
  if (wallet < MAINTENANCE_COST) {
    return {
      ok: false,
      cost: 0,
      ecoGain: 0,
      msg: `Saldo insuficiente (${MAINTENANCE_COST}) para manutenção ${zone}.`,
    };
  }
  if (zone === 'urbano') {
    state.urbanMaintenance[biomeIndex] = Math.min(
      100,
      (state.urbanMaintenance[biomeIndex] ?? 50) + 20
    );
  } else {
    state.ruralMaintenance[biomeIndex] = Math.min(
      100,
      (state.ruralMaintenance[biomeIndex] ?? 50) + 20
    );
  }
  state.playerRsaScore = Math.min(100, state.playerRsaScore + 5);
  return {
    ok: true,
    cost: MAINTENANCE_COST,
    ecoGain: 8,
    msg:
      zone === 'urbano'
        ? '🏙️ Manutenção Urbana realizada (arborização, drenagem e limpeza · +8🌿 · +5 RSA)!'
        : '🌾 Manutenção Rural realizada (recuperação do solo e mata ciliar · +8🌿 · +5 RSA)!',
  };
}

/** Establishes a permanent Natural Preservation Reserve in a neighborhood/biome! */
export function establishNaturalReserve(
  state: SustainabilityState,
  biomeIndex: number,
  wallet: number
): { ok: boolean; cost: number; msg: string } {
  if (state.naturalReserves[biomeIndex]) {
    return { ok: false, cost: 0, msg: 'Este bairro já possui uma Reserva de Preservação Natural!' };
  }
  if (wallet < RESERVE_COST) {
    return {
      ok: false,
      cost: 0,
      msg: `Saldo insuficiente (${RESERVE_COST}) para criar a Preservação Natural.`,
    };
  }
  state.naturalReserves[biomeIndex] = true;
  state.playerRsaScore = Math.min(100, state.playerRsaScore + 12);
  return {
    ok: true,
    cost: RESERVE_COST,
    msg: '🏞️ Reserva de Preservação Natural criada neste bairro! (+3% saúde ecológica/dia e proteção permanente!)',
  };
}

/**
 * Runs an official RSA Environmental Law audit on BOTH the Protagonist AND all NPCs!
 * Non-compliant citizens (score < 60) are fined and ordered to improve!
 */
export function auditRsaCompliance(
  state: SustainabilityState,
  playerWrongDisposals: number,
  playerCarbonItems: number
): { playerCompliant: boolean; playerFine: number; finedNpcs: string[]; msg: string } {
  const penalty = playerWrongDisposals * 8 + playerCarbonItems * 12;
  state.playerRsaScore = Math.max(0, Math.min(100, state.playerRsaScore - Math.min(25, penalty)));
  const playerCompliant = state.playerRsaScore >= 60;
  const playerFine = playerCompliant ? 0 : 25;

  const finedNpcs: string[] = [];
  for (const npc of STORY_NPCS) {
    const score = state.npcRsaScores[npc.id] ?? 75;
    if (score < 60) {
      finedNpcs.push(npc.name);
      state.npcRsaFinesIssued += 1;
      // Enforced RSA compliance raises NPC's score after sanction
      state.npcRsaScores[npc.id] = Math.min(100, score + 12);
    }
  }
  const msg = playerCompliant
    ? `⚖️ Auditoria RSA: Você está em conformidade (${state.playerRsaScore}%)! NPCs autuados: ${finedNpcs.length ? finedNpcs.join(', ') : 'nenhum'}.`
    : `⚠️ Auditoria RSA: Você violou normas ambientais (${state.playerRsaScore}% · multa −${playerFine})! NPCs autuados: ${finedNpcs.length ? finedNpcs.join(', ') : 'nenhum'}.`;
  return { playerCompliant, playerFine, finedNpcs, msg };
}
