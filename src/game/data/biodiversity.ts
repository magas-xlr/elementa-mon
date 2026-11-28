import type { EcoState } from '../rules/ecology';
import type { PetInstance } from '../rules/progression';

export interface GeneTrait {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

/** 12 genetic biodiversity traits — even two pets of the same species carry unique genes! */
export const GENE_TRAITS: readonly GeneTrait[] = [
  {
    id: 'polinizador',
    name: 'Polinizador',
    icon: '🌼',
    desc: 'Espalha pólen e ajuda flores a brotarem.',
  },
  {
    id: 'bioluminescente',
    name: 'Bioluminescente',
    icon: '✨',
    desc: 'Brilha suavemente em cavernas e à noite.',
  },
  {
    id: 'raiz_profunda',
    name: 'Raiz Profunda',
    icon: '🌱',
    desc: 'Resistente a secas e ventanias fortes.',
  },
  {
    id: 'casco_calcario',
    name: 'Casco Calcário',
    icon: '🐚',
    desc: 'Carapaça rica em minerais de recife.',
  },
  {
    id: 'migratorio',
    name: 'Plumagem Migratória',
    icon: '🪶',
    desc: 'Adapta-se a múltiplos climas e altitudes.',
  },
  {
    id: 'simbiose',
    name: 'Simbiose Fúngica',
    icon: '🍄',
    desc: 'Troca nutrientes com o solo da floresta.',
  },
  {
    id: 'termico',
    name: 'Pele Térmica',
    icon: '🌡️',
    desc: 'Regula temperatura em extremos de calor e frio.',
  },
  {
    id: 'ecolocalizacao',
    name: 'Ecolocalização',
    icon: '🔊',
    desc: 'Enxerga caminhos ocultos pelo som.',
  },
  {
    id: 'nectar',
    name: 'Néctar Dourado',
    icon: '🍯',
    desc: 'Atrai borboletas e acalma pets selvagens.',
  },
  {
    id: 'semente_alada',
    name: 'Semente Alada',
    icon: '🍃',
    desc: 'Plana com o vento levando sementes novas.',
  },
  {
    id: 'escama_cristal',
    name: 'Escama Cristalina',
    icon: '💎',
    desc: 'Reflete luz solar em prismas coloridos.',
  },
  {
    id: 'canto_aurora',
    name: 'Canto da Aurora',
    icon: '🎵',
    desc: 'Seu canto alegra todo o ecossistema ao amanhecer.',
  },
];

export interface EcosystemInfo {
  biomeIndex: number;
  habitat: string;
  flora: string;
  keystone: string;
  niche: string;
}

export const ECOSYSTEMS: readonly EcosystemInfo[] = [
  {
    biomeIndex: 0,
    habitat: 'Pradaria Temperada & Riachos',
    flora: 'Carvalhos, bétulas, dentes-de-leão e lírios azuis',
    keystone: 'Pipo & Caputino (polinizadores do prado)',
    niche: 'Berçário fértil que sustenta a Vila da Brisa',
  },
  {
    biomeIndex: 1,
    habitat: 'Dunas Áridas & Oásis Antigos',
    flora: 'Cactos solares, palmeiras de oásis e âmbar fóssil',
    keystone: 'Duninha & Rabisco (engenheiros da areia)',
    niche: 'Conserva água rara sob pedras milenares',
  },
  {
    biomeIndex: 2,
    habitat: 'Planalto Elástico & Vales Ventosos',
    flora: 'Cogumelos-mola, capins flexíveis e bambus curvos',
    keystone: 'Pulinho & Vagalume (dispersores aéreos)',
    niche: 'Energia cinética natural das brisas de altitude',
  },
  {
    biomeIndex: 3,
    habitat: 'Floresta Úmida & Sub-bosque Micelial',
    flora: 'Samambaias gigantes, musgos e fungos luminosos',
    keystone: 'Esporinho & Brotinho (rede simbiótica do solo)',
    niche: 'Reciclagem biológica e purificação da água',
  },
  {
    biomeIndex: 4,
    habitat: 'Ecossistema Urbano-Híbrido & Canais',
    flora: 'Jardins verticais, algas bioluminescentes e liquens',
    keystone: 'Coralinho & Gosminha (biofiltros urbanos)',
    niche: 'Equilíbrio delicado entre tecnologia e natureza',
  },
  {
    biomeIndex: 5,
    habitat: 'Zona de Sucata & Recuperação Mineral',
    flora: 'Trepadeiras metálicas, ervas resistentes e líquen',
    keystone: 'Casquinho & Felpudo (recuperadores de solo)',
    niche: 'Reconversão de áreas degradadas em novos habitats',
  },
  {
    biomeIndex: 6,
    habitat: 'Tundra Alpina & Picos Celestes',
    flora: 'Pinheiros nevados, edelvais e cristais de gelo',
    keystone: 'Floquinho & Penugem (guardiões das nuvens)',
    niche: 'Nascentes geladas que alimentam todos os biomas abaixo',
  },
];

export type EndingTier = 'verdadeiro' | 'bom' | 'cinzento' | 'colapso';

export interface EcologicalEnding {
  tier: EndingTier;
  icon: string;
  title: string;
  subtitle: string;
  epilogue: string;
  bonusXp: number;
}

/**
 * Computes global Ecological Integrity (0..100%):
 * - Average health across all 7 ecosystems
 * - Penalty for any collapsed biome where NPCs perished (-12% each)
 * - Small conservation bonus (up to +8%) for rich genetic & species biodiversity!
 */
export function computeEcologicalIntegrity(eco: EcoState, allPets: readonly PetInstance[]): number {
  const avgHealth =
    eco.biomeHealth.reduce((s, h) => s + h, 0) / Math.max(1, eco.biomeHealth.length);
  const collapsePenalty = eco.deadNpcBiomes.length * 12;
  const uniqueSpecies = new Set(allPets.map((p) => p.speciesId)).size;
  const uniqueTraits = new Set(allPets.map((p) => p.geneTrait).filter(Boolean)).size;
  const bioBonus = Math.min(8, uniqueSpecies + Math.floor(uniqueTraits / 2));
  return Math.max(0, Math.min(100, Math.round(avgHealth - collapsePenalty + bioBonus)));
}

/** Evaluates which of the 4 game endings the player earns based on Ecological Integrity! */
export function evaluateEcologicalEnding(integrity: number): EcologicalEnding {
  if (integrity >= 85) {
    return {
      tier: 'verdadeiro',
      icon: '🌟',
      title: 'Final Verdadeiro: Harmonia Ecológica',
      subtitle: 'Guardião da Biodiversidade!',
      epilogue:
        'Você manteve os 7 ecossistemas íntegros do início ao fim! Florestas florescem, espécies raras prosperam em paz e todas as vilas celebram juntas sob um céu cristalino.',
      bonusXp: 15,
    };
  }
  if (integrity >= 60) {
    return {
      tier: 'bom',
      icon: '🌿',
      title: 'Final Bom: Equilíbrio Frágil',
      subtitle: 'Pacto de Recuperação',
      epilogue:
        'A Fortaleza Celeste foi conquistada e a natureza sobreviveu. Algumas marcas da exploração ficaram nos biomas, mas humanos e pets trabalham juntos para reflorestar o mundo.',
      bonusXp: 8,
    };
  }
  if (integrity >= 30) {
    return {
      tier: 'cinzento',
      icon: '🌫️',
      title: 'Final Cinzento: Progresso a Qualquer Custo',
      subtitle: 'Vitória sob a Neblina',
      epilogue:
        'Você venceu o chefe final, mas a produção desenfreada e ataques destrutivos deixaram céus acinzentados, rios turvos e poucas espécies selvagens no horizonte.',
      bonusXp: 3,
    };
  }
  return {
    tier: 'colapso',
    icon: '💀',
    title: 'Final Sombrio: Colapso Ecológico',
    subtitle: 'Reino das Cinzas',
    epilogue:
      'Uma vitória vazia sobre um mundo silencioso. A integridade ecológica desmoronou: florestas secaram, vilas esvaziaram e a biodiversidade quase desapareceu para sempre...',
    bonusXp: 0,
  };
}

export const getGeneTrait = (id?: string): GeneTrait =>
  GENE_TRAITS.find((t) => t.id === id) ?? GENE_TRAITS[0];

export const ecosystemForBiome = (biomeIndex: number): EcosystemInfo =>
  ECOSYSTEMS[Math.max(0, Math.min(ECOSYSTEMS.length - 1, biomeIndex))];
