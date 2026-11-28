import { describe, expect, it } from 'vitest';
import {
  startRun,
  buyShopItem,
  tickRunLife,
  betOnPetBattle,
  buyCar,
  fastTravelByCar,
  playerStatusScore,
} from '../state/run';
import { SHOP_ITEMS } from '../data/shops';
import { STORY_NPCS, npcAlignmentTreatment } from '../data/npcs';
import { checkChaoticEvilNightRobbery } from './social';
import { createRng } from './rng';

describe('besteira temporária, apostas, carros/fast travel, status, inveja, roubo e alinhamentos/deres', () => {
  it('comida besteira aumenta felicidade no curto prazo, danifica HP e depois a felicidade cai', () => {
    const run = startRun(['pipo'], ['ataque'], 1, 77);
    const pet = run.party[0];
    pet.happiness = 50;
    const hpBefore = pet.hp;
    const pizza = SHOP_ITEMS.find((i) => i.id === 'pizza_gordurosa')!;
    const res = buyShopItem(run, pizza, pet.uid);
    expect(res.ok).toBe(true);
    expect(pet.hp).toBeLessThan(hpBefore);
    expect(pet.happiness!).toBeGreaterThan(70);
    expect(pet.junkBoostHours).toBe(2);

    // After ~2 in-game hours (~85 real seconds), temporary happiness boost crashes!
    const alerts = tickRunLife(run, 85, false);
    expect(alerts.some((a) => a.includes('satisfação temporária'))).toBe(true);
    expect(pet.happiness!).toBeLessThan(55);
  });

  it('casa de apostas permite 1 aposta por dia, qualquer valor e dá título de Viciado após apostar demais', () => {
    const run = startRun(['pipo'], ['ataque'], 1, 99);
    run.coins = 500;
    run.economy.wallets[0] = 500;
    const first = betOnPetBattle(run, 'rex_chama', 25);
    expect(first.ok).toBe(true);
    // Second bet on same day is blocked!
    const secondSameDay = betOnPetBattle(run, 'rex_chama', 10);
    expect(secondSameDay.ok).toBe(false);

    // Betting across 4 days triggers Viciado em Apostas!
    for (let d = 2; d <= 4; d++) {
      run.clock.day = d;
      betOnPetBattle(run, 'rex_chama', 10);
    }
    expect(run.gambling.addicted).toBe(true);
    const lira = STORY_NPCS.find((n) => n.id === 'lira')!;
    const treat = npcAlignmentTreatment(lira, 50, true);
    expect(treat.refusesFavors).toBe(true);
    expect(treat.bondMod).toBeLessThan(0);
  });

  it('carros são caros, poluem, elevam status e são a única forma de fast travel entre bairros', () => {
    const run = startRun(['pipo'], ['ataque'], 1, 55);
    // Cannot fast travel without a car!
    expect(fastTravelByCar(run, 2).ok).toBe(false);

    run.coins = 2000;
    run.economy.wallets[0] = 2000;
    const ecoBefore = run.eco.biomeHealth[0];
    const buy = buyCar(run, 'hiper_ouro');
    expect(buy.ok).toBe(true);
    expect(playerStatusScore(run)).toBeGreaterThanOrEqual(120);
    expect(run.eco.biomeHealth[0]).toBeLessThan(ecoBefore);

    // Now fast travel works and pollutes destination biome!
    const travel = fastTravelByCar(run, 1);
    expect(travel.ok).toBe(true);
    expect(run.eco.biomeHealth[1]).toBeLessThan(100);
  });

  it('NPCs têm alinhamentos (Lawful Good..Chaotic Evil), estereótipos, deres e Chaotic Evil invejoso rouba à noite', () => {
    expect(STORY_NPCS.some((n) => n.alignment === 'Lawful Good')).toBe(true);
    expect(STORY_NPCS.some((n) => n.alignment === 'Chaotic Evil')).toBe(true);
    expect(STORY_NPCS.some((n) => n.stereotype === 'Otaku')).toBe(true);
    expect(STORY_NPCS.some((n) => n.stereotype === 'NEET')).toBe(true);
    expect(STORY_NPCS.some((n) => n.stereotype === 'Patricinha')).toBe(true);
    expect(STORY_NPCS.some((n) => n.dere === 'Tsundere')).toBe(true);
    expect(STORY_NPCS.some((n) => n.dere === 'Yandere')).toBe(true);

    const run = startRun(['pipo'], ['ataque'], 1, 42);
    run.social.npcEnvy['riko'] = 95;
    const rng = createRng(3);
    let robbed = false;
    for (let day = 1; day <= 6; day++) {
      const r = checkChaoticEvilNightRobbery(run.social, rng, day, 300, true);
      if (r.robbed) {
        robbed = true;
        expect(r.thief?.alignment).toBe('Chaotic Evil');
        expect(r.stolenCoins).toBeGreaterThan(0);
        break;
      }
    }
    expect(robbed).toBe(true);
  });
});
