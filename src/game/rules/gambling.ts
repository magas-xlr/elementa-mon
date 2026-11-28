import { next, type RngState } from './rng';

export interface ArenaFighter {
  id: string;
  name: string;
  icon: string;
  record: string;
  /** Base strength rating (higher = stronger favorite, though upsets still happen!). */
  rating: number;
  /** Payout multiplier if this fighter wins. */
  odds: number;
  style: string;
}

export const ARENA_FIGHTERS: readonly ArenaFighter[] = [
  {
    id: 'rex_chama',
    name: 'Rex-Chama',
    icon: '🔥',
    record: '14V - 3D',
    rating: 86,
    odds: 1.65,
    style: 'Campeão agressivo da arena',
  },
  {
    id: 'gelo_rei',
    name: 'Gelo-Rei',
    icon: '❄️',
    record: '12V - 4D',
    rating: 81,
    odds: 1.85,
    style: 'Defesa glacial quase impenetrável',
  },
  {
    id: 'casco_tita',
    name: 'Casco-Titã',
    icon: '🛡️',
    record: '11V - 5D',
    rating: 76,
    odds: 2.1,
    style: 'Tanque resistente de contra-ataque',
  },
  {
    id: 'relampago_z',
    name: 'Relâmpago-Z',
    icon: '⚡',
    record: '9V - 6D',
    rating: 70,
    odds: 2.5,
    style: 'Veloz e imprevisível',
  },
  {
    id: 'sombra_lama',
    name: 'Sombra-Lama',
    icon: '☠️',
    record: '4V - 11D',
    rating: 54,
    odds: 4.0,
    style: 'Azarão traiçoeiro',
  },
  {
    id: 'pipo_furioso',
    name: 'Pipo-Furioso',
    icon: '💥',
    record: '3V - 12D',
    rating: 48,
    odds: 4.8,
    style: 'Zebra total — paga muito se vencer!',
  },
];

export interface GamblingState {
  totalBets: number;
  totalWon: number;
  totalLost: number;
  /** Last in-game day a bet was placed (strictly 1 bet per day!). */
  lastBetDay: number;
  /** Triggered if player bets too much (>= 4 bets): NPCs automatically dislike & avoid you! */
  addicted: boolean;
  lastSummary?: string;
}

export const ADDICTION_THRESHOLD = 4;

export function createGamblingState(): GamblingState {
  return {
    totalBets: 0,
    totalWon: 0,
    totalLost: 0,
    lastBetDay: 0,
    addicted: false,
  };
}

/** Daily featured matchup pair for the Pet Battle Betting House. */
export function dailyMatchup(day: number): [ArenaFighter, ArenaFighter] {
  const a = ARENA_FIGHTERS[(day - 1) % ARENA_FIGHTERS.length];
  const b = ARENA_FIGHTERS[(day + 2) % ARENA_FIGHTERS.length];
  return [a, b.id === a.id ? ARENA_FIGHTERS[(day + 3) % ARENA_FIGHTERS.length] : b];
}

/**
 * Places a Pet Battle bet at the Gambling House:
 * - Strictly 1 bet per day.
 * - Any wager amount up to wallet.
 * - Hard to win (house edge + unpredictable arena upsets), big upside or big loss.
 * - Betting too much (>= 4 times) brands the player as "Viciado em Apostas".
 */
export function placePetBattleBet(
  state: GamblingState,
  rng: RngState,
  day: number,
  fighterA: ArenaFighter,
  fighterB: ArenaFighter,
  pickedId: string,
  wager: number,
  wallet: number
): {
  ok: boolean;
  won: boolean;
  netDelta: number;
  winner: ArenaFighter;
  msg: string;
  newlyAddicted: boolean;
} {
  if (state.lastBetDay === day) {
    return {
      ok: false,
      won: false,
      netDelta: 0,
      winner: fighterA,
      msg: '🎲 Você já fez sua aposta de hoje! Volte amanhã para apostar novamente.',
      newlyAddicted: false,
    };
  }
  const bet = Math.floor(wager);
  if (bet <= 0 || bet > wallet) {
    return {
      ok: false,
      won: false,
      netDelta: 0,
      winner: fighterA,
      msg: 'Valor de aposta inválido ou saldo insuficiente.',
      newlyAddicted: false,
    };
  }
  const picked = pickedId === fighterA.id ? fighterA : fighterB;
  const other = picked.id === fighterA.id ? fighterB : fighterA;

  // Hard-to-win betting house probability: strong house edge + arena upsets!
  const rawShare = picked.rating / (picked.rating + other.rating);
  const winProb = Math.max(0.14, Math.min(0.42, rawShare * 0.68));
  const won = next(rng) < winProb;
  const winner = won ? picked : other;

  state.lastBetDay = day;
  state.totalBets += 1;
  const wasAddicted = state.addicted;
  if (state.totalBets >= ADDICTION_THRESHOLD) state.addicted = true;
  const newlyAddicted = !wasAddicted && state.addicted;

  let netDelta = -bet;
  let msg: string;
  if (won) {
    const payout = Math.round(bet * picked.odds);
    netDelta = payout - bet;
    state.totalWon += netDelta;
    msg = `🏆 ${winner.icon} ${winner.name} venceu a batalha! Você ganhou +${netDelta} moedas (retorno total ${payout})!`;
  } else {
    state.totalLost += bet;
    msg = `💸 ${winner.icon} ${winner.name} venceu ${picked.name}! Você perdeu −${bet} moedas na aposta.`;
  }
  if (newlyAddicted) {
    msg += ' ⚠️ VOCÊ RECEBEU O TÍTULO DE "VICIADO EM APOSTAS"! Os NPCs passaram a evitar você!';
  }
  state.lastSummary = msg;
  return { ok: true, won, netDelta, winner, msg, newlyAddicted };
}
