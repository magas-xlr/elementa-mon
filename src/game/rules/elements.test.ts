import { describe, expect, it } from 'vitest';
import { ELEMENTS, elementMultiplier, strongAgainst, weakAgainst } from '../data/elements';

describe('tabela elemental', () => {
  it('segue a wiki com a linha como atacante', () => {
    expect(elementMultiplier('agua', 'fogo')).toBe(1.5);
    expect(elementMultiplier('fogo', 'agua')).toBe(0.3);
    expect(elementMultiplier('eletrico', 'agua')).toBe(1.5);
    expect(elementMultiplier('venenoso', 'fada')).toBe(1.4);
  });

  it('dá 100% contra o próprio elemento', () => {
    for (const e of ELEMENTS) expect(elementMultiplier(e, e)).toBe(1);
  });

  it('lista vantagens e fraquezas ordenadas', () => {
    expect(strongAgainst('agua')[0]).toBe('fogo');
    expect(weakAgainst('fogo')).toContain('agua');
    expect(weakAgainst('agua')[0]).toBe('eletrico');
  });
});
