/**
 * Story cast & NPC relationship system (Trails in the Sky / Xenoblade Chronicles spirit).
 * Talking to NPCs in Gravity Rush-style comic panels builds Friendship (🤝) or Romance (💖),
 * or sparks fierce Rivalry (🔥) — directly influencing how easy or challenging their duel is!
 */

import type { PrefeituraProfile } from './governance';

export type BondTier = 'rival' | 'estranho' | 'amigo' | 'namoro';
export type PoliticalStance =
  'esquerda' | 'centro_esquerda' | 'centro' | 'centro_direita' | 'direita';
export type PoliticalTalk = 'obcecado' | 'normal' | 'evita';
export type Alignment =
  | 'Lawful Good'
  | 'Neutral Good'
  | 'Chaotic Good'
  | 'Lawful Neutral'
  | 'True Neutral'
  | 'Chaotic Neutral'
  | 'Lawful Evil'
  | 'Neutral Evil'
  | 'Chaotic Evil';
export type Stereotype =
  'Hipster Ecológica' | 'Otaku' | 'NEET' | 'Gótica' | 'Faria Limer' | 'Delinquente' | 'Patricinha';
export type DereType = 'Deredere' | 'Kuudere' | 'Tsundere' | 'Dandere' | 'Himedere' | 'Yandere';

export interface NpcChoice {
  label: string;
  reply: string;
  /** Change to bond score (+1 friendly, +2 heartfelt/romantic, -1 rivalrous). */
  bondDelta: number;
  /** Optional sound/comic SFX badge shown in the comic panel. */
  sfx?: string;
}

export interface NpcProfile {
  id: string;
  name: string;
  title: string;
  biome: number;
  /** Outfit & accent colors for their Trails/Xenoblade anime portrait & 3D model. */
  outfitColor: number;
  hairColor: string;
  eyeColor: string;
  accentColor: string;
  /** Opening story lines (Gravity Rush comic panels). */
  introPanels: { speaker: string; text: string; sfx?: string }[];
  /** Interactive conversation choices that shape Friendship, Romance, or Rivalry. */
  choices: NpcChoice[];
  /** Exclusive heartfelt dialogue once you reach Romance (bond >= 5). */
  romanceLine: string;
  /** Friendly dialogue once you reach Friendship (bond >= 3). */
  friendLine: string;
  /** Political stance along the Esquerda ↔ Direita spectrum. */
  politics: PoliticalStance;
  /** How much this NPC wants to talk about politics ('obcecado', 'normal', or 'evita'). */
  politicalTalk: PoliticalTalk;
  /** D&D moral/ethical alignment (Lawful Good ↔ Chaotic Evil): shapes how they treat the player! */
  alignment: Alignment;
  /** Social stereotype archetype (Otaku, NEET, Patricinha, etc.). */
  stereotype: Stereotype;
  /** Anime Dere romance personality when this NPC falls in love with the player! */
  dere: DereType;
}

