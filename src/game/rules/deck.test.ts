import { describe, expect, it } from 'vitest';
import { STARTER_DECK } from '../data/cards';
import { canAddCard, validateDeck, validateParty } from './deck';

describe('deck', () => {
  it('aceita o deck inicial no nível 1', () => {
    expect(validateDeck(STARTER_DECK, 1)).toEqual([]);
  });

  it('limita a 15 cartas e 1 invocação', () => {
    const ids = ['investida', 'guarda', 'curativo', 'foco', 'brasa', 'jato'];
    const big = Array.from({ length: 16 }, (_, i) => ids[i % ids.length]);
    expect(validateDeck(big, 10).join()).toContain('15');
    expect(validateDeck([...STARTER_DECK, 'fenix'], 10).join()).toContain('invocação');
  });

  it('exige o nível do jogador e o mínimo de cartas', () => {
    const deck = ['pesadelo', 'investida', 'investida', 'guarda', 'foco'];
    expect(validateDeck(deck, 1).join()).toContain('nível 4');
    expect(validateDeck(['investida'], 1).join()).toContain('pelo menos');
  });

  it('canAddCard respeita cópias e invocações', () => {
    expect(canAddCard(['investida', 'investida', 'investida'], 'investida', 1)).toBe(false);
    expect(canAddCard(['golem'], 'fenix', 5)).toBe(false);
    expect(canAddCard(['golem'], 'brasa', 1)).toBe(true);
  });

  it('valida a equipe de até 3 pets', () => {
    expect(validateParty(['fagulho', 'gotelo', 'faiscar'], 1)).toEqual([]);
    expect(validateParty(['fagulho', 'gotelo', 'faiscar', 'torrao'], 5).length).toBeGreaterThan(0);
    expect(validateParty(['vultinho'], 1).join()).toContain('nível 4');
    expect(validateParty(['fagulho', 'fagulho'], 1).join()).toContain('repita');
  });
});
