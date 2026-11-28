import { describe, expect, it } from 'vitest';
import {
  advanceClock,
  beautyRespectBonus,
  clockHour,
  createClock,
  happinessBonus,
  isNight,
  willDisobey,
} from './life';
import { itemsForShop } from '../data/shops';
import { buryFallenPets, buyShopItem, careForPet, startRun, tickRunLife } from '../state/run';
import { STARTER_DECK } from '../data/cards';

describe('vida dos pets, relógio e lojas da vila', () => {
  it('avança dias e horas no padrão acelerado estilo The Sims e detecta noite', () => {
    const c = createClock(1, 19, 0);
    expect(isNight(c)).toBe(false);
    const hrs = advanceClock(c, 40); // ~61 game minutes -> 20:01
    expect(hrs).toBeGreaterThanOrEqual(1);
    expect(clockHour(c)).toBe(20);
    expect(isNight(c)).toBe(true);
  });

  it('felicidade alta fortalece o pet e felicidade baixa causa desobediência', () => {
    expect(happinessBonus(85)).toEqual({ attack: 1, defense: 1 });
    expect(happinessBonus(50)).toEqual({ attack: 0, defense: 0 });
    expect(willDisobey(15, 0.2)).toBe(true);
    expect(willDisobey(80, 0.01)).toBe(false);
  });

  it('beleza alta gera respeito e facilita batalhas contra NPCs', () => {
    expect(beautyRespectBonus(70)).toEqual({ bondBonus: 1, difficultyDelta: -1 });
    expect(beautyRespectBonus(20)).toEqual({ bondBonus: 0, difficultyDelta: 0 });
  });

  it('permadeath remove pets mortos em batalha ou de fome para o memorial', () => {
    const run = startRun(['pipo', 'casquinho'], [...STARTER_DECK], 1, 42);
    run.party[0].hp = 0;
    const dead = buryFallenPets(run);
    expect(dead).toHaveLength(1);
    expect(run.party).toHaveLength(1);
    expect(run.graveyard).toHaveLength(1);

    // Starve remaining pet
    run.party[0].hunger = 3;
    const alerts = tickRunLife(run, 40, true);
    expect(alerts.some((a) => a.includes('fome'))).toBe(true);
    expect(run.party).toHaveLength(0);
    expect(run.graveyard).toHaveLength(2);
  });

  it('lojinhas da vila alimentam, vestem, embelezam e ensinam livros de habilidades', () => {
    const run = startRun(['pipo'], [...STARTER_DECK], 1, 9);
    const pet = run.party[0];
    pet.hunger = 40;
    const food = itemsForShop('comida')[0];
    expect(buyShopItem(run, food, pet.uid).ok).toBe(true);
    expect(pet.hunger).toBeGreaterThan(40);

    const outfit = itemsForShop('roupinhas')[0];
    expect(buyShopItem(run, outfit, pet.uid).ok).toBe(true);
    expect(pet.outfit).toBe(outfit.outfitIcon);
    expect(pet.beauty).toBeGreaterThan(20);

    careForPet(run, pet.uid, 'brincar');
    expect(pet.happiness).toBeGreaterThanOrEqual(80);

    const book = itemsForShop('livros')[0];
    const deckBefore = run.deck.length;
    expect(buyShopItem(run, book).ok).toBe(true);
    expect(run.deck.length).toBe(deckBefore + 1);
  });
});
