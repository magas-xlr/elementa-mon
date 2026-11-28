import { describe, expect, it } from 'vitest';
import { STARTER_DECK } from '../data/cards';
import { itemsForShop } from '../data/shops';
import { buyShopItem, hireMasonForRun, movePlayerToApartment, startRun } from '../state/run';
import { createHousingState, masonQuotePrice, tickHousing } from './housing';
import { createRng } from './rng';

describe('moradia, apartamentos, chuva/goteiras, pedreiro e comidas besteira', () => {
  it('permite alugar ou comprar apartamento e vizinhos reclamam de infiltração', () => {
    const run = startRun(['pipo'], [...STARTER_DECK], 1, 41);
    run.coins = 300;
    run.economy.wallets[0] = 300;
    expect(movePlayerToApartment(run, 'apt_2', 'alugar').ok).toBe(true);
    expect(run.housing.kind).toBe('apartamento');
    expect(run.housing.floor).toBe(2);
    expect(run.housing.neighbors.length).toBeGreaterThan(0);

    // Simulate rainy hours until infiltration triggers on old apartment
    run.housing.ageDays = 40;
    const rng = createRng(9);
    let complained = false;
    for (let i = 0; i < 20; i++) {
      const t = tickHousing(run.housing, rng, 2, 0, true);
      if (run.housing.damage === 'infiltracao' && run.housing.neighborComplaint) {
        complained = true;
        expect(t.petMoodPenalty).toBeGreaterThan(0);
        break;
      }
    }
    expect(complained).toBe(true);
  });

  it('pedreiro cobra mais barato e resolve rápido se bem tratado, ou cobra caro e demora dias se mal tratado', () => {
    const h = createHousingState();
    h.masonRelation = 4;
    const cheap = masonQuotePrice(h);
    h.masonRelation = -4;
    const expensive = masonQuotePrice(h);
    expect(expensive).toBeGreaterThan(cheap * 2);

    const run = startRun(['pipo'], [...STARTER_DECK], 1, 77);
    run.coins = 300;
    run.economy.wallets[0] = 300;
    run.housing.damage = 'goteira';
    run.housing.masonRelation = 4;
    expect(hireMasonForRun(run).ok).toBe(true);
    expect(run.housing.activeRepair?.hoursRemaining).toBeLessThanOrEqual(2);
  });

  it('comidas besteira pioram a saúde e cogumelo alucinógeno causa alucinação', () => {
    const run = startRun(['pipo'], [...STARTER_DECK], 1, 19);
    const pet = run.party[0];
    const pizza = itemsForShop('comida').find((i) => i.id === 'pizza_gordurosa')!;
    const shroom = itemsForShop('comida').find((i) => i.id === 'substancia_proibida')!;
    const hp0 = pet.hp;
    expect(buyShopItem(run, pizza, pet.uid).ok).toBe(true);
    expect(pet.hp).toBeLessThan(hp0);
    expect(buyShopItem(run, shroom, pet.uid).ok).toBe(true);
    expect(pet.hallucinating).toBe(true);
  });
});
