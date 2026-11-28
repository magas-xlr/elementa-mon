import { SPECIES } from '../data/species';
import { ELEMENTS, type Element } from '../data/elements';
import { createPet, type PetInstance } from './progression';

/**
 * Secret Post-Game Quest: The 64 Talking & Thinking Monsters of the Cyberpunk Sewer Underworld!
 * - Unlocks ONLY after defeating the 8 main bosses (`bossesDefeated >= 8`).
 * - 64 sentient monsters who talk, think, and act as trainers (mostly villains, some allies).
 * - Set in a completely separate high-tech Cyberpunk Sewer world with 4 unique biomes.
 * - Plot Twist Final Boss: The Protagonist themselves!
 */

export const BOSSES_TO_UNLOCK_SEWER = 8;
export const TOTAL_TALKING_MONSTERS = 64;

export interface SewerBiome {
  id: string;
  name: string;
  icon: string;
  paletteHex: string;
  desc: string;
}

export const SEWER_BIOMES: readonly SewerBiome[] = [
  {
    id: 'fibra_optica',
    name: 'Túneis de Fibra Óptica',
    icon: '💠',
    paletteHex: '#0ef0ff',
    desc: 'Condutos subterrâneos pulsando dados neon sob a vila.',
  },
  {
    id: 'lodo_quantico',
    name: 'Reator de Lodo Quântico',
    icon: '☢️',
    paletteHex: '#8aff3b',
    desc: 'Usina cyberpunk onde monstros pensantes hackeiam genes elementais.',
  },
  {
    id: 'metropole_0xff',
    name: 'Metrópole Subterrânea 0xFF',
    icon: '🌆',
    paletteHex: '#ff38a8',
    desc: 'Favela holográfica dos 64 monstros falantes e seus mercados clandestinos.',
  },
  {
    id: 'nucleo_espelho',
    name: 'Núcleo Espelho (Trono do Criador)',
    icon: '🪞',
    paletteHex: '#c46bff',
    desc: 'O coração do esgoto cyberpunk — onde o verdadeiro vilão final aguarda.',
  },
];

export interface TalkingMonsterTrainer {
  index: number; // 1..64
  id: string;
  name: string;
  speciesId: string;
  element: Element;
  role: 'vilao' | 'aliado';
  sewerBiomeIndex: number;
  quote: string;
  partySpecies: string[];
}

const PREFIXES = ['Cyber', 'Neo', 'Dr.', 'Kira', 'Vex', 'Zed', 'Nyx', 'Rex'];
const SUFFIXES = ['Byte', 'Pulse', 'Core', 'Shade', 'Flux', 'Zero', 'Glitch', 'Prime'];

/** All 64 sentient, talking & thinking monster trainers living in the Cyberpunk Sewer! */
export const TALKING_MONSTERS: readonly TalkingMonsterTrainer[] = Array.from(
  { length: TOTAL_TALKING_MONSTERS },
  (_, i) => {
    const sp = SPECIES[i % SPECIES.length];
    const el = ELEMENTS[i % ELEMENTS.length];
    // Mostly villains (~78%), some allies (~22%)!
    const role: 'vilao' | 'aliado' = i % 5 === 0 ? 'aliado' : 'vilao';
    const sewerBiomeIndex = Math.min(3, Math.floor(i / 16));
    const name = `${PREFIXES[i % PREFIXES.length]}-${SUFFIXES[Math.floor(i / 8) % SUFFIXES.length]} #${i + 1}`;
    const quote =
      role === 'vilao'
        ? `"Humanos achavam que só eles podiam pensar e treinar... Nós, os 64 do Esgoto, vamos reescrever a superfície!"`
        : `"Nem todos nós queremos guerra, humano... mas cuidado: o líder secreto no Núcleo Espelho tem o SEU rosto!"`;
    return {
      index: i + 1,
      id: `talking_${i + 1}`,
      name,
      speciesId: sp.id,
      element: el,
      role,
      sewerBiomeIndex,
      quote,
      partySpecies: [sp.id, SPECIES[(i + 3) % SPECIES.length].id],
    };
  }
);

export interface SewerQuestState {
  unlocked: boolean;
  currentSewerBiome: number;
  defeatedIds: string[];
  alliedIds: string[];
  finalTwistRevealed: boolean;
  finalBossDefeated: boolean;
}

export function createSewerQuestState(bossesDefeated = 0): SewerQuestState {
  return {
    unlocked: bossesDefeated >= BOSSES_TO_UNLOCK_SEWER,
    currentSewerBiome: 0,
    defeatedIds: [],
    alliedIds: [],
    finalTwistRevealed: false,
    finalBossDefeated: false,
  };
}

export function checkSewerUnlock(state: SewerQuestState, bossesDefeated: number): boolean {
  if (bossesDefeated >= BOSSES_TO_UNLOCK_SEWER) {
    state.unlocked = true;
  }
  return state.unlocked;
}

/** Builds the Plot Twist Final Boss party: a dark cyberpunk mirror of the Protagonist's own team! */
export function buildProtagonistMirrorBoss(playerParty: PetInstance[]): {
  bossTitle: string;
  twistSpeech: string;
  enemies: PetInstance[];
} {
  const mirror = (playerParty.length ? playerParty : [createPet('pipo', 3, 'fantasma')])
    .slice(0, 3)
    .map((p) => {
      const m = createPet(p.speciesId, 3, p.element === 'neutro' ? 'psiquico' : p.element);
      m.atkMod = 2;
      m.defMod = 1;
      return m;
    });
  return {
    bossTitle: '🪞 VOCÊ MESMO (O Arquiteto Sombrio do Esgoto)',
    twistSpeech:
      '"Surpreso ao tirar a máscara? Os 64 monstros falantes nasceram dos SEUS experimentos, da SUA poluição e das SUAS escolhas. O verdadeiro vilão final... sempre foi você!"',
    enemies: mirror,
  };
}