export const STORY_NPCS: readonly NpcProfile[] = [
  {
    id: 'lira',
    name: 'Lira',
    title: 'Aprendiz de Bracer · Vila da Brisa',
    biome: 0,
    outfitColor: 0x3b945e,
    hairColor: '#c96838',
    eyeColor: '#2e8f6b',
    accentColor: '#f5cd5b',
    introPanels: [
      {
        speaker: 'Lira',
        text: 'Ei, viajante! Você também ouviu o eco dos Sete Sinos Elementais lá da Fortaleza Celeste?',
        sfx: 'FWOOSH!',
      },
      {
        speaker: 'Lira',
        text: 'Desde que a fenda se abriu, os Elementa-Mons do Prado ficaram agitados... mas o Caputino até tentou me mostrar o caminho!',
      },
    ],
    choices: [
      {
        label: '💬 "Vamos restaurar os Sinos juntos!"',
        reply:
          'Haha, gostei desse brilho nos seus olhos! Prometo te dar dicas sempre que nos encontrarmos.',
        bondDelta: 1,
        sfx: '✨',
      },
      {
        label: '💐 "O Prado fica mais bonito com você aqui."',
        reply:
          'E-ei! Não fala isso assim do nada... Meu coração quase disparou mais rápido que um Pulinho!',
        bondDelta: 2,
        sfx: 'DOKI!',
      },
      {
        label: '⚔️ "Mostre sua força real num duelo sério!"',
        reply: 'Oh! Quer levar a sério mesmo? Então não vou pegar leve com meus dados de ataque!',
        bondDelta: -1,
        sfx: 'ZAP!',
      },
    ],
    friendLine:
      'Somos uma ótima dupla! Vou fazer um duelo de treino mais leve para fortalecer seus pets.',
    romanceLine:
      'Sempre fico feliz quando você volta para a Vila da Brisa... 💖 Vou cuidar da sua equipe antes do nosso treino!',
    politics: 'esquerda',
    politicalTalk: 'obcecado',
    alignment: 'Lawful Good',
    stereotype: 'Hipster Ecológica',
    dere: 'Deredere',
  },
  {
    id: 'kael',
    name: 'Kael',
    title: 'Cartógrafo Errante · Ruínas Solares',
    biome: 1,
    outfitColor: 0x3a64a8,
    hairColor: '#2e3856',
    eyeColor: '#48a4d8',
    accentColor: '#ff9a3c',
    introPanels: [
      {
        speaker: 'Kael',
        text: 'Hm... minhas anotações apontam que o Segundo Sino ressoa bem no coração destas ruínas.',
        sfx: 'SCRITCH!',
      },
      {
        speaker: 'Kael',
        text: 'Poucos exploradores chegam tão longe com pets tão bem cuidados. Qual é a sua estratégia?',
      },
    ],
    choices: [
      {
        label: '🗺️ "Posso ver seus mapas dos biomas?"',
        reply: 'Claro! Marquei onde ficam os cristais elementais mais raros. Boa sorte lá adiante.',
        bondDelta: 1,
        sfx: '✨',
      },
      {
        label: '💖 "Gosto de viajar quando encontro você."',
        reply:
          '...Você sempre sabe como quebrar minha concentração. Guarde este amuleto de sorte comigo.',
        bondDelta: 2,
        sfx: '♥',
      },
      {
        label: '🔥 "Mapas não vencem batalhas. Vamos duelar!"',
        reply: 'Muito bem. Vou testar cada carta do seu deck com força total!',
        bondDelta: -1,
        sfx: 'BOOM!',
      },
    ],
    friendLine: 'Bom te rever, parceiro! Vamos fazer um duelo amigável para testar suas evoluções.',
    romanceLine:
      'Cada mapa que desenho acaba me trazendo de volta para perto de você... 💖 Vamos treinar juntos!',
    politics: 'direita',
    politicalTalk: 'evita',
    alignment: 'Neutral Good',
    stereotype: 'Otaku',
    dere: 'Kuudere',
  },
  {
    id: 'mina',
    name: 'Mina',
    title: 'Artífice de Cristais · Campos Distantes',
    biome: 2,
    outfitColor: 0x8e5ec8,
    hairColor: '#6b4288',
    eyeColor: '#d968a8',
    accentColor: '#ffe066',
    introPanels: [
      {
        speaker: 'Mina',
        text: 'Uau! A ressonância dos seus Elementa-Mons está fazendo os cristais cantarem!',
        sfx: 'TING!',
      },
      {
        speaker: 'Mina',
        text: 'Se continuar evoluindo seus pets e trocando os elementos na hora certa, você vai chegar à Fortaleza Celeste!',
      },
    ],
    choices: [
      {
        label: '✨ "Me ensina sobre a sintonia dos elementos!"',
        reply:
          'Com prazer! Quando um pet evolui, mudar o elemento dele muda toda a tática da equipe.',
        bondDelta: 1,
        sfx: '✨',
      },
      {
        label: '🌸 "Seu entusiasmo ilumina todo esse lugar."',
        reply: 'Own, que fofo! Se continuar me elogiando assim, vou querer viajar na sua equipe!',
        bondDelta: 2,
        sfx: 'DOKI!',
      },
      {
        label: '⚡ "Menos teoria, mais ação na arena!"',
        reply: 'Ui, espírito competitivo! Pode deixar que eu vou jogar pra valer!',
        bondDelta: -1,
        sfx: 'CRACK!',
      },
    ],
    friendLine: 'Que alegria te ver! Vou deixar o duelo mais tranquilo pra gente se divertir.',
    romanceLine:
      'N-não é como se eu tivesse esperado por você o dia inteiro, baka! Toma... cuidei dos seus pets só por pena! 😳💖',
    politics: 'centro_esquerda',
    politicalTalk: 'normal',
    alignment: 'Chaotic Good',
    stereotype: 'NEET',
    dere: 'Tsundere',
  },
  {
    id: 'breno',
    name: 'Breno',
    title: 'Empresário de Cristais · Metrópole Neon',
    biome: 4,
    outfitColor: 0x2c4b7c,
    hairColor: '#3a2d24',
    eyeColor: '#c98830',
    accentColor: '#66b2ff',
    introPanels: [
      {
        speaker: 'Breno',
        text: 'Você viu os impostos que querem cobrar nas lojas hoje em dia? O mercado precisa respirar!',
        sfx: 'HMPH!',
      },
      {
        speaker: 'Breno',
        text: 'Mas deixando os negócios de lado por um segundo: seus Elementa-Mons parecem bem treinados.',
      },
    ],
    choices: [
      {
        label: '💼 "Vamos conversar sobre economia e pets."',
        reply: 'Finalmente alguém que entende de livre iniciativa! Gostei de você.',
        bondDelta: 1,
        sfx: '✨',
      },
      {
        label: '🌟 "Admiro sua determinação."',
        reply: 'Haha, obrigado! Não é todo dia que alguém reconhece o esforço por aqui.',
        bondDelta: 2,
        sfx: '♥',
      },
      {
        label: '⚔️ "Menos discurso e mais batalha!"',
        reply: 'Feito! Vamos ver se seu deck rende lucro na arena!',
        bondDelta: -1,
        sfx: 'CLANG!',
      },
    ],
    friendLine: 'Parceiro de negócios! Vamos fazer um treino justo.',
    romanceLine: 'Você vale mais que todas as ações da bolsa de Neon... 💖',
    politics: 'direita',
    politicalTalk: 'obcecado',
    alignment: 'Lawful Evil',
    stereotype: 'Faria Limer',
    dere: 'Himedere',
  },
  {
    id: 'nadia',
    name: 'Nádia',
    title: 'Botânica do Labirinto · Mata Densa',
    biome: 3,
    outfitColor: 0x4b7d5b,
    hairColor: '#2c4a3c',
    eyeColor: '#76c288',
    accentColor: '#a8e6a3',
    introPanels: [
      {
        speaker: 'Nádia',
        text: 'Shhh... ouça as folhas do Labirinto. Elas dizem muito mais do que qualquer comício.',
        sfx: 'SHHH...',
      },
    ],
    choices: [
      {
        label: '🌿 "A natureza aqui é incrível."',
        reply: 'Sim! Prefiro cuidar das plantas e dos pets longe de brigas políticas.',
        bondDelta: 1,
        sfx: '🍃',
      },
      {
        label: '🌸 "Sua calma me inspira."',
        reply: 'Obrigada... você traz uma paz rara para este lugar.',
        bondDelta: 2,
        sfx: '♥',
      },
      {
        label: '🔥 "Quero testar meus pets contra os seus!"',
        reply: 'Tudo bem, mas tente não queimar a floresta no processo!',
        bondDelta: -1,
        sfx: 'WHOOSH!',
      },
    ],
    friendLine: 'Sempre bom te ver cuidando do equilíbrio ecológico.',
    romanceLine: 'Nossa sintonia floresce como o próprio Labirinto... 💖',
    politics: 'centro_direita',
    politicalTalk: 'evita',
    alignment: 'True Neutral',
    stereotype: 'Gótica',
    dere: 'Dandere',
  },
  {
    id: 'riko',
    name: 'Riko',
    title: 'Sucateiro das Sombras · Ferro-Velho',
    biome: 5,
    outfitColor: 0x3b2a3e,
    hairColor: '#1f1624',
    eyeColor: '#e04868',
    accentColor: '#ff5277',
    introPanels: [
      {
        speaker: 'Riko',
        text: 'Heh... andando por aí cheio de itens caros no meio do Ferro-Velho? Corajoso... ou descuidado.',
        sfx: 'GRIN!',
      },
    ],
    choices: [
      {
        label: '🕶️ "Não tenho medo de você. Vamos conversar."',
        reply: 'Haha, gostei da marra. Talvez eu não te roube hoje à noite...',
        bondDelta: 1,
        sfx: 'HEH!',
      },
      {
        label: '🖤 "Você tem um charme perigoso."',
        reply:
          'Cuidado com o que diz... se eu me apaixonar por você, ninguém mais vai poder chegar perto! 🔪💖',
        bondDelta: 2,
        sfx: 'DOKI!',
      },
      {
        label: '⚔️ "Encosta um dedo nas minhas moedas e eu te derroto!"',
        reply: 'Ótimo! Adoro quando a presa revida!',
        bondDelta: -1,
        sfx: 'SLASH!',
      },
    ],
    friendLine: 'Você é legal demais pra eu saquear... por enquanto.',
    romanceLine:
      'Você só precisa olhar para mim... se algum outro NPC encostar em você, eu resolvo pessoalmente... 🔪💖',
    politics: 'centro',
    politicalTalk: 'evita',
    alignment: 'Chaotic Evil',
    stereotype: 'Delinquente',
    dere: 'Yandere',
  },
  {
    id: 'tiffany',
    name: 'Tiffany',
    title: 'Herdeira Celeste · Fortaleza',
    biome: 6,
    outfitColor: 0xd972b4,
    hairColor: '#f2d06b',
    eyeColor: '#58b4f2',
    accentColor: '#ffb8e0',
    introPanels: [
      {
        speaker: 'Tiffany',
        text: 'Ai, miga... você veio até a Fortaleza a pé ou tem pelo menos um carro de luxo na garagem?',
        sfx: 'SPARKLE!',
      },
    ],
    choices: [
      {
        label: '💎 "Estilo e status são essenciais!"',
        reply: 'Amei! Finalmente alguém com bom gosto por aqui!',
        bondDelta: 1,
        sfx: '✨',
      },
      {
        label: '👑 "Nenhuma joia brilha mais que você."',
        reply:
          'Obviamente! Continue me tratando como a princesa que sou e talvez eu te dê uma chance~ 💖',
        bondDelta: 2,
        sfx: 'DOKI!',
      },
      {
        label: '⚔️ "Dinheiro não compra vitória em batalha!"',
        reply: 'Que horror! Vou acabar com você agora mesmo!',
        bondDelta: -1,
        sfx: 'SLAP!',
      },
    ],
    friendLine: 'Adoro conversar com gente de alto status como você!',
    romanceLine:
      'Ajoelhe-se diante da sua princesa, meu bem~ 👑💖 Como recompensa, vou mimar toda a sua equipe!',
    politics: 'direita',
    politicalTalk: 'normal',
    alignment: 'Neutral Evil',
    stereotype: 'Patricinha',
    dere: 'Himedere',
  },
];

