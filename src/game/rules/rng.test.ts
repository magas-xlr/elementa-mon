import { describe, expect, it } from 'vitest';
import { createRng, int, next, shuffle } from './rng';

describe('rng', () => {
  it('é determinístico pela seed', () => {
    const a = createRng(42);
    const b = createRng(42);
    expect([next(a), next(a), next(a)]).toEqual([next(b), next(b), next(b)]);
  });

  it('gera inteiros dentro do intervalo', () => {
    const rng = createRng(1);
    for (let i = 0; i < 500; i++) {
      const n = int(rng, 3, 7);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(7);
    }
  });

  it('embaralha mantendo os itens', () => {
    const items = shuffle(createRng(9), [1, 2, 3, 4, 5, 6]);
    expect([...items].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
