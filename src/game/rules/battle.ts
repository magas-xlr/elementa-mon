import { petMultiplier, type Element, type PetElement } from '../data/elements';
import {
  cardName,
  getCard,
  MANA_TYPES,
  type CardElement,
  type ManaPool,
  type ManaType,
} from '../data/cards';
import { t } from '../../i18n';
import { getSpecies } from '../data/species';
import { petStats, type PetInstance, type StatBonus } from './progression';
import { createRng, int, pick, shuffle, type RngState } from './rng';

export type Side = 'player' | 'enemy';

export interface Fighter {
  uid: string;
  speciesId: string;
  name: string;
  element: PetElement;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  shield: number;
  side: Side;
  /** Wild pets only: how much they like the team so far, and how much it takes to join. */
  affection?: number;
  affectionMax?: number;
}

export interface SummonState {
  uid: string;
  cardId: string;
  name: string;
  element: CardElement;
  power: number;
  turnsLeft: number;
}

/** Neopets Battledome TCG-style dice clash (d6: 1–2 miss, 3–5 hit/block, 6 double crit). */
export interface DiceRoll {
  attackDice: number[];
  defenseDice: number[];
  attackHits: number;
  defenseBlocks: number;
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
      dice?: DiceRoll;
    }
  | { type: 'cura'; targetUid: string; amount: number }
  | { type: 'escudo'; targetUid: string; amount: number }
  | { type: 'fortalecer'; targetUid: string; amount: number }
  | { type: 'transformar'; targetUid: string; element: Element }
  | { type: 'comprar'; count: number }
  | { type: 'invocar'; summonUid: string; name: string }
  | { type: 'invocacaoSaiu'; summonUid: string }
  | { type: 'nocaute'; uid: string }
  | { type: 'carinho'; casterUid: string; targetUid: string; amount: number; liked: boolean }
  | { type: 'bravo'; uid: string }
  | { type: 'capturado'; uid: string; name: string }
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
  /** Extra power of enemy basic attacks (grows with the biome tier). */
  enemyPower: number;
  /** Wild pets that liked the team enough to join it (removed from `enemies`). */
  captured: Fighter[];
  /** Free party slots: petting only works while there is room for one more pet. */
  captureRoom: number;
  /** True when Global Warming extreme heat (>= +3.0°C) disables Water cards & Ice pets! */
  extremeHeat?: boolean;
  /** Number of nuclear attacks launched in this battle (2 kills the player's own party!). */
  nuclearAttacksUsed: number;
  winner: Side | null;
}

export const INITIAL_HAND = 4;
export const MAX_HAND = 5;
export const MAX_MANA_PER_TYPE = 5;

export function fighterFromPet(pet: PetInstance, side: Side, bonus: StatBonus = {}): Fighter {
  const stats = petStats(pet, bonus);
  return {
    uid: pet.uid,
    speciesId: pet.speciesId,
    name: stats.name,
    element: pet.element,
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
  /** Wild battle: enemies get an affection meter and can be petted into joining. */
  wild?: boolean;
  captureRoom?: number;
  extremeHeat?: boolean;
}

/** Affection needed for a wild pet to join: 5, 7 and 9 for levels 1–3. */
export const affectionNeeded = (level: number): number => 3 + level * 2;

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
    captured: [],
    captureRoom: opts.captureRoom ?? 0,
    extremeHeat: opts.extremeHeat ?? false,
    nuclearAttacksUsed: 0,
  };
  if (opts.wild)
    for (const e of state.enemies) {
      e.affection = 0;
      e.affectionMax = affectionNeeded(e.level);
    }
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

/** Scores one Battledome d6 die: 1–2 = 0, 3–5 = 1 success, 6 = 2 (critical symbol!). */
export const scoreDie = (face: number): number => (face >= 6 ? 2 : face >= 3 ? 1 : 0);

