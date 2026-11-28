import { MATERIAL_BUNDLES, prefeituraForBiome, type MaterialSource } from '../data/governance';
import type { Element } from '../data/elements';
import { damageBiomeEcology, type EcoState } from './ecology';
import { next, type RngState } from './rng';

export interface GovernanceState {
  /** Biomes where the player has obtained a Government Building Permit (Alvará). */
  permits: number[];
  /** Construction materials currently owned (certified vs clandestine). */
  materials: { source: MaterialSource; durability: number } | null;
  /** Custom player-built house state (null if not yet built). */
  customHouse: {
    biomeIndex: number;
    quality: MaterialSource;
    condition: number; // 0..100 (at 0 -> collapses!)
    iptuOwed: number;
    unpaidDays: number;
    seizedByCity: boolean;
    collapsed: boolean;
  } | null;
  /** Total elemental neighborhood taxes paid to Prefeituras. */
  totalElementalTaxes: number;
}

export function createGovernanceState(): GovernanceState {
  return {
    permits: [],
    materials: null,
    customHouse: null,
    totalElementalTaxes: 0,
  };
}

/**
 * Natural ecological resilience: healthy/resilient ecosystems (>= 45% health) recover slowly each day!
 * If a biome hits 0%, it is permanently dead and NEVER recovers (not even via the Government!).
 */
export function tickEcologicalResilience(eco: EcoState, daysPassed: number): string[] {
  const alerts: string[] = [];
  if (daysPassed <= 0) return alerts;
  for (let i = 0; i < eco.biomeHealth.length; i++) {
    const h = eco.biomeHealth[i];
    if (h <= 0 || h >= 100) continue;
    if (h >= 45) {
      const pref = prefeituraForBiome(i);
      const gain = pref.resiliencePerDay * daysPassed;
      eco.biomeHealth[i] = Math.min(100, h + gain);
    }
  }
  return alerts;
}

/**
 * Only the Government (Prefeitura) can restore environmental damage!
 * Fails if biome health reached 0% (irreversible!) or is too severely deteriorated (< 10%).
 */
export function governmentRestoreBiome(
  eco: EcoState,
  biomeIndex: number,
  wallet: number
): { ok: boolean; cost: number; msg: string } {
  const pref = prefeituraForBiome(biomeIndex);
  const h = eco.biomeHealth[biomeIndex] ?? 100;
  if (h <= 0) {
    return {
      ok: false,
      cost: 0,
      msg: `💀 Saúde ecológica chegou a 0%! Nem a ${pref.name} consegue restaurar este bioma...`,
    };
  }
  if (h < 10) {
    return {
      ok: false,
      cost: 0,
      msg: `🌫️ Bioma deteriorado demais (${h}%). A prefeitura não consegue mais reverter o estrago!`,
    };
  }
  if (h >= 100) {
    return { ok: false, cost: 0, msg: 'Este bioma já está com 100% de saúde ecológica!' };
  }
  if (wallet < pref.ecoRestoreFee) {
    return {
      ok: false,
      cost: 0,
      msg: `Precisa de ${pref.ecoRestoreFee} moedas para o plano ambiental da ${pref.name}.`,
    };
  }
  eco.biomeHealth[biomeIndex] = Math.min(100, h + 25);
  return {
    ok: true,
    cost: pref.ecoRestoreFee,
    msg: `🏛️ ${pref.name} executou reajuste ambiental! Saúde ecológica subiu para ${eco.biomeHealth[biomeIndex]}%!`,
  };
}

/** Checks if an element is taxed in this biome's neighborhood and returns the tax fee (0 if exempt). */
export function elementalLawTax(biomeIndex: number, element: Element | 'neutro'): number {
  if (element === 'neutro') return 0;
  const pref = prefeituraForBiome(biomeIndex);
  return pref.taxedElements.includes(element) ? pref.elementTaxFee : 0;
}

/** Buys construction materials from Certified Carpentry OR Clandestine Alley Logger! */
export function buyConstructionMaterials(
  gov: GovernanceState,
  eco: EcoState,
  biomeIndex: number,
  source: MaterialSource,
  wallet: number
): { ok: boolean; cost: number; msg: string; ecoWarnings: string[] } {
  const bundle = MATERIAL_BUNDLES[source];
  if (wallet < bundle.basePrice) {
    return {
      ok: false,
      cost: 0,
      msg: `Saldo insuficiente (${bundle.basePrice}) para comprar em ${bundle.seller}.`,
      ecoWarnings: [],
    };
  }
  gov.materials = { source, durability: bundle.durability };
  const ecoWarnings = damageBiomeEcology(eco, biomeIndex, bundle.ecoDamage);
  return {
    ok: true,
    cost: bundle.basePrice,
    msg: `${bundle.icon} Comprou ${bundle.name} (${bundle.seller})! Impacto ambiental: −${bundle.ecoDamage}🌿.`,
    ecoWarnings,
  };
}

