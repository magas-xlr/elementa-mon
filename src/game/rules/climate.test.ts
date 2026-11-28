import { describe, expect, it } from 'vitest';
import {
  CONSPIRACY_SOCIETY,
  EXTREME_HEAT_CO2_THRESHOLD,
  emitCo2,
  globalTempDeltaC,
  isExtremeHeat,
  talkToConspiracyLeader,
} from './climate';
import { canUseCard, createBattle, fighterFromPet } from './battle';
import { createPet } from './progression';
import { startRun, clearLotInRun, mineMineralsInRun, sellMineralsInRun } from '../state/run';

describe('aquecimento global, sociedade secreta (quebra da 4ª parede), capinar lote e extração mineral', () => {
  it('CO2 eleva temperatura global e calor extremo inutiliza cartas de Água e pets de Gelo em batalha', () => {
    const run = startRun(['pipo'], ['jato', 'brasa'], 1, 71);
    expect(isExtremeHeat(run.climate)).toBe(false);
    emitCo2(run.climate, EXTREME_HEAT_CO2_THRESHOLD);
    expect(isExtremeHeat(run.climate)).toBe(true);
    expect(globalTempDeltaC(run.climate)).toBeGreaterThanOrEqual(3.0);

    const icePet = fighterFromPet(createPet('floco', 1, 'gelo'), 'player');
    const firePet = fighterFromPet(createPet('pipo', 1, 'fogo'), 'player');
    const enemy = fighterFromPet(createPet('bicudo', 1, 'neutro'), 'enemy');
    const battle = createBattle({
      party: [icePet, firePet],
      enemies: [enemy],
      deck: ['jato', 'brasa'],
      seed: 1,
      extremeHeat: true,
    });
    battle.mana = { corpo: 5, ilusao: 5, talento: 5 };

    // Water card ('jato') is disabled in extreme heat!
    expect(canUseCard(firePet, 'jato', battle.extremeHeat)).toBe(false);
    // Fire card works for Fire pet, but Ice pet ('gelo') is disabled in extreme heat!
    expect(canUseCard(firePet, 'brasa', battle.extremeHeat)).toBe(true);
    expect(canUseCard(icePet, 'brasa', battle.extremeHeat)).toBe(false);
  });

  it('sociedade secreta nega aquecimento global e quebra a quarta parede falando de IA, energia e água de refrigeração', () => {
    const run = startRun(['pipo'], ['ataque'], 1, 72);
    expect(CONSPIRACY_SOCIETY.name).toContain('Sociedade Secreta');
    const lines = [
      talkToConspiracyLeader(run.climate),
      talkToConspiracyLeader(run.climate),
      talkToConspiracyLeader(run.climate),
    ];
    expect(lines.some((l) => l.includes('IA') && l.includes('energia') && l.includes('água'))).toBe(
      true
    );
  });

  it('capinar lote e extrair minerais (pedra, metal, ouro, pedras preciosas) rende lucro mas polui e emite CO2', () => {
    const run = startRun(['pipo'], ['ataque'], 1, 73);
    // Cannot mine before clearing a lot
    expect(mineMineralsInRun(run).ok).toBe(false);

    const ecoBefore = run.eco.biomeHealth[0];
    const co2Before = run.climate.co2Atmosphere;
    clearLotInRun(run);
    expect(run.climate.lotsCleared).toBe(1);
    expect(run.eco.biomeHealth[0]).toBeLessThan(ecoBefore);
    expect(run.climate.co2Atmosphere).toBeGreaterThan(co2Before);

    const mined = mineMineralsInRun(run);
    expect(mined.ok).toBe(true);
    const sold = sellMineralsInRun(run);
    expect(sold.coins).toBeGreaterThan(0);
  });
});