/** Rolls Attack Dice vs Defense Dice (Neopets Battledome TCG mechanic). */
export function rollBattledomeDice(
  rng: RngState,
  attackPool: number,
  defensePool: number
): DiceRoll {
  const atkCount = Math.max(1, Math.min(8, attackPool));
  const defCount = Math.max(0, Math.min(8, defensePool));
  const attackDice = Array.from({ length: atkCount }, () => int(rng, 1, 6));
  const defenseDice = Array.from({ length: defCount }, () => int(rng, 1, 6));
  const attackHits = attackDice.reduce((sum, d) => sum + scoreDie(d), 0);
  const defenseBlocks = defenseDice.reduce((sum, d) => sum + scoreDie(d), 0);
  return { attackDice, defenseDice, attackHits, defenseBlocks };
}

/**
 * Computes the base Attack & Defense dice pools (and elemental multiplier).
 * Same-element card grants +1 attack die.
 */
export function computeDicePools(
  power: number,
  attacker: { attack: number; element: PetElement },
  cardElement: CardElement,
  defender: { defense: number; element: PetElement }
): { attackPool: number; defensePool: number; multiplier: number } {
  const bonus = cardElement !== 'neutro' && cardElement === attacker.element ? 1 : 0;
  const multiplier = petMultiplier(cardElement, defender.element);
  const attackPool = Math.max(
    1,
    Math.min(8, Math.round((power + bonus + attacker.attack) * multiplier))
  );
  const defensePool = Math.max(0, Math.min(8, defender.defense));
  return { attackPool, defensePool, multiplier };
}

/**
 * Legacy deterministic damage estimate (kept for tooltips/UI previews).
 */
export function computeDamage(
  power: number,
  attacker: { attack: number; element: PetElement },
  cardElement: CardElement,
  defender: { defense: number; element: PetElement }
): { amount: number; multiplier: number } {
  const bonus = cardElement !== 'neutro' && cardElement === attacker.element ? 1 : 0;
  const multiplier = petMultiplier(cardElement, defender.element);
  const amount = Math.max(
    1,
    Math.round((power + bonus + attacker.attack) * multiplier) - defender.defense
  );
  return { amount, multiplier };
}

/** Resolves a Battledome dice clash between attacker and defender. */
export function resolveDiceAttack(
  rng: RngState,
  power: number,
  attacker: { attack: number; element: PetElement },
  cardElement: CardElement,
  defender: { defense: number; element: PetElement }
): { amount: number; multiplier: number; dice: DiceRoll } {
  const { attackPool, defensePool, multiplier } = computeDicePools(
    power,
    attacker,
    cardElement,
    defender
  );
  const dice = rollBattledomeDice(rng, attackPool, defensePool);
  const amount = Math.max(0, dice.attackHits - dice.defenseBlocks);
  return { amount, multiplier, dice };
}

function applyDamage(
  state: BattleState,
  sourceUid: string,
  target: Fighter,
  amount: number,
  multiplier: number,
  events: BattleEvent[],
  dice?: DiceRoll
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
    dice,
  });
  // Hitting a wild pet makes it angry: it loses half of the affection it had.
  if (target.affection && dealt > 0) {
    target.affection = Math.floor(target.affection / 2);
    events.push({ type: 'bravo', uid: target.uid });
  }
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

/**
 * Neutral pets can use neutral cards AND elemental transformation cards;
 * Radioactive pets CANNOT use elemental cards or elemental transformation cards (they are useless on them!).
 */
export function canUseCard(
  caster: { element: PetElement },
  cardId: string,
  extremeHeat = false
): boolean {
  const card = getCard(cardId);
  // Global Warming extreme heat disables Water element cards AND Ice pets!
  if (extremeHeat) {
    if (card.element === 'agua') return false;
    if (caster.element === 'gelo') return false;
  }
  // Radioactive pets cannot turn into elemental pets and elemental cards are useless on them!
  if (caster.element === 'radioativo') {
    if (card.element !== 'neutro' || card.effect.kind === 'transformar') return false;
    return true;
  }
  return (
    caster.element !== 'neutro' || card.element === 'neutro' || card.effect.kind === 'transformar'
  );
}

