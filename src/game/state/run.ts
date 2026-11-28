import { t } from '../../i18n';
import { CARDS, getCard } from '../data/cards';
import { RELICS } from '../data/relics';
import { canAddCard, MAX_PARTY } from '../rules/deck';
import { fighterFromPet, type BattleState, createBattle } from '../rules/battle';
import { createPet, gainPetXp, petStats, type PetInstance } from '../rules/progression';
import { createRng, int, next, pick, randomSeed, shuffle, type RngState } from '../rules/rng';
import { BIOMES } from '../data/biomes';
import type { Element, PetElement } from '../data/elements';
import { HOSPITAL_COST, type ShopItem } from '../data/shops';
import { getJob, getJobItem } from '../data/jobs';
import { SPECIES } from '../data/species';
import { createEconomyState, localPrice, tickEconomy, type EconomyState } from '../rules/economy';
import {
  computeLabAccidentChance,
  createEcoState,
  damageBiomeEcology,
  labCatalystForBiome,
  MISHAP_OUTCOMES,
  shopRelationPriceFactor,
  type EcoState,
  type LabOutcomeKind,
  type WeatherKind,
} from '../rules/ecology';
import {
  createHousingState,
  hireMason,
  moveToApartment,
  tickHousing,
  type HousingState,
} from '../rules/housing';
import {
  buildCustomHouse,
  buyConstructionMaterials,
  createGovernanceState,
  elementalLawTax,
  governmentRestoreBiome,
  seizedHouseBuybackPrice,
  tickEcologicalResilience,
  tickGovernance,
  type GovernanceState,
} from '../rules/governance';
import { prefeituraForBiome, type MaterialSource } from '../data/governance';
import {
  createGamblingState,
  dailyMatchup,
  placePetBattleBet,
  type GamblingState,
} from '../rules/gambling';
import {
  checkChaoticEvilNightRobbery,
  createSocialState,
  getCar,
  recordLuxuryGain,
  totalPlayerStatus,
  type SocialState,
} from '../rules/social';
import {
  computeUtilityImpact,
  createUtilityState,
  discardItemInBin,
  disposeItemLifecycle,
  getAppliance,
  type RecyclingBin,
  type UtilityState,
} from '../rules/utilities';
import {
  applyDojoGraduation,
  getMartialArt,
  type DojoSlot,
  type MartialArtId,
} from '../rules/dojo';
import {
  checkPermafrostEvent,
  createBiogeochemState,
  findRandomFossilBone,
  getSeed,
  recordPetPollen,
  reviveDinosaurSkeleton,
  rollCursedBattleIdentity,
  witchRestoreSkeletonPet,
  type BiogeochemState,
} from '../rules/biogeochem';
import {
  buildProtagonistMirrorBoss,
  checkSewerUnlock,
  createSewerQuestState,
  type SewerQuestState,
} from '../rules/sewerQuest';
import {
  createNgoState,
  joinNgo,
  recordWildSpeciesKill,
  recoverExtinctSpecies,
  recruitToNgo,
  resolveNgoFine,
  type NgoId,
  type NgoState,
} from '../rules/ngos';
import {
  createLitterState,
  groundLitterEcoDamage,
  PACKING_BOX_PRICE,
  pickupLitterFromGround,
  recycleLitter,
  type DisposalTarget,
  type LitterState,
} from '../rules/litter';
import {
  createEnvironmentSimState,
  doEnvironmentalMilitancy,
  drinkBiomeWater,
  makeCompost,
  MAX_INVENTORY_ITEMS,
  protestWithNgoAtCityHall,
  repairBagacoItem,
  tickEnvironmentSim,
  type EnvironmentSimState,
} from '../rules/environment';
import {
  createBusinessState,
  fireEmployee,
  hireHumanEmployee,
  installShopRobot,
  runShopShift,
  treatEmployee,
  type BusinessState,
} from '../rules/business';
import {
  auditRsaCompliance,
  createSustainabilityState,
  establishNaturalReserve,
  performMaintenance,
  type MaintenanceZone,
  type SustainabilityState,
} from '../rules/sustainability';
import {
  clearLandLot,
  createClimateState,
  emitCo2,
  emitMethane,
  extractMinerals,
  globalTempDeltaC,
  isExtremeHeat,
  sellAllMinerals,
  talkToConspiracyLeader,
  type ClimateState,
} from '../rules/climate';
import {
  buildHydroelectricDam,
  chopTreeOnMap,
  createBiosphereState,
  replantTreeOnMap,
  seasonForDay,
  type BiosphereState,
} from '../rules/biosphere';
import {
  createEnergyGridState,
  energySourceForBiome,
  exposePetsToNuclearRadiation,
  installBiomeEnergyPlant,
  type EnergyGridState,
  type EnergySourceId,
} from '../rules/energy';
import {
  computeAnthropoceneIndex,
  createHydroClimateState,
  improveBiomeSanitation,
  tickHydroClimate,
  type AnthropoceneReport,
  type HydroClimateState,
} from '../rules/hydroRisk';
import {
  createFlyerState,
  distributePlayerFlyers,
  maybeTriggerApartmentBroker,
  type FlyerCampaignKind,
  type FlyerState,
} from '../rules/flyers';
import { STORY_NPCS } from '../data/npcs';
import {
  advanceClock,
  CATASTROPHES,
  createClock,
  happinessBonus,
  isNight,
  type GameClock,
} from '../rules/life';
import {
  biomeAt,
  createEncounter,
  generateWorld,
  setTile,
  type Encounter,
  type EncounterKind,
  type Point,
  type WorldMap,
} from '../rules/world';

export interface LabPod {
  id: string;
  pet: PetInstance;
  targetElement: Element;
  hoursRemaining: number;
  totalHours: number;
}

export const LAB_GENES_NEEDED = 3;
export const LAB_HOURS = 4;
export const LAB_FEE = 40;
export const RESURRECT_FEE = 60;
export const RESURRECT_MACABRE_NEEDED = 2;
export const MACABRE_ITEM_PRICE = 25;

export interface GraveEntry {
  id?: string;
  name: string;
  speciesId?: string;
  level?: number;
  element?: PetElement;
  cause: string;
  day: number;
}

/** One attempt (run). Everything here is lost on defeat; only player XP persists. */
export interface RunState {
  seed: number;
  rng: RngState;
  map: WorldMap;
  pos: Point;
  /** Biome indexes discovered so far, in order of discovery. */
  visited: number[];
  /** Element crystals carried (element → count). */
  crystals: Partial<Record<Element, number>>;
  /** Active battle party (up to MAX_PARTY = 4 pets). */
  party: PetInstance[];
  /** Unlimited storage bench ("Banco") for captured or reserved pets. */
  bench: PetInstance[];
  /** The 1 active pet from the party that physically follows the protagonist in the overworld. */
  activePetUid: string | null;
  deck: string[];
  relics: string[];
  potions: number;
  xpEarned: number;
  battlesWon: number;
  playerLevel: number;
  /** The Sims-style in-game clock (days & hours). */
  clock: GameClock;
  /** Gold coins for Town Shops (Food, Outfits, Beauty, Hospital, Books). */
  coins: number;
  /** Fallen pets memorial (can only return as Zombie via Equivalent Exchange at the Lab!). */
  graveyard: GraveEntry[];
  /** Macabre ritual items (🕯️ Vela Negra, 🦴 Osso Antigo, 🩸 Essência Sombria) for Lab resurrection. */
  macabreItems: number;
  /** Special quest items carried for NPC Jobs ("Trabalhos"). */
  jobItems: Record<string, number>;
  /** Accepted NPC job IDs. */
  activeJobs: string[];
  /** Completed NPC job IDs. */
  completedJobs: string[];
  /** 7-biome economy: regional wallets, bank deposits, stock market, exchange rates & player shop. */
  economy: EconomyState;
  /** Elemental genes extracted from elemental foods, potions, outfits & crystals for the Lab. */
  elementGenes: Partial<Record<Element, number>>;
  /** Pets currently incubating inside the Transmodification Lab for permanent elemental form! */
  labPods: LabPod[];
  /** Environmental health, weather, shopkeeper/lab relationships, production demand & pet statues. */
  eco: EcoState;
  /** Player housing (house or rented/bought apartment, aging, rain leaks/infiltration & Mason service). */
  housing: HousingState;
  /** Biome City Halls (Prefeituras), building permits, certified/clandestine construction, IPTU & elemental laws. */
  gov: GovernanceState;
  /** Pet Battle Betting House state (1 bet/day, any wager, gambling addiction title). */
  gambling: GamblingState;
  /** Cars (exclusive fast travel), luxury status, NPC status/inter-NPC status & Chaotic Evil envy/robbery. */
  social: SocialState;
  /** Home water & energy bills, owned appliances/items, carbon gas & selective recycling bins. */
  utilities: UtilityState;
  /** Pets currently training at the Martial Arts Dojo (Karate, Muay Thai, Judô, Kung Fu). */
  dojoSlots: DojoSlot[];
  /** Biogeochemical cycles: permafrost, pollen, homegrown seeds/garden & dinosaur fossils! */
  biogeochem: BiogeochemState;
  /** Secret 64 Talking Monsters & Cyberpunk Sewer Underworld quest (unlocks after 8 bosses!). */
  sewer: SewerQuestState;
  /** NGOs (ONGs), species extinction tracking, anti-poaching fines & Prison Game Over. */
  ngo: NgoState;
  /** Ground litter, selective recycling bins, special E-waste/battery/glass depot & packing boxes. */
  litter: LitterState;
  /** Organic waste, composting, city landfills, soil/water contamination, hydration, militancy & bagaço. */
  envSim: EnvironmentSimState;
  /** Player business economy: human employees, salaries, gossip, cheaper error-prone robots & banned customers. */
  business: BusinessState;
  /** If an NPC likes you too much (bond >= 7), they become an obsessive Stalker who follows you! */
  stalkerNpcId: string | null;
  /** Urban/Rural maintenance, Natural Preservation Reserves, RSA compliance & ESG auditing. */
  sustainability: SustainabilityState;
  /** Global warming (CO2, extreme heat), 4th-wall climate-denial society, land clearing & mineral extraction. */
  climate: ClimateState;
  /** Forest fragmentation (chop/replant), endemism/microendemism, hydroelectric dams & 4 seasons! */
  biosphere: BiosphereState;
  /** Neighborhood energy grid (8 power plant types + nuclear radiation mutation). */
  energy: EnergyGridState;
  /** Dam failure risk, prolonged drought (estiagem), heavy rain street floods, diseases & thermal fallback. */
  hydro: HydroClimateState;
  /** Annoying apartment-broker NPCs & player flyer distribution campaigns. */
  flyers: FlyerState;
}

