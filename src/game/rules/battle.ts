import { elementMultiplier, type Element } from '../data/elements';
import { getCard, MANA_TYPES, type CardElement, type ManaPool, type ManaType } from '../data/cards';
import { getSpecies } from '../data/species';
import { petStats, type PetInstance, type StatBonus } from './progression';
import { createRng, pick, shuffle, type RngState } from './rng';

export type Side = 'player' | 'enemy';

export interface Fighter {
  uid: string;
  speciesId: string;
  name: string;
  element: Element;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  shield: number;
  side: Side;
}

export interface SummonState {
  uid: string;
  cardId: string;
  name: string;
  element: CardElement;
  power: number;
  turnsLeft: number;
}

export type BattleEvent =
  | { type: 'carta'; cardId: string; casterUid: string }
  | {
      type: 'dano';
      sourceUid: string;
      targetUid: string;
      amount: number;
      absorbed: number;
      multiplier: number;
    }
  | { type: 'cura'; targetUid: string; amount: number }
  | { type: 'escudo'; targetUid: string; amount: number }
  | { type: 'fortalecer'; targetUid: string; amount: number }
  | { type: 'comprar'; count: number }
  | { type: 'invocar'; summonUid: string; name: string }
  | { type: 'invocacaoSaiu'; summonUid: string }
  | { type: 'nocaute'; uid: string }
  | { type: 'turno'; side: Side; round: number }
  | { type: 'fim'; winner: Side };

export type Phase = 'mana' | 'jogador' | 'fim';

export interface BattleState {
  rng: RngState;
  round: number;
  phase: Phase;
  party: Fighter[];
  enemies: Fighter[];
  deck: string[];
  hand: string[];
  discard: string[];
  mana: ManaPool;
  maxMana: ManaPool;
  summons: SummonState[];
  /** Extra power of enemy basic attacks (grows with the floor). */
  enemyPower: number;
  winner: Side | null;
}

export const INITIAL_HAND = 4;
export const MAX_HAND = 5;
export const MAX_MANA_PER_TYPE = 5;

export function fighterFromPet(pet: PetInstance, side: Side, bonus: StatBonus = {}): Fighter {
  const species = getSpecies(pet.speciesId);
  const stats = petStats(pet, bonus);
  return {
    uid: pet.uid,
    speciesId: pet.speciesId,
    name: stats.name,
    element: species.element,
    level: pet.level,
    hp: Math.min(pet.hp, stats.maxHp),
    maxHp: stats.maxHp,
    attack: stats.attack,
    defense: stats.defense,
    shield: 0,
    side,
  };
}

export interface BattleOptions {
  party: Fighter[];
  enemies: Fighter[];
  deck: readonly string[];
  seed: number;
  enemyPower?: number;
  bonusMana?: number;
  handSize?: number;
}

export function createBattle(opts: BattleOptions): BattleState {
  const rng = createRng(opts.seed);
  const base = 1 + (opts.bonusMana ?? 0);
  const maxMana: ManaPool = { corpo: base, ilusao: base, talento: base };
  const state: BattleState = {
    rng,
    round: 1,
    phase: 'jogador',
    party: opts.party,
    enemies: opts.enemies,
    deck: shuffle(rng, [...opts.deck]),
    hand: [],
    discard: [],
    mana: { ...maxMana },
    maxMana,
    summons: [],
    enemyPower: opts.enemyPower ?? 0,
    winner: null,
  };
  draw(state, opts.handSize ?? INITIAL_HAND);
  return state;
}

export const alive = (fighters: readonly Fighter[]) => fighters.filter((f) => f.hp > 0);

function findFighter(state: BattleState, uid: string): Fighter | undefined {
  return state.party.find((f) => f.uid === uid) ?? state.enemies.find((f) => f.uid === uid);
}

/** Draws up to `count` cards, reshuffling the discard pile when the deck runs out. */
export function draw(state: BattleState, count: number): number {
  let drawn = 0;
  for (let i = 0; i < count; i++) {
    if (state.deck.length === 0) {
      if (state.discard.length === 0) break;
      state.deck = shuffle(state.rng, state.discard);
      state.discard = [];
    }
    state.hand.push(state.deck.pop() as string);
    drawn += 1;
  }
  return drawn;
}