/** Which kind of target a card asks for. */
export function targetKind(cardId: string): 'inimigo' | 'aliado' | 'nenhum' {
  const { effect } = getCard(cardId);
  if (effect.kind === 'dano') return effect.area ? 'nenhum' : 'inimigo';
  if (effect.kind === 'cura' || effect.kind === 'escudo') return effect.area ? 'nenhum' : 'aliado';
  if (effect.kind === 'transformar') return 'aliado';
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
  if (state.phase !== 'jogador') return fail(t('errNotYourTurn'));
  const cardId = state.hand[handIndex];
  if (!cardId) return fail(t('errInvalidCard'));
  const card = getCard(cardId);
  const caster = state.party.find((f) => f.uid === casterUid && f.hp > 0);
  if (!caster) return fail(t('errPickCaster'));
  if (!canUseCard(caster, cardId, state.extremeHeat)) return fail(t('errNeutralOnly'));
  if (!canAfford(state.mana, card.cost)) return fail(t('errNoMana'));

  const kind = targetKind(cardId);
  let target: Fighter | undefined;
  if (kind === 'inimigo') {
    target = state.enemies.find((f) => f.uid === targetUid && f.hp > 0);
    if (!target) return fail(t('errPickEnemy'));
  } else if (kind === 'aliado') {
    target = state.party.find((f) => f.uid === (targetUid ?? casterUid) && f.hp > 0);
    if (!target) return fail(t('errPickAlly'));
    // Radioactive pets cannot become elemental pets, and elemental cards are useless on them!
    if (
      target.element === 'radioativo' &&
      (card.effect.kind === 'transformar' || card.element !== 'neutro')
    ) {
      return fail(
        '☢️ Pet radioativo não consegue virar pet de elemento — cartas de elemento são inúteis nele!'
      );
    }
  }

  for (const t of MANA_TYPES) state.mana[t] -= card.cost[t] ?? 0;
  state.hand.splice(handIndex, 1);
  state.discard.push(cardId);

  const events: BattleEvent[] = [{ type: 'carta', cardId, casterUid }];
  const effect = card.effect;
  switch (effect.kind) {
    case 'dano': {
      const targets = effect.area ? alive(state.enemies) : [target as Fighter];
      if (caster.element === 'radioativo') {
        // Nuclear Hit-Kill Attack!
        // 1. Deals lethal hit-kill damage to target(s).
        // 2. Radiation drains HALF of HP from ALL pets on the field.
        // 3. 2 nuclear attacks in one battle WIPE OUT the player's own party!
        state.nuclearAttacksUsed += 1;
        for (const t of targets) {
          const lethal = t.hp + t.shield + 999;
          t.shield = 0;
          t.hp = 0;
          events.push({
            type: 'dano',
            sourceUid: caster.uid,
            targetUid: t.uid,
            amount: lethal,
            absorbed: 0,
            multiplier: 99,
          });
          events.push({ type: 'nocaute', uid: t.uid });
        }
        const allFieldPets = [...state.party, ...state.enemies];
        for (const f of allFieldPets) {
          if (f.hp <= 0) continue;
          const drain =
            f.side === 'player' && state.nuclearAttacksUsed >= 2 ? f.hp : Math.ceil(f.maxHp / 2);
          f.hp = Math.max(0, f.hp - drain);
          events.push({
            type: 'dano',
            sourceUid: caster.uid,
            targetUid: f.uid,
            amount: drain,
            absorbed: 0,
            multiplier: 1,
          });
          if (f.hp === 0) events.push({ type: 'nocaute', uid: f.uid });
        }
        // If 2nd nuclear attack wiped the player's own party, party dies (enemy wins)!
        if (alive(state.party).length === 0) {
          state.winner = 'enemy';
          state.phase = 'fim';
          events.push({ type: 'fim', winner: 'enemy' });
        } else {
          checkEnd(state, events);
        }
        break;
      }
      // Transformed elemental pets infuse neutral attacks with their active elemental variation!
      const attackElement: CardElement =
        card.element === 'neutro' && caster.element !== 'neutro' ? caster.element : card.element;
      for (const t of targets) {
        const { amount, multiplier, dice } = resolveDiceAttack(
          state.rng,
          effect.power,
          caster,
          attackElement,
          t
        );
        applyDamage(state, caster.uid, t, amount, multiplier, events, dice);
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
    case 'transformar': {
      const ally = target as Fighter;
      ally.element = effect.element;
      ally.attack += 1;
      events.push({ type: 'transformar', targetUid: ally.uid, element: effect.element });
      break;
    }
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
        name: cardName(card),
        element: card.element,
        power: effect.power,
        turnsLeft: effect.turns,
      });
      events.push({ type: 'invocar', summonUid: uid, name: cardName(card) });
      break;
    }
  }
  return { ok: true, events };
}