export const POLITICAL_STANCE_LABELS: Record<PoliticalStance, string> = {
  esquerda: '🔴 Esquerda',
  centro_esquerda: '🟠 Centro-Esquerda',
  centro: '⚪ Centro',
  centro_direita: '💠 Centro-Direita',
  direita: '🔵 Direita',
};

/** Evaluates how an NPC feels about a biome's Prefeitura and generates a political dialogue quote. */
export function npcGovernmentOpinion(
  npc: NpcProfile,
  pref: PrefeituraProfile
): { approves: boolean; badge: string; quote: string } {
  const npcIsLeft = npc.politics === 'esquerda' || npc.politics === 'centro_esquerda';
  const npcIsRight = npc.politics === 'direita' || npc.politics === 'centro_direita';
  const approves =
    (pref.politicalLean === 'esquerda' && npcIsLeft) ||
    (pref.politicalLean === 'direita' && npcIsRight);

  if (npc.politicalTalk === 'evita') {
    return {
      approves,
      badge: '🤐 Evita falar de política',
      quote:
        'Olha, prefiro não entrar nesse papo de esquerda ou direita... cada um vota como acha melhor e eu só quero cuidar dos meus pets em paz!',
    };
  }
  if (npc.politicalTalk === 'obcecado') {
    return {
      approves,
      badge: approves ? '📢 Fanático · Apoia a Prefeitura' : '📢 Fanático · Oposição ferrenha',
      quote: approves
        ? `Você viu o trabalho da ${pref.name} (${pref.politicalLabel})?! É disso que o povo precisa! Todo mundo no bairro devia apoiar esse projeto!`
        : `Não aguento mais essa gestão da ${pref.name} (${pref.politicalLabel})! A gente fala disso todo santo dia aqui no bairro — precisa mudar tudo na próxima eleição!`,
    };
  }
  return {
    approves,
    badge: approves ? '👍 Gosta do governo local' : '👎 Não curte o governo local',
    quote: approves
      ? `Até que a ${pref.name} (${pref.politicalLabel}) tem acertado nas medidas para o bairro.`
      : `Sinceramente, não concordo muito com o rumo da ${pref.name} (${pref.politicalLabel}), mas tento manter a calma.`,
  };
}

