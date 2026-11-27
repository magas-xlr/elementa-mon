export interface RelicDef {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const RELICS: readonly RelicDef[] = [
  {
    id: 'amuleto',
    name: 'Amuleto de Garra',
    icon: '🦷',
    description: '+1 de ataque para todos os pets.',
  },
  {
    id: 'casco',
    name: 'Casco Antigo',
    icon: '🐢',
    description: '+1 de defesa para todos os pets.',
  },
  {
    id: 'cristal',
    name: 'Cristal Arcano',
    icon: '💎',
    description: 'Começa cada batalha com +1 de mana de cada tipo.',
  },
  { id: 'pena', name: 'Pena da Sorte', icon: '🪶', description: 'Mão inicial com 5 cartas.' },
  {
    id: 'trevo',
    name: 'Trevo Dourado',
    icon: '🍀',
    description: 'Pets curam 2 de vida ao vencer uma batalha.',
  },
];

const BY_ID = new Map(RELICS.map((r) => [r.id, r]));

export function getRelic(id: string): RelicDef {
  const r = BY_ID.get(id);
  if (!r) throw new Error(`Relíquia desconhecida: ${id}`);
  return r;
}
