import { describe, expect, it } from 'vitest';
import { STARTER_DECK } from '../data/cards';
import { endTurn, playCard } from '../rules/battle';
import {
  battleFromEncounter,
  encounterFor,
  openChest,
  startRun,
  usePotion,
  winBattle,
} from './run';

describe('partida', () => {
  it('começa com pets nível 1 e o deck escolhido', () => {
    const run = startRun(['fagulho', 'gotelo'], [...STARTER_DECK], 1, 5);
    expect(run.party.map((p) => p.hp)).toEqual([10, 10]);
    expect(run.deck).toHaveLength(STARTER_DECK.length);
  });

  it('vence uma batalha e recebe recompensas', () => {
    const run = startRun(['fagulho', 'gotelo', 'faiscar'], [...STARTER_DECK], 1, 5);
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
    const run = startRun(['fagulho'], [...STARTER_DECK], 1, 8);
    const before = run.deck.length + run.relics.length + run.potions;
    openChest(run);
    expect(run.deck.length + run.relics.length + run.potions).toBe(before + 1);
    run.party[0].hp = 2;
    expect(usePotion(run, run.party[0].uid)).toBe(true);
    expect(run.party[0].hp).toBe(7);
  });
});