export function canAfford(mana: ManaPool, cost: Partial<ManaPool>): boolean {
  return MANA_TYPES.every((t) => mana[t] >= (cost[t] ?? 0));
}

/**
 * Damage formula: max(1, round((power + attack) × multiplier) − defense).
 * A card of the same element as the attacking pet gets +1 power.
 */
export function computeDamage(
  power: number,
  attacker: { attack: number; element: CardElement },
  cardElement: CardElement,
  defender: { defense: number; element: Element }
): { amount: number; multiplier: number } {
  const bonus = cardElement !== 'neutro' && cardElement === attacker.element ? 1 : 0;
  const multiplier =
    cardElement === 'neutro' ? 1 : elementMultiplier(cardElement, defender.element);
  const amount = Math.max(
    1,
    Math.round((power + bonus + attacker.attack) * multiplier) - defender.defense
  );
  return { amount, multiplier };
}

function applyDamage(
  state: BattleState,
  sourceUid: string,
  target: Fighter,
  amount: number,
  multiplier: number,
  events: BattleEvent[]
): void {
  const absorbed = Math.min(target.shield, amount);
  target.shield -= absorbed;
  const dealt = amount - absorbed;
  target.hp = Math.max(0, target.hp - dealt);
  events.push({
    type: 'dano',
    sourceUid,
    targetUid: target.uid,
    amount: dealt,
    absorbed,
    multiplier,
  });
  if (target.hp === 0) events.push({ type: 'nocaute', uid: target.uid });
  checkEnd(state, events);
}

function checkEnd(state: BattleState, events: BattleEvent[]): void {
  if (state.winner) return;
  if (alive(state.enemies).length === 0) state.winner = 'player';
  else if (alive(state.party).length === 0) state.winner = 'enemy';
  if (state.winner) {
    state.phase = 'fim';
    events.push({ type: 'fim', winner: state.winner });
  }
}

/** Which kind of target a card asks for. */
export function targetKind(cardId: string): 'inimigo' | 'aliado' | 'nenhum' {
  const { effect } = getCard(cardId);
  if (effect.kind === 'dano') return effect.area ? 'nenhum' : 'inimigo';
  if (effect.kind === 'cura' || effect.kind === 'escudo') return effect.area ? 'nenhum' : 'aliado';
  return 'nenhum';
}

export interface PlayResult {
  ok: boolean;
  error?: string;
  events: BattleEvent[];
}

export function playCard(
  state: BattleState,
  handIndex: number,
  casterUid: string,
  targetUid?: string
): PlayResult {
  const fail = (error: string): PlayResult => ({ ok: false, error, events: [] });
  if (state.phase !== 'jogador') return fail('Não é a sua vez.');
  const cardId = state.hand[handIndex];
  if (!cardId) return fail('Carta inválida.');
  const card = getCard(cardId);
  const caster = state.party.find((f) => f.uid === casterUid && f.hp > 0);
  if (!caster) return fail('Escolha um pet de pé para usar a carta.');
  if (!canAfford(state.mana, card.cost)) return fail('Mana insuficiente.');

  const kind = targetKind(cardId);
  let target: Fighter | undefined;
  if (kind === 'inimigo') {
    target = state.enemies.find((f) => f.uid === targetUid && f.hp > 0);
    if (!target) return fail('Escolha um inimigo como alvo.');
  } else if (kind === 'aliado') {
    target = state.party.find((f) => f.uid === (targetUid ?? casterUid) && f.hp > 0);
    if (!target) return fail('Escolha um aliado como alvo.');
  }

  for (const t of MANA_TYPES) state.mana[t] -= card.cost[t] ?? 0;
  state.hand.splice(handIndex, 1);
  state.discard.push(cardId);

  const events: BattleEvent[] = [{ type: 'carta', cardId, casterUid }];
  const effect = card.effect;
  switch (effect.kind) {
    case 'dano': {
      const targets = effect.area ? alive(state.enemies) : [target as Fighter];
      for (const t of targets) {
        const { amount, multiplier } = computeDamage(effect.power, caster, card.element, t);
        applyDamage(state, caster.uid, t, amount, multiplier, events);
      }
      break;
    }
    case 'cura': {
      const targets = effect.area ? alive(state.party) : [target as Fighter];
      for (const t of targets) {
        const amount = Math.min(effect.amount, t.maxHp - t.hp);
        t.hp += amount;
        events.push({ type: 'cura', targetUid: t.uid, amount });
      }
      break;
    }
    case 'escudo': {
      const targets = effect.area ? alive(state.party) : [target as Fighter];
      for (const t of targets) {
        t.shield += effect.amount;
        events.push({ type: 'escudo', targetUid: t.uid, amount: effect.amount });
      }
      break;
    }
    case 'fortalecer':
      caster.attack += effect.amount;
      events.push({ type: 'fortalecer', targetUid: caster.uid, amount: effect.amount });
      break;
    case 'comprar': {
      const count = draw(state, effect.amount);
      events.push({ type: 'comprar', count });
      break;
    }
    case 'invocar': {
      const uid = `inv-${state.round}-${state.summons.length}-${cardId}`;
      state.summons.push({
        uid,
        cardId,
        name: card.name,
        element: card.element,
        power: effect.power,
        turnsLeft: effect.turns,
      });
      events.push({ type: 'invocar', summonUid: uid, name: card.name });
      break;
    }
  }
  return { ok: true, events };
}

