import { describe, expect, it } from 'vitest';
import {
  createEnergyGridState,
  ENERGY_SOURCE_LIST,
  ENERGY_SOURCES,
  exposePetsToNuclearRadiation,
  installBiomeEnergyPlant,
} from './energy';
import { createPet } from './progression';
import { createBattle, fighterFromPet, canUseCard, playCard } from './battle';
import { CARDS } from '../data/cards';
import { applyCrystal, changePetElement, startRun } from '../state/run';

describe('Neighborhood Energy Plants & Radioactive Pets', () => {
  it('supports all 8 energy sources and every single one harms the environment (some much less, some much more)', () => {
    expect(ENERGY_SOURCE_LIST.length).toBe(8);
    const ids = ENERGY_SOURCE_LIST.map((e) => e.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'hidroeletrica',
        'termoeletrica',
        'solar',
        'fotovoltaica',
        'eolica',
        'nuclear',
        'hidrogenio',
        'biocombustivel',
      ])
    );
    for (const src of ENERGY_SOURCE_LIST) {
      expect(src.ecoDamage).toBeGreaterThan(0);
    }
    expect(ENERGY_SOURCES.eolica.ecoDamage).toBeLessThan(ENERGY_SOURCES.termoeletrica.ecoDamage);
    expect(ENERGY_SOURCES.solar.ecoDamage).toBeLessThan(ENERGY_SOURCES.hidroeletrica.ecoDamage);
  });

  it('mutates pets staying too long near a nuclear plant into radioactive type', () => {
    const grid = createEnergyGridState();
    const res = installBiomeEnergyPlant(grid, 0, 'nuclear', 500);
    expect(res.ok).toBe(true);
    expect(grid.biomePlants[0]).toBe('nuclear');

    const pet = createPet('pipo', 1, 'neutro');
    const alerts1 = exposePetsToNuclearRadiation([pet], 2, true);
    expect(alerts1.length).toBe(0);
    expect(pet.element).toBe('neutro');

    const alerts2 = exposePetsToNuclearRadiation([pet], 4, true);
    expect(alerts2.length).toBe(1);
    expect(pet.element).toBe('radioativo');
  });

  it('prevents radioactive pets from becoming elemental pets or using elemental cards', () => {
    const run = startRun(['pipo'], ['investida', 'chama'], 1, 42);
    const pet = run.party[0];
    pet.element = 'radioativo';
    run.crystals.fogo = 1;

    expect(applyCrystal(run, pet.uid, 'fogo')).toBe(false);
    expect(changePetElement(run, pet.uid, 'agua')).toBe(false);
    expect(pet.element).toBe('radioativo');

    const fireCard = Object.values(CARDS).find((c) => c.element === 'fogo')!;
    const transformCard = Object.values(CARDS).find((c) => c.effect.kind === 'transformar')!;
    const neutralDmgCard = Object.values(CARDS).find(
      (c) => c.element === 'neutro' && c.effect.kind === 'dano'
    )!;

    expect(canUseCard(pet, fireCard.id)).toBe(false);
    expect(canUseCard(pet, transformCard.id)).toBe(false);
    expect(canUseCard(pet, neutralDmgCard.id)).toBe(true);
  });

  it('radioactive attack is hit-kill, drains 50% HP of all pets, and 2 nuclear attacks wipe own party', () => {
    const neutralDmgCard = Object.values(CARDS).find(
      (c) => c.element === 'neutro' && c.effect.kind === 'dano' && !c.effect.area
    )!;
    const radPet = createPet('pipo', 2, 'radioativo');
    const allyPet = createPet('casquinho', 2, 'neutro');
    const enemy1 = createPet('bicudo', 3, 'fogo');
    const enemy2 = createPet('duna', 3, 'terra');

    const battle = createBattle({
      party: [fighterFromPet(radPet, 'player'), fighterFromPet(allyPet, 'player')],
      enemies: [fighterFromPet(enemy1, 'enemy'), fighterFromPet(enemy2, 'enemy')],
      deck: [neutralDmgCard.id, neutralDmgCard.id, neutralDmgCard.id, neutralDmgCard.id],
      seed: 123,
      bonusMana: 4,
    });

    const radMax = battle.party[0].maxHp;
    const allyMax = battle.party[1].maxHp;
    const enemy2Max = battle.enemies[1].maxHp;

    // 1st nuclear attack: hit-kills enemy1, drains half HP of all surviving pets!
    const r1 = playCard(battle, 0, battle.party[0].uid, battle.enemies[0].uid);
    expect(r1.ok).toBe(true);
    expect(battle.enemies[0].hp).toBe(0);
    expect(battle.party[0].hp).toBe(radMax - Math.ceil(radMax / 2));
    expect(battle.party[1].hp).toBe(allyMax - Math.ceil(allyMax / 2));
    expect(battle.enemies[1].hp).toBe(enemy2Max - Math.ceil(enemy2Max / 2));
    expect(battle.winner).toBeNull();

    // 2nd nuclear attack in same battle: kills own entire party!
    const r2 = playCard(battle, 0, battle.party[0].uid, battle.enemies[1].uid);
    expect(r2.ok).toBe(true);
    expect(battle.party.every((p) => p.hp === 0)).toBe(true);
    expect(battle.winner).toBe('enemy');
  });
});
