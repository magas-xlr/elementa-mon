import { CARDS, getCard } from '../data/cards';
import { RELICS } from '../data/relics';
import { canAddCard } from '../rules/deck';
import { fighterFromPet, type BattleState, createBattle } from '../rules/battle';
import { createPet, gainPetXp, petStats, type PetInstance } from '../rules/progression';
import { createRng, int, next, pick, randomSeed, shuffle, type RngState } from '../rules/rng';
import {
  createEncounter,
  generateFloor,
  type Encounter,
  type EncounterKind,
  type FloorMap,
  type Point,
} from '../rules/world';

/** One attempt (run). Everything here is lost on defeat; only player XP persists. */
export interface RunState {
  seed: number;
  rng: RngState;
  floor: number;
  map: FloorMap;
  pos: Point;
  party: PetInstance[];
  deck: string[];
  relics: string[];
  potions: number;
  xpEarned: number;
  battlesWon: number;
  playerLevel: number;
}

export function startRun(
  speciesIds: string[],
  deck: string[],
  playerLevel: number,
  seed = randomSeed()
): RunState {
  const map = generateFloor(seed, 1);
  return {
    seed,
    rng: createRng(seed ^ 0x9e3779b9),
    floor: 1,
    map,
    pos: { ...map.start },
    party: speciesIds.map((id) => createPet(id)),
    deck: [...deck],
    relics: [],
    potions: 1,
    xpEarned: 0,
    battlesWon: 0,
    playerLevel,
  };
}

export function nextFloor(run: RunState): void {
  run.floor += 1;
  run.map = generateFloor(run.seed, run.floor);
  run.pos = { ...run.map.start };
}

export function relicBonus(run: RunState) {
  return {
    attack: run.relics.includes('amuleto') ? 1 : 0,
    defense: run.relics.includes('casco') ? 1 : 0,
  };
}

export function battleFromEncounter(run: RunState, encounter: Encounter): BattleState {
  const bonus = relicBonus(run);
  return createBattle({
    party: run.party.filter((p) => p.hp > 0).map((p) => fighterFromPet(p, 'player', bonus)),
    enemies: encounter.enemies.map((p) => fighterFromPet(p, 'enemy')),
    deck: run.deck,
    seed: int(run.rng, 0, 2 ** 31),
    enemyPower: encounter.enemyPower,
    bonusMana: run.relics.includes('cristal') ? 1 : 0,
    handSize: run.relics.includes('pena') ? 5 : 4,
  });
}

export function encounterFor(run: RunState, kind: EncounterKind): Encounter {
  return createEncounter(run.rng, kind, run.floor, run.playerLevel);
}

/** Copies battle HP back to the run pets. */
export function syncAfterBattle(run: RunState, battle: BattleState): void {
  for (const f of battle.party) {
    const pet = run.party.find((p) => p.uid === f.uid);
    if (pet) pet.hp = f.hp;
  }
}

export interface Reward {
  xp: number;
  evolutions: string[];
  cardChoices: string[];
  recruit?: string;
}

const XP_BY_KIND: Record<EncounterKind, number> = { selvagem: 3, treinador: 5, chefe: 15 };

export function winBattle(run: RunState, battle: BattleState, encounter: Encounter): Reward {
  syncAfterBattle(run, battle);
  run.battlesWon += 1;
  const xp = XP_BY_KIND[encounter.kind];
  run.xpEarned += xp;
  const evolutions: string[] = [];
  for (const pet of run.party) {
    if (pet.hp <= 0) continue;
    if (run.relics.includes('trevo')) pet.hp = Math.min(petStats(pet).maxHp, pet.hp + 2);
    const before = petStats(pet).name;
    const result = gainPetXp(pet, encounter.kind === 'chefe' ? 3 : 1);
    if (result.evolvedTo && result.evolvedTo !== before)
      evolutions.push(`${before} evoluiu para ${result.evolvedTo}!`);
  }
  const recruit =
    encounter.kind === 'selvagem' &&
    run.party.length < 3 &&
    !run.party.some((p) => p.speciesId === encounter.enemies[0].speciesId)
      ? encounter.enemies[0].speciesId
      : undefined;
  return { xp, evolutions, cardChoices: cardChoices(run, 3), recruit };
}

/** Up to `n` distinct cards the deck can still take. */
export function cardChoices(run: RunState, n: number): string[] {
  const options = CARDS.filter((c) => canAddCard(run.deck, c.id, run.playerLevel)).map((c) => c.id);
  return shuffle(run.rng, options).slice(0, n);
}

export function addCard(run: RunState, cardId: string): boolean {
  if (!canAddCard(run.deck, cardId, run.playerLevel)) return false;
  run.deck.push(cardId);
  return true;
}

export function recruit(run: RunState, speciesId: string): void {
  if (run.party.length < 3) run.party.push(createPet(speciesId));
}

export type ChestLoot =
  { kind: 'carta'; cardId: string } | { kind: 'reliquia'; relicId: string } | { kind: 'pocao' };

export function openChest(run: RunState): ChestLoot {
  const roll = next(run.rng);
  const freeRelics = RELICS.filter((r) => !run.relics.includes(r.id));
  if (roll < 0.3 && freeRelics.length) {
    const relic = pick(run.rng, freeRelics);
    run.relics.push(relic.id);
    return { kind: 'reliquia', relicId: relic.id };
  }
  const choices = cardChoices(run, 1);
  if (roll < 0.75 && choices.length) {
    addCard(run, choices[0]);
    return { kind: 'carta', cardId: choices[0] };
  }
  run.potions += 1;
  return { kind: 'pocao' };
}

export function healParty(run: RunState): void {
  for (const pet of run.party) if (pet.hp > 0) pet.hp = petStats(pet).maxHp;
}

export const POTION_HEAL = 5;

export function usePotion(run: RunState, petUid: string): boolean {
  const pet = run.party.find((p) => p.uid === petUid);
  if (!pet || run.potions <= 0 || pet.hp <= 0) return false;
  const max = petStats(pet).maxHp;
  if (pet.hp >= max) return false;
  pet.hp = Math.min(max, pet.hp + POTION_HEAL);
  run.potions -= 1;
  return true;
}

export const partyAlive = (run: RunState) => run.party.some((p) => p.hp > 0);

export const cardName = (id: string) => getCard(id).name;
