/**
 * The Sims-inspired in-game clock, Day/Night cycle, pet care needs (hunger, happiness, beauty),
 * disobedience/buff thresholds, and rare random catastrophe events.
 */

export interface GameClock {
  /** Current day starting at 1. */
  day: number;
  /** Minutes elapsed in the current day (0..1439). Starts at 08:00 (480). */
  minutes: number;
}

/** In-game minutes per real second (~1.54 min/s -> 1 game hour ≈ 39 real seconds). */
export const GAME_MINUTES_PER_REAL_SEC = 1.54;

export function createClock(day = 1, hour = 8, minute = 0): GameClock {
  return { day, minutes: hour * 60 + minute };
}

export function clockHour(c: GameClock): number {
  return Math.floor(c.minutes / 60) % 24;
}

export function clockMinute(c: GameClock): number {
  return Math.floor(c.minutes) % 60;
}

export function isNight(c: GameClock): boolean {
  const h = clockHour(c);
  return h >= 20 || h < 5;
}

export function timePhase(c: GameClock): 'amanhecer' | 'dia' | 'entardecer' | 'noite' {
  const h = clockHour(c);
  if (h >= 5 && h < 8) return 'amanhecer';
  if (h >= 8 && h < 17) return 'dia';
  if (h >= 17 && h < 20) return 'entardecer';
  return 'noite';
}

export function formatClock(c: GameClock): string {
  const hh = String(clockHour(c)).padStart(2, '0');
  const mm = String(clockMinute(c)).padStart(2, '0');
  const phase = timePhase(c);
  const icon =
    phase === 'noite' ? '🌙' : phase === 'entardecer' ? '🌇' : phase === 'amanhecer' ? '🌅' : '☀️';
  return `${icon} Dia ${c.day} · ${hh}:${mm}`;
}

/**
 * Advances the Sims clock by `realDt` seconds.
 * Returns how many full in-game hours elapsed (for draining hunger & rolling weather disasters).
 */
export function advanceClock(clock: GameClock, realDt: number): number {
  const prevHour = Math.floor(clock.minutes / 60);
  clock.minutes += realDt * GAME_MINUTES_PER_REAL_SEC;
  const hoursPassed = Math.floor(clock.minutes / 60) - prevHour;
  while (clock.minutes >= 1440) {
    clock.minutes -= 1440;
    clock.day += 1;
  }
  return Math.max(0, hoursPassed);
}

export interface CatastropheEvent {
  id: 'raio' | 'furacao' | 'arvore';
  message: (petName: string) => string;
}

export const CATASTROPHES: readonly CatastropheEvent[] = [
  { id: 'raio', message: (n) => `⚡ Um raio caiu subitamente sobre ${n}!` },
  { id: 'furacao', message: (n) => `🌪️ Um furacão repentino levou ${n} embora!` },
  { id: 'arvore', message: (n) => `🌲 Uma árvore antiga caiu sobre ${n}!` },
];

/** Happiness stat bonus: very happy pets (>=80) gain +1 ATK and +1 DEF! */
export function happinessBonus(happiness = 70): { attack: number; defense: number } {
  return happiness >= 80 ? { attack: 1, defense: 1 } : { attack: 0, defense: 0 };
}

/** Unhappy pets (<25) may refuse to obey commands in battle. */
export function willDisobey(happiness = 70, roll01: number): boolean {
  if (happiness >= 25) return false;
  return roll01 < 0.45;
}

/** High average party beauty (>=55) makes NPCs admire you and go easier in battle! */
export function beautyRespectBonus(avgBeauty: number): {
  bondBonus: number;
  difficultyDelta: number;
} {
  if (avgBeauty >= 65) return { bondBonus: 1, difficultyDelta: -1 };
  if (avgBeauty >= 45) return { bondBonus: 1, difficultyDelta: 0 };
  return { bondBonus: 0, difficultyDelta: 0 };
}
