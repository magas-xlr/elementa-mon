import { describe, expect, it } from 'vitest';
import { STARTER_DECK } from '../data/cards';
import { endTurn, petMonster, playCard } from '../rules/battle';
import { BIOMES } from '../data/biomes';
import {
  acceptJob,
  applyCrystal,
  battleFromEncounter,
  claimLabPod,
  completeJob,
  ensureActivePet,
  grantJobItem,
  LAB_GENES_NEEDED,
  LAB_HOURS,
  moveTo,
  moveToBench,
  moveToParty,
  setActivePet,
  startLabTransmodification,
  syncAfterBattle,
  takeCrystal,
  encounterFor,
  openChest,
  startRun,
  usePotion,
  waitLabHours,
  winBattle,
} from './run';

describe('partida', () => {
  it('começa com pets nível 1 e o deck escolhido', () => {
    const run = startRun(['pipo', 'casquinho'], [...STARTER_DECK], 1, 5);
    expect(run.party.map((p) => p.hp)).toEqual([10, 10]);
    expect(run.deck).toHaveLength(STARTER_DECK.length);
  });

  it('vence uma batalha e recebe recompensas', () => {
    const run = startRun(['pipo', 'casquinho', 'bicudo'], [...STARTER_DECK], 1, 5);
    const enc = encounterFor(run, 'selvagem');
    const battle = battleFromEncounter(run, enc);
    let guard = 0;
    while (!battle.winner && guard++ < 50) {
      if (battle.phase === 'mana') {
        battle.phase = 'jogador';
        battle.mana = { corpo: 5, ilusao: 5, talento: 5 };
      }
      const caster = battle.party.find((f) => f.hp > 0)?.uid ?? '';
      const target = battle.enemies.find((f) => f.hp > 0)?.uid;
      const played = battle.hand.some(
        (_, i) => playCard(battle, i, caster, target).ok || playCard(battle, i, caster).ok
      );
      if (!played) endTurn(battle);
    }
    expect(battle.winner).toBe('player');
    const reward = winBattle(run, battle, enc);
    expect(reward.xp).toBe(3);
    expect(run.battlesWon).toBe(1);
    expect(reward.cardChoices.length).toBeGreaterThan(0);
  });

  it('baús dão algo e poções curam', () => {
    const run = startRun(['pipo'], [...STARTER_DECK], 1, 8);
    const before = run.deck.length + run.relics.length + run.potions;
    openChest(run);
    expect(run.deck.length + run.relics.length + run.potions).toBe(before + 1);
    run.party[0].hp = 2;
    expect(usePotion(run, run.party[0].uid)).toBe(true);
    expect(run.party[0].hp).toBe(7);
  });

  it('começa neutro; gemas dão um elemento e outra gema troca', () => {
    const run = startRun(['pipo'], [...STARTER_DECK], 1, 11);
    const pet = run.party[0];
    expect(pet.element).toBe('neutro');
    expect(applyCrystal(run, pet.uid, 'fogo')).toBe(false);
    run.crystals = { fogo: 1, agua: 1 };
    expect(applyCrystal(run, pet.uid, 'fogo')).toBe(true);
    expect(pet.element).toBe('fogo');
    expect(run.crystals.fogo).toBeUndefined();
    expect(applyCrystal(run, pet.uid, 'agua')).toBe(true);
    expect(pet.element).toBe('agua');
    expect(battleFromEncounter(run, encounterFor(run, 'selvagem')).party[0].element).toBe('agua');
  });

  it('pega cristais do mapa e registra biomas novos ao andar', () => {
    const run = startRun(['pipo'], [...STARTER_DECK], 1, 4);
    expect(run.visited).toEqual([0]);
    const idx = Number(Object.keys(run.map.loot)[0]);
    const x = idx % run.map.width;
    const y = Math.floor(idx / run.map.width);
    const element = run.map.loot[idx];
    expect(takeCrystal(run, x, y)).toBe(element);
    expect(run.crystals[element]).toBe(1);
    expect(takeCrystal(run, x, y)).toBeNull();
    const far = run.map.biomes.findIndex((b) => BIOMES[b].id === 'cidade');
    expect(moveTo(run, far % run.map.width, Math.floor(far / run.map.width))).toBe(4);
    expect(moveTo(run, far % run.map.width, Math.floor(far / run.map.width))).toBeNull();
    expect(run.visited).toEqual([0, 4]);
  });

  it('pet selvagem que gostou da equipe entra nela (até 4) e excedentes vão para o banco ilimitado', () => {
    const run = startRun(['pipo'], [...STARTER_DECK], 1, 21);
    const enc = encounterFor(run, 'selvagem');
    enc.enemies = enc.enemies.slice(0, 1);
    enc.enemies[0].element = 'terra';
    const b = battleFromEncounter(run, enc);
    expect(b.captureRoom).toBeGreaterThan(0);
    b.mana = { corpo: 5, ilusao: 5, talento: 5 };
    const wild = b.enemies[0];
    while (b.captured.length === 0) petMonster(b, b.party[0].uid, wild.uid, 'corpo');
    syncAfterBattle(run, b);
    expect(run.party).toHaveLength(2);
    expect(run.party[1]).toMatchObject({
      speciesId: wild.speciesId,
      element: 'terra',
      level: wild.level,
    });
    const reward = winBattle(run, b, enc);
    expect(reward).not.toHaveProperty('recruit');
  });

  it('suporta até 4 pets na party, 1 pet ativo seguidor e banco ilimitado', () => {
    const run = startRun(['pipo', 'casquinho', 'bicudo', 'pulinho'], [...STARTER_DECK], 5, 33);
    expect(run.party).toHaveLength(4);
    expect(run.bench).toHaveLength(0);
    expect(ensureActivePet(run)?.uid).toBe(run.party[0].uid);

    // Switch active follower pet
    expect(setActivePet(run, run.party[2].uid)).toBe(true);
    expect(run.activePetUid).toBe(run.party[2].uid);

    // Capture a 5th pet: overflows cleanly to unlimited bench
    const enc = encounterFor(run, 'selvagem');
    const b = battleFromEncounter(run, enc);
    b.captured.push(b.enemies[0]);
    syncAfterBattle(run, b);
    expect(run.party).toHaveLength(4);
    expect(run.bench).toHaveLength(1);

    // Move a party pet to bench and bring benched pet into party
    expect(moveToBench(run, run.party[2].uid)).toBe(true);
    expect(run.party).toHaveLength(3);
    expect(run.bench).toHaveLength(2);
    expect(run.activePetUid).not.toBeNull();
    expect(moveToParty(run, run.bench[0].uid)).toBe(true);
    expect(run.party).toHaveLength(4);
    expect(run.bench).toHaveLength(1);
  });

  it('carta de evolução elemental transforma o pet na batalha e volta ao normal depois', () => {
    const run = startRun(
      ['orelhito'],
      ['evo_fogo', 'investida', 'evo_fogo', 'investida', 'guarda'],
      1,
      77
    );
    expect(run.party[0].element).toBe('neutro');
    const enc = encounterFor(run, 'selvagem');
    const b = battleFromEncounter(run, enc);
    b.mana = { corpo: 5, ilusao: 5, talento: 5 };
    const idx = b.hand.indexOf('evo_fogo');
    expect(idx).toBeGreaterThanOrEqual(0);
    const res = playCard(b, idx, b.party[0].uid, b.party[0].uid);
    expect(res.ok).toBe(true);
    expect(b.party[0].element).toBe('fogo');
    // After battle sync, the run pet reverts to normal (neutro)!
    syncAfterBattle(run, b);
    expect(run.party[0].element).toBe('neutro');
  });

  it('trabalhos de NPC permitem aceitar, entregar itens e ganhar recompensas encadeadas', () => {
    const run = startRun(['pipo'], [...STARTER_DECK], 1, 99);
    grantJobItem(run, 'mel_dourado', 1);
    const res = completeJob(run, 'job_bento');
    expect(res.ok).toBe(true);
    expect(run.completedJobs).toContain('job_bento');
    expect(run.jobItems['chave_moinho']).toBe(1);
    expect(acceptJob(run, 'job_taro')).toBe(true);
    const res2 = completeJob(run, 'job_taro');
    expect(res2.ok).toBe(true);
    expect(run.completedJobs).toContain('job_taro');
  });

  it('laboratório de transmodificação usa genes, incuba por horas do jogo e grava elemento permanente', () => {
    const run = startRun(['pipo', 'casquinho'], [...STARTER_DECK], 1, 55);
    const targetUid = run.party[1].uid;
    run.elementGenes.fogo = LAB_GENES_NEEDED;
    const start = startLabTransmodification(run, targetUid, 'fogo');
    expect(start.ok).toBe(true);
    expect(run.party).toHaveLength(1);
    expect(run.labPods).toHaveLength(1);
    expect(run.labPods[0].hoursRemaining).toBe(LAB_HOURS);

    // Cannot claim before hours pass
    expect(claimLabPod(run, run.labPods[0].id).ok).toBe(false);

    // Advance in-game hours until ready
    waitLabHours(run, LAB_HOURS);
    expect(run.labPods[0].hoursRemaining).toBe(0);

    const claimed = claimLabPod(run, run.labPods[0].id);
    expect(claimed.ok).toBe(true);
    expect(claimed.pet?.element).toBe('fogo');
    expect(run.party).toHaveLength(2);
    expect(run.party.find((p) => p.uid === targetUid)?.element).toBe('fogo');
  });
});
