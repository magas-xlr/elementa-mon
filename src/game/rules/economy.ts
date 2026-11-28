import { BIOME_ECONOMIES, STOCKS, biomeEconomy, getShopGood, getStock } from '../data/economy';
import { next, type RngState } from './rng';

export interface EconomyState {
  /** Wallet balance per biome currency (index 0..6). Index 0 mirrors run.coins (Florins). */
  wallets: number[];
  /** Savings deposited in each biome's bank (earns compound interest!). */
  deposits: number[];
  /** Current live exchange rate of each biome's currency relative to Florim (1.0). */
  rates: number[];
  /** Previous exchange rate (to show ▲/▼ appreciation/depreciation). */
  prevRates: number[];
  /** Current live stock price (in Florim-equivalent base units, converted to local currency at bank). */
  stockPrices: Record<string, number>;
  /** Previous stock price (for ▲/▼ trend). */
  prevStockPrices: Record<string, number>;
  /** Number of shares owned by the player per stock ID. */
  shares: Record<string, number>;
  /** Player's own shop stock: goodId → quantity on shelves. */
  myShopStock: Record<string, number>;
  /** Player's custom selling price per goodId (in Florim base, shown in local currency). */
  myShopPrices: Record<string, number>;
  /** Total sales tax paid to banks across all sales. */
  totalTaxPaid: number;
  /** Total net profit earned from the player's own shop. */
  totalShopSales: number;
  /** Accumulated hours toward next daily interest payout. */
  interestHourAccum: number;
}

export function createEconomyState(initialFlorins = 120): EconomyState {
  const wallets = BIOME_ECONOMIES.map((_, i) => (i === 0 ? initialFlorins : 0));
  const deposits = BIOME_ECONOMIES.map(() => 0);
  const rates = BIOME_ECONOMIES.map((b) => b.baseRate);
  const stockPrices: Record<string, number> = {};
  for (const s of STOCKS) stockPrices[s.id] = s.basePrice;
  return {
    wallets,
    deposits,
    rates: [...rates],
    prevRates: [...rates],
    stockPrices,
    prevStockPrices: { ...stockPrices },
    shares: {},
    myShopStock: { good_cha: 2, good_biscoito: 1 },
    myShopPrices: { good_cha: 26, good_biscoito: 40, good_amuleto: 68, good_elixir: 98 },
    totalTaxPaid: 0,
    totalShopSales: 0,
    interestHourAccum: 0,
  };
}

/** Converts a base Florim price into the local currency of `biomeIndex`, applying regional pricing. */
export function localPrice(eco: EconomyState, biomeIndex: number, baseFlorins: number): number {
  const prof = biomeEconomy(biomeIndex);
  const rate = Math.max(0.25, eco.rates[biomeIndex] ?? prof.baseRate);
  return Math.max(1, Math.round((baseFlorins * prof.priceMultiplier) / rate));
}

/**
 * Advances market prices, currency appreciation/depreciation, and accrues bank savings interest
 * every in-game hour (interest compounds every 6 game hours for satisfying gameplay pacing).
 */
export function tickEconomy(eco: EconomyState, rng: RngState, hoursPassed: number): string[] {
  const alerts: string[] = [];
  if (hoursPassed <= 0) return alerts;

  // 1. Fluctuate currency rates & stock prices
  eco.prevRates = [...eco.rates];
  for (let i = 1; i < BIOME_ECONOMIES.length; i++) {
    const base = BIOME_ECONOMIES[i].baseRate;
    const drift = (next(rng) - 0.5) * 0.1 * hoursPassed;
    const revert = (base - eco.rates[i]) * 0.08;
    eco.rates[i] = Number(
      Math.max(base * 0.6, Math.min(base * 1.65, eco.rates[i] + drift + revert)).toFixed(2)
    );
  }

  eco.prevStockPrices = { ...eco.stockPrices };
  for (const s of STOCKS) {
    const cur = eco.stockPrices[s.id] ?? s.basePrice;
    const pct = (next(rng) - 0.49) * s.volatility * Math.min(3, hoursPassed);
    const revert = ((s.basePrice - cur) / s.basePrice) * 0.06;
    const updated = Math.max(5, Math.round(cur * (1 + pct + revert)));
    eco.stockPrices[s.id] = updated;
  }

  // 2. Accrue compound interest on bank deposits every 6 in-game hours
  eco.interestHourAccum += hoursPassed;
  while (eco.interestHourAccum >= 6) {
    eco.interestHourAccum -= 6;
    for (let i = 0; i < BIOME_ECONOMIES.length; i++) {
      if (eco.deposits[i] <= 0) continue;
      const prof = BIOME_ECONOMIES[i];
      const earned = Math.max(1, Math.round(eco.deposits[i] * (prof.interestRate * 0.5)));
      eco.deposits[i] += earned;
      alerts.push(`🏦 ${prof.bankName}: +${earned} ${prof.currencyCode} de juros!`);
    }
  }
  return alerts;
}

