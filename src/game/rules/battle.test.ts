import { describe, expect, it } from 'vitest';
import {
  chooseEnemyTarget,
  chooseManaGrowth,
  computeDamage,
  createBattle,
  endTurn,
  canUseCard,
  fighterFromPet,
  petMonster,
  playCard,
  type BattleState,
} from './battle';
import type { PetElement } from '../data/elements';
import { createPet } from './progression';

type Spec = [string, PetElement];
const pet = ([id, element]: Spec, side: 'player' | 'enemy') =>
  fighterFromPet(createPet(id, 1, element), side);

function battle(deck: string[], enemies: Spec[] = [['bicudo', 'fogo']]): BattleState {
  return createBattle({
    party: (
      [
        ['casquinho', 'agua'],
        ['bicudo', 'eletrico'],
      ] as Spec[]
    ).map((s) => pet(s, 'player')),
    enemies: enemies.map((s) => pet(s, 'enemy')),
    deck,
    seed: 7,
  });
}

describe('batalha', () => {
  it('começa com 4 cartas na mão e mana 1/1/1', () => {
    const b = battle(['investida', 'guarda', 'foco', 'curativo', 'jato', 'brasa']);
    expect(b.hand).toHaveLength(4);
    expect(b.mana).toEqual({ corpo: 1, ilusao: 1, talento: 1 });
  });

  it('aplica a fórmula de dano com vantagem elemental e bônus do mesmo elemento', () => {
    // Água (ataque 2) com Jato (3 + 1 do mesmo elemento) contra Fogo (defesa 1): round(6 × 1.5) − 1
    const water = { attack: 2, element: 'agua' as const };
    expect(computeDamage(3, water, 'agua', { defense: 1, element: 'fogo' })).toEqual({
      amount: 8,
      multiplier: 1.5,
    });
    const weak = { attack: 0, element: 'fogo' as const };
    expect(computeDamage(0, weak, 'fogo', { defense: 9, element: 'agua' }).amount).toBe(1);
  });

  it('gasta mana, descarta a carta e rola dados de ataque vs defesa (Battledome)', () => {
    const b = battle(['jato', 'jato', 'jato', 'jato']);
    const caster = b.party[0].uid;
    const target = b.enemies[0].uid;
    const res = playCard(b, 0, caster, target);
    expect(res.ok).toBe(true);
    expect(b.mana.ilusao).toBe(0);
    expect(b.discard).toEqual(['jato']);
    const dmg = res.events.find((e) => e.type === 'dano');
    expect(dmg?.type).toBe('dano');
    if (dmg?.type === 'dano') {
      expect(dmg.dice).toBeDefined();
      expect(dmg.dice!.attackDice.length).toBeGreaterThanOrEqual(1);
      expect(dmg.dice!.defenseDice.length).toBe(b.enemies[0].defense);
      expect(b.enemies[0].hp).toBe(10 - dmg.amount);
    }
    expect(playCard(b, 0, caster, target).error).toBe('Mana insuficiente.');
  });

  it('escudo absorve dano e é limpo no novo turno', () => {
    const b = battle(['guarda', 'guarda', 'guarda', 'guarda']);
    const pet = b.party[0];
    playCard(b, 0, pet.uid);
    expect(pet.shield).toBe(3);
    const events = endTurn(b);
    expect(events.some((e) => e.type === 'dano')).toBe(true);
    expect(b.phase).toBe('mana');
    expect(b.party.every((f) => f.shield === 0)).toBe(true);
  });

  it('cresce +1 de mana no tipo escolhido a cada rodada e compra 1 carta', () => {
    const b = battle(['investida', 'guarda', 'foco', 'curativo', 'jato', 'brasa']);
    endTurn(b);
    expect(b.hand).toHaveLength(5);
    expect(chooseManaGrowth(b, 'corpo')).toBe(true);
    expect(b.mana).toEqual({ corpo: 2, ilusao: 1, talento: 1 });
    expect(b.round).toBe(2);
  });

  it('IA escolhe o melhor multiplicador e depois a menor vida', () => {
    const fire = pet(['pipo', 'fogo'], 'enemy');
    const water = pet(['casquinho', 'agua'], 'player');
    const fairy = pet(['penugem', 'fada'], 'player');
    expect(chooseEnemyTarget(fire, [water, fairy]).uid).toBe(fairy.uid);
    const fairy2 = { ...fairy, uid: 'x', hp: 3 };
    expect(chooseEnemyTarget(fire, [fairy, fairy2]).uid).toBe('x');
  });

  it('pets neutros só usam cartas neutras e não têm vantagem elemental', () => {
    const b = createBattle({
      party: [pet(['pipo', 'neutro'], 'player')],
      enemies: [pet(['bicudo', 'fogo'], 'enemy')],
      deck: ['jato', 'investida', 'jato', 'investida'],
      seed: 3,
    });
    const caster = b.party[0];
    expect(canUseCard(caster, 'jato')).toBe(false);
    expect(canUseCard(caster, 'investida')).toBe(true);
    const jato = b.hand.indexOf('jato');
    expect(playCard(b, jato, caster.uid, b.enemies[0].uid).ok).toBe(false);
    expect(b.hand).toHaveLength(4);
    // Neutral attacker and neutral defender: always 100%, no same-element bonus.
    expect(computeDamage(2, caster, 'neutro', b.enemies[0]).multiplier).toBe(1);
    expect(computeDamage(3, { attack: 2, element: 'agua' }, 'agua', caster)).toEqual({
      amount: 4,
      multiplier: 1,
    });
  });

  it('invocação ataca no fim do turno', () => {
    const b = battle(['golem', 'golem', 'golem', 'golem'], [['pulinho', 'neutro']]);
    b.mana = { corpo: 3, ilusao: 3, talento: 3 };
    expect(playCard(b, 0, b.party[0].uid).ok).toBe(true);
    const hpBefore = b.enemies[0].hp;
    const events = endTurn(b);
    expect(events[0]).toMatchObject({ type: 'dano', targetUid: b.enemies[0].uid });
    expect(b.enemies[0].hp).toBeLessThan(hpBefore);
  });

  it('captura por carinho: o favorito enche o dobro e bater deixa bravo', () => {
    const wild = () =>
      createBattle({
        party: [pet(['pipo', 'fogo'], 'player')],
        enemies: [pet(['casquinho', 'neutro'], 'enemy')],
        deck: ['brasa', 'brasa', 'brasa', 'brasa'],
        seed: 4,
        wild: true,
        captureRoom: 1,
      });
    const b = wild();
    const [me, it] = [b.party[0], b.enemies[0]];
    expect(it.affectionMax).toBe(5);
    b.mana = { corpo: 5, ilusao: 5, talento: 5 };
    // Casquinho likes belly rubs (corpo): +2; other kinds give +1.
    expect(petMonster(b, me.uid, it.uid, 'ilusao').events[0]).toMatchObject({
      amount: 1,
      liked: false,
    });
    expect(petMonster(b, me.uid, it.uid, 'corpo').events[0]).toMatchObject({
      amount: 2,
      liked: true,
    });
    expect(it.affection).toBe(3);
    expect(b.mana).toEqual({ corpo: 4, ilusao: 4, talento: 5 });
    // Hitting it with a damaging roll halves the affection.
    b.enemies[0].defense = 0;
    const hitRes = playCard(b, 0, me.uid, it.uid);
    const dmgEv = hitRes.events.find((e) => e.type === 'dano');
    if (dmgEv?.type === 'dano' && dmgEv.amount > 0) expect(it.affection).toBe(1);
    petMonster(b, me.uid, it.uid, 'corpo');
    const last = petMonster(b, me.uid, it.uid, 'corpo');
    const done = last.events.some((e) => e.type === 'capturado')
      ? last
      : petMonster(b, me.uid, it.uid, 'corpo');
    expect(done.events.map((e) => e.type)).toEqual(['carinho', 'capturado', 'fim']);
    expect(b.captured.map((f) => f.uid)).toEqual([it.uid]);
    expect(b.enemies).toHaveLength(0);
    expect(b.winner).toBe('player');

    // No room in the team, or not a wild battle: no petting.
    const full = wild();
    full.captureRoom = 0;
    expect(petMonster(full, full.party[0].uid, full.enemies[0].uid, 'corpo').ok).toBe(false);
    const trainer = battle(['brasa']);
    expect(petMonster(trainer, trainer.party[0].uid, trainer.enemies[0].uid, 'corpo').ok).toBe(
      false
    );
  });
});
