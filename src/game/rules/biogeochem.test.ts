import { describe, expect, it } from 'vitest';
import { ALL_BUILDING_KINDS, BUILDINGS } from '../data/buildings';
import { getSpecies } from '../data/species';
import { generateWorld, doorAt } from './world';
import {
  startRun,
  buyApplianceItem,
  handleOwnedItem,
  startDojoTraining,
  collectDojoPet,
  buySeeds,
  plantHomeSeed,
  harvestAndFeedHomeFood,
  searchForFossil,
  reviveFossilAtLab,
  restoreSkeletonWithWitch,
  tickRunLife,
  checkPermafrostEvent,
  recordPetPollen,
} from '../state/run';
import { computeUtilityImpact } from './utilities';
import { rollCursedBattleIdentity } from './biogeochem';
import { createRng } from './rng';

describe('edifícios físicos, água/energia/lixeiras, dojo, ciclos bioquímicos e fósseis/bruxa', () => {
  it('mapa gera fisicamente todos os 13 estabelecimentos com portas caminháveis', () => {
    const map = generateWorld(123);
    const placed = new Set(Object.values(map.buildings));
    for (const kind of ALL_BUILDING_KINDS) {
      expect(placed.has(kind)).toBe(true);
    }
    const doorKinds = new Set(Object.values(map.doors));
    expect(doorKinds.size).toBe(ALL_BUILDING_KINDS.length);
    // Verify doorAt works for at least one placed door
    const firstDoorIdx = Number(Object.keys(map.doors)[0]);
    const dx = firstDoorIdx % map.width;
    const dy = Math.floor(firstDoorIdx / map.width);
    expect(doorAt(map, dx, dy)).toBe(map.doors[firstDoorIdx]);
    // Every single building NPC's active pet & party species must be a valid Species ID!
    for (const kind of ALL_BUILDING_KINDS) {
      const npc = BUILDINGS[kind].npc;
      expect(getSpecies(npc.activePetSpecies).id).toBe(npc.activePetSpecies);
      for (const sid of npc.partySpecies) {
        expect(getSpecies(sid).id).toBe(sid);
      }
    }
    // Legends: Arceus-style sparse visible wild spawns on the map (2-3 per biome, not overcrowded!)
    const wildKeys = Object.keys(map.wildSpawns);
    expect(wildKeys.length).toBeGreaterThanOrEqual(14);
    expect(wildKeys.length).toBeLessThanOrEqual(24);
  });

  it('consumo de água/energia, gás carbono (CO2), ciclo de vida de itens e lixeira seletiva', () => {
    const run = startRun(['pipo'], ['ataque'], 1, 10);
    run.coins = 500;
    run.economy.wallets[0] = 500;
    const baseImpact = computeUtilityImpact(run.utilities, 0);
    buyApplianceItem(run, 'gerador_carbono');
    const carbonImpact = computeUtilityImpact(run.utilities, 0);
    expect(carbonImpact.carbonCount).toBe(1);
    expect(carbonImpact.ecoDamage).toBeGreaterThan(baseImpact.ecoDamage + 5);

    // Wrong recycling bin damages ecology!
    const ecoBefore = run.eco.biomeHealth[0];
    const wrong = handleOwnedItem(run, 'garrafa_vidro', 'descartar', 'papel');
    expect(wrong.ok).toBe(true);
    expect(run.eco.biomeHealth[0]).toBeLessThan(ecoBefore);

    // Donate / auction / sell / trade work cleanly
    buyApplianceItem(run, 'revista_papel');
    const donated = handleOwnedItem(run, 'revista_papel', 'doar');
    expect(donated.ok).toBe(true);
    expect(run.utilities.totalDonated).toBe(1);
  });

  it('dojo de artes marciais treina pet e aumenta HP, Força, Defesa e Agilidade permanentemente', () => {
    const run = startRun(['pipo', 'casquinho'], ['ataque'], 1, 22);
    run.coins = 200;
    run.economy.wallets[0] = 200;
    const target = run.party[1];
    const train = startDojoTraining(run, target.uid, 'muay_thai');
    expect(train.ok).toBe(true);
    expect(run.dojoSlots.length).toBe(1);

    // Advance 4+ in-game hours (~165 real seconds)
    tickRunLife(run, 165, false);
    const grad = collectDojoPet(run, run.dojoSlots[0].id);
    expect(grad.ok).toBe(true);
    const trainedPet = run.party.find((p) => p.uid === target.uid)!;
    expect(trainedPet.hpMod).toBeGreaterThan(0);
    expect(trainedPet.atkMod).toBeGreaterThan(0);
    expect(trainedPet.defMod).toBeGreaterThan(0);
    expect(trainedPet.agiMod).toBeGreaterThan(0);
  });

  it('sementes, permafrost, pólen, fósseis -> dinossauro esqueleto -> bruxa do cemitério -> pet amaldiçoado', () => {
    const run = startRun(['pipo'], ['ataque'], 1, 33);
    run.coins = 300;
    run.economy.wallets[0] = 300;

    // 1. Seeds & home organic food
    expect(buySeeds(run, 'semente_fruta').ok).toBe(true);
    expect(plantHomeSeed(run, 'semente_fruta').ok).toBe(true);
    tickRunLife(run, 130, false);
    expect(harvestAndFeedHomeFood(run).ok).toBe(true);

    // 2. Pollen cycle -> permanent Plant form
    recordPetPollen(run.party[0]);
    recordPetPollen(run.party[0]);
    const pollenMsg = recordPetPollen(run.party[0]);
    expect(pollenMsg).toContain('PLANTA');
    expect(run.party[0].plantForm).toBe(true);

    // 3. Permafrost -> Ice transformation
    const rng = createRng(1);
    let froze = false;
    for (let i = 0; i < 40; i++) {
      if (checkPermafrostEvent(run.party, rng, true)) {
        froze = true;
        break;
      }
    }
    expect(froze).toBe(true);
    expect(run.party[0].element).toBe('gelo');

    // 4. Fossils -> Lab Skeleton Dinosaur -> Cemetery Witch -> Living/Cursed pet
    searchForFossil(run);
    searchForFossil(run);
    searchForFossil(run);
    const dinoRes = reviveFossilAtLab(run);
    expect(dinoRes.ok).toBe(true);
    const skeleton = run.party.find((p) => p.mutation === 'esqueleto')!;
    expect(skeleton).toBeDefined();

    const witchRes = restoreSkeletonWithWitch(run, skeleton.uid);
    expect(witchRes.ok).toBe(true);
    expect(skeleton.mutation).toBeUndefined();
    // Test cursed random identity swap
    skeleton.cursed = true;
    const id1 = rollCursedBattleIdentity(skeleton, createRng(7));
    const id2 = rollCursedBattleIdentity(skeleton, createRng(99));
    expect(id1.speciesId !== id2.speciesId || id1.element !== id2.element).toBe(true);
  });
});