/** Deposit local currency into that biome's bank to earn interest. */
export function depositAtBank(
  eco: EconomyState,
  biomeIndex: number,
  amount: number
): { ok: boolean; msg: string } {
  const amt = Math.floor(amount);
  const prof = biomeEconomy(biomeIndex);
  if (amt <= 0 || eco.wallets[biomeIndex] < amt) {
    return { ok: false, msg: `Saldo insuficiente em ${prof.currencyName}!` };
  }
  eco.wallets[biomeIndex] -= amt;
  eco.deposits[biomeIndex] += amt;
  return {
    ok: true,
    msg: `🏦 Depositado ${amt} ${prof.currencyCode} (rende ${Math.round(prof.interestRate * 100)}%/dia)!`,
  };
}

/** Withdraw local currency from that biome's bank. */
export function withdrawFromBank(
  eco: EconomyState,
  biomeIndex: number,
  amount: number
): { ok: boolean; msg: string } {
  const amt = Math.floor(amount);
  const prof = biomeEconomy(biomeIndex);
  if (amt <= 0 || eco.deposits[biomeIndex] < amt) {
    return { ok: false, msg: `Você não tem ${amt} ${prof.currencyCode} depositados neste banco.` };
  }
  eco.deposits[biomeIndex] -= amt;
  eco.wallets[biomeIndex] += amt;
  return { ok: true, msg: `🏦 Sacado ${amt} ${prof.currencyCode} da poupança!` };
}

/** Exchange currency from `fromBiome` to `toBiome` using live exchange rates minus brokerage fee. */
export function exchangeCurrency(
  eco: EconomyState,
  fromBiome: number,
  toBiome: number,
  amount: number
): { ok: boolean; msg: string; received: number; fee: number } {
  const amt = Math.floor(amount);
  const src = biomeEconomy(fromBiome);
  const dst = biomeEconomy(toBiome);
  if (fromBiome === toBiome) {
    return { ok: false, msg: 'Escolha outra moeda para o câmbio.', received: 0, fee: 0 };
  }
  if (amt <= 0 || eco.wallets[fromBiome] < amt) {
    return { ok: false, msg: `Saldo insuficiente em ${src.currencyName}.`, received: 0, fee: 0 };
  }
  const grossFlorins = amt * eco.rates[fromBiome];
  const netFlorins = grossFlorins * (1 - src.brokerageFee);
  const received = Math.max(1, Math.floor(netFlorins / eco.rates[toBiome]));
  const fee = Math.max(1, Math.round(amt * src.brokerageFee));
  eco.wallets[fromBiome] -= amt;
  eco.wallets[toBiome] += received;
  return {
    ok: true,
    msg: `💱 Câmbio: ${amt} ${src.currencyCode} → ${received} ${dst.currencyCode} (corretagem ${Math.round(src.brokerageFee * 100)}%)`,
    received,
    fee,
  };
}

/** Buy 1 share of a stock using the current biome's bank (pays regional brokerage fee!). */
export function buyStock(
  eco: EconomyState,
  biomeIndex: number,
  stockId: string
): { ok: boolean; msg: string } {
  const stock = getStock(stockId);
  const prof = biomeEconomy(biomeIndex);
  if (!stock) return { ok: false, msg: 'Ação inválida.' };
  const basePrice = eco.stockPrices[stockId] ?? stock.basePrice;
  const localSharePrice = Math.max(1, Math.round(basePrice / eco.rates[biomeIndex]));
  const fee = Math.max(1, Math.round(localSharePrice * prof.brokerageFee));
  const total = localSharePrice + fee;
  if (eco.wallets[biomeIndex] < total) {
    return {
      ok: false,
      msg: `Precisa de ${total} ${prof.currencyCode} (incl. corretagem de ${fee}).`,
    };
  }
  eco.wallets[biomeIndex] -= total;
  eco.shares[stockId] = (eco.shares[stockId] ?? 0) + 1;
  return {
    ok: true,
    msg: `📈 Comprou 1 ação de ${stock.ticker} por ${localSharePrice} + ${fee} ${prof.currencyCode} de corretagem!`,
  };
}

