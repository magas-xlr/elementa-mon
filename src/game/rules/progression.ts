import { colorName } from '../../i18n';
import type { PetElement } from '../data/elements';
import { GENE_TRAITS } from '../data/biodiversity';
import { getSpecies, stageName, type Species } from '../data/species';

export const MAX_PET_LEVEL = 3;
export const BASE_PET_HP = 10;
/** XP a pet needs to reach level 2 and level 3. */
export const PET_XP_TO_LEVEL = [0, 0, 2, 5] as const;

export const MAX_PLAYER_LEVEL = 10;
/** Total XP needed to reach each player level (index = level). */
export const PLAYER_XP_TO_LEVEL = [0, 0, 10, 25, 45, 70, 100, 140, 190, 250, 320] as const;

export const XP_REWARD = { selvagem: 3, treinador: 5, chefe: 15, bioma: 5 } as const;

/** A pet owned during a run. Pets always start a run at level 1 with 10 HP (permadeath). */
export interface PetInstance {
  uid: string;
  speciesId: string;
  level: number;
  xp: number;
  hp: number;
  /** Neutral until an element crystal is used on it; a new crystal swaps the element. */
  element: PetElement;
  /** Daily hunger (0..100). If it reaches 0, the pet starves permanently! */
  hunger?: number;
  /** Happiness & obedience (0..100). Low = disobeys; high (>=80) = +1 ATK/+1 DEF! */
  happiness?: number;
  /** Beauty score (0..100). Higher beauty makes NPCs admire you and go easier in battle! */
  beauty?: number;
  /** Equipped cosmetic outfit icon from the Boutique (e.g. 🎀, 🎩, 👑). */
  outfit?: string;
  /** Sick from a Lab accident: loses HP every game hour until healed at Hospital (or dies!). */
  sick?: boolean;
  /** Lab mishap mutation tag ('mutante', 'geleca', 'zumbi', or fossil 'esqueleto'). */
  mutation?: 'mutante' | 'geleca' | 'zumbi' | 'esqueleto';
  /** Developed depression after donating half HP in Lab Equivalent Exchange: HP halves every in-game day! */
  depressed?: boolean;
  /** Hallucinating from toxic/forbidden substances: ignores commands and may die suddenly out of nowhere! */
  hallucinating?: boolean;
  /** Temporary happiness boost from eating junk food ("besteira"): wears off after a few hours! */
  junkBoost?: number;
  junkBoostHours?: number;
  /** Pollen cycle stacks in battle (>=3 turns pet permanently into a Plant pet!). */
  pollenCount?: number;
  plantForm?: boolean;
  /** Cursed by the Cemetery Witch ritual: randomly swaps battle species/element moveset every battle! */
  cursed?: boolean;
  /** Unique genetic biodiversity trait (from 12 ecological traits). */
  geneTrait?: string;
  /** Accumulated nuclear radiation exposure (0..100+); at 100 the pet mutates into `radioativo`! */
  nuclearExposure?: number;
  /** Permanent HP/ATK/DEF/AGI modifiers from Dojo martial arts training & Lab accidents. */
  hpMod?: number;
  atkMod?: number;
  defMod?: number;
  agiMod?: number;
}

export interface PetStats {
  name: string;
  maxHp: number;
  attack: number;
  defense: number;
}

export interface StatBonus {
  attack?: number;
  defense?: number;
}

let uidCounter = 0;
export function newUid(prefix = 'pet'): string {
  uidCounter += 1;
  return `${prefix}-${uidCounter}-${Math.floor(Math.random() * 1e6)}`;
}

/** Level equals evolution stage: level 2 evolves to stage 2, level 3 to stage 3. */
export function stageOf(level: number): 0 | 1 | 2 {
  return (Math.min(MAX_PET_LEVEL, Math.max(1, level)) - 1) as 0 | 1 | 2;
}

