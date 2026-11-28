import { describe, expect, it } from 'vitest';
import { STARTER_DECK } from '../data/cards';
import { itemsForShop } from '../data/shops';
import {
  computeEcologicalIntegrity,
  evaluateEcologicalEnding,
  GENE_TRAITS,
} from '../data/biodiversity';
import { SPECIES } from '../data/species';
import {
  buyMacabreItem,
  buyShopItem,
  claimLabPod,
  LAB_HOURS,
  resurrectPetAtLab,
  startLabTransmodification,
  startRun,
  waitLabHours,
} from '../state/run';
import {
  cardEcoDamage,
  computeLabAccidentChance,
  damageBiomeEcology,
  shopRelationPriceFactor,
} from './ecology';

describe('ecologia, risco do laboratório, lojistas e consequências ambientais', () => {
  it('variáveis ruins (clima, fome, tristeza, má relação) aumentam risco de acidente no laboratório', () => {
    const safe = computeLabAccidentChance({
      labRelation: 3,
      hunger: 100,
      happiness: 90,
      beauty: 60,
      hpRatio: 1,
      weather: 'ameno',
    });
    const risky = computeLabAccidentChance({
      labRelation: -3,
      hunger: 15,
      happiness: 20,
      beauty: 10,
      hpRatio: 0.3,
      weather: 'frio_extremo',
    });
    expect(safe).toBeLessThan(0.1);
    expect(risky).toBeGreaterThan(0.6);
  });

  it('suporta todos os desfechos de acidente do laboratório (estátua, doença, geleca, mutante, morte)', () => {
    const run = startRun(['pipo', 'casquinho', 'bicudo'], [...STARTER_DECK], 1, 12);
    run.coins = 500;
    run.economy.wallets[0] = 500;
    run.elementGenes.fogo = 20;

    // Estátua decorativa
    startLabTransmodification(run, run.party[1].uid, 'fogo');
    waitLabHours(run, LAB_HOURS);
    const stat = claimLabPod(run, run.labPods[0].id, 'estatua');
    expect(stat.outcome).toBe('estatua');
    expect(run.eco.statues).toHaveLength(1);

    // Geleca (Slime)
    startLabTransmodification(run, run.party[1].uid, 'fogo');
    waitLabHours(run, LAB_HOURS);
    const slime = claimLabPod(run, run.labPods[0].id, 'geleca');
    expect(slime.outcome).toBe('geleca');
    expect(slime.pet?.speciesId).toBe('gosminha');
    expect(slime.pet?.mutation).toBe('geleca');

    // Doente perde HP com horas
    startLabTransmodification(run, run.party[1].uid, 'fogo');
    waitLabHours(run, LAB_HOURS);
    const sick = claimLabPod(run, run.labPods[0].id, 'doente');
    expect(sick.outcome).toBe('doente');
    expect(sick.pet?.sick).toBe(true);
    const hpBefore = sick.pet!.hp;
    waitLabHours(run, 1);
    expect(sick.pet!.hp).toBeLessThan(hpBefore);
  });

  it('produção de itens por lojistas e ataques destrutivos degradam o bioma e matam NPCs no colapso', () => {
    const run = startRun(['pipo'], [...STARTER_DECK], 1, 7);
    run.coins = 500;
    run.economy.wallets[0] = 500;
    const item = itemsForShop('comida')[0];
    buyShopItem(run, item);
    buyShopItem(run, item);
    expect(run.eco.shopDemand[item.id]).toBe(2);
    expect(run.eco.shopStock[item.id]).toBeGreaterThan(3);
    expect(run.eco.biomeHealth[0]).toBeLessThan(100);

    expect(cardEcoDamage('brasa', 'fogo')).toBeGreaterThan(0);
    expect(cardEcoDamage('investida', 'neutro')).toBe(0);

    const msgs = damageBiomeEcology(run.eco, 0, 90);
    expect(run.eco.biomeHealth[0]).toBeLessThanOrEqual(15);
    expect(run.eco.deadNpcBiomes).toContain(0);
    expect(msgs.length).toBeGreaterThan(0);
  });

  it('relação horrível com o lojista encarece os itens', () => {
    expect(shopRelationPriceFactor(-4)).toBeGreaterThanOrEqual(2);
    expect(shopRelationPriceFactor(3)).toBeLessThan(1);
  });

  it('troca equivalente ressuscita pet morto como zumbi e depressão aplica ciclo de meia-vida diário no doador', () => {
    const run = startRun(['pipo', 'casquinho'], [...STARTER_DECK], 1, 88);
    run.coins = 300;
    run.economy.wallets[0] = 300;
    run.graveyard.push({
      id: 'g-1',
      name: 'Bicudo',
      speciesId: 'bicudo',
      level: 1,
      element: 'neutro',
      cause: 'Batalha',
      day: 1,
    });
    expect(buyMacabreItem(run).ok).toBe(true);
    expect(buyMacabreItem(run).ok).toBe(true);
    expect(run.macabreItems).toBe(2);

    const donor = run.party[0]; // 10/10 HP (100%)
    const res = resurrectPetAtLab(run, 0, donor.uid, true);
    expect(res.ok).toBe(true);
    expect(res.zombie?.mutation).toBe('zumbi');
    expect(run.graveyard).toHaveLength(0);
    expect(run.party).toHaveLength(3);
    expect(donor.hp).toBe(5); // half HP taken!
    expect(donor.depressed).toBe(true);

    // Advance 24 in-game hours (1 full day) -> depressed donor HP halves again (5 -> 2)!
    const alerts = waitLabHours(run, 24);
    expect(donor.hp).toBe(2);
    expect(alerts.some((a) => a.includes('meia-vida'))).toBe(true);
  });

  it('biodiversidade expandida e integridade ecológica determinam finais feliz vs sombrio', () => {
    expect(SPECIES.length).toBeGreaterThanOrEqual(15);
    expect(GENE_TRAITS.length).toBeGreaterThanOrEqual(12);

    const happyRun = startRun(['pipo', 'coralinho', 'esporo', 'duna'], [...STARTER_DECK], 5, 11);
    const highIntegrity = computeEcologicalIntegrity(happyRun.eco, happyRun.party);
    expect(highIntegrity).toBeGreaterThanOrEqual(85);
    expect(evaluateEcologicalEnding(highIntegrity).tier).toBe('verdadeiro');

    // Damage all 7 biomes severely -> triggers dark collapse ending!
    for (let i = 0; i < 7; i++) damageBiomeEcology(happyRun.eco, i, 92);
    const lowIntegrity = computeEcologicalIntegrity(happyRun.eco, happyRun.party);
    expect(lowIntegrity).toBeLessThan(30);
    expect(evaluateEcologicalEnding(lowIntegrity).tier).toBe('colapso');
  });
});
