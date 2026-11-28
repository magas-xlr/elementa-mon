/**
 * Town Shops in Vila da Brisa (Biome 1):
 * - Food Shop (feed pets daily so they don't starve!)
 * - Outfit Boutique (dress up pets to raise Beauty!)
 * - Beauty Salon (grooming & cosmetics for Beauty + Happiness!)
 * - Pet Hospital (full party heal)
 * - Elemental Bookshop (books that teach new attack/defense/heal skill cards!)
 */

import type { Element } from './elements';

export type ShopId = 'comida' | 'roupinhas' | 'beleza' | 'hospital' | 'livros';

export interface ShopItem {
  id: string;
  shop: ShopId;
  name: string;
  icon: string;
  price: number;
  desc: string;
  hunger?: number;
  happiness?: number;
  beauty?: number;
  /** Cosmetic outfit badge equipped on the pet. */
  outfitIcon?: string;
  /** Card taught directly to the player's deck by a Bookshop book. */
  teachesCardId?: string;
  /** Special quest item granted for NPC Jobs ("Trabalhos"). */
  questItemId?: string;
  /** Elemental genes extracted from this item for the Transmodification Lab! */
  geneElement?: Element;
  geneAmount?: number;
  /** Environmental destruction score when shopkeepers mass-produce this item! */
  ecoDamage?: number;
  /** Junk food health penalty (reduces pet HP / can make pet sick!). */
  healthPenalty?: number;
  /** Toxic/forbidden substance: causes hallucinations, disobedience, and sudden death risk! */
  causesHallucination?: boolean;
  /** Luxury status points granted when buying expensive outfits/items (also increases envy & eco-damage). */
  luxuryStatus?: number;
}

export const SHOP_META: Record<ShopId, { name: string; icon: string; desc: string }> = {
  comida: {
    name: 'Empório de Comida',
    icon: '🍎',
    desc: 'Alimente seus pets todos os dias para evitar que morram de fome!',
  },
  roupinhas: {
    name: 'Boutique de Roupinhas',
    icon: '👗',
    desc: 'Vista seus pets! Pets mais bonitos impressionam os NPCs nas batalhas.',
  },
  beleza: {
    name: 'Salão de Beleza',
    icon: '✨',
    desc: 'Perfumes, escovas e banhos que aumentam Beleza e Felicidade.',
  },
  hospital: {
    name: 'Hospital dos Pets',
    icon: '🏥',
    desc: 'Recupere toda a vida dos pets feridos antes que seja tarde demais.',
  },
  livros: {
    name: 'Livraria Elemental',
    icon: '📚',
    desc: 'Livros que ensinam novas habilidades de ataque, defesa e cura!',
  },
};

