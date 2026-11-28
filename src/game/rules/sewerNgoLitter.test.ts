import { describe, expect, it } from 'vitest';
import {
  BOSSES_TO_UNLOCK_SEWER,
  SEWER_BIOMES,
  TALKING_MONSTERS,
  TOTAL_TALKING_MONSTERS,
  buildProtagonistMirrorBoss,
  checkSewerUnlock,
} from './sewerQuest';
import { INITIAL_SPECIES_POPULATION, NGOS, POACHING_FINE_THRESHOLD } from './ngos';
import {
  startRun,
  recordWildKillInRun,
  payNgoFineInRun,
  joinNgo,
  recruitToNgo,
  recoverExtinctSpecies,
  buyGlassPackingBox,
  pickupGroundLitterInRun,
  recycleLitterInRun,
} from '../state/run';

describe('esgoto cyberpunk (64 monstros falantes), ONGs/extinção/prisão roguelike e lixo/depósito de vidro', () => {
  it('missão secreta dos 64 monstros falantes só desbloqueia após 8 chefes e o vilão final é o protagonista', () => {
    const run = startRun(['pipo', 'casquinho'], ['ataque'], 1, 77, { bossesDefeated: 7 });
    expect(run.sewer.unlocked).toBe(false);
    expect(checkSewerUnlock(run.sewer, BOSSES_TO_UNLOCK_SEWER)).toBe(true);
    expect(TALKING_MONSTERS.length).toBe(TOTAL_TALKING_MONSTERS);
    expect(SEWER_BIOMES.length).toBe(4);
    const villains = TALKING_MONSTERS.filter((m) => m.role === 'vilao').length;
    const allies = TALKING_MONSTERS.filter((m) => m.role === 'aliado').length;
    expect(villains).toBeGreaterThan(allies);

    const twist = buildProtagonistMirrorBoss(run.party);
    expect(twist.bossTitle).toContain('VOCÊ MESMO');
    expect(twist.enemies.length).toBe(2);
    expect(twist.enemies[0].speciesId).toBe('pipo');
  });

  it('ONGs, extinção permanente de espécie, recuperação por recrutas, multa e prisão roguelike mantendo pets/itens', () => {
    const run = startRun(['pipo'], ['ataque'], 1, 88);
    expect(NGOS.length).toBeGreaterThanOrEqual(4);

    // Killing all wild individuals of 'bicudo' makes it EXTINCT and triggers NGO fine!
    for (let i = 0; i < INITIAL_SPECIES_POPULATION; i++) {
      recordWildKillInRun(run, 'bicudo');
    }
    expect(run.ngo.extinctSpecies).toContain('bicudo');
    expect(run.ngo.wildPetsKilled).toBeGreaterThanOrEqual(POACHING_FINE_THRESHOLD);
    expect(run.ngo.fineOwed).toBeGreaterThan(0);

    // Unable to pay fine -> ARRESTED (Prison Game Over!)
    run.coins = 5;
    run.economy.wallets[0] = 5;
    const arrest = payNgoFineInRun(run);
    expect(arrest.paid).toBe(false);
    expect(arrest.arrested).toBe(true);

    // Roguelike restart after prison keeps pets & items!
    const nextRun = startRun(['pipo'], ['ataque'], 1, 89, {
      prisonCarryover: {
        pets: [...run.party],
        relics: ['amuleto'],
        jobItems: { mel_dourado: 1 },
        potions: 3,
      },
    });
    expect(nextRun.relics).toContain('amuleto');
    expect(nextRun.jobItems['mel_dourado']).toBe(1);
    expect(nextRun.potions).toBe(3);

    // Joining Pet NGO + recruiting 2 NPCs allows recovering an extinct species!
    expect(joinNgo(run.ngo, 'ong_pets').ok).toBe(true);
    expect(recruitToNgo(run.ngo, 'ong_pets', 'Lira').ok).toBe(true);
    expect(recruitToNgo(run.ngo, 'ong_pets', 'Kael').ok).toBe(true);
    expect(recoverExtinctSpecies(run.ngo, 'bicudo').ok).toBe(true);
    expect(run.ngo.extinctSpecies).not.toContain('bicudo');
  });

  it('lixo no chão, coleta, depósito especial (eletrônicos/baterias/vidros) e caixa obrigatória para vidro', () => {
    const run = startRun(['pipo'], ['ataque'], 1, 91);
    run.litter.packingBoxes = 0;
    run.litter.groundLitter = ['vidro', 'bateria'];
    run.litter.bagLitter = [];

    expect(pickupGroundLitterInRun(run, 0).ok).toBe(true); // picked up 'vidro'
    // Trying to recycle glass WITHOUT a packing box fails and damages eco!
    const noBox = recycleLitterInRun(run, 0, 'deposito_especial');
    expect(noBox.ok).toBe(false);
    expect(noBox.ecoDelta).toBeLessThan(0);

    // Buy a packing box -> now glass recycles cleanly at Special Depot!
    expect(buyGlassPackingBox(run).ok).toBe(true);
    const withBox = recycleLitterInRun(run, 0, 'deposito_especial');
    expect(withBox.ok).toBe(true);
    expect(withBox.ecoDelta).toBeGreaterThan(0);

    // Battery thrown in wrong normal bin damages eco!
    expect(pickupGroundLitterInRun(run, 0).ok).toBe(true); // picked up 'bateria'
    const wrongBin = recycleLitterInRun(run, 0, 'lixeira_plastico');
    expect(wrongBin.ecoDelta).toBeLessThan(0);
  });
});