/** Enemy AI: the target with the best element multiplier, then the lowest HP. */
export function chooseEnemyTarget(attacker: Fighter, targets: readonly Fighter[]): Fighter {
  return [...targets].sort((a, b) => {
    const diff =
      elementMultiplier(attacker.element, b.element) -
      elementMultiplier(attacker.element, a.element);
    return diff !== 0 ? diff : a.hp - b.hp;
  })[0];
}

/** Ends the player's turn: summons act, enemies attack, then the next round begins. */
export function endTurn(state: BattleState): BattleEvent[] {
  const events: BattleEvent[] = [];
  if (state.phase !== 'jogador') return events;

  for (const summon of [...state.summons]) {
    if (state.winner) break;
    const targets = alive(state.enemies);
    if (targets.length === 0) break;
    const target = pick(state.rng, targets);
    const { amount, multiplier } = computeDamage(
      summon.power,
      { attack: 0, element: summon.element },
      summon.element,
      target
    );
    applyDamage(state, summon.uid, target, amount, multiplier, events);
    summon.turnsLeft -= 1;
    if (summon.turnsLeft <= 0) {
      state.summons = state.summons.filter((s) => s !== summon);
      events.push({ type: 'invocacaoSaiu', summonUid: summon.uid });
    }
  }
  if (state.winner) return events;

  events.push({ type: 'turno', side: 'enemy', round: state.round });
  for (const enemy of alive(state.enemies)) {
    const targets = alive(state.party);
    if (targets.length === 0) break;
    const target = chooseEnemyTarget(enemy, targets);
    const { amount, multiplier } = computeDamage(state.enemyPower, enemy, enemy.element, target);
    applyDamage(state, enemy.uid, target, amount, multiplier, events);
    if (state.winner) return events;
  }

  state.round += 1;
  for (const f of state.party) f.shield = 0;
  if (state.hand.length < MAX_HAND) {
    const count = draw(state, 1);
    if (count > 0) events.push({ type: 'comprar', count });
  }
  state.phase = 'mana';
  events.push({ type: 'turno', side: 'player', round: state.round });
  return events;
}

/** Start of each new round: +1 max mana in a type the player chooses, then mana refills. */
export function chooseManaGrowth(state: BattleState, type: ManaType): boolean {
  if (state.phase !== 'mana') return false;
  state.maxMana[type] = Math.min(MAX_MANA_PER_TYPE, state.maxMana[type] + 1);
  state.mana = { ...state.maxMana };
  state.phase = 'jogador';
  return true;
}

export function getFighter(state: BattleState, uid: string): Fighter | undefined {
  return findFighter(state, uid);
}
