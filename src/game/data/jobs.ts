export type JobItemSource = 'loja' | 'mapa' | 'trabalho' | 'batalha';

export interface JobItemDef {
  id: string;
  name: string;
  icon: string;
  source: JobItemSource;
  hint: string;
}

export interface JobDef {
  id: string;
  npcName: string;
  title: string;
  description: string;
  needItemId: string;
  needCount: number;
  rewardCoins: number;
  rewardXp: number;
  /** Optional special quest item rewarded for chained jobs! */
  rewardItemId?: string;
}

export const JOB_ITEMS: readonly JobItemDef[] = [
  {
    id: 'mel_dourado',
    name: 'Mel Dourado',
    icon: '🍯',
    source: 'loja',
    hint: 'Vendido na Loja de Comida em Vila da Brisa.',
  },
  {
    id: 'flor_lunar',
    name: 'Flor Lunar',
    icon: '🪷',
    source: 'mapa',
    hint: 'Encontrada avulsa explorando o mapa e baús.',
  },
  {
    id: 'chave_moinho',
    name: 'Chave do Moinho',
    icon: '🗝️',
    source: 'trabalho',
    hint: 'Recompensa ao concluir o trabalho do Padeiro Bento.',
  },
  {
    id: 'pena_reluzente',
    name: 'Pena Reluzente',
    icon: '🪶',
    source: 'batalha',
    hint: 'Obtida ao vencer batalhas contra pets ou treinadores.',
  },
  {
    id: 'fio_seda',
    name: 'Fio de Seda Mágica',
    icon: '🧵',
    source: 'loja',
    hint: 'Vendido na Loja de Roupinhas em Vila da Brisa.',
  },
];

export const JOBS: readonly JobDef[] = [
  {
    id: 'job_bento',
    npcName: 'Padeiro Bento',
    title: 'Bolo de Mel da Vila',
    description:
      'Preciso de um pote de Mel Dourado da Loja de Comida para assar o bolo do festival!',
    needItemId: 'mel_dourado',
    needCount: 1,
    rewardCoins: 75,
    rewardXp: 4,
    rewardItemId: 'chave_moinho',
  },
  {
    id: 'job_mira',
    npcName: 'Botânica Mira',
    title: 'Pétalas da Flor Lunar',
    description:
      'Estou estudando a Flor Lunar que brota avulsa pelo mapa e em baús. Pode trazer uma?',
    needItemId: 'flor_lunar',
    needCount: 1,
    rewardCoins: 85,
    rewardXp: 5,
  },
  {
    id: 'job_taro',
    npcName: 'Ferreiro Taro',
    title: 'O Moinho Trancado',
    description:
      'O Padeiro Bento guardou a Chave do Moinho. Ajude-o no trabalho dele e traga a chave para mim!',
    needItemId: 'chave_moinho',
    needCount: 1,
    rewardCoins: 120,
    rewardXp: 7,
  },
  {
    id: 'job_luma',
    npcName: 'Estilista Luma',
    title: 'Chapéu de Plumas',
    description:
      'Vença batalhas contra pets para conseguir uma Pena Reluzente para minha nova coleção!',
    needItemId: 'pena_reluzente',
    needCount: 1,
    rewardCoins: 95,
    rewardXp: 6,
  },
  {
    id: 'job_nina',
    npcName: 'Costureira Nina',
    title: 'Costura Encantada',
    description:
      'Traga Fio de Seda Mágica da Loja de Roupinhas para eu remendar as capas dos exploradores.',
    needItemId: 'fio_seda',
    needCount: 1,
    rewardCoins: 90,
    rewardXp: 5,
  },
];

export const getJobItem = (id: string): JobItemDef | undefined =>
  JOB_ITEMS.find((i) => i.id === id);

export const getJob = (id: string): JobDef | undefined => JOBS.find((j) => j.id === id);