export function statsFor(species: Species, level: number, bonus: StatBonus = {}): PetStats {
  const stage = stageOf(level);
  return {
    name: stageName(species, stage),
    maxHp: BASE_PET_HP + stage * 5,
    attack: species.attack + stage + (bonus.attack ?? 0),
    defense: species.defense + stage + (bonus.defense ?? 0),
  };
}

export function petStats(pet: PetInstance, bonus: StatBonus = {}): PetStats {
  const base = statsFor(getSpecies(pet.speciesId), pet.level, {
    attack: (bonus.attack ?? 0) + (pet.atkMod ?? 0),
    defense: (bonus.defense ?? 0) + (pet.defMod ?? 0),
  });
  return {
    ...base,
    maxHp: Math.max(4, base.maxHp + (pet.hpMod ?? 0)),
    attack: Math.max(1, base.attack),
    defense: Math.max(0, base.defense),
  };
}

export function createPet(
  speciesId: string,
  level = 1,
  element: PetElement = 'neutro'
): PetInstance {
  const species = getSpecies(speciesId);
  const lvl = Math.min(MAX_PET_LEVEL, Math.max(1, level));
  const trait = GENE_TRAITS[(uidCounter + speciesId.length) % GENE_TRAITS.length].id;
  return {
    uid: newUid(),
    speciesId,
    level: lvl,
    xp: PET_XP_TO_LEVEL[lvl],
    hp: statsFor(species, lvl).maxHp,
    element,
    hunger: 100,
    happiness: 72,
    beauty: 20,
    geneTrait: trait,
  };
}

export interface LevelUpResult {
  leveledUp: boolean;
  evolvedTo?: string;
}

/** Adds XP; on level up the pet evolves and its HP grows by the max HP difference. */
export function gainPetXp(pet: PetInstance, amount: number): LevelUpResult {
  if (pet.level >= MAX_PET_LEVEL) return { leveledUp: false };
  const species = getSpecies(pet.speciesId);
  const before = statsFor(species, pet.level);
  pet.xp += amount;
  let leveled = false;
  while (pet.level < MAX_PET_LEVEL && pet.xp >= PET_XP_TO_LEVEL[pet.level + 1]) {
    pet.level += 1;
    leveled = true;
  }
  if (!leveled) return { leveledUp: false };
  const after = statsFor(species, pet.level);
  pet.hp = Math.min(after.maxHp, pet.hp + (after.maxHp - before.maxHp));
  return { leveledUp: true, evolvedTo: after.name };
}

export function playerLevelFor(totalXp: number): number {
  let level = 1;
  for (let l = 2; l <= MAX_PLAYER_LEVEL; l++) {
    if (totalXp >= PLAYER_XP_TO_LEVEL[l]) level = l;
  }
  return level;
}

/** Progress inside the current player level, for the XP bar. */
export function playerLevelProgress(totalXp: number): {
  level: number;
  current: number;
  needed: number;
} {
  const level = playerLevelFor(totalXp);
  if (level >= MAX_PLAYER_LEVEL) return { level, current: 1, needed: 1 };
  const base = PLAYER_XP_TO_LEVEL[level];
  return { level, current: totalXp - base, needed: PLAYER_XP_TO_LEVEL[level + 1] - base };
}

/** Avatar colors unlocked by player level (customization screen). */
export const AVATAR_COLORS: readonly { color: number; name: string; level: number }[] = [
  { color: 0xd94a4a, name: 'Vermelho', level: 1 },
  { color: 0x3a6fd9, name: 'Azul', level: 1 },
  { color: 0x3fa34d, name: 'Verde', level: 2 },
  { color: 0xf2b134, name: 'Amarelo', level: 3 },
  { color: 0x9b59d0, name: 'Roxo', level: 4 },
  { color: 0x222222, name: 'Preto', level: 6 },
  { color: 0xf4f4f4, name: 'Branco', level: 8 },
  { color: 0xffc0e0, name: 'Rosa Lendário', level: 10 },
];

export const avatarColorName = (index: number): string =>
  colorName(index) ?? AVATAR_COLORS[index].name;
