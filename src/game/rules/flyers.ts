import { next, pick, type RngState } from './rng';

/**
 * Annoying Apartment-Broker NPCs & Player Flyer Distribution System:
 * - Pushy real-estate broker NPCs appear in neighborhoods handing out apartment flyers ("panfletos") — yes, they are annoying!
 * - The player can also hand out flyers for a job, to advertise selling their apartment, or to promote their NGO —
 *   and NPCs will find the player annoying too (-bond), plus discarded paper flyers create street litter!
 */

export type FlyerCampaignKind = 'emprego' | 'apartamento' | 'ong';

export interface BrokerPitch {
  brokerName: string;
  quote: string;
  apartmentName: string;
}

const BROKER_NAMES = [
  'Corretor Kleber (Panfleteiro)',
  'Corretora Vanessa (Imóveis Já!)',
  'Beto dos Panfletos',
  'Sônia do Plantão de Vendas',
] as const;

const BROKER_PITCHES = [
  '"Ei, moça! Pega um panfleto! Apartamento na planta com vista pro estacionamento, entrada facilitada!!"',
  '"Só um segundinho! Não vai embora! Tenho um estúdio de 14m² que é a SUA cara! Toma esse panfleto!"',
  '"Oportunidade ÚNICA! Últimas unidades do Residencial Brisa! Pega dois panfletos pra mostrar pra família!"',
  '"Psiu! Já pensou em sair do aluguel hoje?! Toma meu panfleto, eu te sigo até a esquina explicando!"',
] as const;

export interface FlyerState {
  /** Number of annoying flyers handed to the player by real-estate broker NPCs. */
  receivedFlyers: number;
  /** How many times the player handed out flyers (makes NPCs think you're annoying!). */
  distributedFlyers: number;
  /** Accumulated annoyance ("chatice") from handing out flyers. */
  annoyanceScore: number;
  /** Cooldown steps before another annoying apartment broker can approach. */
  brokerCooldownSteps: number;
}

export function createFlyerState(): FlyerState {
  return {
    receivedFlyers: 0,
    distributedFlyers: 0,
    annoyanceScore: 0,
    brokerCooldownSteps: 14,
  };
}

/**
 * Checks if an annoying apartment-broker NPC approaches while walking in a neighborhood.
 * Hands the player a paper flyer and delivers an annoying sales pitch!
 */
export function maybeTriggerApartmentBroker(state: FlyerState, rng: RngState): BrokerPitch | null {
  if (state.brokerCooldownSteps > 0) {
    state.brokerCooldownSteps -= 1;
    return null;
  }
  if (next(rng) >= 0.08) return null;
  state.receivedFlyers += 1;
  state.brokerCooldownSteps = 22;
  return {
    brokerName: pick(rng, BROKER_NAMES),
    quote: pick(rng, BROKER_PITCHES),
    apartmentName: 'Residencial Brisa',
  };
}

/**
 * Player hands out flyers on the street (for a job, selling their apartment, or promoting their NGO).
 * Works, BUT NPCs find you annoying (-1 bond) and tossed flyers pollute the street!
 */
export function distributePlayerFlyers(
  state: FlyerState,
  kind: FlyerCampaignKind
): {
  coinsEarned: number;
  ngoRecruitGained: boolean;
  apartmentInterestBoost: number;
  npcBondPenalty: number;
  paperLitterCreated: number;
  msg: string;
} {
  state.distributedFlyers += 1;
  state.annoyanceScore += 1;
  const npcBondPenalty = -1;
  const paperLitterCreated = 1;

  if (kind === 'emprego') {
    return {
      coinsEarned: 18,
      ngoRecruitGained: false,
      apartmentInterestBoost: 0,
      npcBondPenalty,
      paperLitterCreated,
      msg: '📄 Você distribuiu panfletos no emprego (+18 moedas), mas os NPCs te acharam bem chato (−1 afinidade) e alguns jogaram papel no chão!',
    };
  }
  if (kind === 'apartamento') {
    return {
      coinsEarned: 15,
      ngoRecruitGained: false,
      apartmentInterestBoost: 15,
      npcBondPenalty,
      paperLitterCreated,
      msg: '🏢📄 Você divulgou a venda do seu apartamento por panfleto (+15 moedas de sinal), mas os NPCs te acharam chato (−1 afinidade)!',
    };
  }
  return {
    coinsEarned: 0,
    ngoRecruitGained: true,
    apartmentInterestBoost: 0,
    npcBondPenalty,
    paperLitterCreated,
    msg: '🌱📄 Você divulgou sua ONG distribuindo panfletos (+1 novo apoiador!), mas os NPCs acharam a abordagem bem chata (−1 afinidade)!',
  };
}