/** Sell 1 share of a stock at the current biome's bank (deducts regional brokerage fee!). */
export function sellStock(
  eco: EconomyState,
  biomeIndex: number,
  stockId: string
): { ok: boolean; msg: string } {
  const stock = getStock(stockId);
  const prof = biomeEconomy(biomeIndex);
  if (!stock || (eco.shares[stockId] ?? 0) <= 0) {
    return { ok: false, msg: 'Você não possui ações desta empresa.' };
  }
  const basePrice = eco.stockPrices[stockId] ?? stock.basePrice;
  const localSharePrice = Math.max(1, Math.round(basePrice / eco.rates[biomeIndex]));
  const fee = Math.max(1, Math.round(localSharePrice * prof.brokerageFee));
  const net = Math.max(1, localSharePrice - fee);
  eco.shares[stockId] -= 1;
  eco.wallets[biomeIndex] += net;
  return {
    ok: true,
    msg: `📉 Vendeu 1 ação de ${stock.ticker}: +${net} ${prof.currencyCode} (corretagem -${fee})!`,
  };
}

/** Restock a product in the player's own shop ("Minha Lojinha") at wholesale cost. */
export function restockMyShop(
  eco: EconomyState,
  biomeIndex: number,
  goodId: string
): { ok: boolean; msg: string } {
  const good = getShopGood(goodId);
  const prof = biomeEconomy(biomeIndex);
  if (!good) return { ok: false, msg: 'Produto inválido.' };
  const cost = localPrice(eco, biomeIndex, good.baseCost);
  if (eco.wallets[biomeIndex] < cost) {
    return { ok: false, msg: `Precisa de ${cost} ${prof.currencyCode} para estocar ${good.name}.` };
  }
  eco.wallets[biomeIndex] -= cost;
  eco.myShopStock[goodId] = (eco.myShopStock[goodId] ?? 0) + 1;
  return { ok: true, msg: `📦 Estocou +1 ${good.icon} ${good.name} na sua lojinha!` };
}

/**
 * Sells 1 stocked item from the player's own shop to a local biome NPC customer!
 * Automatically charges and pays the biome Bank's sales tax (10%–18%), and returns
 * the regional NPC customer's dialect/slang quote!
 */
export function sellFromMyShop(
  eco: EconomyState,
  biomeIndex: number,
  goodId: string
): { ok: boolean; msg: string; gross: number; tax: number; net: number; quote: string } {
  const good = getShopGood(goodId);
  const prof = biomeEconomy(biomeIndex);
  if (!good || (eco.myShopStock[goodId] ?? 0) <= 0) {
    return {
      ok: false,
      msg: 'Sem estoque deste item na prateleira!',
      gross: 0,
      tax: 0,
      net: 0,
      quote: '',
    };
  }
  const askBase = eco.myShopPrices[goodId] ?? good.suggestedPrice;
  const gross = localPrice(eco, biomeIndex, askBase);
  const tax = Math.max(1, Math.round(gross * prof.salesTax));
  const net = Math.max(1, gross - tax);
  eco.myShopStock[goodId] -= 1;
  eco.wallets[biomeIndex] += net;
  eco.totalTaxPaid += tax;
  eco.totalShopSales += net;
  const overPriced = askBase > good.suggestedPrice * 1.25;
  const quote = overPriced ? prof.dialect.haggleQuote : prof.dialect.buyQuote;
  return {
    ok: true,
    msg: `🏪 Vendeu ${good.icon} ${good.name}: +${gross} ${prof.currencyCode} · Imposto ao ${prof.bankName} (-${Math.round(prof.salesTax * 100)}%): -${tax} · Líquido: +${net} ${prof.currencyCode}!`,
    gross,
    tax,
    net,
    quote,
  };
}
