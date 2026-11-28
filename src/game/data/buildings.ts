/**
 * Physical 3D Buildings across the overworld villages:
 * Every establishment from the game is a real physical building on the map with:
 * - Its own unique 3D exterior architecture & floating sign
 * - Its own walkable 3D interior room with custom props/furniture
 * - Its own exclusive NPC standing inside alongside their own active 3D pet & full battle party!
 */

export type BuildingKind =
  | 'banco'
  | 'prefeitura'
  | 'moradia'
  | 'minhaloja'
  | 'laboratorio'
  | 'comida'
  | 'roupinhas'
  | 'hospital'
  | 'livros'
  | 'apostas'
  | 'garagem'
  | 'dojo'
  | 'cemiterio'
  | 'reparo';

export interface BuildingNpcDef {
  id: string;
  name: string;
  role: string;
  outfitColor: number;
  hatColor: number;
  /** The NPC's active 3D pet standing beside them inside the building! */
  activePetSpecies: string;
  /** Full battle party when the player challenges this building's NPC! */
  partySpecies: string[];
  greeting: string;
}

export interface BuildingDef {
  kind: BuildingKind;
  name: string;
  shortSign: string;
  icon: string;
  /** Unique 3D exterior palette */
  wallColor: number;
  roofColor: number;
  accentColor: number;
  /** Interior room colors */
  floorColor: number;
  interiorWallColor: number;
  npc: BuildingNpcDef;
}

