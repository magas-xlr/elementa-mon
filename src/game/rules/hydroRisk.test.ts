import { describe, expect, it } from 'vitest';
import {
  applyHydroRegimeEffects,
  computeAnthropoceneIndex,
  createHydroClimateState,
  DEFAULT_BIOME_SANITATION,
  improveBiomeSanitation,
  triggerDamBreak,
  triggerGovernmentDamExplosion,
} from './hydroRisk';
import { APARTMENTS, createHousingState, moveToApartment } from './housing';
import { createEnergyGridState } from './energy';
import { createPet } from './progression';
import { createRng } from './rng';
import { generateWorld } from './world';

describe('Dam Housing Risk, Drought (Estiagem) & Heavy Rain Floods', () => {
  it('offers much cheaper housing near dams with nearDam risk flag', () => {
    const damApt = APARTMENTS.find((a) => a.nearDam);
    const normalApt = APARTMENTS.find((a) => !a.nearDam);
    expect(damApt).toBeDefined();
    expect(normalApt).toBeDefined();
    expect(damApt!.rentPerDay).toBeLessThan(normalApt!.rentPerDay);
    expect(damApt!.buyPrice).toBeLessThan(normalApt!.buyPrice);

    const h = createHousingState();
    const res = moveToApartment(h, damApt!.id, 'alugar', 100);
    expect(res.ok).toBe(true);
    expect(h.nearDam).toBe(true);
  });

  it('dam break floods tiles and permanently kills NPCs or makes them homeless', () => {
    const state = createHydroClimateState();
    const map = generateWorld(42);
    const rng = createRng(77);
    const npcIds = ['lira', 'kael', 'mira', 'tomas'];

    const res = triggerDamBreak(state, map, 0, npcIds, rng);
    expect(state.damBroken).toBe(true);
    expect(res.floodedTiles).toBeGreaterThan(0);
    expect(res.killedNpcs.length + res.homelessNpcs.length).toBe(npcIds.length);
    expect(state.deadNpcIds.length + state.homelessNpcIds.length).toBe(npcIds.length);
  });

  it('prolonged drought (estiagem) harms agriculture, water storage, disease risk, and activates expensive Termoelétrica', () => {
    const state = createHydroClimateState();
    state.regime = 'estiagem';
    const map = generateWorld(42);
    const energy = createEnergyGridState();
    const rng = createRng(99);
    const party = [createPet('pipo', 1, 'neutro')];

    const res = applyHydroRegimeEffects(state, rng, 2, map, 0, ['lira'], party, energy);
    expect(state.waterStorageStatus).toBe('inadequado');
    expect(state.agricultureMultiplier).toBeLessThan(0.5);
    expect(state.diseaseRisk).toBeGreaterThan(20);
    expect(state.thermalFallbackActive).toBe(true);
    expect(state.energyTariffMultiplier).toBeGreaterThan(1.5);
    expect(energy.biomePlants[0]).toBe('termoeletrica');
    expect(res.extraCo2).toBeGreaterThan(0);
  });

  it('prolonged heavy rain (chuva_intensa) floods streets, spreads disease, hurts agriculture, and can rupture the dam', () => {
    const state = createHydroClimateState();
    state.regime = 'chuva_intensa';
    state.damRiskLevel = 60;
    const map = generateWorld(42);
    const energy = createEnergyGridState();
    const rng = createRng(11);
    const party = [createPet('pipo', 1, 'neutro')];

    const res = applyHydroRegimeEffects(state, rng, 2, map, 0, ['lira', 'kael'], party, energy);
    expect(state.floodedStreets).toBeGreaterThan(0);
    expect(state.waterStorageStatus).toBe('inadequado');
    expect(state.agricultureMultiplier).toBeLessThan(0.5);
    expect(state.diseaseRisk).toBeGreaterThan(30);
    expect(state.damBroken).toBe(true);
    expect(res.alerts.some((a) => a.includes('ROMPIMENTO DA BARRAGEM'))).toBe(true);
  });

  it('varies basic sanitation across neighborhoods and supports sanitation upgrades', () => {
    const state = createHydroClimateState();
    const values = Object.values(DEFAULT_BIOME_SANITATION);
    expect(Math.max(...values) - Math.min(...values)).toBeGreaterThanOrEqual(40);
    const before = state.biomeSanitation[5];
    const up = improveBiomeSanitation(state, 5, 100);
    expect(up.ok).toBe(true);
    expect(state.biomeSanitation[5]).toBe(before + 20);
  });

  it('government-neglect dam explosion turns the entire biome into mud (lama) and raises Anthropocene index', () => {
    const state = createHydroClimateState();
    const map = generateWorld(42);
    const rng = createRng(55);

    const beforeIdx = computeAnthropoceneIndex({
      co2Atmosphere: 10,
      methaneAtmosphere: 0,
      choppedTreesCount: 0,
      mudBiomesCount: 0,
      avgSanitation: 75,
      groundLitterCount: 0,
    });

    const exp = triggerGovernmentDamExplosion(state, map, 0, ['lira', 'kael'], rng);
    expect(exp.mudTiles).toBeGreaterThan(50);
    expect(state.mudBiomes).toContain(0);
    expect(map.tiles.some((t) => t === 'lama')).toBe(true);

    const afterIdx = computeAnthropoceneIndex({
      co2Atmosphere: 60,
      methaneAtmosphere: 20,
      choppedTreesCount: 6,
      mudBiomesCount: state.mudBiomes.length,
      avgSanitation: 35,
      groundLitterCount: 8,
    });
    expect(afterIdx.score).toBeGreaterThan(beforeIdx.score);
    expect(afterIdx.era).toMatch(/Antropoc[eê]n/);
  });
});