export function startRun(
  speciesIds: string[],
  deck: string[],
  playerLevel: number,
  seed = randomSeed(),
  options?: {
    bossesDefeated?: number;
    prisonCarryover?: {
      pets: PetInstance[];
      relics: string[];
      jobItems: Record<string, number>;
      potions: number;
    } | null;
  }
): RunState {
  const map = generateWorld(seed);
  const carried = options?.prisonCarryover;
  const party =
    carried && carried.pets.length > 0
      ? carried.pets.slice(0, MAX_PARTY).map((p) => ({ ...p, hp: Math.max(1, p.hp) }))
      : speciesIds.slice(0, MAX_PARTY).map((id) => createPet(id));
  const bench = carried && carried.pets.length > MAX_PARTY ? carried.pets.slice(MAX_PARTY) : [];
  return {
    seed,
    rng: createRng(seed ^ 0x9e3779b9),
    map,
    pos: { ...map.start },
    visited: [biomeAt(map, map.start.x, map.start.y)],
    crystals: {},
    party,
    bench,
    activePetUid: party[0]?.uid ?? null,
    deck: [...deck],
    relics: carried ? [...carried.relics] : [],
    potions: carried ? Math.max(1, carried.potions) : 1,
    xpEarned: 0,
    battlesWon: 0,
    playerLevel,
    clock: createClock(1, 8, 0),
    coins: 120,
    graveyard: [],
    macabreItems: 0,
    jobItems: carried ? { ...carried.jobItems } : {},
    activeJobs: ['job_bento'],
    completedJobs: [],
    economy: createEconomyState(120),
    elementGenes: { fogo: 1, agua: 1 },
    labPods: [],
    eco: createEcoState(),
    housing: createHousingState(),
    gov: createGovernanceState(),
    gambling: createGamblingState(),
    social: createSocialState(),
    utilities: createUtilityState(),
    dojoSlots: [],
    biogeochem: createBiogeochemState(),
    sewer: createSewerQuestState(options?.bossesDefeated ?? 0),
    ngo: createNgoState(),
    litter: createLitterState(),
    envSim: createEnvironmentSimState(),
    business: createBusinessState(),
    stalkerNpcId: null,
    sustainability: createSustainabilityState(),
    climate: createClimateState(),
    biosphere: createBiosphereState(),
    energy: createEnergyGridState(),
    hydro: createHydroClimateState(),
    flyers: createFlyerState(),
  };
}

/** Biome the player is standing in. */
export const currentBiome = (run: RunState): number => biomeAt(run.map, run.pos.x, run.pos.y);

/** Moves the player; returns the biome index when it is entered for the first time. */
export function moveTo(run: RunState, x: number, y: number): number | null {
  run.pos = { x, y };
  const biome = currentBiome(run);
  if (run.visited.includes(biome)) return null;
  run.visited.push(biome);
  return biome;
}

/** Picks up the crystal on a tile (it goes to the bag). */
export function takeCrystal(run: RunState, x: number, y: number): Element | null {
  const idx = y * run.map.width + x;
  const element = run.map.loot[idx];
  if (!element) return null;
  delete run.map.loot[idx];
  setTile(run.map, x, y, 'caminho');
  run.crystals[element] = (run.crystals[element] ?? 0) + 1;
  run.elementGenes[element] = (run.elementGenes[element] ?? 0) + 2;
  return element;
}

/**
 * Uses a crystal on a pet: the pet takes that element for the rest of the run. Another crystal
 * swaps it again. Fails without the crystal or when the pet already has that element.
 */
export function applyCrystal(run: RunState, petUid: string, element: Element): boolean {
  const pet = run.party.find((p) => p.uid === petUid);
  if (
    !pet ||
    pet.element === 'radioativo' ||
    (run.crystals[element] ?? 0) <= 0 ||
    pet.element === element
  ) {
    return false;
  }
  pet.element = element;
  run.crystals[element] = (run.crystals[element] ?? 0) - 1;
  if (!run.crystals[element]) delete run.crystals[element];
  return true;
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
    party: run.party
      .filter((p) => p.hp > 0)
      .map((p) => {
        const hb = happinessBonus(p.happiness);
        // Cursed pets randomly swap their battle species/element behavior every battle!
        const effectivePet = p.cursed ? { ...p, ...rollCursedBattleIdentity(p, run.rng) } : p;
        return fighterFromPet(effectivePet, 'player', {
          attack: bonus.attack + hb.attack,
          defense: bonus.defense + hb.defense,
        });
      }),
    enemies: encounter.enemies.map((p) => fighterFromPet(p, 'enemy')),
    deck: run.deck,
    seed: int(run.rng, 0, 2 ** 31),
    enemyPower: encounter.enemyPower + (isNight(run.clock) ? 1 : 0),
    bonusMana: run.relics.includes('cristal') ? 1 : 0,
    handSize: run.relics.includes('pena') ? 5 : 4,
    wild: encounter.kind === 'selvagem',
    // Unlimited bench means the player can ALWAYS capture wild pets (overflow goes straight to bench!)
    captureRoom: 99,
    extremeHeat: isExtremeHeat(run.climate, seasonForDay(run.clock.day).tempShiftC),
  });
}

export function encounterFor(run: RunState, kind: EncounterKind): Encounter {
  return createEncounter(run.rng, kind, currentBiome(run));
}

/** Ensures activePetUid always points to a living pet in the party (or null if empty). */
export function ensureActivePet(run: RunState): PetInstance | null {
  const cur = run.party.find((p) => p.uid === run.activePetUid && p.hp > 0);
  if (cur) return cur;
  const fallback = run.party.find((p) => p.hp > 0) ?? run.party[0] ?? null;
  run.activePetUid = fallback?.uid ?? null;
  return fallback;
}

/** Selects which 1 party pet follows the protagonist in the overworld. */
export function setActivePet(run: RunState, petUid: string): boolean {
  const pet = run.party.find((p) => p.uid === petUid && p.hp > 0);
  if (!pet) return false;
  run.activePetUid = pet.uid;
  return true;
}

/** Moves a pet from party to the unlimited bench (must keep at least 1 pet in party). */
export function moveToBench(run: RunState, petUid: string): boolean {
  if (run.party.length <= 1) return false;
  const idx = run.party.findIndex((p) => p.uid === petUid);
  if (idx < 0) return false;
  const [pet] = run.party.splice(idx, 1);
  run.bench.push(pet);
  ensureActivePet(run);
  return true;
}

/** Moves a pet from the unlimited bench into the active party (up to MAX_PARTY = 4). */
export function moveToParty(run: RunState, petUid: string): boolean {
  if (run.party.length >= MAX_PARTY) return false;
  const idx = run.bench.findIndex((p) => p.uid === petUid);
  if (idx < 0) return false;
  const [pet] = run.bench.splice(idx, 1);
  run.party.push(pet);
  ensureActivePet(run);
  return true;
}

/**
 * Copies battle HP back to the run pets, and wild pets that were petted until they liked the
 * team join the party (up to 4) or overflow into the unlimited bench!
 */
export function syncAfterBattle(run: RunState, battle: BattleState): void {
  for (const f of battle.party) {
    const pet = run.party.find((p) => p.uid === f.uid);
    if (pet) pet.hp = f.hp;
  }
  for (const f of battle.captured) {
    if (run.party.some((p) => p.uid === f.uid) || run.bench.some((p) => p.uid === f.uid)) continue;
    const pet = createPet(f.speciesId, f.level, f.element);
    pet.uid = f.uid;
    if (run.party.length < MAX_PARTY) run.party.push(pet);
    else run.bench.push(pet);
  }
  battle.captured = [];
  ensureActivePet(run);
}

export interface LeveledPet {
  uid: string;
  name: string;
  level: number;
  element: PetElement;
}

export interface Reward {
  xp: number;
  evolutions: string[];
  /** Pets that gained a level this battle — each may optionally swap its element! */
  leveledUp: LeveledPet[];
  cardChoices: string[];
}

/** Swaps a pet's element (available whenever that pet evolves a level; radioactive pets cannot change). */
export function changePetElement(run: RunState, petUid: string, element: PetElement): boolean {
  const pet = run.party.find((p) => p.uid === petUid);
  if (!pet || pet.element === 'radioativo') return false;
  pet.element = element;
  return true;
}

const XP_BY_KIND: Record<EncounterKind, number> = { selvagem: 3, treinador: 5, chefe: 15 };