export const BUILDINGS: Record<BuildingKind, BuildingDef> = {
  banco: {
    kind: 'banco',
    name: 'Banco Central do Bairro',
    shortSign: '🏦 Banco',
    icon: '🏦',
    wallColor: 0xe6dec8,
    roofColor: 0x3b5878,
    accentColor: 0xf4c94e,
    floorColor: 0xd9d2c0,
    interiorWallColor: 0xefe9da,
    npc: {
      id: 'npc_banco',
      name: 'Sr. Aurélio',
      role: 'Gerente do Banco',
      outfitColor: 0x263954,
      hatColor: 0xf4c94e,
      activePetSpecies: 'casquinho',
      partySpecies: ['casquinho', 'vagalume'],
      greeting: 'Bem-vindo ao cofre! Juros, bolsa de valores e câmbio regional à sua disposição.',
    },
  },
  prefeitura: {
    kind: 'prefeitura',
    name: 'Prefeitura Municipal',
    shortSign: '🏛️ Prefeitura',
    icon: '🏛️',
    wallColor: 0xdedad2,
    roofColor: 0x7c3b3b,
    accentColor: 0xe8b948,
    floorColor: 0xcfc9bc,
    interiorWallColor: 0xeae5db,
    npc: {
      id: 'npc_prefeitura',
      name: 'Prefeita Helena',
      role: 'Chefe da Prefeitura',
      outfitColor: 0x6b2f4a,
      hatColor: 0x2f2838,
      activePetSpecies: 'bicudo',
      partySpecies: ['bicudo', 'penugem'],
      greeting: 'Alvarás, IPTU, contas de água/luz e programas ambientais são tratados aqui.',
    },
  },
  moradia: {
    kind: 'moradia',
    name: 'Minha Casa & Horta',
    shortSign: '🏡 Minha Casa',
    icon: '🏡',
    wallColor: 0xc99250,
    roofColor: 0xd87b3c,
    accentColor: 0x7bc268,
    floorColor: 0xb88652,
    interiorWallColor: 0xead5b4,
    npc: {
      id: 'npc_moradia',
      name: 'Pedreiro Zeca',
      role: 'Zelador & Pedreiro',
      outfitColor: 0xd9843b,
      hatColor: 0xf4c94e,
      activePetSpecies: 'pulinho',
      partySpecies: ['pulinho', 'duna'],
      greeting:
        'Aqui você cuida da sua casa, da horta de sementes, dos eletrodomésticos e das lixeiras!',
    },
  },
  minhaloja: {
    kind: 'minhaloja',
    name: 'Minha Lojinha',
    shortSign: '🏪 Lojinha',
    icon: '🏪',
    wallColor: 0xd4a46a,
    roofColor: 0xc95448,
    accentColor: 0xffe066,
    floorColor: 0xc49560,
    interiorWallColor: 0xf2dfc0,
    npc: {
      id: 'npc_minhaloja',
      name: 'Atendente Lia',
      role: 'Caixa da sua Loja',
      outfitColor: 0xc95448,
      hatColor: 0xffe066,
      activePetSpecies: 'pipo',
      partySpecies: ['pipo', 'felpudo'],
      greeting: 'Pronta para vender, doar, trocar ou leiloar seus itens para os moradores!',
    },
  },
  laboratorio: {
    kind: 'laboratorio',
    name: 'Laboratório de Transmodificação',
    shortSign: '🧬 Laboratório',
    icon: '🧬',
    wallColor: 0xd8e4ee,
    roofColor: 0x3b86b8,
    accentColor: 0x52f2d6,
    floorColor: 0xbecad6,
    interiorWallColor: 0xe4eff7,
    npc: {
      id: 'npc_lab',
      name: 'Dr. Cobalto',
      role: 'Cientista Geneticista',
      outfitColor: 0xeef6fc,
      hatColor: 0x3b86b8,
      activePetSpecies: 'gosminha',
      partySpecies: ['gosminha', 'esporo'],
      greeting:
        'Genes elementais, incubadoras, troca equivalente e reconstrução de fósseis de dinossauros!',
    },
  },
  comida: {
    kind: 'comida',
    name: 'Empório de Comida & Sementes',
    shortSign: '🍎 Empório',
    icon: '🍎',
    wallColor: 0xcf9b5e,
    roofColor: 0x4b9452,
    accentColor: 0xf26444,
    floorColor: 0xb8844c,
    interiorWallColor: 0xf0dfc2,
    npc: {
      id: 'npc_comida',
      name: 'Padeiro Bento',
      role: 'Mercador de Alimentos & Sementes',
      outfitColor: 0x4b9452,
      hatColor: 0xfff4dc,
      activePetSpecies: 'felpudo',
      partySpecies: ['felpudo', 'pipo'],
      greeting: 'Frutas frescas, sementes para sua horta própria... e umas besteiras tentadoras!',
    },
  },
  roupinhas: {
    kind: 'roupinhas',
    name: 'Boutique & Salão de Beleza',
    shortSign: '👗 Boutique',
    icon: '👗',
    wallColor: 0xe6c8d8,
    roofColor: 0xb8588e,
    accentColor: 0xffd166,
    floorColor: 0xd9b8c8,
    interiorWallColor: 0xf5e2ec,
    npc: {
      id: 'npc_boutique',
      name: 'Estilista Nina',
      role: 'Modista & Cabeleireira',
      outfitColor: 0xb8588e,
      hatColor: 0xffd166,
      activePetSpecies: 'orelhito',
      partySpecies: ['orelhito', 'vagalume'],
      greeting: 'Roupas elegantes, perfumes e mantos de grife para elevar a Beleza e o Status!',
    },
  },
  hospital: {
    kind: 'hospital',
    name: 'Hospital dos Pets',
    shortSign: '🏥 Hospital',
    icon: '🏥',
    wallColor: 0xf0f4f8,
    roofColor: 0xd64550,
    accentColor: 0x52c882,
    floorColor: 0xdbe6ec,
    interiorWallColor: 0xf4f9fc,
    npc: {
      id: 'npc_hospital',
      name: 'Enfermeira Clara',
      role: 'Veterinária Chefe',
      outfitColor: 0xf5f9fc,
      hatColor: 0xd64550,
      activePetSpecies: 'coralinho',
      partySpecies: ['coralinho', 'pipo'],
      greeting: 'Traga seus pets feridos ou doentes — cuidamos deles imediatamente!',
    },
  },
  livros: {
    kind: 'livros',
    name: 'Livraria Elemental',
    shortSign: '📚 Livraria',
    icon: '📚',
    wallColor: 0xb8865c,
    roofColor: 0x5a4878,
    accentColor: 0x8ec8ff,
    floorColor: 0x8f6440,
    interiorWallColor: 0xdcc5a4,
    npc: {
      id: 'npc_livros',
      name: 'Bibliotecário Otto',
      role: 'Erudito dos Tomos',
      outfitColor: 0x5a4878,
      hatColor: 0x3a2e52,
      activePetSpecies: 'penugem',
      partySpecies: ['penugem', 'rabisco'],
      greeting:
        'Silêncio na biblioteca! Aqui seus pets aprendem novas cartas e técnicas elementais.',
    },
  },
  apostas: {
    kind: 'apostas',
    name: 'Casa de Apostas & Arcade',
    shortSign: '🎰 Apostas',
    icon: '🎰',
    wallColor: 0x453458,
    roofColor: 0xd43b68,
    accentColor: 0xffd148,
    floorColor: 0x352846,
    interiorWallColor: 0x563e6e,
    npc: {
      id: 'npc_apostas',
      name: 'Croupier Jack',
      role: 'Dono da Casa de Jogos',
      outfitColor: 0x221b2c,
      hatColor: 0xd43b68,
      activePetSpecies: 'rabisco',
      partySpecies: ['rabisco', 'esporo'],
      greeting:
        'Aposte nas batalhas da arena ou teste a sorte nos fliperamas — mas cuidado com o vício!',
    },
  },
  garagem: {
    kind: 'garagem',
    name: 'Concessionária & Garagem',
    shortSign: '🚗 Garagem',
    icon: '🚗',
    wallColor: 0x7b8896,
    roofColor: 0xd96236,
    accentColor: 0xffc845,
    floorColor: 0x616b76,
    interiorWallColor: 0x96a2ae,
    npc: {
      id: 'npc_garagem',
      name: 'Mecânico Enzo',
      role: 'Vendedor de Carros',
      outfitColor: 0x34527a,
      hatColor: 0xd96236,
      activePetSpecies: 'duna',
      partySpecies: ['duna', 'floco'],
      greeting:
        'Carros de luxo dão Status e liberam o Fast Travel entre bairros — mas poluem bastante!',
    },
  },
  dojo: {
    kind: 'dojo',
    name: 'Dojo de Artes Marciais',
    shortSign: '🥋 Dojo',
    icon: '🥋',
    wallColor: 0xe6dac4,
    roofColor: 0xa63232,
    accentColor: 0x2c2530,
    floorColor: 0xcfb97a,
    interiorWallColor: 0xefe5d2,
    npc: {
      id: 'npc_dojo',
      name: 'Mestre Ryu',
      role: 'Grão-Mestre de Karate & Muay Thai',
      outfitColor: 0xf4f0e6,
      hatColor: 0xa63232,
      activePetSpecies: 'musgoso',
      partySpecies: ['musgoso', 'pulinho', 'casquinho'],
      greeting:
        'Disciplina! Deixe seu pet treinando Karate, Muay Thai ou Judô para aumentar HP, Força, Agilidade e Defesa!',
    },
  },
  cemiterio: {
    kind: 'cemiterio',
    name: 'Cemitério & Cabana da Bruxa',
    shortSign: '🪦 Cemitério',
    icon: '🪦',
    wallColor: 0x524c62,
    roofColor: 0x2d243a,
    accentColor: 0xb86bff,
    floorColor: 0x424a44,
    interiorWallColor: 0x483f58,
    npc: {
      id: 'npc_bruxa',
      name: 'Bruxa Morgana',
      role: 'Necromante do Cemitério',
      outfitColor: 0x3b2254,
      hatColor: 0x1e152b,
      activePetSpecies: 'floco',
      partySpecies: ['floco', 'gosminha'],
      greeting:
        'Trouxe um dinossauro esqueleto? Posso devolver a carne e a vida a ele... mas o preço pode ser uma maldição! 🔮',
    },
  },
  reparo: {
    kind: 'reparo',
    name: 'Casa de Reparo & Reuso',
    shortSign: '🔧 Reparo',
    icon: '🔧',
    wallColor: 0xb8865c,
    roofColor: 0x5c6e7e,
    accentColor: 0xf4a438,
    floorColor: 0x8f745c,
    interiorWallColor: 0xd9c6b0,
    npc: {
      id: 'npc_reparo',
      name: 'Mestre Jonas',
      role: 'Artesão de Reparos & Reuso',
      outfitColor: 0x5c6e7e,
      hatColor: 0xf4a438,
      activePetSpecies: 'casquinho',
      partySpecies: ['casquinho', 'musgoso'],
      greeting:
        'Não jogue fora! Traga o bagaço dos itens consumidos para eu consertar e você reutilizar sem poluir!',
    },
  },
};

export const ALL_BUILDING_KINDS: readonly BuildingKind[] = Object.keys(BUILDINGS) as BuildingKind[];
