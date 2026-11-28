import { describe, expect, it } from 'vitest';
import { BIOME_ENDEMISM, canSpeciesAppear, seasonForDay } from './biosphere';
import { globalTempDeltaC } from './climate';
import { startRun, chopTreeInRun, replantTreeInRun, buildHydroDamInRun } from '../state/run';
import { setTile, tileAt } from './world';

describe('fragmentação florestal, endemismo/microendemismo, nichos dia/noite/habitat, hidrelétricas (metano) e 4 estações', () => {
  it('cortar árvore causa fragmentação florestal (some do mapa) e só volta ao replantar muda', () => {
    const run = startRun(['pipo'], ['ataque'], 1, 81);
    setTile(run.map, 10, 10, 'arvore');
    const chop = chopTreeInRun(run, 10, 10);
    expect(chop.ok).toBe(true);
    expect(tileAt(run.map, 10, 10)).toBe('grama');
    expect(run.biosphere.choppedTrees.length).toBe(1);
    expect(run.biosphere.woodLogs).toBe(1);

    const plant = replantTreeInRun(run, 10, 10);
    expect(plant.ok).toBe(true);
    expect(tileAt(run.map, 10, 10)).toBe('arvore');
    expect(run.biosphere.choppedTrees.length).toBe(0);
  });

  it('endemismo, microendemismo por bairro e nichos (só dia, só noite, só rio, só vulcão)', () => {
    expect(BIOME_ENDEMISM.length).toBe(7);
    // Vagalume only at night
    expect(canSpeciesAppear('vagalume', 4, true, 'qualquer')).toBe(true);
    expect(canSpeciesAppear('vagalume', 4, false, 'qualquer')).toBe(false);
    // Bicudo only during day
    expect(canSpeciesAppear('bicudo', 0, false, 'qualquer')).toBe(true);
    expect(canSpeciesAppear('bicudo', 0, true, 'qualquer')).toBe(false);
    // Coralinho: microendemic ONLY to biome 0 AND river habitat!
    expect(canSpeciesAppear('coralinho', 0, false, 'rio')).toBe(true);
    expect(canSpeciesAppear('coralinho', 1, false, 'rio')).toBe(false);
    expect(canSpeciesAppear('coralinho', 0, false, 'floresta')).toBe(false);
    // Duna: microendemic ONLY to biome 1, day, volcano/desert!
    expect(canSpeciesAppear('duna', 1, false, 'vulcao')).toBe(true);
    expect(canSpeciesAppear('duna', 0, false, 'vulcao')).toBe(false);
  });

  it('hidrelétrica inunda áreas verdes, libera metano e aumenta fortemente o efeito estufa', () => {
    const run = startRun(['pipo'], ['ataque'], 1, 82);
    run.coins = 200;
    run.economy.wallets[0] = 200;
    const tempBefore = globalTempDeltaC(run.climate);
    const hydro = buildHydroDamInRun(run);
    expect(hydro.ok).toBe(true);
    expect(hydro.floodedTiles).toBeGreaterThan(0);
    expect(run.climate.methaneAtmosphere).toBeGreaterThan(0);
    expect(globalTempDeltaC(run.climate)).toBeGreaterThan(tempBefore + 1.5);
  });

  it('estações do ano ciclam entre Primavera, Verão, Outono e Inverno e afetam plantas e temperatura', () => {
    expect(seasonForDay(1).id).toBe('primavera');
    expect(seasonForDay(8).id).toBe('verao');
    expect(seasonForDay(15).id).toBe('outono');
    expect(seasonForDay(22).id).toBe('inverno');
    expect(seasonForDay(1).plantGrowthMult).toBeGreaterThan(seasonForDay(22).plantGrowthMult);
  });
});
