export interface BiomeEconomyProfile {
  biomeIndex: number;
  bankName: string;
  currencyCode: string;
  currencyName: string;
  currencyIcon: string;
  /** Base value relative to Florim (1.0 = parity). Fluctuates dynamically! */
  baseRate: number;
  /** Daily compound interest rate on bank deposits (e.g. 0.04 = 4%/day). */
  interestRate: number;
  /** Sales tax charged by this biome's bank on Player Shop sales (e.g. 0.10 = 10%). */
  salesTax: number;
  /** Brokerage fee on stock trades and currency exchange (e.g. 0.03 = 3%). */
  brokerageFee: number;
  /** Regional shop price multiplier (e.g. 0.85 = cheaper bargains, 1.35 = luxury). */
  priceMultiplier: number;
  /** Regional NPC personality/behavior & dialect/slang lines! */
  behavior: string;
  dialect: {
    greeting: string;
    buyQuote: string;
    haggleQuote: string;
    bankGreeting: string;
  };
}

export interface StockDef {
  id: string;
  ticker: string;
  name: string;
  biomeIndex: number;
  basePrice: number;
  volatility: number;
  sector: string;
}

export interface PlayerShopGood {
  id: string;
  name: string;
  icon: string;
  baseCost: number;
  suggestedPrice: number;
  desc: string;
}

export const BIOME_ECONOMIES: readonly BiomeEconomyProfile[] = [
  {
    biomeIndex: 0,
    bankName: 'Banco Rural da Brisa',
    currencyCode: 'FL',
    currencyName: 'Florim',
    currencyIcon: '🪙',
    baseRate: 1.0,
    interestRate: 0.04,
    salesTax: 0.1,
    brokerageFee: 0.03,
    priceMultiplier: 1.0,
    behavior: 'Acolhedor e honesto — clientes pagam bem por comidas e itens da roça.',
    dialect: {
      greeting: 'Opa, sô! Chega mais, tem cafezin quente e negócio bom no prado!',
      buyQuote: 'Uai, esse trem tá bonitão demais! Fechado, sô!',
      haggleQuote: 'Ô meu consagrado, dá uma aliviada nesse precin aí!',
      bankGreeting: 'Bem-vindo ao Banco da Brisa! Aqui teu Florim rende mansinho igual lavoura.',
    },
  },
  {
    biomeIndex: 1,
    bankName: 'Casa Dourada de Solis',
    currencyCode: 'DS',
    currencyName: 'Dinar Solar',
    currencyIcon: '☀️',
    baseRate: 1.18,
    interestRate: 0.05,
    salesTax: 0.12,
    brokerageFee: 0.04,
    priceMultiplier: 1.15,
    behavior: 'Mercadores sábios que valorizam relíquias e pechincham com elegância.',
    dialect: {
      greeting: 'Que o Sol eterno ilumine tua bolsa, nobre viajante das areias!',
      buyQuote: 'Pelas dunas douradas, eis uma mercadoria digna dos antigos!',
      haggleQuote: 'O deserto ensina paciência... aceitas um pouco menos em Dinares?',
      bankGreeting: 'Os cofres de Solis guardam ouro há séculos. Confia-nos teu tesouro.',
    },
  },
  {
    biomeIndex: 2,
    bankName: 'Caixa Saltitante Boing',
    currencyCode: 'BG',
    currencyName: 'Boing',
    currencyIcon: '🌀',
    baseRate: 0.92,
    interestRate: 0.06,
    salesTax: 0.11,
    brokerageFee: 0.05,
    priceMultiplier: 0.95,
    behavior: 'Impulsivos e animados — preços e ações sobem e descem num piscar de olhos!',
    dialect: {
      greeting: 'E aí, mola-mestra! Bora quicar uns Boings e fazer o lucro pular alto?!',
      buyQuote: 'BOING!! Curti demais, tô levando agora mesmo, valeu!!',
      haggleQuote: 'Opa, deu uma quicada alta demais nesse preço, segura a mola aí!',
      bankGreeting: 'Salta pra dentro! Aqui o câmbio quica e os juros dão cambalhota!',
    },
  },
  {
    biomeIndex: 3,
    bankName: 'Cofre Oculto do Labirinto',
    currencyCode: 'DR',
    currencyName: 'Dracma',
    currencyIcon: '🍃',
    baseRate: 1.08,
    interestRate: 0.05,
    salesTax: 0.13,
    brokerageFee: 0.04,
    priceMultiplier: 1.1,
    behavior: 'Calculistas e misteriosos — adoram raridades e testam sua lábia.',
    dialect: {
      greeting: 'Quem encontra este balcão no labirinto... já provou que sabe negociar.',
      buyQuote: 'Curiosa escolha. Os caminhos do comércio nos sorriram hoje.',
      haggleQuote: 'Hmm... há um atalho para um valor mais justo, não achas?',
      bankGreeting: 'Cada Dracma aqui é registrado em pedra e musgo. Silêncio e rendimento.',
    },
  },
  {
    biomeIndex: 4,
    bankName: 'NeonBank Exchange 2099',
    currencyCode: 'NB',
    currencyName: 'NeonBit',
    currencyIcon: '💠',
    baseRate: 1.32,
    interestRate: 0.07,
    salesTax: 0.14,
    brokerageFee: 0.02,
    priceMultiplier: 1.25,
    behavior: 'Rápidos e antenados — corretagem baixíssima e mercado de ações super aquecido!',
    dialect: {
      greeting: 'Salve, runner! Mercado tá hype demais hoje, zero lag no câmbio, mano!',
      buyQuote: 'Brabo demais!! Manda pro meu inventário no pix de NeonBit, fechou!',
      haggleQuote: 'Cê tá nerfando minha carteira com esse preço, parça! Faz um desconto aí!',
      bankGreeting: 'NeonBank online. Taxa de corretagem mínima, liquidez máxima 24/7.',
    },
  },
  {
    biomeIndex: 5,
    bankName: 'Cooperativa da Sucata',
    currencyCode: 'PC',
    currencyName: 'Porca',
    currencyIcon: '⚙️',
    baseRate: 0.78,
    interestRate: 0.03,
    salesTax: 0.15,
    brokerageFee: 0.06,
    priceMultiplier: 0.85,
    behavior: 'Diretos e econômicos — pechinchas baratas, mas imposto salgado na lojinha.',
    dialect: {
      greeting: 'Fala, ferrugem! Sem enrolação: mostra o que tem na lata que eu pago em Porca!',
      buyQuote: 'Peça bruta e bem feita! Toma tuas Porcas e boa viagem, chefia!',
      haggleQuote: 'Tá achando que eu fabrico metal, é? Abaixa essa engrenagem aí!',
      bankGreeting: 'Cofre de aço maciço. Não é bonito, mas ninguém arromba nem com marreta.',
    },
  },
  {
    biomeIndex: 6,
    bankName: 'Banco Imperial Celeste',
    currencyCode: 'CC',
    currencyName: 'Coroa Celeste',
    currencyIcon: '👑',
    baseRate: 1.55,
    interestRate: 0.08,
    salesTax: 0.18,
    brokerageFee: 0.03,
    priceMultiplier: 1.35,
    behavior: 'Exigentes e aristocráticos — pagam fortunas por luxo, mas cobram 18% de imposto!',
    dialect: {
      greeting: 'Vossa Mercê honra nossas galerias celestes. Deseja tratar de negócios?',
      buyQuote: 'Esplêndido! Uma aquisição verdadeiramente digna da alta corte.',
      haggleQuote: 'Ora, sejamos razoáveis; até a realeza aprecia a moderação nos valores.',
      bankGreeting: 'O Banco Imperial garante os maiores juros do reino sob o selo da Coroa.',
    },
  },
];

