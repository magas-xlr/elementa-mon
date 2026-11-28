import type { PetInstance } from './progression';

export type MartialArtId = 'karate' | 'muay_thai' | 'judo' | 'kung_fu';

export interface MartialArtCourse {
  id: MartialArtId;
  name: string;
  icon: string;
  fee: number;
  hours: number;
  hpGain: number;
  atkGain: number;
  defGain: number;
  agiGain: number;
  desc: string;
}

export const MARTIAL_ARTS: readonly MartialArtCourse[] = [
  {
    id: 'karate',
    name: 'Karate Tradicional',
    icon: '🥋',
    fee: 35,
    hours: 3,
    hpGain: 2,
    atkGain: 1,
    defGain: 1,
    agiGain: 1,
    desc: 'Equilíbrio total (+2 HP, +1 Força, +1 Defesa, +1 Agilidade · 3h no Dojo).',
  },
  {
    id: 'muay_thai',
    name: 'Muay Thai Intenso',
    icon: '🥊',
    fee: 48,
    hours: 4,
    hpGain: 3,
    atkGain: 2,
    defGain: 1,
    agiGain: 1,
    desc: 'Foco em golpes pesados e resistência (+3 HP, +2 Força, +1 Def, +1 Agi · 4h).',
  },
  {
    id: 'judo',
    name: 'Judô Defensivo',
    icon: '🤼',
    fee: 40,
    hours: 3,
    hpGain: 3,
    atkGain: 1,
    defGain: 2,
    agiGain: 1,
    desc: 'Mestre em projeções e defesa (+3 HP, +1 Força, +2 Def, +1 Agi · 3h).',
  },
  {
    id: 'kung_fu',
    name: 'Kung Fu Veloz',
    icon: '🐉',
    fee: 45,
    hours: 4,
    hpGain: 2,
    atkGain: 1,
    defGain: 1,
    agiGain: 3,
    desc: 'Velocidade e reflexos extremos (+2 HP, +1 Força, +1 Def, +3 Agilidade · 4h).',
  },
];

export const getMartialArt = (id: MartialArtId): MartialArtCourse =>
  MARTIAL_ARTS.find((m) => m.id === id) ?? MARTIAL_ARTS[0];

export interface DojoSlot {
  id: string;
  pet: PetInstance;
  artId: MartialArtId;
  hoursRemaining: number;
}

/** Completes training and permanently applies HP, Strength (ATK), Agility (AGI) & Defense (DEF)! */
export function applyDojoGraduation(slot: DojoSlot): { pet: PetInstance; msg: string } {
  const art = getMartialArt(slot.artId);
  const p = slot.pet;
  p.hpMod = (p.hpMod ?? 0) + art.hpGain;
  p.hp += art.hpGain;
  p.atkMod = (p.atkMod ?? 0) + art.atkGain;
  p.defMod = (p.defMod ?? 0) + art.defGain;
  p.agiMod = (p.agiMod ?? 0) + art.agiGain;
  return {
    pet: p,
    msg: `${art.icon} Treino de ${art.name} concluído! (+${art.hpGain} HP, +${art.atkGain} Força, +${art.defGain} Defesa, +${art.agiGain} Agilidade!)`,
  };
}
