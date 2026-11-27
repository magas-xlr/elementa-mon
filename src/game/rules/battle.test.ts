import { describe, expect, it } from 'vitest';
import {
  chooseEnemyTarget,
  chooseManaGrowth,
  computeDamage,
  createBattle,
  endTurn,
  fighterFromPet,
  playCard,
  type BattleState,
} from './battle';
import { createPet } from './progression';

function battle(deck: string[], enemies = ['fagulho']): BattleState {
  return createBattle({
    party: ['gotelo', 'faiscar'].map((id) => fighterFromPet(createPet(id), 'player')),
    enemies: enemies.map((id) => fighterFromPet(createPet(id), 'enemy')),
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

  it('gasta mana, descarta a carta e reduz a vida do alvo', () => {
    const b = battle(['jato', 'jato', 'jato', 'jato']);
    const caster = b.party[0].uid;
    const target = b.enemies[0].uid;
    expect(playCard(b, 0, caster, target).ok).toBe(true);
    expect(b.mana.ilusao).toBe(0);
    expect(b.discard).toEqual(['jato']);
    expect(b.enemies[0].hp).toBe(2);
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
    const fire = fighterFromPet(createPet('fagulho'), 'enemy');
    const water = fighterFromPet(createPet('gotelo'), 'player');
    const fairy = fighterFromPet(createPet('petalo'), 'player');
    expect(chooseEnemyTarget(fire, [water, fairy]).uid).toBe(fairy.uid);
    const fairy2 = { ...fairy, uid: 'x', hp: 3 };
    expect(chooseEnemyTarget(fire, [fairy, fairy2]).uid).toBe('x');
  });

  it('invocação ataca no fim do turno', () => {
    const b = battle(['golem', 'golem', 'golem', 'golem'], ['faiscar']);
    b.mana = { corpo: 3, ilusao: 3, talento: 3 };
    expect(playCard(b, 0, b.party[0].uid).ok).toBe(true);
    const hpBefore = b.enemies[0].hp;
    const events = endTurn(b);
    expect(events[0]).toMatchObject({ type: 'dano', targetUid: b.enemies[0].uid });
    expect(b.enemies[0].hp).toBeLessThan(hpBefore);
  });
});
