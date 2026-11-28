import { elementName, t } from '../../i18n';

export const ELEMENTS = [
  'fogo',
  'agua',
  'eletrico',
  'terra',
  'gelo',
  'venenoso',
  'psiquico',
  'fantasma',
  'fada',
] as const;

export type Element = (typeof ELEMENTS)[number];

export interface ElementInfo {
  name: string;
  icon: string;
  /** Main color used by models, cards and UI (0xRRGGBB). */
  color: number;
}

export const ELEMENT_INFO: Record<Element, ElementInfo> = {
  fogo: { name: 'Fogo', icon: '🔥', color: 0xe8552d },
  agua: { name: 'Água', icon: '💧', color: 0x3b8ee8 },
  eletrico: { name: 'Elétrico', icon: '⚡', color: 0xf2c62f },
  terra: { name: 'Terra', icon: '🪨', color: 0x9a6b3c },
  gelo: { name: 'Gelo', icon: '❄️', color: 0x8fe3f0 },
  venenoso: { name: 'Venenoso', icon: '☠️', color: 0x9b4fc7 },
  psiquico: { name: 'Psíquico', icon: '🔮', color: 0xe85fa8 },
  fantasma: { name: 'Fantasma', icon: '👻', color: 0x6a5acd },
  fada: { name: 'Fada', icon: '🧚', color: 0xf5a3d0 },
};

export const elementLabel = (e: Element): string => elementName(e) ?? ELEMENT_INFO[e].name;

/**
 * Damage percentage of an attack of the row element against a defender of the column element.
 * Copied from the wiki table ("Tabela de Vantagens e Desvantagens Elementais"), where the row is
 * the attacker: Água vs Fogo = 150% matches "Água vence Fogo".
 * Column order follows ELEMENTS.
 */
const DAMAGE_TABLE: Record<Element, readonly number[]> = {
  fogo: [100, 30, 70, 50, 40, 60, 80, 90, 110],
  agua: [150, 100, 50, 60, 130, 80, 70, 80, 120],
  eletrico: [130, 150, 100, 60, 90, 80, 75, 80, 100],
  terra: [120, 110, 90, 100, 80, 70, 100, 100, 90],
  gelo: [130, 70, 100, 130, 100, 100, 100, 80, 70],
  venenoso: [70, 90, 90, 100, 100, 100, 85, 80, 140],
  psiquico: [80, 90, 80, 100, 90, 85, 100, 120, 80],
  fantasma: [110, 110, 100, 100, 120, 90, 70, 100, 100],
  fada: [100, 130, 100, 100, 130, 60, 120, 100, 100],
};

/** Multiplier (1 = 100%) for an attack of `attacker` element hitting a `defender` element. */
export function elementMultiplier(attacker: Element, defender: Element): number {
  return DAMAGE_TABLE[attacker][ELEMENTS.indexOf(defender)] / 100;
}

/** Elements this attacker hits for more than 100%, strongest first. */
export function strongAgainst(attacker: Element): Element[] {
  return ELEMENTS.filter((e) => elementMultiplier(attacker, e) > 1).sort(
    (a, b) => elementMultiplier(attacker, b) - elementMultiplier(attacker, a)
  );
}

/** Attacking elements that deal more than 100% to this defender, strongest first. */
export function weakAgainst(defender: Element): Element[] {
  return ELEMENTS.filter((e) => elementMultiplier(e, defender) > 1).sort(
    (a, b) => elementMultiplier(b, defender) - elementMultiplier(a, defender)
  );
}

/** A pet is neutral until an element crystal transforms it, or radioactive from nuclear exposure. */
export type PetElement = Element | 'neutro' | 'radioativo';

export const NEUTRAL_INFO: ElementInfo = { name: 'Neutro', icon: '✦', color: 0xc9bfae };
export const RADIOACTIVE_INFO: ElementInfo = { name: 'Radioativo', icon: '☢️', color: 0x76ff03 };

export const petElementInfo = (e: PetElement): ElementInfo =>
  e === 'neutro' ? NEUTRAL_INFO : e === 'radioativo' ? RADIOACTIVE_INFO : ELEMENT_INFO[e];

export const petElementLabel = (e: PetElement): string =>
  e === 'neutro' ? t('neutral') : e === 'radioativo' ? 'Radioativo' : elementLabel(e);

/** Like elementMultiplier, but neutral and radioactive fighters are always 100%. */
export function petMultiplier(attacker: PetElement, defender: PetElement): number {
  return attacker === 'neutro' ||
    defender === 'neutro' ||
    attacker === 'radioativo' ||
    defender === 'radioativo'
    ? 1
    : elementMultiplier(attacker, defender);
}