export const STOCKS: readonly StockDef[] = [
  {
    id: 'stk_brisa',
    ticker: 'BRSA',
    name: 'Moinhos da Brisa',
    biomeIndex: 0,
    basePrice: 28,
    volatility: 0.07,
    sector: 'Alimentos',
  },
  {
    id: 'stk_solis',
    ticker: 'SOLS',
    name: 'Relíquias de Solis',
    biomeIndex: 1,
    basePrice: 44,
    volatility: 0.1,
    sector: 'Arqueologia',
  },
  {
    id: 'stk_boing',
    ticker: 'BONG',
    name: 'Molas Turbo S.A.',
    biomeIndex: 2,
    basePrice: 22,
    volatility: 0.18,
    sector: 'Energia',
  },
  {
    id: 'stk_drac',
    ticker: 'LABR',
    name: 'Botânica do Labirinto',
    biomeIndex: 3,
    basePrice: 36,
    volatility: 0.09,
    sector: 'Poções',
  },
  {
    id: 'stk_neon',
    ticker: 'NEON',
    name: 'NeonGrid Tech',
    biomeIndex: 4,
    basePrice: 62,
    volatility: 0.15,
    sector: 'Tecnologia',
  },
  {
    id: 'stk_suc',
    ticker: 'FERO',
    name: 'Forja Ferro-Velho',
    biomeIndex: 5,
    basePrice: 19,
    volatility: 0.12,
    sector: 'Metalurgia',
  },
  {
    id: 'stk_coroa',
    ticker: 'CORO',
    name: 'Estaleiro Celeste',
    biomeIndex: 6,
    basePrice: 85,
    volatility: 0.08,
    sector: 'Luxo',
  },
];

/** Merchandise the player can stock and resell in their own shop ("Minha Lojinha"). */
export const PLAYER_SHOP_GOODS: readonly PlayerShopGood[] = [
  {
    id: 'good_cha',
    name: 'Chá de Ervas do Prado',
    icon: '🍵',
    baseCost: 14,
    suggestedPrice: 26,
    desc: 'Bebida aromática muito procurada por viajantes.',
  },
  {
    id: 'good_biscoito',
    name: 'Biscoito Elemental',
    icon: '🍪',
    baseCost: 22,
    suggestedPrice: 40,
    desc: 'Petisco artesanal que faz sucesso com pets e treinadores.',
  },
  {
    id: 'good_amuleto',
    name: 'Pingente Brilhante',
    icon: '📿',
    baseCost: 38,
    suggestedPrice: 68,
    desc: 'Acessório estiloso com boa margem de lucro.',
  },
  {
    id: 'good_elixir',
    name: 'Elixir Arco-Íris',
    icon: '🧪',
    baseCost: 55,
    suggestedPrice: 98,
    desc: 'Poção premium disputada em todos os biomas.',
  },
];

export const biomeEconomy = (biomeIndex: number): BiomeEconomyProfile =>
  BIOME_ECONOMIES[Math.max(0, Math.min(BIOME_ECONOMIES.length - 1, biomeIndex))];

export const getStock = (id: string): StockDef | undefined => STOCKS.find((s) => s.id === id);
export const getShopGood = (id: string): PlayerShopGood | undefined =>
  PLAYER_SHOP_GOODS.find((g) => g.id === id);
