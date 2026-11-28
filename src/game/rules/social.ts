import { next, type RngState } from './rng';
import { STORY_NPCS, type NpcProfile } from '../data/npcs';

export interface CarModel {
  id: string;
  name: string;
  icon: string;
  price: number;
  /** Social status points granted by owning this car (makes NPCs admire you more!). */
  statusBonus: number;
  /** Heavy environmental damage when manufacturing/buying this car. */
  ecoDamageBuy: number;
  /** Exhaust pollution damage every time you fast travel between neighborhoods/biomes! */
  ecoDamageTrip: number;
  desc: string;
}

export const CAR_MODELS: readonly CarModel[] = [
  {
    id: 'fusca_fumaca',
    name: 'Fusquinha Fumacento',
    icon: '🚗',
    price: 180,
    statusBonus: 14,
    ecoDamageBuy: 12,
    ecoDamageTrip: 5,
    desc: 'Carro de entrada para Fast Travel entre bairros (+14 Status · −12🌿 compra · −5🌿/viagem).',
  },
  {
    id: 'sedan_executivo',
    name: 'Sedan Executivo',
    icon: '🚙',
    price: 420,
    statusBonus: 32,
    ecoDamageBuy: 18,
    ecoDamageTrip: 7,
    desc: 'Conforto e status de sobra (+32 Status · −18🌿 compra · −7🌿/viagem).',
  },
  {
    id: 'suv_luxo',
    name: 'SUV Blindado de Luxo',
    icon: '🚐',
    price: 850,
    statusBonus: 60,
    ecoDamageBuy: 28,
    ecoDamageTrip: 10,
    desc: 'Chama atenção no bairro inteiro e gera inveja (+60 Status · −28🌿 compra · −10🌿/viagem).',
  },
  {
    id: 'hiper_ouro',
    name: 'Hipercarro Dourado V12',
    icon: '🏎️',
    price: 1800,
    statusBonus: 120,
    ecoDamageBuy: 45,
    ecoDamageTrip: 16,
    desc: 'Máximo status social — poluição extrema e inveja altíssima (+120 Status · −45🌿 compra · −16🌿/viagem)!',
  },
];

export const getCar = (id: string): CarModel | undefined => CAR_MODELS.find((c) => c.id === id);

export interface SocialState {
  /** Owned car IDs (cars are the ONLY way to fast travel between neighborhoods/biomes!). */
  cars: string[];
  /** Currently equipped/driven car ID. */
  activeCarId: string | null;
  /** Status points earned from expensive clothes, luxury items & expensive houses. */
  luxuryStatus: number;
  /** Per-NPC status score toward the player (0..100). */
  npcStatus: Record<string, number>;
  /** Inter-NPC status/reputation pairs (e.g. 'lira:kael' -> 0..100). */
  interNpcStatus: Record<string, number>;
  /** Per-NPC envy level toward the player (0..100). High envy on Chaotic Evil NPCs triggers night robbery! */
  npcEnvy: Record<string, number>;
  /** Last in-game day a night robbery check occurred. */
  lastRobberyDay: number;
}

export function createSocialState(): SocialState {
  const npcStatus: Record<string, number> = {};
  const npcEnvy: Record<string, number> = {};
  for (const n of STORY_NPCS) {
    npcStatus[n.id] = 20;
    npcEnvy[n.id] = 5;
  }
  const interNpcStatus: Record<string, number> = {
    'lira↔kael': 68,
    'lira↔mina': 74,
    'breno↔tiffany': 82,
    'riko↔breno': 18,
    'nadia↔lira': 79,
    'mina↔kael': 71,
  };
  return {
    cars: [],
    activeCarId: null,
    luxuryStatus: 0,
    npcStatus,
    interNpcStatus,
    npcEnvy,
    lastRobberyDay: 0,
  };
}

/** Total Player Social Status from luxury items/clothes/house + best owned car. */
export function totalPlayerStatus(
  social: SocialState,
  houseOwned: boolean,
  housePrice = 0
): number {
  const carBonus = social.cars.reduce(
    (best, id) => Math.max(best, getCar(id)?.statusBonus ?? 0),
    0
  );
  const houseBonus = houseOwned ? Math.max(10, Math.round(housePrice / 10)) : 0;
  return social.luxuryStatus + carBonus + houseBonus;
}

/** Records a luxury purchase (expensive outfit, item, car, or house): raises Status & Envy! */
export function recordLuxuryGain(social: SocialState, statusGain: number): void {
  if (statusGain <= 0) return;
  social.luxuryStatus += statusGain;
  for (const n of STORY_NPCS) {
    // Higher status improves admiration with most NPCs...
    const statusMult = n.alignment.includes('Evil') ? 0.6 : 0.4;
    social.npcStatus[n.id] = Math.min(
      100,
      (social.npcStatus[n.id] ?? 20) + Math.round(statusGain * statusMult)
    );
    // ...but also builds Envy (especially strong in Chaotic Evil / Neutral Evil NPCs!)
    const envyMult =
      n.alignment === 'Chaotic Evil' ? 1.15 : n.alignment.includes('Evil') ? 0.75 : 0.35;
    social.npcEnvy[n.id] = Math.min(
      100,
      (social.npcEnvy[n.id] ?? 5) + Math.round(statusGain * envyMult)
    );
  }
}

/**
 * Checks at night whether an envious Chaotic Evil NPC attempts to rob the player!
 * Returns robbery details if triggered.
 */
export function checkChaoticEvilNightRobbery(
  social: SocialState,
  rng: RngState,
  day: number,
  wallet: number,
  isNightNow: boolean
): { robbed: boolean; thief?: NpcProfile; stolenCoins: number; msg?: string } {
  if (!isNightNow || social.lastRobberyDay === day || wallet <= 10) {
    return { robbed: false, stolenCoins: 0 };
  }
  const chaoticEvils = STORY_NPCS.filter(
    (n) => n.alignment === 'Chaotic Evil' && (social.npcEnvy[n.id] ?? 0) >= 35
  );
  if (!chaoticEvils.length) return { robbed: false, stolenCoins: 0 };

  social.lastRobberyDay = day;
  const thief = chaoticEvils[0];
  const envy = social.npcEnvy[thief.id] ?? 0;
  const chance = Math.min(0.65, 0.18 + (envy - 35) * 0.008);
  if (next(rng) < chance) {
    const stolenCoins = Math.max(8, Math.round(wallet * (0.15 + next(rng) * 0.18)));
    social.npcEnvy[thief.id] = Math.max(15, envy - 20);
    return {
      robbed: true,
      thief,
      stolenCoins,
      msg: `🌙🕵️ ${thief.name} (${thief.alignment} · Inveja ${envy}%) invadiu sua casa à noite e roubou ${stolenCoins} moedas!`,
    };
  }
  return { robbed: false, stolenCoins: 0 };
}
