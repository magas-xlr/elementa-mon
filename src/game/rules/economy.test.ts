import { describe, expect, it } from 'vitest';
import { BIOME_ECONOMIES } from '../data/economy';
import { createRng } from './rng';
import {
  buyStock,
  createEconomyState,
  depositAtBank,
  exchangeCurrency,
  restockMyShop,
  sellFromMyShop,
  sellStock,
  tickEconomy,
  withdrawFromBank,
} from './economy';

describe('economia regional, bancos, ações, câmbio e lojinha própria', () => {
  it('cada um dos 7 biomas possui moeda, banco, imposto, corretagem e dialeto próprios', () => {
    expect(BIOME_ECONOMIES).toHaveLength(7);
    const codes = new Set(BIOME_ECONOMIES.map((b) => b.currencyCode));
    expect(codes.size).toBe(7);
    for (const b of BIOME_ECONOMIES) {
      expect(b.salesTax).toBeGreaterThan(0);
      expect(b.brokerageFee).toBeGreaterThan(0);
      expect(b.dialect.greeting.length).toBeGreaterThan(5);
    }
  });

  it('depósito no banco rende juros com o passar das horas e permite saque', () => {
    const eco = createEconomyState(200);
    const rng = createRng(42);
    expect(depositAtBank(eco, 0, 100).ok).toBe(true);
    expect(eco.wallets[0]).toBe(100);
    expect(eco.deposits[0]).toBe(100);

    const alerts = tickEconomy(eco, rng, 12);
    expect(alerts.length).toBeGreaterThan(0);
    expect(eco.deposits[0]).toBeGreaterThan(100);

    const afterInterest = eco.deposits[0];
    expect(withdrawFromBank(eco, 0, afterInterest).ok).toBe(true);
    expect(eco.deposits[0]).toBe(0);
    expect(eco.wallets[0]).toBe(100 + afterInterest);
  });

  it('compra e venda de ações cobra taxa de corretagem e atualiza carteira', () => {
    const eco = createEconomyState(200);
    expect(buyStock(eco, 0, 'stk_brisa').ok).toBe(true);
    expect(eco.shares['stk_brisa']).toBe(1);
    expect(eco.wallets[0]).toBeLessThan(200 - 28); // includes brokerage fee
    expect(sellStock(eco, 0, 'stk_brisa').ok).toBe(true);
    expect(eco.shares['stk_brisa']).toBe(0);
  });

  it('câmbio converte entre moedas de biomas diferentes com taxa de corretagem', () => {
    const eco = createEconomyState(150);
    const res = exchangeCurrency(eco, 0, 4, 100); // Florim -> NeonBit
    expect(res.ok).toBe(true);
    expect(res.received).toBeGreaterThan(0);
    expect(eco.wallets[0]).toBe(50);
    expect(eco.wallets[4]).toBe(res.received);
  });

  it('lojinha própria permite estocar, vender para NPC local e paga imposto ao banco do bioma', () => {
    const eco = createEconomyState(100);
    expect(restockMyShop(eco, 0, 'good_cha').ok).toBe(true);
    const beforeWallet = eco.wallets[0];
    const sale = sellFromMyShop(eco, 0, 'good_cha');
    expect(sale.ok).toBe(true);
    expect(sale.tax).toBeGreaterThan(0);
    expect(sale.net).toBe(sale.gross - sale.tax);
    expect(eco.totalTaxPaid).toBe(sale.tax);
    expect(eco.wallets[0]).toBe(beforeWallet + sale.net);
    expect(sale.quote.length).toBeGreaterThan(5);
  });
});