export function winBattle(run: RunState, battle: BattleState, encounter: Encounter): Reward {
  syncAfterBattle(run, battle);
  run.battlesWon += 1;
  const xp = XP_BY_KIND[encounter.kind];
  run.xpEarned += xp;
  const evolutions: string[] = [];
  const leveledUp: LeveledPet[] = [];
  for (const pet of run.party) {
    if (pet.hp <= 0) continue;
    if (run.relics.includes('trevo')) pet.hp = Math.min(petStats(pet).maxHp, pet.hp + 2);
    const before = petStats(pet).name;
    const result = gainPetXp(pet, encounter.kind === 'chefe' ? 3 : 1);
    if (result.evolvedTo && result.evolvedTo !== before) {
      evolutions.push(t('evolved', { from: before, to: result.evolvedTo }));
      leveledUp.push({
        uid: pet.uid,
        name: result.evolvedTo,
        level: pet.level,
        element: pet.element,
      });
    }
  }
  return { xp, evolutions, leveledUp, cardChoices: cardChoices(run, 3) };
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

export type ChestLoot =
  | { kind: 'carta'; cardId: string }
  | { kind: 'reliquia'; relicId: string }
  | { kind: 'cristal'; element: Element }
  | { kind: 'pocao' };

export function openChest(run: RunState): ChestLoot {
  const roll = next(run.rng);
  const freeRelics = RELICS.filter((r) => !run.relics.includes(r.id));
  // Chests hold the crystals of their own biome.
  if (roll < 0.2) {
    const element = pick(run.rng, BIOMES[currentBiome(run)].elements);
    run.crystals[element] = (run.crystals[element] ?? 0) + 1;
    return { kind: 'cristal', element };
  }
  if (roll < 0.45 && freeRelics.length) {
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
  for (const pet of run.party) {
    if (pet.hp > 0) {
      pet.hp = petStats(pet).maxHp;
      pet.sick = false;
      pet.hallucinating = false;
    }
  }
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

/** Permanently removes any pet that died in battle (0 HP -> graveyard forever!). */
export function buryFallenPets(run: RunState): string[] {
  const deadNames: string[] = [];
  const alivePets: PetInstance[] = [];
  for (const p of run.party) {
    if (p.hp <= 0) {
      const name = petStats(p).name;
      deadNames.push(name);
      run.graveyard.push({
        id: `grave-${Date.now()}-${p.uid}`,
        name,
        speciesId: p.speciesId,
        level: p.level,
        element: p.element,
        cause: 'Batalha',
        day: run.clock.day,
      });
    } else {
      alivePets.push(p);
    }
  }
  run.party = alivePets;
  if (run.party.length === 0 && run.bench.length > 0) {
    run.party.push(run.bench.shift()!);
  }
  ensureActivePet(run);
  return deadNames;
}

/**
 * Advances the Sims clock, drains daily hunger (-4 per game hour), gently decays happiness,
 * checks for starvation death, and rolls rare outdoor catastrophe events (lightning, hurricane, falling tree).
 */
export function tickRunLife(run: RunState, realDt: number, inSafeTown: boolean): string[] {
  const alerts: string[] = [];
  const prevDay = run.clock.day;
  const hours = advanceClock(run.clock, realDt);
  if (hours <= 0) return alerts;
  const daysPassed = Math.max(0, run.clock.day - prevDay);

  // Daily half-life HP decay for depressed pets (meia-vida: HP cai pela metade a cada dia!)
  for (let d = 0; d < daysPassed; d++) {
    const stillAlive: PetInstance[] = [];
    for (const p of run.party) {
      if (p.depressed) {
        p.hp = Math.floor(p.hp / 2);
        const name = petStats(p).name;
        if (p.hp <= 0) {
          run.graveyard.push({
            id: `grave-${Date.now()}-${p.uid}`,
            name,
            speciesId: p.speciesId,
            level: p.level,
            element: p.element,
            cause: 'Depressão (meia-vida)',
            day: run.clock.day,
          });
          alerts.push(`💔 ${name} sucumbiu à depressão profunda...`);
          continue;
        }
        alerts.push(`😢 Depressão (meia-vida): o HP de ${name} caiu pela metade (${p.hp} HP)!`);
      }
      stillAlive.push(p);
    }
    run.party = stillAlive;
  }

  for (let h = 0; h < hours; h++) {
    const survivors: PetInstance[] = [];
    for (const p of run.party) {
      p.hunger = Math.max(0, (p.hunger ?? 100) - 4);
      p.happiness = Math.max(0, (p.happiness ?? 72) - 1);
      if (p.sick) {
        p.hp = Math.max(0, p.hp - 2);
        if (p.hp <= 0) {
          const name = petStats(p).name;
          run.graveyard.push({ name, cause: 'Doença do Laboratório', day: run.clock.day });
          alerts.push(`🤒 ${name} não resistiu à doença do Laboratório e morreu para sempre...`);
          continue;
        }
      }
      if (p.hallucinating && next(run.rng) < 0.08) {
        const name = petStats(p).name;
        run.graveyard.push({
          id: `grave-${Date.now()}-${p.uid}`,
          name,
          speciesId: p.speciesId,
          level: p.level,
          element: p.element,
          cause: 'Substância tóxica / alucinação',
          day: run.clock.day,
        });
        alerts.push(`💀 ${name} estava alucinando e morreu do absoluto nada...`);
        continue;
      }
      if (p.hunger <= 0) {
        const name = petStats(p).name;
        run.graveyard.push({ name, cause: 'Fome', day: run.clock.day });
        alerts.push(`💔 ${name} morreu de fome para sempre...`);
      } else {
        if (p.hunger <= 20 && p.hunger > 16) {
          alerts.push(`🍽️ ${petStats(p).name} está com muita fome! Alimente-o na loja!`);
        }
        survivors.push(p);
      }
    }
    run.party = survivors;

    // Rare random catastrophe outdoors (~0.6% per game hour when outside the village)
    if (!inSafeTown && run.party.length > 0 && next(run.rng) < 0.006) {
      const victimIdx = int(run.rng, 0, run.party.length - 1);
      const victim = run.party[victimIdx];
      const disaster = pick(run.rng, CATASTROPHES);
      const name = petStats(victim).name;
      run.party.splice(victimIdx, 1);
      run.graveyard.push({ name, cause: disaster.id, day: run.clock.day });
      alerts.push(`${disaster.message(name)} (Morte permanente)`);
    }
    if (run.party.length === 0 && run.bench.length > 0) {
      run.party.push(run.bench.shift()!);
    }
    ensureActivePet(run);
  }
  const ecoAlerts = tickEconomy(run.economy, run.rng, hours);
  alerts.push(...ecoAlerts);
  // Dynamic weather shifts (including rain that can damage old roofs!)
  if (next(run.rng) < 0.16 * Math.min(3, hours)) {
    const weathers: WeatherKind[] = [
      'ameno',
      'chuva',
      'chuva',
      'frio_extremo',
      'calor_extremo',
      'ventania',
    ];
    run.eco.weather = pick(run.rng, weathers);
  }
  // Housing aging, rain roof leaks / apartment infiltration & Mason repair progress!
  const houseTick = tickHousing(
    run.housing,
    run.rng,
    hours,
    daysPassed,
    run.eco.weather === 'chuva'
  );
  alerts.push(...houseTick.alerts);
  if (houseTick.petMoodPenalty > 0) {
    for (const p of run.party) {
      p.happiness = Math.max(0, (p.happiness ?? 72) - houseTick.petMoodPenalty);
    }
  }
  if (houseTick.rentDue > 0) {
    run.economy.wallets[0] = Math.max(0, run.economy.wallets[0] - houseTick.rentDue);
    run.coins = run.economy.wallets[0];
    alerts.push(`🏢 Aluguel do apartamento pago: −${houseTick.rentDue} FL.`);
  }
  // Natural ecological resilience & City Hall IPTU / cheap-house collapse!
  tickEcologicalResilience(run.eco, daysPassed);
  const govTick = tickGovernance(run.gov, run.rng, daysPassed, run.eco.weather === 'chuva');
  alerts.push(...govTick.alerts);
  if (govTick.houseCollapsed && run.party.length > 0) {
    // If a pet was inside the house when it collapsed, it dies permanently!
    const victim = run.party.pop()!;
    const vName = petStats(victim).name;
    run.graveyard.push({
      id: `grave-${Date.now()}-${victim.uid}`,
      name: vName,
      speciesId: victim.speciesId,
      level: victim.level,
      element: victim.element,
      cause: 'Desabamento da casa (material barato)',
      day: run.clock.day,
    });
    ensureActivePet(run);
    alerts.push(`💔 ${vName} estava dentro da casa quando ela desabou e morreu...`);
  }
  for (const pod of run.labPods) {
    if (pod.hoursRemaining > 0) {
      pod.hoursRemaining = Math.max(0, pod.hoursRemaining - hours);
      if (pod.hoursRemaining === 0) {
        alerts.push(
          `🧬 ${petStats(pod.pet).name} terminou a transmodificação no Laboratório! Volte para buscá-lo!`
        );
      }
    }
  }
  // Temporary junk-food happiness crash wears off after a short time!
  for (const p of run.party) {
    if ((p.junkBoostHours ?? 0) > 0) {
      p.junkBoostHours = Math.max(0, (p.junkBoostHours ?? 0) - hours);
      if (p.junkBoostHours === 0 && (p.junkBoost ?? 0) > 0) {
        const drop = Math.round((p.junkBoost ?? 0) * 1.1);
        p.happiness = Math.max(0, (p.happiness ?? 72) - drop);
        p.junkBoost = 0;
        alerts.push(
          `📉 A satisfação temporária da besteira de ${petStats(p).name} passou (−${drop} 😊)!`
        );
      }
    }
  }
  // Chaotic Evil NPCs with high envy can try to rob you during the night!
  const robbery = checkChaoticEvilNightRobbery(
    run.social,
    run.rng,
    run.clock.day,
    run.economy.wallets[0],
    isNight(run.clock)
  );
  if (robbery.robbed && robbery.msg) {
    run.economy.wallets[0] = Math.max(0, run.economy.wallets[0] - robbery.stolenCoins);
    alerts.push(robbery.msg);
  }
  // Dojo martial arts training timer
  for (const slot of run.dojoSlots) {
    if (slot.hoursRemaining > 0) {
      slot.hoursRemaining = Math.max(0, slot.hoursRemaining - hours);
      if (slot.hoursRemaining === 0) {
        alerts.push(
          `🥋 ${petStats(slot.pet).name} concluiu o treino no Dojo! Volte lá para buscá-lo!`
        );
      }
    }
  }
  // Home garden seed growth timer (affected by the 4 Seasons AND Drought/Flood agricultural impact!)
  const season = seasonForDay(run.clock.day);
  const growthMult = season.plantGrowthMult * run.hydro.agricultureMultiplier;
  for (const crop of run.biogeochem.garden) {
    if (crop.hoursRemaining > 0) {
      crop.hoursRemaining = Math.max(0, crop.hoursRemaining - hours * growthMult);
      if (crop.hoursRemaining === 0) {
        alerts.push(
          `🌱 Sua colheita de ${getSeed(crop.seedId).name} (${season.icon} ${season.name}) está pronta!`
        );
      }
    }
  }
  // Daily water & energy utility bill + carbon/habitat environmental impact + Hydro-Climate crisis!
  if (daysPassed > 0) {
    const bi = currentBiome(run);
    const biomeNpcIds = STORY_NPCS.filter((n) => n.biome === bi).map((n) => n.id);
    const hydroTick = tickHydroClimate(
      run.hydro,
      run.rng,
      daysPassed,
      run.map,
      bi,
      biomeNpcIds,
      run.party,
      run.energy
    );
    alerts.push(...hydroTick.alerts);
    if (hydroTick.extraCo2 > 0) emitCo2(run.climate, hydroTick.extraCo2);
    if (hydroTick.extraEcoDamage > 0) damageBiomeEcology(run.eco, bi, hydroTick.extraEcoDamage);
    if (run.hydro.damBroken && run.housing.nearDam) {
      run.housing.damage = 'infiltracao';
    }

    const util = computeUtilityImpact(run.utilities, bi);
    run.utilities.billOwed += Math.round(util.bill * run.hydro.energyTariffMultiplier) * daysPassed;
    if (util.ecoDamage > 0) {
      damageBiomeEcology(run.eco, bi, util.ecoDamage * daysPassed);
    }
    if (util.carbonCount > 0) {
      alerts.push(
        `🏭 Seus itens com gás carbono (CO₂) devastaram o ambiente (−${util.ecoDamage * daysPassed}🌿)!`
      );
    }
    // NGO representative arrival & daily NGO restoration bonuses
    if (!run.ngo.representativeArrived && run.clock.day >= 2) {
      run.ngo.representativeArrived = true;
      alerts.push(
        '🐾 Uma representante das ONGs chegou na Prefeitura! Visite lá para participar e recrutar voluntários!'
      );
    }
    if (run.ngo.joinedNgos.includes('ong_floresta')) {
      const bonus = 4 + run.ngo.recruits.ong_floresta.length * 2;
      run.eco.biomeHealth[bi] = Math.min(
        100,
        (run.eco.biomeHealth[bi] ?? 100) + bonus * daysPassed
      );
    }
    if (run.ngo.joinedNgos.includes('ong_reciclagem')) {
      run.litter.packingBoxes += daysPassed;
    }
    // Natural Preservation Reserve protects and heals its neighborhood daily!
    for (let i = 0; i < run.sustainability.naturalReserves.length; i++) {
      if (run.sustainability.naturalReserves[i] && (run.eco.biomeHealth[i] ?? 0) > 0) {
        run.eco.biomeHealth[i] = Math.min(100, (run.eco.biomeHealth[i] ?? 100) + 3 * daysPassed);
      }
    }
    // Ground litter damages the environment every day if left uncollected!
    const litterDmg = groundLitterEcoDamage(run.litter);
    if (litterDmg > 0) {
      damageBiomeEcology(run.eco, bi, litterDmg * daysPassed);
      alerts.push(
        `🗑️ Lixo deixado no chão danificou o ambiente (−${litterDmg * daysPassed}🌿)! Recolha e recicle!`
      );
    }
  }
  // Hydration drain + soil/water contamination + city landfill load!
  const envTick = tickEnvironmentSim(
    run.envSim,
    currentBiome(run),
    run.litter.groundLitter.length,
    hours,
    daysPassed
  );
  alerts.push(...envTick.alerts);
  if (envTick.diedOfThirst) {
    // Player died from dehydration (mark party HP 0 or handled by caller via playerHydration === 0)
    run.envSim.playerHydration = 0;
  }
  // Nuclear plant radiation exposure: pets staying near a Nuclear power plant can mutate into Radioactive!
  const activePlant = energySourceForBiome(run.energy, currentBiome(run));
  if (activePlant.id === 'nuclear') {
    const radAlerts = exposePetsToNuclearRadiation(run.party, hours, true);
    alerts.push(...radAlerts);
  }
  run.coins = run.economy.wallets[0];
  return alerts;
}

/** Play or pet your companion to raise Happiness & Obedience! */
export function careForPet(run: RunState, petUid: string, kind: 'carinho' | 'brincar'): boolean {
  const pet = run.party.find((p) => p.uid === petUid);
  if (!pet) return false;
  pet.happiness = Math.min(100, (pet.happiness ?? 72) + (kind === 'brincar' ? 18 : 12));
  return true;
}

/** Average Beauty of the living party (high beauty makes NPCs admire you and go easier!). */
export function partyAverageBeauty(run: RunState): number {
  if (!run.party.length) return 0;
  return Math.round(run.party.reduce((s, p) => s + (p.beauty ?? 20), 0) / run.party.length);
}

/** Purchases an item from a Biome Town Shop: tracks shopkeeper demand, adaptive production & eco-damage! */
export function buyShopItem(
  run: RunState,
  item: ShopItem,
  petUid?: string
): { ok: boolean; msg: string; ecoWarnings?: string[] } {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  const relFactor = shopRelationPriceFactor(run.eco.shopRelation);
  const price = Math.max(1, Math.round(localPrice(run.economy, bi, item.price) * relFactor));
  if (run.economy.wallets[bi] < price) return { ok: false, msg: 'Moedas insuficientes!' };

  // Track demand: when player buys more of an item, shopkeepers ramp up production (damaging ecology!)
  const recordProduction = (): string[] => {
    const d = (run.eco.shopDemand[item.id] ?? 0) + 1;
    run.eco.shopDemand[item.id] = d;
    const baseStock = run.eco.shopStock[item.id] ?? 3;
    run.eco.shopStock[item.id] = d >= 2 ? baseStock + 2 : baseStock;
    const dmg = item.ecoDamage ?? Math.max(1, Math.round(item.price / 9));
    const prodMult = d >= 2 ? 1.5 : 1;
    return damageBiomeEcology(run.eco, bi, Math.round(dmg * prodMult));
  };

  if (item.teachesCardId) {
    if (!addCard(run, item.teachesCardId)) {
      return { ok: false, msg: 'Deck cheio ou limite de cópias atingido!' };
    }
    run.economy.wallets[bi] -= price;
    if (bi === 0) run.coins = run.economy.wallets[0];
    const ecoWarnings = recordProduction();
    return { ok: true, msg: `📚 Aprendeu a carta ${cardName(item.teachesCardId)}!`, ecoWarnings };
  }
  if (item.questItemId) {
    run.economy.wallets[bi] -= price;
    if (bi === 0) run.coins = run.economy.wallets[0];
    grantJobItem(run, item.questItemId);
    const ecoWarnings = recordProduction();
    return {
      ok: true,
      msg: `${item.icon} Você comprou ${item.name} para entregar num Trabalho!`,
      ecoWarnings,
    };
  }
  const pet = run.party.find((p) => p.uid === petUid) ?? run.party[0];
  if (!pet) return { ok: false, msg: 'Nenhum pet vivo na equipe.' };
  run.economy.wallets[bi] -= price;
  if (bi === 0) run.coins = run.economy.wallets[0];
  if (item.hunger) {
    pet.hunger = Math.min(100, (pet.hunger ?? 100) + item.hunger);
    // Consumed food generates organic scraps for composting + reusable bagaço!
    run.envSim.organicWaste += 1;
    run.envSim.spentBagaco.push(`Bagaço de ${item.name}`);
  }
  if (item.happiness) pet.happiness = Math.min(100, (pet.happiness ?? 72) + item.happiness);
  if (item.beauty) pet.beauty = Math.min(100, (pet.beauty ?? 20) + item.beauty);
  if (item.outfitIcon) pet.outfit = item.outfitIcon;
  if (item.geneElement && item.geneAmount) {
    run.elementGenes[item.geneElement] =
      (run.elementGenes[item.geneElement] ?? 0) + item.geneAmount;
  }
  let healthWarn = '';
  if (item.healthPenalty) {
    pet.hp = Math.max(1, pet.hp - item.healthPenalty);
    if (item.healthPenalty >= 3 && next(run.rng) < 0.45) pet.sick = true;
    // Junk food grants a short-term happiness spike that crashes after ~2 in-game hours!
    if (item.happiness) {
      pet.junkBoost = (pet.junkBoost ?? 0) + item.happiness;
      pet.junkBoostHours = 2;
    }
    healthWarn += ` ⚠️ Besteira deixou feliz por pouco tempo (+${item.happiness ?? 0} 😊 por 2h), mas fez mal à saúde (−${item.healthPenalty} HP)!`;
  }
  if (item.luxuryStatus) {
    recordLuxuryGain(run.social, item.luxuryStatus);
  }
  if (item.causesHallucination) {
    pet.hallucinating = true;
    healthWarn += ' 🌀 O pet começou a ALUCINAR! Pode ignorar comandos e morrer do nada!';
  }
  const ecoWarnings = recordProduction();
  const geneNote =
    item.geneElement && item.geneAmount
      ? ` (+${item.geneAmount} Genes de ${item.geneElement})`
      : '';
  return {
    ok: true,
    msg: `${item.icon} ${petStats(pet).name} consumiu ${item.name}!${geneNote}${healthWarn}`,
    ecoWarnings,
  };
}

/** Purchases the biome's specific Lab catalyst item (expensive/rare if shopRelation is terrible!). */
export function buyLabCatalyst(run: RunState, biomeIndex: number): { ok: boolean; msg: string } {
  const cat = labCatalystForBiome(biomeIndex);
  if (!cat) return { ok: false, msg: 'Este bioma não exige catalisador especial.' };
  if (run.eco.shopRelation <= -3 && next(run.rng) < 0.5) {
    return {
      ok: false,
      msg: `😠 O lojista se recusou a procurar ${cat.name} porque sua relação com ele está horrível!`,
    };
  }
  if (biomeIndex === 0) run.economy.wallets[0] = run.coins;
  const price = Math.max(
    1,
    Math.round(
      localPrice(run.economy, biomeIndex, cat.basePrice) *
        shopRelationPriceFactor(run.eco.shopRelation)
    )
  );
  if (run.economy.wallets[biomeIndex] < price) {
    return { ok: false, msg: `Saldo insuficiente (${price}) para comprar ${cat.name}.` };
  }
  run.economy.wallets[biomeIndex] -= price;
  if (biomeIndex === 0) run.coins = run.economy.wallets[0];
  run.eco.catalysts[cat.id] = (run.eco.catalysts[cat.id] ?? 0) + 1;
  damageBiomeEcology(run.eco, biomeIndex, cat.ecoDamage);
  return { ok: true, msg: `${cat.icon} Comprou catalisador ${cat.name} para o Laboratório!` };
}

/** Heals all living pets at the Pet Hospital for the local biome's fee. */
export function healAtHospital(run: RunState): { ok: boolean; msg: string } {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  const price = localPrice(run.economy, bi, HOSPITAL_COST);
  if (run.economy.wallets[bi] < price) return { ok: false, msg: 'Moedas insuficientes!' };
  run.economy.wallets[bi] -= price;
  if (bi === 0) run.coins = run.economy.wallets[0];
  healParty(run);
  return { ok: true, msg: '🏥 Todos os seus pets foram curados no Hospital!' };
}

/** Grants a special quest item to the player's bag (from shop, map, battle or another job). */
export function grantJobItem(run: RunState, itemId: string, count = 1): void {
  run.jobItems[itemId] = (run.jobItems[itemId] ?? 0) + count;
}

/** Accepts an NPC Job ("Trabalho"). */
export function acceptJob(run: RunState, jobId: string): boolean {
  if (run.activeJobs.includes(jobId) || run.completedJobs.includes(jobId)) return false;
  if (!getJob(jobId)) return false;
  run.activeJobs.push(jobId);
  return true;
}

/** Delivers the requested item(s) to complete an NPC Job and receive coins, XP & chained items! */
export function completeJob(
  run: RunState,
  jobId: string
): { ok: boolean; msg: string; rewardItem?: { icon: string; name: string } } {
  const job = getJob(jobId);
  if (!job || run.completedJobs.includes(jobId)) {
    return { ok: false, msg: 'Trabalho inválido ou já concluído.' };
  }
  const have = run.jobItems[job.needItemId] ?? 0;
  if (have < job.needCount) {
    const need = getJobItem(job.needItemId);
    return { ok: false, msg: `Você ainda precisa de ${need?.name ?? job.needItemId}!` };
  }
  run.jobItems[job.needItemId] = have - job.needCount;
  if (run.jobItems[job.needItemId] <= 0) delete run.jobItems[job.needItemId];
  run.activeJobs = run.activeJobs.filter((id) => id !== jobId);
  run.completedJobs.push(jobId);
  run.coins += job.rewardCoins;
  run.xpEarned += job.rewardXp;
  let rewardItem: { icon: string; name: string } | undefined;
  if (job.rewardItemId) {
    grantJobItem(run, job.rewardItemId);
    const ri = getJobItem(job.rewardItemId);
    if (ri) rewardItem = { icon: ri.icon, name: ri.name };
  }
  return {
    ok: true,
    msg: `✅ Trabalho concluído! +${job.rewardCoins} moedas${rewardItem ? ` e ${rewardItem.icon} ${rewardItem.name}` : ''}!`,
    rewardItem,
  };
}

/**
 * Starts permanent elemental transmodification in the Lab:
 * Consumes LAB_GENES_NEEDED genes of `targetElement` + regional Lab fee, and incubates
 * the pet inside a Lab bio-pod for LAB_HOURS in-game hours!
 */
export function startLabTransmodification(
  run: RunState,
  petUid: string,
  targetElement: Element
): { ok: boolean; msg: string } {
  if (run.party.length <= 1) {
    return {
      ok: false,
      msg: 'Você precisa manter pelo menos 1 pet ativo na equipe enquanto o outro fica no Laboratório!',
    };
  }
  const idx = run.party.findIndex((p) => p.uid === petUid && p.hp > 0);
  if (idx < 0) return { ok: false, msg: 'Escolha um pet vivo da equipe.' };
  const genes = run.elementGenes[targetElement] ?? 0;
  if (genes < LAB_GENES_NEEDED) {
    return {
      ok: false,
      msg: `Precisa de ${LAB_GENES_NEEDED} Genes deste elemento (você tem ${genes}). Compre comidas, roupas ou colete cristais desse elemento!`,
    };
  }
  const bi = currentBiome(run);
  const reqCat = labCatalystForBiome(bi);
  if (reqCat && (run.eco.catalysts[reqCat.id] ?? 0) <= 0) {
    return {
      ok: false,
      msg: `Este laboratório exige o item específico ${reqCat.icon} ${reqCat.name}! Compre com o lojista local.`,
    };
  }
  if (bi === 0) run.economy.wallets[0] = run.coins;
  const fee = localPrice(run.economy, bi, LAB_FEE);
  if (run.economy.wallets[bi] < fee) {
    return { ok: false, msg: `Saldo insuficiente para pagar a mistura do Laboratório (${fee}).` };
  }
  run.economy.wallets[bi] -= fee;
  if (bi === 0) run.coins = run.economy.wallets[0];
  if (reqCat) run.eco.catalysts[reqCat.id] = (run.eco.catalysts[reqCat.id] ?? 1) - 1;
  run.elementGenes[targetElement] = genes - LAB_GENES_NEEDED;
  const [pet] = run.party.splice(idx, 1);
  ensureActivePet(run);
  run.labPods.push({
    id: `pod-${Date.now()}-${pet.uid}`,
    pet,
    targetElement,
    hoursRemaining: LAB_HOURS,
    totalHours: LAB_HOURS,
  });
  return {
    ok: true,
    msg: `🧬 ${petStats(pet).name} entrou na cápsula do Laboratório! Volte em ${LAB_HOURS}h do jogo para buscá-lo transformado!`,
  };
}

/** Advances in-game clock by `hours` (e.g. resting in the Lab waiting room) and updates Lab pods. */
export function waitLabHours(run: RunState, hours = 1): string[] {
  // life.ts runs at 1.5 game minutes per real second => 40 real seconds per 1 game hour
  return tickRunLife(run, hours * 40, true);
}

/**
 * Claims a finished pet from the Lab pod!
 * Mostly succeeds cleanly (permanent element!), but poor scientist relation, hunger, low beauty,
 * extreme weather, low HP or sadness can trigger dramatic mishaps:
 * death, stat loss, species morph, mutant, decorative statue, sickness, or slime!
 */
export function claimLabPod(
  run: RunState,
  podId: string,
  forceOutcome?: LabOutcomeKind
): { ok: boolean; msg: string; outcome?: LabOutcomeKind; pet?: PetInstance; element?: Element } {
  const idx = run.labPods.findIndex((p) => p.id === podId);
  if (idx < 0) return { ok: false, msg: 'Cápsula não encontrada.' };
  const pod = run.labPods[idx];
  if (pod.hoursRemaining > 0) {
    return { ok: false, msg: `Ainda faltam ${pod.hoursRemaining}h do jogo para concluir!` };
  }
  run.labPods.splice(idx, 1);
  const pet = pod.pet;
  const st = petStats(pet);
  const risk = computeLabAccidentChance({
    labRelation: run.eco.labRelation,
    hunger: pet.hunger ?? 100,
    happiness: pet.happiness ?? 72,
    beauty: pet.beauty ?? 20,
    hpRatio: pet.hp / Math.max(1, st.maxHp),
    weather: run.eco.weather,
  });
  const outcome: LabOutcomeKind =
    forceOutcome ?? (next(run.rng) < risk ? pick(run.rng, MISHAP_OUTCOMES) : 'sucesso');

  const returnPet = () => {
    if (run.party.length < MAX_PARTY) run.party.push(pet);
    else run.bench.push(pet);
    ensureActivePet(run);
  };

  switch (outcome) {
    case 'sucesso':
      pet.element = pod.targetElement;
      returnPet();
      return {
        ok: true,
        outcome,
        msg: `🧬 ${petStats(pet).name} agora mantém permanentemente o elemento ${pod.targetElement}!`,
        pet,
        element: pod.targetElement,
      };
    case 'morte':
      run.graveyard.push({
        id: `grave-${Date.now()}-${pet.uid}`,
        name: st.name,
        speciesId: pet.speciesId,
        level: pet.level,
        element: pet.element,
        cause: 'Acidente no Laboratório',
        day: run.clock.day,
      });
      ensureActivePet(run);
      return {
        ok: true,
        outcome,
        msg: `💀 Acidente fatal no Laboratório! ${st.name} não resistiu à transmodificação e morreu...`,
      };
    case 'enfraquecido':
      pet.element = pod.targetElement;
      pet.atkMod = (pet.atkMod ?? 0) - 1;
      pet.defMod = (pet.defMod ?? 0) - 1;
      returnPet();
      return {
        ok: true,
        outcome,
        msg: `⚠️ ${st.name} se transformou, mas ficou enfraquecido (-1 ATK / -1 DEF)!`,
        pet,
        element: pod.targetElement,
      };
    case 'outra_especie': {
      const others = SPECIES.filter((s) => s.id !== pet.speciesId);
      const picked = pick(run.rng, others);
      pet.speciesId = picked.id;
      pet.element = pod.targetElement;
      returnPet();
      return {
        ok: true,
        outcome,
        msg: `🌀 Mutação inesperada! ${st.name} virou um ${petStats(pet).name}!`,
        pet,
        element: pod.targetElement,
      };
    }
    case 'mutante':
      pet.element = pod.targetElement;
      pet.mutation = 'mutante';
      pet.atkMod = (pet.atkMod ?? 0) + 2;
      pet.defMod = (pet.defMod ?? 0) - 2;
      returnPet();
      return {
        ok: true,
        outcome,
        msg: `☣️ ${st.name} virou um MUTANTE instável (+2 ATK / -2 DEF)!`,
        pet,
        element: pod.targetElement,
      };
    case 'estatua':
      run.eco.statues.push({
        id: `statue-${Date.now()}-${pet.uid}`,
        name: `Estátua de ${st.name}`,
        speciesId: pet.speciesId,
        icon: '🗿',
      });
      ensureActivePet(run);
      return {
        ok: true,
        outcome,
        msg: `🗿 ${st.name} petrificou e virou uma Estátua decorativa para suas casas e lojinha!`,
      };
    case 'doente':
      pet.element = pod.targetElement;
      pet.sick = true;
      returnPet();
      return {
        ok: true,
        outcome,
        msg: `🤒 ${st.name} ficou DOENTE no processo e perderá HP até ser curado no Hospital!`,
        pet,
        element: pod.targetElement,
      };
    case 'geleca':
      pet.speciesId = 'gosminha';
      pet.mutation = 'geleca';
      pet.element = pod.targetElement;
      returnPet();
      return {
        ok: true,
        outcome,
        msg: `🟢 ${st.name} derreteu na cápsula e virou uma GELECA (Slime)!`,
        pet,
        element: pod.targetElement,
      };
  }
}

/** Purchases a Macabre ritual item (🕯️ Vela Negra / 🦴 Osso Antigo) for Lab Resurrection. */
export function buyMacabreItem(run: RunState): { ok: boolean; msg: string } {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  const price = Math.max(
    1,
    Math.round(
      localPrice(run.economy, bi, MACABRE_ITEM_PRICE) *
        shopRelationPriceFactor(run.eco.shopRelation)
    )
  );
  if (run.economy.wallets[bi] < price) {
    return { ok: false, msg: `Saldo insuficiente (${price}) para comprar item macabro.` };
  }
  run.economy.wallets[bi] -= price;
  if (bi === 0) run.coins = run.economy.wallets[0];
  run.macabreItems += 1;
  return {
    ok: true,
    msg: `🕯️ Comprou 1 Item Macabro para rituais do Laboratório (total: ${run.macabreItems})!`,
  };
}

/**
 * Equivalent Exchange Lab Resurrection:
 * Brings a dead pet from the graveyard back to life as a ZOMBIE (🧟), at the cost of:
 * - Half the HP of a living donor pet currently at 100% HP (which may develop Depression — daily half-life HP decay!)
 * - Lab resurrection fee
 * - Macabre items (RESURRECT_MACABRE_NEEDED)
 */
export function resurrectPetAtLab(
  run: RunState,
  graveIndex: number,
  donorPetUid: string,
  forceDepressed?: boolean
): { ok: boolean; msg: string; zombie?: PetInstance; donorDepressed?: boolean } {
  const grave = run.graveyard[graveIndex];
  if (!grave) return { ok: false, msg: 'Pet morto não encontrado no memorial.' };
  const donor = run.party.find((p) => p.uid === donorPetUid && p.hp > 0);
  if (!donor) return { ok: false, msg: 'Escolha um pet vivo da equipe para a troca equivalente.' };
  const donorMaxHp = petStats(donor).maxHp;
  if (donor.hp < donorMaxHp) {
    return {
      ok: false,
      msg: `Troca Equivalente exige um pet doador com 100% de HP (${petStats(donor).name} tem ${donor.hp}/${donorMaxHp})!`,
    };
  }
  if (run.macabreItems < RESURRECT_MACABRE_NEEDED) {
    return {
      ok: false,
      msg: `Precisa de ${RESURRECT_MACABRE_NEEDED} Itens Macabros (você tem ${run.macabreItems}).`,
    };
  }
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  const fee = localPrice(run.economy, bi, RESURRECT_FEE);
  if (run.economy.wallets[bi] < fee) {
    return { ok: false, msg: `Precisa de ${fee} moedas locais para o ritual no Laboratório.` };
  }

  // Pay Equivalent Exchange costs!
  run.economy.wallets[bi] -= fee;
  if (bi === 0) run.coins = run.economy.wallets[0];
  run.macabreItems -= RESURRECT_MACABRE_NEEDED;
  donor.hp = Math.max(1, Math.floor(donor.hp / 2));

  // Donor pet may develop Depression (half-life HP decay each day!)
  const depressed = forceDepressed ?? next(run.rng) < 0.7;
  if (depressed) donor.depressed = true;

  // Resurrect fallen pet as a Zombie!
  run.graveyard.splice(graveIndex, 1);
  const zombie = createPet(grave.speciesId ?? 'pipo', grave.level ?? 1, 'fantasma');
  zombie.mutation = 'zumbi';
  zombie.hp = Math.max(1, Math.floor(petStats(zombie).maxHp * 0.65));
  if (run.party.length < MAX_PARTY) run.party.push(zombie);
  else run.bench.push(zombie);
  ensureActivePet(run);

  const depMsg = depressed
    ? ` 😢 ${petStats(donor).name} desenvolveu DEPRESSÃO (ciclo de meia-vida diário)!`
    : '';
  return {
    ok: true,
    zombie,
    donorDepressed: depressed,
    msg: `🧟 Troca Equivalente concluída! ${grave.name} voltou à vida como ZUMBI! (${petStats(donor).name} perdeu metade do HP.${depMsg})`,
  };
}

/** Rents or buys an Apartment in the residential building. */
export function movePlayerToApartment(
  run: RunState,
  aptId: string,
  mode: 'alugar' | 'comprar'
): { ok: boolean; msg: string } {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  const res = moveToApartment(run.housing, aptId, mode, run.economy.wallets[bi]);
  if (res.ok) {
    run.economy.wallets[bi] -= res.cost;
    if (bi === 0) run.coins = run.economy.wallets[0];
  }
  return { ok: res.ok, msg: res.msg };
}

/** Obtains a Government Building Permit (Alvará) from the current biome's Prefeitura. */
export function buyBuildingPermit(run: RunState): { ok: boolean; msg: string } {
  const bi = currentBiome(run);
  const pref = prefeituraForBiome(bi);
  if (run.gov.permits.includes(bi)) {
    return { ok: false, msg: `Você já possui Alvará de Construção da ${pref.name}!` };
  }
  if (bi === 0) run.economy.wallets[0] = run.coins;
  if (run.economy.wallets[bi] < pref.permitFee) {
    return { ok: false, msg: `Saldo insuficiente (${pref.permitFee}) para o Alvará.` };
  }
  run.economy.wallets[bi] -= pref.permitFee;
  if (bi === 0) run.coins = run.economy.wallets[0];
  run.gov.permits.push(bi);
  return { ok: true, msg: `📜 Alvará de Construção obtido na ${pref.name}!` };
}

/** Purchases construction materials from Certified Carpentry or Clandestine Alley Logger. */
export function buyMaterialsForRun(
  run: RunState,
  source: MaterialSource
): { ok: boolean; msg: string; ecoWarnings?: string[] } {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  const res = buyConstructionMaterials(run.gov, run.eco, bi, source, run.economy.wallets[bi]);
  if (res.ok) {
    run.economy.wallets[bi] -= res.cost;
    if (bi === 0) run.coins = run.economy.wallets[0];
  }
  return res;
}

/** Builds the player's own custom house using Permit + Materials + Mason. */
export function buildMyHouse(run: RunState): { ok: boolean; msg: string } {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  const res = buildCustomHouse(run.gov, bi, run.housing.masonRelation, run.economy.wallets[bi]);
  if (res.ok) {
    run.economy.wallets[bi] -= res.cost;
    if (bi === 0) run.coins = run.economy.wallets[0];
  }
  return res;
}

/** Pays overdue IPTU property tax to the Prefeitura. */
export function payIptu(run: RunState): { ok: boolean; msg: string } {
  const ch = run.gov.customHouse;
  if (!ch || ch.iptuOwed <= 0 || ch.seizedByCity) {
    return { ok: false, msg: 'Nenhum IPTU pendente no momento.' };
  }
  const bi = ch.biomeIndex;
  if (bi === 0) run.economy.wallets[0] = run.coins;
  if (run.economy.wallets[bi] < ch.iptuOwed) {
    return { ok: false, msg: `Saldo insuficiente (${ch.iptuOwed}) para quitar o IPTU!` };
  }
  const paid = ch.iptuOwed;
  run.economy.wallets[bi] -= paid;
  if (bi === 0) run.coins = run.economy.wallets[0];
  ch.iptuOwed = 0;
  ch.unpaidDays = 0;
  return { ok: true, msg: `🏛️ IPTU quitado (${paid} moedas)! Sua casa está regularizada.` };
}

/** Buys back a house that was seized by the Prefeitura for unpaid IPTU. */
export function buybackSeizedHouse(run: RunState): { ok: boolean; msg: string } {
  const ch = run.gov.customHouse;
  if (!ch || !ch.seizedByCity)
    return { ok: false, msg: 'Sua casa não foi tomada pela prefeitura.' };
  const bi = ch.biomeIndex;
  const price = seizedHouseBuybackPrice(run.gov);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  if (run.economy.wallets[bi] < price) {
    return { ok: false, msg: `A prefeitura estipulou ${price} moedas para recuperar sua casa.` };
  }
  run.economy.wallets[bi] -= price;
  if (bi === 0) run.coins = run.economy.wallets[0];
  ch.seizedByCity = false;
  ch.iptuOwed = 0;
  ch.unpaidDays = 0;
  return { ok: true, msg: `🏡 Casa recomprada da Prefeitura por ${price} moedas!` };
}

/** Calls the current biome's Prefeitura to run an official environmental restoration program. */
export function restoreBiomeWithGovernment(run: RunState): { ok: boolean; msg: string } {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  const res = governmentRestoreBiome(run.eco, bi, run.economy.wallets[bi]);
  if (res.ok) {
    run.economy.wallets[bi] -= res.cost;
    if (bi === 0) run.coins = run.economy.wallets[0];
  }
  return res;
}

/** Charges the neighborhood's local elemental battle tax if the element is taxed in this biome. */
export function chargeElementalTax(run: RunState, element: Element | 'neutro'): string | null {
  const bi = currentBiome(run);
  const fee = elementalLawTax(bi, element);
  if (fee <= 0) return null;
  if (bi === 0) run.economy.wallets[0] = run.coins;
  const paid = Math.min(run.economy.wallets[bi], fee);
  run.economy.wallets[bi] -= paid;
  if (bi === 0) run.coins = run.economy.wallets[0];
  run.gov.totalElementalTaxes += paid;
  const pref = prefeituraForBiome(bi);
  return `🏛️ ${pref.name}: taxa ambiental de −${paid} por usar ${element} neste bairro!`;
}

/** Hires the Mason (Pedreiro) to repair house leaks or apartment infiltration. */
export function hireMasonForRun(run: RunState): { ok: boolean; msg: string } {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  const res = hireMason(run.housing, run.rng, run.economy.wallets[bi]);
  if (res.ok) {
    run.economy.wallets[bi] -= res.cost;
    if (bi === 0) run.coins = run.economy.wallets[0];
  }
  return { ok: res.ok, msg: res.msg };
}

/** Total social status of the player (cars + expensive clothes/items + owned house/apartment). */
export function playerStatusScore(run: RunState): number {
  const houseOwned =
    run.housing.owned || Boolean(run.gov.customHouse && !run.gov.customHouse.seizedByCity);
  const housePrice = run.housing.owned ? 260 : run.gov.customHouse ? 160 : 0;
  return totalPlayerStatus(run.social, houseOwned, housePrice);
}

/** Places a Pet Battle bet at the Gambling House (strictly 1 bet/day, any wager up to wallet). */
export function betOnPetBattle(
  run: RunState,
  pickedFighterId: string,
  wager: number
): { ok: boolean; won: boolean; msg: string; newlyAddicted: boolean } {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  const [fA, fB] = dailyMatchup(run.clock.day);
  const res = placePetBattleBet(
    run.gambling,
    run.rng,
    run.clock.day,
    fA,
    fB,
    pickedFighterId,
    wager,
    run.economy.wallets[bi]
  );
  if (res.ok) {
    run.economy.wallets[bi] = Math.max(0, run.economy.wallets[bi] + res.netDelta);
    if (bi === 0) run.coins = run.economy.wallets[0];
  }
  return { ok: res.ok, won: res.won, msg: res.msg, newlyAddicted: res.newlyAddicted };
}

/** Purchases a Car (expensive, heavily pollutes ecology, grants high Status, unlocks Fast Travel!). */
export function buyCar(run: RunState, carId: string): { ok: boolean; msg: string } {
  const car = getCar(carId);
  if (!car) return { ok: false, msg: 'Modelo de carro inválido.' };
  if (run.social.cars.includes(carId))
    return { ok: false, msg: 'Você já possui este carro na garagem.' };
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  if (run.economy.wallets[bi] < car.price) {
    return { ok: false, msg: `Saldo insuficiente (${car.price}) para comprar ${car.name}.` };
  }
  run.economy.wallets[bi] -= car.price;
  if (bi === 0) run.coins = run.economy.wallets[0];
  run.social.cars.push(car.id);
  run.social.activeCarId = car.id;
  recordLuxuryGain(run.social, car.statusBonus);
  damageBiomeEcology(run.eco, bi, car.ecoDamageBuy);
  emitCo2(run.climate, Math.round(car.ecoDamageBuy * 0.7));
  return {
    ok: true,
    msg: `${car.icon} Comprou ${car.name}! (+${car.statusBonus} Status · Fast Travel liberado · Poluição −${car.ecoDamageBuy}🌿)`,
  };
}

/**
 * Exclusive Car Fast Travel: cars are the ONLY way to fast travel from one neighborhood/biome to another!
 * Teleports the player to a walkable tile in the target biome and applies exhaust pollution.
 */
export function fastTravelByCar(run: RunState, targetBiome: number): { ok: boolean; msg: string } {
  if (!run.social.cars.length) {
    return {
      ok: false,
      msg: '🚗 Você precisa comprar um carro para fazer Fast Travel entre bairros!',
    };
  }
  const car = getCar(run.social.activeCarId ?? run.social.cars[0])!;
  // Find a walkable tile in targetBiome
  for (let y = 1; y < run.map.height - 1; y++) {
    for (let x = 1; x < run.map.width - 1; x++) {
      const idx = y * run.map.width + x;
      if (
        run.map.biomes[idx] === targetBiome &&
        (run.map.tiles[idx] === 'caminho' || run.map.tiles[idx] === 'grama')
      ) {
        moveTo(run, x, y);
        damageBiomeEcology(run.eco, targetBiome, car.ecoDamageTrip);
        return {
          ok: true,
          msg: `${car.icon} Fast Travel de ${car.name} para ${BIOMES[targetBiome]?.id ?? targetBiome}! (Poluição −${car.ecoDamageTrip}🌿)`,
        };
      }
    }
  }
  return { ok: false, msg: 'Não foi possível estacionar nesse bairro.' };
}

/** Purchases an appliance/household item (raises water/energy use & carbon/status). */
export function buyApplianceItem(run: RunState, applianceId: string): { ok: boolean; msg: string } {
  const def = getAppliance(applianceId);
  if (!def) return { ok: false, msg: 'Item residencial inválido.' };
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  if (run.economy.wallets[bi] < def.price) return { ok: false, msg: 'Moedas insuficientes!' };
  run.economy.wallets[bi] -= def.price;
  if (bi === 0) run.coins = run.economy.wallets[0];
  run.utilities.ownedItems.push(def.id);
  recordLuxuryGain(run.social, def.statusBonus);
  if (def.emitsCarbon) {
    damageBiomeEcology(run.eco, bi, 10);
    emitCo2(run.climate, 12);
  }
  return {
    ok: true,
    msg: `${def.icon} Instalou ${def.name} em casa! (+${def.statusBonus} Status)`,
  };
}

/** Pays accumulated water & energy utility bills to the local Prefeitura. */
export function payUtilityBill(run: RunState): { ok: boolean; msg: string } {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  const owed = run.utilities.billOwed;
  if (owed <= 0) return { ok: false, msg: 'Nenhuma conta de água/energia em aberto.' };
  if (run.economy.wallets[bi] < owed) return { ok: false, msg: `Saldo insuficiente (${owed}).` };
  run.economy.wallets[bi] -= owed;
  if (bi === 0) run.coins = run.economy.wallets[0];
  run.utilities.billOwed = 0;
  return { ok: true, msg: `💧⚡ Conta de água e energia (${owed}) paga à Prefeitura!` };
}

/** Sells, donates, trades, auctions, or discards an owned item into a recycling bin! */
export function handleOwnedItem(
  run: RunState,
  itemId: string,
  action: 'vender' | 'doar' | 'trocar' | 'leiloar' | 'descartar',
  bin?: RecyclingBin
): { ok: boolean; msg: string } {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  if (action === 'descartar') {
    const res = discardItemInBin(run.utilities, itemId, bin ?? 'comum');
    if (res.ok) {
      if (res.ecoDelta < 0) damageBiomeEcology(run.eco, bi, -res.ecoDelta);
      else run.eco.biomeHealth[bi] = Math.min(100, (run.eco.biomeHealth[bi] ?? 100) + res.ecoDelta);
    }
    return { ok: res.ok, msg: res.msg };
  }
  const res = disposeItemLifecycle(run.utilities, itemId, action, run.rng);
  if (res.ok) {
    run.economy.wallets[bi] += res.coinsGained;
    if (bi === 0) run.coins = run.economy.wallets[0];
    if (res.statusGain > 0) recordLuxuryGain(run.social, res.statusGain);
  }
  return { ok: res.ok, msg: res.msg };
}

/** Enrolls a pet at the Martial Arts Dojo (leaves party until training finishes!). */
export function startDojoTraining(
  run: RunState,
  petUid: string,
  artId: MartialArtId
): { ok: boolean; msg: string } {
  if (run.party.length <= 1)
    return { ok: false, msg: 'Você precisa manter pelo menos 1 pet na equipe!' };
  const idx = run.party.findIndex((p) => p.uid === petUid);
  if (idx < 0) return { ok: false, msg: 'Pet não encontrado na equipe.' };
  const art = getMartialArt(artId);
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  if (run.economy.wallets[bi] < art.fee)
    return { ok: false, msg: `Saldo insuficiente (${art.fee}).` };
  run.economy.wallets[bi] -= art.fee;
  if (bi === 0) run.coins = run.economy.wallets[0];
  const [pet] = run.party.splice(idx, 1);
  ensureActivePet(run);
  run.dojoSlots.push({
    id: `dojo-${Date.now()}-${pet.uid}`,
    pet,
    artId,
    hoursRemaining: art.hours,
  });
  return {
    ok: true,
    msg: `${art.icon} ${petStats(pet).name} entrou no Dojo para treinar ${art.name} (${art.hours}h)!`,
  };
}

/** Collects a graduated pet from the Martial Arts Dojo with permanent stat gains! */
export function collectDojoPet(run: RunState, slotId: string): { ok: boolean; msg: string } {
  const idx = run.dojoSlots.findIndex((s) => s.id === slotId);
  if (idx < 0) return { ok: false, msg: 'Treino não encontrado.' };
  const slot = run.dojoSlots[idx];
  if (slot.hoursRemaining > 0)
    return { ok: false, msg: `Ainda faltam ${slot.hoursRemaining}h de treino!` };
  run.dojoSlots.splice(idx, 1);
  const { pet, msg } = applyDojoGraduation(slot);
  if (run.party.length < MAX_PARTY) run.party.push(pet);
  else run.bench.push(pet);
  return { ok: true, msg };
}

/** Buys seeds for home organic food production! */
export function buySeeds(run: RunState, seedId: string): { ok: boolean; msg: string } {
  const seed = getSeed(seedId);
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  if (run.economy.wallets[bi] < seed.price) return { ok: false, msg: 'Moedas insuficientes!' };
  run.economy.wallets[bi] -= seed.price;
  if (bi === 0) run.coins = run.economy.wallets[0];
  run.biogeochem.seeds[seed.id] = (run.biogeochem.seeds[seed.id] ?? 0) + 1;
  return { ok: true, msg: `${seed.icon} Comprou ${seed.name}! Plante na horta da sua casa.` };
}

/** Plants a seed in your home garden. */
export function plantHomeSeed(run: RunState, seedId: string): { ok: boolean; msg: string } {
  if ((run.biogeochem.seeds[seedId] ?? 0) <= 0)
    return { ok: false, msg: 'Você não tem essa semente.' };
  const seed = getSeed(seedId);
  run.biogeochem.seeds[seedId] -= 1;
  run.biogeochem.garden.push({
    id: `crop-${Date.now()}-${Math.random()}`,
    seedId,
    hoursRemaining: seed.growHours,
  });
  return {
    ok: true,
    msg: `${seed.icon} Plantou ${seed.name} na horta! Fica pronto em ${seed.growHours}h.`,
  };
}

/** Harvests ready homegrown food and feeds a pet for free with zero eco damage! */
export function harvestAndFeedHomeFood(
  run: RunState,
  petUid?: string
): { ok: boolean; msg: string } {
  const ready = run.biogeochem.garden.filter((c) => c.hoursRemaining <= 0);
  if (ready.length > 0) {
    run.biogeochem.garden = run.biogeochem.garden.filter((c) => c.hoursRemaining > 0);
    run.biogeochem.homeFood += ready.length;
  }
  if (run.biogeochem.homeFood <= 0)
    return { ok: false, msg: 'Nenhum alimento orgânico colhido ainda!' };
  const pet = run.party.find((p) => p.uid === petUid) ?? run.party[0];
  if (!pet) return { ok: false, msg: 'Nenhum pet na equipe.' };
  run.biogeochem.homeFood -= 1;
  pet.hunger = Math.min(100, (pet.hunger ?? 100) + 55);
  pet.happiness = Math.min(100, (pet.happiness ?? 72) + 14);
  return {
    ok: true,
    msg: `🥗 ${petStats(pet).name} comeu alimento orgânico da sua própria horta (+55 fome, +14 😊, 0 poluição)!`,
  };
}

/** Searches/digs for dinosaur fossil bones on the map (or permafrost check). */
export function searchForFossil(run: RunState): { ok: boolean; msg: string } {
  const bone = findRandomFossilBone(run.biogeochem, run.rng);
  return { ok: true, msg: `🦴 Você escavou um fóssil de dinossauro: ${bone.toUpperCase()}!` };
}

/** Revives a complete Dinosaur Fossil at the Transmodification Lab as a 💀 Skeleton Dinosaur! */
export function reviveFossilAtLab(run: RunState): { ok: boolean; msg: string } {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  if (run.economy.wallets[bi] < 65)
    return { ok: false, msg: 'O Laboratório cobra 65 moedas para reviver um fóssil!' };
  const dino = reviveDinosaurSkeleton(run.biogeochem);
  if (!dino)
    return { ok: false, msg: 'Você precisa reunir todos os 3 ossos (Crânio, Costelas e Cauda)!' };
  run.economy.wallets[bi] -= 65;
  if (bi === 0) run.coins = run.economy.wallets[0];
  if (run.party.length < MAX_PARTY) run.party.push(dino);
  else run.bench.push(dino);
  return {
    ok: true,
    msg: '💀 Dinossauro Esqueleto trazido à vida no Laboratório! Leve-o à Bruxa do Cemitério para torná-lo vivo!',
  };
}

/** Cemetery Witch ritual: turns a Skeleton Dinosaur into a normal living pet (high chance of Cursed!). */
export function restoreSkeletonWithWitch(
  run: RunState,
  petUid: string
): { ok: boolean; msg: string } {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  if (run.economy.wallets[bi] < 55)
    return { ok: false, msg: 'Bruxa Morgana cobra 55 moedas pelo ritual!' };
  const pet = run.party.find((p) => p.uid === petUid) ?? run.bench.find((p) => p.uid === petUid);
  if (!pet) return { ok: false, msg: 'Pet não encontrado.' };
  const res = witchRestoreSkeletonPet(pet, run.rng);
  if (res.ok) {
    run.economy.wallets[bi] -= 55;
    if (bi === 0) run.coins = run.economy.wallets[0];
  }
  return { ok: res.ok, msg: res.msg };
}

export { checkPermafrostEvent, recordPetPollen };

/** Records a wild pet kill (tracks species extinction & NGO anti-poaching fines!). */
export function recordWildKillInRun(run: RunState, speciesId: string) {
  return recordWildSpeciesKill(run.ngo, speciesId);
}

/** Pays an NGO poaching fine or triggers Arrest / Roguelike Prison Game Over if unaffordable! */
export function payNgoFineInRun(run: RunState): { paid: boolean; arrested: boolean; msg: string } {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  const res = resolveNgoFine(run.ngo, run.economy.wallets[bi]);
  if (res.paid && res.cost > 0) {
    run.economy.wallets[bi] -= res.cost;
    if (bi === 0) run.coins = run.economy.wallets[0];
  }
  return { paid: res.paid, arrested: res.arrested, msg: res.msg };
}

/** Buys a cardboard Packing Box required to safely recycle Glass at the Special Depot! */
export function buyGlassPackingBox(run: RunState): { ok: boolean; msg: string } {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  if (run.economy.wallets[bi] < PACKING_BOX_PRICE) {
    return {
      ok: false,
      msg: `Saldo insuficiente (${PACKING_BOX_PRICE}) para comprar Caixa para Vidro.`,
    };
  }
  run.economy.wallets[bi] -= PACKING_BOX_PRICE;
  if (bi === 0) run.coins = run.economy.wallets[0];
  run.litter.packingBoxes += 1;
  return { ok: true, msg: '📦 Comprou 1 Caixa de Papelão para embalar vidros com segurança!' };
}

export function pickupGroundLitterInRun(run: RunState, index = 0) {
  return pickupLitterFromGround(run.litter, index);
}

export function recycleLitterInRun(run: RunState, bagIndex: number, target: DisposalTarget) {
  const bi = currentBiome(run);
  const res = recycleLitter(run.litter, bagIndex, target);
  if (res.ecoDelta < 0) damageBiomeEcology(run.eco, bi, -res.ecoDelta);
  else if (res.ecoDelta > 0) {
    run.eco.biomeHealth[bi] = Math.min(100, (run.eco.biomeHealth[bi] ?? 100) + res.ecoDelta);
  }
  return res;
}

export {
  buildProtagonistMirrorBoss,
  checkSewerUnlock,
  joinNgo,
  recoverExtinctSpecies,
  recruitToNgo,
  type NgoId,
  MAX_INVENTORY_ITEMS,
  makeCompost,
  hireHumanEmployee,
  fireEmployee,
  treatEmployee,
};

/** Counts total items in the player's inventory (hard cap = 50 items!). */
export function totalInventoryItems(run: RunState): number {
  const crystals = Object.values(run.crystals).reduce((s, n) => s + (n ?? 0), 0);
  const jobs = Object.values(run.jobItems).reduce((s, n) => s + (n ?? 0), 0);
  const seeds = Object.values(run.biogeochem.seeds).reduce((s, n) => s + (n ?? 0), 0);
  return (
    run.potions +
    crystals +
    jobs +
    seeds +
    run.litter.bagLitter.length +
    run.envSim.spentBagaco.length +
    run.envSim.organicWaste +
    run.envSim.compost +
    run.utilities.ownedItems.length
  );
}

/** Discarding excess items when inventory is full (>=50) pollutes the biome & fills its landfill! */
export function discardExcessItem(run: RunState): { ok: boolean; msg: string } {
  const bi = currentBiome(run);
  if (run.envSim.spentBagaco.length > 0) {
    const [dropped] = run.envSim.spentBagaco.splice(0, 1);
    run.litter.groundLitter.push('plastico');
    run.envSim.cityLandfills[bi] = Math.min(100, (run.envSim.cityLandfills[bi] ?? 0) + 4);
    damageBiomeEcology(run.eco, bi, 4);
    return {
      ok: true,
      msg: `🗑️ Descartou "${dropped}" (poluiu −4🌿 e encheu o aterro da cidade!).`,
    };
  }
  if (run.potions > 0) {
    run.potions -= 1;
    run.envSim.cityLandfills[bi] = Math.min(100, (run.envSim.cityLandfills[bi] ?? 0) + 3);
    damageBiomeEcology(run.eco, bi, 3);
    return {
      ok: true,
      msg: '🗑️ Descartou 1 Poção por falta de espaço na mochila (50 itens máx · −3🌿)!',
    };
  }
  return { ok: false, msg: 'Nenhum item sobrando para descartar.' };
}

/** Uses compost on home garden: instantly matures planted seeds & yields +1 bonus organic food! */
export function applyCompostToGarden(run: RunState): { ok: boolean; msg: string } {
  if (run.envSim.compost <= 0)
    return { ok: false, msg: 'Faça compostagem com resíduos orgânicos primeiro!' };
  run.envSim.compost -= 1;
  for (const crop of run.biogeochem.garden) crop.hoursRemaining = 0;
  run.biogeochem.homeFood += 1;
  return {
    ok: true,
    msg: '🌱 Compostagem aplicada! Suas plantas cresceram na hora (+1 alimento orgânico)!',
  };
}

/** Player drinks water in the current biome (contaminated water can kill!). */
export function drinkWaterInRun(run: RunState) {
  return drinkBiomeWater(run.envSim, currentBiome(run), next(run.rng));
}

/** Go to City Hall with your NGO group to complain about trash -> faster government cleanup! */
export function protestTrashWithNgo(run: RunState) {
  const bi = currentBiome(run);
  const totalRecruits = Object.values(run.ngo.recruits).reduce((s, arr) => s + arr.length, 0);
  const protesters = 1 + run.ngo.joinedNgos.length + totalRecruits;
  const res = protestWithNgoAtCityHall(run.envSim, bi, protesters, run.litter.groundLitter.length);
  for (let i = 0; i < res.cleanedLitter; i++) run.litter.groundLitter.pop();
  return res;
}

/** Environmental militancy action (+eco, but being overly pushy hurts NPC bonds!). */
export function performMilitancyInRun(run: RunState) {
  const bi = currentBiome(run);
  const res = doEnvironmentalMilitancy(run.envSim);
  run.eco.biomeHealth[bi] = Math.min(100, (run.eco.biomeHealth[bi] ?? 100) + res.ecoGain);
  return res;
}

/** Repairs a spent item ("bagaço") at physical 🔧 Casa de Reparo so you can reuse it! */
export function repairBagacoInRun(run: RunState, index: number): { ok: boolean; msg: string } {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  if (run.economy.wallets[bi] < 10)
    return { ok: false, msg: 'Mestre Jonas cobra 10 moedas pelo reparo.' };
  const res = repairBagacoItem(run.envSim, index);
  if (res.ok) {
    run.economy.wallets[bi] -= 10;
    if (bi === 0) run.coins = run.economy.wallets[0];
    run.potions += 1;
  }
  return { ok: res.ok, msg: res.msg };
}

/** Buys & installs a Robot employee in Minha Lojinha. */
export function buyShopRobotInRun(run: RunState): { ok: boolean; msg: string } {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  const res = installShopRobot(run.business, run.economy.wallets[bi]);
  if (res.ok) {
    run.economy.wallets[bi] -= res.cost;
    if (bi === 0) run.coins = run.economy.wallets[0];
  }
  return { ok: res.ok, msg: res.msg };
}

/** Runs a business shift at Minha Lojinha (salaries, human vs robot sales & angry permanent customers!). */
export function runMyShopShiftInRun(run: RunState) {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  const res = runShopShift(run.business, run.rng);
  run.economy.wallets[bi] = Math.max(0, run.economy.wallets[bi] + res.revenue - res.salaryCost);
  if (bi === 0) run.coins = run.economy.wallets[0];
  return res;
}

/** Performs Urban or Rural environmental maintenance in the current biome. */
export function maintainBiomeInRun(run: RunState, zone: MaintenanceZone) {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  const res = performMaintenance(run.sustainability, bi, zone, run.economy.wallets[bi]);
  if (res.ok) {
    run.economy.wallets[bi] -= res.cost;
    if (bi === 0) run.coins = run.economy.wallets[0];
    run.eco.biomeHealth[bi] = Math.min(100, (run.eco.biomeHealth[bi] ?? 100) + res.ecoGain);
  }
  return res;
}

/** Creates a Natural Preservation Reserve in the current neighborhood/biome. */
export function createReserveInRun(run: RunState) {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  const res = establishNaturalReserve(run.sustainability, bi, run.economy.wallets[bi]);
  if (res.ok) {
    run.economy.wallets[bi] -= res.cost;
    if (bi === 0) run.coins = run.economy.wallets[0];
  }
  return res;
}

/** Runs an official RSA Environmental Law audit on Protagonist & NPCs! */
export function runRsaAuditInRun(run: RunState) {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  const util = computeUtilityImpact(run.utilities, bi);
  const res = auditRsaCompliance(
    run.sustainability,
    run.utilities.wrongDisposals,
    util.carbonCount
  );
  if (res.playerFine > 0) {
    run.economy.wallets[bi] = Math.max(0, run.economy.wallets[bi] - res.playerFine);
    if (bi === 0) run.coins = run.economy.wallets[0];
  }
  return res;
}

/** Clears a land lot ("capinar lote") for mineral extraction (impacts eco & emits CO2!). */
export function clearLotInRun(run: RunState) {
  const bi = currentBiome(run);
  const res = clearLandLot(run.climate);
  damageBiomeEcology(run.eco, bi, res.ecoDamage);
  return res;
}

/** Extracts minerals (stone, metal, gold, precious gems) from a cleared lot (impacts eco & CO2!). */
export function mineMineralsInRun(run: RunState) {
  const bi = currentBiome(run);
  const res = extractMinerals(run.climate, run.rng);
  if (res.ok) damageBiomeEcology(run.eco, bi, res.ecoDamage);
  return res;
}

/** Sells all extracted minerals for coins. */
export function sellMineralsInRun(run: RunState) {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  const res = sellAllMinerals(run.climate);
  if (res.coins > 0) {
    run.economy.wallets[bi] += res.coins;
    if (bi === 0) run.coins = run.economy.wallets[0];
  }
  return res;
}

export { globalTempDeltaC, isExtremeHeat, talkToConspiracyLeader, seasonForDay };

/** Chops a tree on the map: removes it permanently (Forest Fragmentation) until player replants! */
export function chopTreeInRun(run: RunState, x: number, y: number) {
  const bi = currentBiome(run);
  const res = chopTreeOnMap(run.biosphere, run.map, x, y);
  if (res.ok) damageBiomeEcology(run.eco, bi, 4);
  return res;
}

/** Replants a tree sapling on a fragmented grass tile to restore the forest! */
export function replantTreeInRun(run: RunState, x: number, y: number) {
  const bi = currentBiome(run);
  const res = replantTreeOnMap(run.biosphere, run.map, x, y);
  if (res.ok) run.eco.biomeHealth[bi] = Math.min(100, (run.eco.biomeHealth[bi] ?? 100) + 5);
  return res;
}

/** Builds a Hydroelectric Dam: floods green areas & emits Methane (CH4) worsening greenhouse warming! */
export function buildHydroDamInRun(run: RunState) {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  const res = buildHydroelectricDam(run.biosphere, run.map, bi, run.economy.wallets[bi]);
  if (res.ok) {
    run.economy.wallets[bi] -= res.cost;
    if (bi === 0) run.coins = run.economy.wallets[0];
    run.energy.biomePlants[bi] = 'hidroeletrica';
    damageBiomeEcology(run.eco, bi, res.ecoDamage);
    emitMethane(run.climate, res.methaneEmitted);
  }
  return res;
}

/** Installs any of the 8 neighborhood energy plants (all harm the environment to varying degrees!). */
export function installEnergyPlantInRun(run: RunState, sourceId: EnergySourceId) {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  const res = installBiomeEnergyPlant(run.energy, bi, sourceId, run.economy.wallets[bi], run.map);
  if (res.ok) {
    run.economy.wallets[bi] -= res.cost;
    if (bi === 0) run.coins = run.economy.wallets[0];
    damageBiomeEcology(run.eco, bi, res.ecoDamage);
    if (res.co2Emitted > 0) emitCo2(run.climate, res.co2Emitted);
    if (res.methaneEmitted > 0) emitMethane(run.climate, res.methaneEmitted);
    if (sourceId === 'hidroeletrica' && !run.biosphere.hydroDamsBuilt.includes(bi)) {
      run.biosphere.hydroDamsBuilt.push(bi);
    }
  }
  return res;
}

/** Invests in Basic Sanitation works for the current neighborhood (+20% quality, lowers disease risk). */
export function improveSanitationInRun(run: RunState) {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  const res = improveBiomeSanitation(run.hydro, bi, run.economy.wallets[bi]);
  if (res.ok) {
    run.economy.wallets[bi] -= res.cost;
    if (bi === 0) run.coins = run.economy.wallets[0];
    run.eco.biomeHealth[bi] = Math.min(100, (run.eco.biomeHealth[bi] ?? 100) + 6);
  }
  return res;
}

/** Computes the philosophical Anthropocene Index & Era for the current run! */
export function anthropoceneReportForRun(run: RunState): AnthropoceneReport {
  const sanVals = Object.values(run.hydro.biomeSanitation);
  const avgSanitation = sanVals.length ? sanVals.reduce((s, v) => s + v, 0) / sanVals.length : 60;
  return computeAnthropoceneIndex({
    co2Atmosphere: run.climate.co2Atmosphere,
    methaneAtmosphere: run.climate.methaneAtmosphere,
    choppedTreesCount: run.biosphere.choppedTrees.length,
    mudBiomesCount: run.hydro.mudBiomes.length,
    avgSanitation,
    groundLitterCount: run.litter.groundLitter.length,
  });
}

/** Checks if an annoying apartment-broker NPC approaches while walking, handing you a flyer! */
export function checkApartmentBrokerInRun(run: RunState) {
  const pitch = maybeTriggerApartmentBroker(run.flyers, run.rng);
  if (pitch) {
    run.litter.groundLitter.push('papel');
  }
  return pitch;
}

/** Player distributes flyers (job, apartment sale, or NGO) — works, but NPCs find you annoying (-bond)! */
export function handOutFlyersInRun(run: RunState, kind: FlyerCampaignKind) {
  const bi = currentBiome(run);
  if (bi === 0) run.economy.wallets[0] = run.coins;
  const res = distributePlayerFlyers(run.flyers, kind);
  if (res.coinsEarned > 0) {
    run.economy.wallets[bi] += res.coinsEarned;
    if (bi === 0) run.coins = run.economy.wallets[0];
  }
  if (res.ngoRecruitGained && run.ngo.joinedNgos.length > 0) {
    const nid = run.ngo.joinedNgos[0];
    const list = (run.ngo.recruits[nid] ??= []);
    list.push(`Panfletado #${list.length + 1}`);
  }
  if (res.paperLitterCreated > 0) {
    run.litter.groundLitter.push('papel');
    damageBiomeEcology(run.eco, bi, 2);
  }
  return res;
}
