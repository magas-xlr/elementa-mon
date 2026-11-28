import { detectLang, isLang, type Lang } from '../../i18n';
import { STARTER_DECK } from '../data/cards';
import { STARTER_SPECIES, isStarter } from '../data/species';
import { playerLevelFor, type PetInstance } from '../rules/progression';

export type Resolution = 'baixa' | 'media' | 'alta';

export interface Settings {
  volume: number;
  music: boolean;
  /** Internal render height: baixa 240p (N64), media 360p, alta 480p. */
  resolution: Resolution;
  fpsCap: 30 | 60;
  fullscreen: boolean;
  /** HD-2D post effects (tilt-shift, bloom, grade, vignette). */
  postFx: boolean;
  /** Interface language; the first launch follows the browser/OS language. */
  lang: Lang;
}

export interface SaveData {
  version: 1;
  playerXp: number;
  avatar: { body: number; hat: number };
  /** Last party and deck chosen in the builder. */
  party: string[];
  deck: string[];
  tutorialSeen: boolean;
  /** `biomesFound`: most biomes discovered in a single run. */
  stats: { runs: number; victories: number; battlesWon: number; biomesFound: number };
  /** Discovered secrets (undiscovered pets, cards & biomes stay hidden as ???). */
  discoveredSpecies?: string[];
  discoveredCards?: string[];
  discoveredBiomes?: number[];
  /** NPC relationship bond scores (negative = rival, 3+ = friendship, 5+ = romance). */
  npcBonds?: Record<string, number>;
  /** Total main bosses defeated across runs (8 unlocks the Secret 64 Talking Monsters Cyberpunk Sewer!). */
  bossesDefeated?: number;
  /** Roguelike Prison Game Over carryover: keeps collected pets & items when restarting after arrest! */
  prisonCarryover?: {
    pets: PetInstance[];
    relics: string[];
    jobItems: Record<string, number>;
    potions: number;
  } | null;
  settings: Settings;
}

export const SAVE_KEY = 'elementamon.save.v1';

export function defaultSave(): SaveData {
  return {
    version: 1,
    playerXp: 0,
    avatar: { body: 0xd94a4a, hat: 0x3a6fd9 },
    party: [...STARTER_SPECIES],
    deck: [...STARTER_DECK],
    tutorialSeen: false,
    stats: { runs: 0, victories: 0, battlesWon: 0, biomesFound: 0 },
    discoveredSpecies: [...STARTER_SPECIES],
    discoveredCards: [...new Set(STARTER_DECK)],
    discoveredBiomes: [0],
    settings: {
      volume: 0.6,
      music: true,
      resolution: 'alta',
      fpsCap: 60,
      fullscreen: false,
      postFx: true,
      lang: detectLang(),
    },
  };
}

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function storage(): KeyValueStorage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function loadSave(store: KeyValueStorage | null = storage()): SaveData {
  const base = defaultSave();
  try {
    const raw = store?.getItem(SAVE_KEY);
    if (!raw) return base;
    const data = JSON.parse(raw) as Partial<SaveData>;
    if (data.version !== 1) return base;
    return {
      ...base,
      ...data,
      avatar: { ...base.avatar, ...data.avatar },
      // Every adventure starts with the starter pet only (older saves had a free pick).
      party: data.party?.filter(isStarter).length ? data.party.filter(isStarter) : base.party,
      stats: { ...base.stats, ...data.stats },
      settings: {
        ...base.settings,
        ...data.settings,
        lang: isLang(data.settings?.lang) ? data.settings.lang : base.settings.lang,
      },
    };
  } catch {
    return base;
  }
}

export function writeSave(data: SaveData, store: KeyValueStorage | null = storage()): void {
  try {
    store?.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or blocked: the game keeps running with in-memory progress.
  }
}

export const playerLevel = (save: SaveData): number => playerLevelFor(save.playerXp);