/**
 * Petting a wild pet: costs 1 mana of the chosen kind (corpo = belly rubs, ilusao = playing,
 * talento = grooming) and fills its affection meter, twice as fast with the kind it likes.
 * When the meter is full the pet joins the team on the spot. There is no capture by beating
 * or weakening a pet: a knocked-out pet can't be petted.
 */
export function petMonster(
  state: BattleState,
  casterUid: string,
  targetUid: string,
  style: ManaType
): PlayResult {
  const fail = (error: string): PlayResult => ({ ok: false, error, events: [] });
  if (state.phase !== 'jogador') return fail(t('errNotYourTurn'));
  const caster = state.party.find((f) => f.uid === casterUid && f.hp > 0);
  if (!caster) return fail(t('errPickCaster'));
  const target = state.enemies.find((f) => f.uid === targetUid && f.hp > 0);
  if (!target) return fail(t('errPickEnemy'));
  if (target.affectionMax === undefined) return fail(t('errNotWild'));
  if (state.captureRoom <= 0) return fail(t('errTeamFull'));
  if (state.mana[style] < 1) return fail(t('errNoMana'));
  state.mana[style] -= 1;
  const liked = getSpecies(target.speciesId).likes === style;
  const amount = liked ? 2 : 1;
  target.affection = Math.min(target.affectionMax, (target.affection ?? 0) + amount);
  const events: BattleEvent[] = [{ type: 'carinho', casterUid, targetUid, amount, liked }];
  if (target.affection >= target.affectionMax) {
    state.enemies = state.enemies.filter((f) => f !== target);
    state.captured.push(target);
    state.captureRoom -= 1;
    events.push({ type: 'capturado', uid: target.uid, name: target.name });
    checkEnd(state, events);
  }
  return { ok: true, events };
}

/** Enemy AI: the target with the best element multiplier, then the lowest HP. */
export function chooseEnemyTarget(attacker: Fighter, targets: readonly Fighter[]): Fighter {
  return [...targets].sort((a, b) => {
    const diff =
      petMultiplier(attacker.element, b.element) - petMultiplier(attacker.element, a.element);
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
    const { amount, multiplier, dice } = resolveDiceAttack(
      state.rng,
      summon.power,
      { attack: 0, element: summon.element },
      summon.element,
      target
    );
    applyDamage(state, summon.uid, target, amount, multiplier, events, dice);
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
    const { amount, multiplier, dice } = resolveDiceAttack(
      state.rng,
      state.enemyPower,
      enemy,
      enemy.element === 'radioativo' ? 'neutro' : enemy.element,
      target
    );
    applyDamage(state, enemy.uid, target, amount, multiplier, events, dice);
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
