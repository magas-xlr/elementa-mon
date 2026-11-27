import { STARTER_DECK } from '../data/cards';
import { playerLevelFor } from '../rules/progression';

export type Resolution = 'baixa' | 'media' | 'alta';

export interface Settings {
  volume: number;
  music: boolean;
  /** Internal render height: baixa 240p (N64), media 360p, alta 480p. */
  resolution: Resolution;
  fpsCap: 30 | 60;
  fullscreen: boolean;
}

export interface SaveData {
  version: 1;
  playerXp: number;
  avatar: { body: number; hat: number };
  /** Last party and deck chosen in the builder. */
  party: string[];
  deck: string[];
  tutorialSeen: boolean;
  stats: { runs: number; victories: number; battlesWon: number; bestFloor: number };
  settings: Settings;
}

export const SAVE_KEY = 'elementamon.save.v1';

export function defaultSave(): SaveData {
  return {
    version: 1,
    playerXp: 0,
    avatar: { body: 0xd94a4a, hat: 0x3a6fd9 },
    party: ['fagulho', 'gotelo', 'faiscar'],
    deck: [...STARTER_DECK],
    tutorialSeen: false,
    stats: { runs: 0, victories: 0, battlesWon: 0, bestFloor: 0 },
    settings: { volume: 0.6, music: true, resolution: 'baixa', fpsCap: 60, fullscreen: false },
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
      stats: { ...base.stats, ...data.stats },
      settings: { ...base.settings, ...data.settings },
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
