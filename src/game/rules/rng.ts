/**
 * Small seeded PRNG (mulberry32). The whole state is one number, so it can live inside
 * plain serializable game state and makes battles and maps reproducible in tests.
 */
export interface RngState {
  state: number;
}

export function createRng(seed: number): RngState {
  return { state: seed >>> 0 };
}

/** Float in [0, 1). */
export function next(rng: RngState): number {
  rng.state = (rng.state + 0x6d2b79f5) >>> 0;
  let t = rng.state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Integer in [min, max] (inclusive). */
export function int(rng: RngState, min: number, max: number): number {
  return min + Math.floor(next(rng) * (max - min + 1));
}

export function chance(rng: RngState, probability: number): boolean {
  return next(rng) < probability;
}

export function pick<T>(rng: RngState, items: readonly T[]): T {
  if (items.length === 0) throw new Error('pick() de lista vazia');
  return items[Math.floor(next(rng) * items.length)];
}

/** Fisher–Yates shuffle, in place. */
export function shuffle<T>(rng: RngState, items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(next(rng) * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 32);
}
