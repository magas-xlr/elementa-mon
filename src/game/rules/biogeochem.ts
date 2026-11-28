import { createPet, type PetInstance } from './progression';
import { next, pick, type RngState } from './rng';
import { ELEMENTS, type Element } from '../data/elements';
import { SPECIES } from '../data/species';

/**
 * Earth's Biogeochemical Cycles:
 * - Permafrost: random ice-element transformation when crossing permafrost zones!
 * - Pollen: pets that release lots of pollen in battles permanently turn into Plant pets!
 * - Seeds: buy seeds, plant & harvest your own healthy food at home (zero factory eco damage)!
 * - Fossils: collect all 3 dinosaur bones -> Lab revives as Skeleton Dinosaur ->
 *   Cemetery Witch restores to living pet (high chance of becoming Cursed = random species/element moves every battle!).
 */

export interface SeedDef {
  id: string;
  name: string;
  icon: string;
  price: number;
  growHours: number;
  hungerRestore: number;
  happinessRestore: number;
  desc: string;
}

export const SEEDS: readonly SeedDef[] = [
  {
    id: 'semente_fruta',
    name: 'Semente de Fruta Orgânica',
    icon: '🌱',
    price: 8,
    growHours: 3,
    hungerRestore: 45,
    happinessRestore: 12,
    desc: 'Cresce em 3h na sua horta caseira! Alimento próprio sem poluição.',
  },
  {
    id: 'semente_raiz',
    name: 'Semente de Raiz Nutritiva',
    icon: '🥕',
    price: 12,
    growHours: 4,
    hungerRestore: 70,
    happinessRestore: 15,
    desc: 'Cresce em 4h e alimenta muito bem (+70 fome, 0 poluição!).',
  },
];

export const getSeed = (id: string): SeedDef => SEEDS.find((s) => s.id === id) ?? SEEDS[0];

export interface PlantedCrop {
  id: string;
  seedId: string;
  hoursRemaining: number;
}

export type FossilBone = 'cranio' | 'costelas' | 'cauda';
export const ALL_FOSSIL_BONES: readonly FossilBone[] = ['cranio', 'costelas', 'cauda'];

export interface BiogeochemState {
  /** Seeds carried ready to plant in your home garden. */
  seeds: Record<string, number>;
  /** Active crops growing at your house. */
  garden: PlantedCrop[];
  /** Harvested homegrown organic food ready to feed pets for free! */
  homeFood: number;
  /** Collected dinosaur fossil bones (need all 3 to revive a Skeleton Dinosaur at the Lab!). */
  fossilBones: Partial<Record<FossilBone, number>>;
}

export function createBiogeochemState(): BiogeochemState {
  return {
    seeds: { semente_fruta: 1 },
    garden: [],
    homeFood: 0,
    fossilBones: {},
  };
}

export function hasCompleteDinosaurFossil(bio: BiogeochemState): boolean {
  return ALL_FOSSIL_BONES.every((b) => (bio.fossilBones[b] ?? 0) >= 1);
}

/** Finds a random fossil bone while exploring or digging. */
export function findRandomFossilBone(bio: BiogeochemState, rng: RngState): FossilBone {
  const missing = ALL_FOSSIL_BONES.filter((b) => !(bio.fossilBones[b] ?? 0));
  const bone = missing.length ? pick(rng, missing) : pick(rng, ALL_FOSSIL_BONES);
  bio.fossilBones[bone] = (bio.fossilBones[bone] ?? 0) + 1;
  return bone;
}

/** Permafrost event: crossing a permafrost region can randomly transform a pet into Ice ('gelo')! */
export function checkPermafrostEvent(
  party: PetInstance[],
  rng: RngState,
  inPermafrostZone: boolean
): string | null {
  if (!inPermafrostZone || !party.length) return null;
  if (next(rng) >= 0.16) return null;
  const candidate = party.find((p) => p.element !== 'gelo');
  if (!candidate) return null;
  candidate.element = 'gelo';
  return `🧊 Evento de Permafrost! O frio ancestral congelou seu pet e o transformou em tipo GELO!`;
}

/** Pollen cycle: pets releasing heavy pollen in battles permanently transform into Plant pets! */
export function recordPetPollen(pet: PetInstance): string | null {
  if (pet.plantForm) return null;
  pet.pollenCount = (pet.pollenCount ?? 0) + 1;
  if (pet.pollenCount >= 3) {
    pet.plantForm = true;
    pet.element = 'fada';
    return `🌼 Ciclo do Pólen! De tanto soltar pólen em batalha, seu pet virou permanentemente um PET PLANTA!`;
  }
  return null;
}

/** Lab revives a complete Dinosaur Fossil (all 3 bones) as a 💀 Skeleton Dinosaur pet! */
export function reviveDinosaurSkeleton(bio: BiogeochemState): PetInstance | null {
  if (!hasCompleteDinosaurFossil(bio)) return null;
  for (const b of ALL_FOSSIL_BONES) {
    bio.fossilBones[b] = Math.max(0, (bio.fossilBones[b] ?? 1) - 1);
  }
  const dino = createPet('casquinho', 1, 'fantasma');
  dino.mutation = 'esqueleto';
  dino.atkMod = 2;
  dino.defMod = 1;
  return dino;
}

/**
 * Cemetery Witch ritual: turns a 💀 Skeleton Dinosaur back into a normal living pet,
 * with a HIGH chance (65%) of becoming 🔮 Cursed (randomly swaps battle species/element each battle!).
 */
export function witchRestoreSkeletonPet(
  pet: PetInstance,
  rng: RngState
): { ok: boolean; cursed: boolean; msg: string } {
  if (pet.mutation !== 'esqueleto') {
    return {
      ok: false,
      cursed: false,
      msg: 'A Bruxa só realiza este ritual em pets Dinossauro Esqueleto!',
    };
  }
  pet.mutation = undefined;
  pet.element = 'terra';
  const cursed = next(rng) < 0.65;
  if (cursed) {
    pet.cursed = true;
    return {
      ok: true,
      cursed: true,
      msg: '🔮 A Bruxa trouxe o dinossauro de volta à vida... mas ele veio AMALDIÇOADO! A cada batalha ele agirá como uma espécie/elemento aleatório!',
    };
  }
  return {
    ok: true,
    cursed: false,
    msg: '✨ Milagre sombrio! A Bruxa transformou o dinossauro esqueleto em um pet vivo e normal!',
  };
}

/** For a Cursed pet, picks a random species & element behavior for the current battle! */
export function rollCursedBattleIdentity(
  pet: PetInstance,
  rng: RngState
): { speciesId: string; element: Element } {
  if (!pet.cursed) {
    return {
      speciesId: pet.speciesId,
      element: pet.element === 'neutro' || pet.element === 'radioativo' ? 'terra' : pet.element,
    };
  }
  return {
    speciesId: pick(rng, SPECIES).id,
    element: pick(rng, ELEMENTS),
  };
}