/** Builds the player's own house (requires Government Permit + Materials + Mason fee!). */
export function buildCustomHouse(
  gov: GovernanceState,
  biomeIndex: number,
  masonRelation: number,
  wallet: number
): { ok: boolean; cost: number; msg: string } {
  const pref = prefeituraForBiome(biomeIndex);
  if (!gov.permits.includes(biomeIndex)) {
    return {
      ok: false,
      cost: 0,
      msg: `Você precisa primeiro tirar o Alvará de Construção na ${pref.name}!`,
    };
  }
  if (!gov.materials) {
    return {
      ok: false,
      cost: 0,
      msg: 'Compre materiais de construção (Marcenaria Certificada ou Lenhador Clandestino) primeiro!',
    };
  }
  const masonBuildFee = Math.round(80 * (masonRelation < 0 ? 1.4 : masonRelation >= 3 ? 0.8 : 1.0));
  if (wallet < masonBuildFee) {
    return {
      ok: false,
      cost: 0,
      msg: `O pedreiro cobra ${masonBuildFee} moedas para construir a casa.`,
    };
  }
  gov.customHouse = {
    biomeIndex,
    quality: gov.materials.source,
    condition: gov.materials.durability,
    iptuOwed: 0,
    unpaidDays: 0,
    seizedByCity: false,
    collapsed: false,
  };
  gov.materials = null;
  return {
    ok: true,
    cost: masonBuildFee,
    msg: `🏡 Casa construída em ${pref.name} com material ${gov.customHouse.quality}! Lembre-se de pagar o IPTU.`,
  };
}

/** Calculates buyback price set by the Prefeitura when a house was seized for unpaid IPTU. */
export function seizedHouseBuybackPrice(gov: GovernanceState): number {
  const ch = gov.customHouse;
  if (!ch) return 0;
  const pref = prefeituraForBiome(ch.biomeIndex);
  const conditionFactor = Math.max(0.35, ch.condition / 100);
  return Math.max(25, Math.round(110 * conditionFactor * pref.seizureMultiplier) + ch.iptuOwed);
}

/**
 * Advances custom house IPTU billing, seizure if unpaid, and structural collapse risk for cheap materials!
 * Returns `collapsedWithCasualty = true` if a poorly built house collapses on your pets!
 */
export function tickGovernance(
  gov: GovernanceState,
  rng: RngState,
  daysPassed: number,
  isRaining: boolean
): { alerts: string[]; houseCollapsed: boolean } {
  const alerts: string[] = [];
  let houseCollapsed = false;
  const ch = gov.customHouse;
  if (!ch || ch.collapsed || ch.seizedByCity || daysPassed <= 0) {
    return { alerts, houseCollapsed };
  }

  const pref = prefeituraForBiome(ch.biomeIndex);

  // 1. IPTU billing & seizure if left unpaid for 2+ days
  if (ch.iptuOwed > 0) {
    ch.unpaidDays += daysPassed;
    if (ch.unpaidDays >= 2) {
      ch.seizedByCity = true;
      alerts.push(
        `🏛️ Você não pagou o IPTU! A ${pref.name} TOMOU sua casa! Recompre na Prefeitura.`
      );
      return { alerts, houseCollapsed };
    }
  }
  ch.iptuOwed += pref.iptuBase * daysPassed;
  alerts.push(`🏛️ IPTU cobrado pela ${pref.name}: ${ch.iptuOwed} moedas em aberto.`);

  // 2. Structural wear & collapse risk (much higher with clandestine cheap materials!)
  const wear = (ch.quality === 'clandestina' ? 18 : 4) * (isRaining ? 1.8 : 1) * daysPassed;
  ch.condition = Math.max(0, Math.round(ch.condition - wear));
  if (
    ch.condition <= 0 ||
    (ch.quality === 'clandestina' && ch.condition < 20 && next(rng) < 0.45)
  ) {
    ch.collapsed = true;
    ch.condition = 0;
    houseCollapsed = true;
    alerts.push('💥 A casa construída com material barato DESABOU!');
  }

  return { alerts, houseCollapsed };
}