export const SHOP_ITEMS: readonly ShopItem[] = [
  // --- Food Shop ---
  {
    id: 'fruta',
    shop: 'comida',
    name: 'Fruta do Prado',
    icon: '🍎',
    price: 15,
    desc: 'Restaura +35 de fome e +5 de felicidade.',
    hunger: 35,
    happiness: 5,
  },
  {
    id: 'sopa',
    shop: 'comida',
    name: 'Sopa Quentinha',
    icon: '🍲',
    price: 30,
    desc: 'Refeição completa: +70 de fome e +15 de felicidade.',
    hunger: 70,
    happiness: 15,
  },
  {
    id: 'banquete',
    shop: 'comida',
    name: 'Banquete Real',
    icon: '🍰',
    price: 50,
    desc: 'Enche 100% da fome e dá +25 de felicidade!',
    hunger: 100,
    happiness: 25,
  },
  {
    id: 'mel_dourado_loja',
    shop: 'comida',
    name: 'Mel Dourado',
    icon: '🍯',
    price: 25,
    desc: 'Item especial de trabalho pedido pelo Padeiro Bento!',
    questItemId: 'mel_dourado',
  },
  {
    id: 'pimenta_fogo',
    shop: 'comida',
    name: 'Pimenta Flamejante',
    icon: '🌶️',
    price: 20,
    desc: 'Comida picante: +30 fome e +2 Genes de Fogo p/ o Laboratório!',
    hunger: 30,
    happiness: 8,
    geneElement: 'fogo',
    geneAmount: 2,
  },
  {
    id: 'sopa_marinha',
    shop: 'comida',
    name: 'Caldo de Algas Azuis',
    icon: '🥣',
    price: 20,
    desc: 'Comida refrescante: +30 fome e +2 Genes de Água p/ o Laboratório!',
    hunger: 30,
    happiness: 8,
    geneElement: 'agua',
    geneAmount: 2,
  },
  {
    id: 'sorvete_geada',
    shop: 'comida',
    name: 'Sorvete de Geada',
    icon: '🍧',
    price: 22,
    desc: 'Doce gelado: +25 fome, +12 felicidade e +2 Genes de Gelo!',
    hunger: 25,
    happiness: 12,
    geneElement: 'gelo',
    geneAmount: 2,
  },
  // --- Junk Food & Dangerous Substances ---
  {
    id: 'pizza_gordurosa',
    shop: 'comida',
    name: 'Pizza Gordurosa',
    icon: '🍕',
    price: 12,
    desc: 'Besteira deliciosa (+45 fome, +26 😊 temporário por 2h), mas faz mal à saúde (−2 HP)!',
    hunger: 45,
    happiness: 26,
    healthPenalty: 2,
    ecoDamage: 4,
  },
  {
    id: 'doces_acucar',
    shop: 'comida',
    name: 'Doces & Bolo Ultraprocessado',
    icon: '🎂',
    price: 10,
    desc: 'Muito açúcar (+30 fome, +32 😊 temporário por 2h), piora a saúde do pet (−3 HP e pode adoecer)!',
    hunger: 30,
    happiness: 32,
    healthPenalty: 3,
    ecoDamage: 5,
  },
  {
    id: 'substancia_proibida',
    shop: 'comida',
    name: 'Cogumelo Alucinógeno',
    icon: '🍄',
    price: 18,
    desc: '⚠️ PERIGO: faz o pet alucinar, ignorar comandos e pode matá-lo do absoluto nada!',
    happiness: 10,
    healthPenalty: 2,
    causesHallucination: true,
    ecoDamage: 6,
  },

  // --- Outfit Boutique ---
  {
    id: 'laco',
    shop: 'roupinhas',
    name: 'Laço de Seda',
    icon: '🎀',
    price: 35,
    desc: 'Veste 🎀 no pet (+25 Beleza, +10 Felicidade).',
    beauty: 25,
    happiness: 10,
    outfitIcon: '🎀',
  },
  {
    id: 'cachecol',
    shop: 'roupinhas',
    name: 'Cachecol Aconchegante',
    icon: '🧣',
    price: 45,
    desc: 'Veste 🧣 no pet (+30 Beleza, +12 Felicidade).',
    beauty: 30,
    happiness: 12,
    outfitIcon: '🧣',
  },
  {
    id: 'cartola',
    shop: 'roupinhas',
    name: 'Cartola Elegante',
    icon: '🎩',
    price: 60,
    desc: 'Veste 🎩 no pet (+40 Beleza, +10 Felicidade).',
    beauty: 40,
    happiness: 10,
    outfitIcon: '🎩',
  },
  {
    id: 'fio_seda_loja',
    shop: 'roupinhas',
    name: 'Fio de Seda Mágica',
    icon: '🧵',
    price: 30,
    desc: 'Item especial de trabalho pedido pela Costureira Nina!',
    questItemId: 'fio_seda',
  },
  {
    id: 'capa_brasas',
    shop: 'roupinhas',
    name: 'Capa de Brasas',
    icon: '🧣',
    price: 38,
    desc: 'Veste 🧣 (+25 Beleza) e gera +2 Genes de Fogo p/ o Laboratório!',
    beauty: 25,
    happiness: 10,
    outfitIcon: '🧣',
    geneElement: 'fogo',
    geneAmount: 2,
  },
  {
    id: 'tiara_raio',
    shop: 'roupinhas',
    name: 'Tiara Relâmpago',
    icon: '⚡',
    price: 38,
    desc: 'Veste ⚡ (+25 Beleza) e gera +2 Genes Elétricos p/ o Laboratório!',
    beauty: 25,
    happiness: 10,
    outfitIcon: '⚡',
    geneElement: 'eletrico',
    geneAmount: 2,
  },
  {
    id: 'coroa',
    shop: 'roupinhas',
    name: 'Coroa Floral',
    icon: '👑',
    price: 85,
    desc: 'Veste 👑 no pet (+55 Beleza, +20 Felicidade, +15 Status de Luxo · −6🌿).',
    beauty: 55,
    happiness: 20,
    outfitIcon: '👑',
    luxuryStatus: 15,
    ecoDamage: 6,
  },
  {
    id: 'manto_grife',
    shop: 'roupinhas',
    name: 'Manto de Grife Imperial',
    icon: '🧥',
    price: 240,
    desc: 'Roupa caríssima de luxo (+75 Beleza, +40 Status · gera inveja e polui −14🌿)!',
    beauty: 75,
    happiness: 25,
    outfitIcon: '🧥',
    luxuryStatus: 40,
    ecoDamage: 14,
  },

  // --- Beauty Salon ---
  {
    id: 'escova',
    shop: 'beleza',
    name: 'Escovação Brilhante',
    icon: '🪮',
    price: 20,
    desc: 'Pelo macio e brilhante (+18 Beleza, +15 Felicidade).',
    beauty: 18,
    happiness: 15,
  },
  {
    id: 'perfume',
    shop: 'beleza',
    name: 'Perfume de Flores',
    icon: '🧴',
    price: 40,
    desc: 'Aroma encantador (+32 Beleza, +20 Felicidade).',
    beauty: 32,
    happiness: 20,
  },

  // --- Elemental Bookshop (teaches skill cards!) ---
  {
    id: 'livro_brasa',
    shop: 'livros',
    name: 'Tomo da Brasa',
    icon: '📕',
    price: 40,
    desc: 'Ensina a carta de ataque de Fogo: Brasa.',
    teachesCardId: 'brasa',
  },
  {
    id: 'livro_jato',
    shop: 'livros',
    name: 'Manual das Marés',
    icon: '📘',
    price: 40,
    desc: "Ensina a carta de ataque de Água: Jato d'Água.",
    teachesCardId: 'jato',
  },
  {
    id: 'livro_guarda',
    shop: 'livros',
    name: 'Tratado do Escudo',
    icon: '📙',
    price: 35,
    desc: 'Ensina a carta de defesa: Guarda.',
    teachesCardId: 'guarda',
  },
  {
    id: 'livro_cura',
    shop: 'livros',
    name: 'Herbário Curativo',
    icon: '📗',
    price: 35,
    desc: 'Ensina a carta de cura: Curativo.',
    teachesCardId: 'curativo',
  },
];

export const HOSPITAL_COST = 25;

export function itemsForShop(shop: ShopId): ShopItem[] {
  return SHOP_ITEMS.filter((i) => i.shop === shop);
}