/**
 * Computes how an NPC treats the player based on their D&D alignment (Lawful Good ↔ Chaotic Evil),
 * gambling addiction title, and player luxury status!
 */
export function npcAlignmentTreatment(
  npc: NpcProfile,
  playerStatus: number,
  gamblingAddicted: boolean
): { bondMod: number; refusesFavors: boolean; note: string } {
  if (gamblingAddicted) {
    return {
      bondMod: npc.alignment.includes('Good') ? -3 : -2,
      refusesFavors: true,
      note: '🎲 Título "Viciado em Apostas": este NPC perdeu a confiança em você e evita te fazer favores!',
    };
  }
  const highStatus = playerStatus >= 40;
  if (npc.alignment === 'Chaotic Evil') {
    return {
      bondMod: highStatus ? -1 : 0,
      refusesFavors: false,
      note: highStatus
        ? '😈 Chaotic Evil: seu luxo despertou muita INVEJA — cuidado para não ser roubado à noite!'
        : '😈 Chaotic Evil: trata você com sarcasmo imprevisível.',
    };
  }
  if (npc.alignment === 'Lawful Evil' || npc.alignment === 'Neutral Evil') {
    return {
      bondMod: highStatus ? 2 : -1,
      refusesFavors: false,
      note: highStatus
        ? `💎 ${npc.alignment}: impressionado com seu alto Status (${playerStatus})!`
        : `😒 ${npc.alignment}: só respeita quem tem carros e itens de alto Status.`,
    };
  }
  if (npc.alignment === 'Lawful Good') {
    return {
      bondMod: 1,
      refusesFavors: false,
      note: '⚖️ Lawful Good: trata você com gentileza e senso de justiça.',
    };
  }
  return {
    bondMod: highStatus ? 1 : 0,
    refusesFavors: false,
    note: highStatus
      ? `✨ ${npc.alignment} (${npc.stereotype}): admira seu Status (${playerStatus})!`
      : `🎭 ${npc.alignment} (${npc.stereotype}) · Paixão: ${npc.dere}`,
  };
}

export function npcForBiome(biome: number): NpcProfile {
  return STORY_NPCS[biome % STORY_NPCS.length];
}

export function bondTier(score: number): BondTier {
  if (score <= -1) return 'rival';
  if (score >= 5) return 'namoro';
  if (score >= 3) return 'amigo';
  return 'estranho';
}

export function bondLabel(score: number): string {
  const tier = bondTier(score);
  if (tier === 'namoro') return '💖 Namoro';
  if (tier === 'amigo') return '🤝 Amizade';
  if (tier === 'rival') return '🔥 Rivalidade';
  return '💬 Conhecido';
}

/**
 * How your relationship with an NPC affects their duel difficulty:
 * - Romance/Friendship: gentle friendly spar (-1 enemyPower, easier!)
 * - Neutral: normal difficulty (0)
 * - Rivalry: intense all-out challenge (+1 enemyPower, harder!)
 */
export function bondDifficultyDelta(score: number): number {
  const tier = bondTier(score);
  if (tier === 'namoro' || tier === 'amigo') return -1;
  if (tier === 'rival') return 1;
  return 0;
}
