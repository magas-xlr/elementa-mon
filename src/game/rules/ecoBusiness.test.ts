import { describe, expect, it } from 'vitest';
import {
  startRun,
  buyShopItem,
  makeCompost,
  applyCompostToGarden,
  drinkWaterInRun,
  protestTrashWithNgo,
  performMilitancyInRun,
  repairBagacoInRun,
  hireHumanEmployee,
  fireEmployee,
  treatEmployee,
  buyShopRobotInRun,
  runMyShopShiftInRun,
  totalInventoryItems,
  discardExcessItem,
  MAX_INVENTORY_ITEMS,
  joinNgo,
  recruitToNgo,
} from '../state/run';
import { SHOP_ITEMS } from '../data/shops';
import { ALL_BUILDING_KINDS } from '../data/buildings';
import { createRng } from './rng';
import { runShopShift } from './business';

describe('compostagem, contaminação de água, protesto ONG, empresa/robôs, casa de reparo e limite de 50 itens', () => {
  it('comidas geram resíduo orgânico e bagaço; compostagem acelera horta e Casa de Reparo reutiliza bagaço', () => {
    expect(ALL_BUILDING_KINDS).toContain('reparo');
    const run = startRun(['pipo'], ['ataque'], 1, 15);
    const fruta = SHOP_ITEMS.find((i) => i.id === 'fruta')!;
    buyShopItem(run, fruta, run.party[0].uid);
    expect(run.envSim.organicWaste).toBeGreaterThanOrEqual(3);
    expect(run.envSim.spentBagaco.length).toBeGreaterThanOrEqual(2);

    // Composting & boosting garden
    expect(makeCompost(run.envSim).ok).toBe(true);
    expect(applyCompostToGarden(run).ok).toBe(true);
    expect(run.biogeochem.homeFood).toBeGreaterThanOrEqual(1);

    // Repair Shop reuses bagaço without polluting!
    const bagacoBefore = run.envSim.spentBagaco.length;
    expect(repairBagacoInRun(run, 0).ok).toBe(true);
    expect(run.envSim.spentBagaco.length).toBe(bagacoBefore - 1);
  });

  it('água contaminada mata o jogador; protesto em grupo da ONG na Prefeitura limpa mais rápido; militância chata irrita NPCs', () => {
    const run = startRun(['pipo'], ['ataque'], 1, 25);
    run.envSim.waterContamination[0] = 85;
    const drink = drinkWaterInRun(run);
    expect(drink.died).toBe(true);
    expect(drink.poisoned).toBe(true);

    // NGO group protest cleans trash & lowers contamination faster with more recruits!
    run.litter.groundLitter = ['plastico', 'vidro', 'bateria', 'papel'];
    joinNgo(run.ngo, 'ong_reciclagem');
    recruitToNgo(run.ngo, 'ong_reciclagem', 'Lira');
    recruitToNgo(run.ngo, 'ong_reciclagem', 'Kael');
    const protest = protestTrashWithNgo(run);
    expect(protest.cleanedLitter).toBeGreaterThanOrEqual(3);
    expect(run.envSim.waterContamination[0]).toBeLessThan(85);

    // Pushy environmental militancy (>=3) hurts NPC bonds!
    performMilitancyInRun(run);
    performMilitancyInRun(run);
    const third = performMilitancyInRun(run);
    expect(third.npcBondPenalty).toBeLessThan(0);
  });

  it('empresa na Lojinha: contratar humanos, maltratar gera fofoca, demitir e pôr robô gera erro e cliente nunca mais volta', () => {
    const run = startRun(['pipo'], ['ataque'], 1, 35);
    run.coins = 300;
    run.economy.wallets[0] = 300;
    expect(hireHumanEmployee(run.business, 'emp_carla').ok).toBe(true);
    const bad = treatEmployee(run.business, 'emp_carla', 'maltratar');
    expect(bad.gossipTriggered).toBe(true);
    expect(fireEmployee(run.business, 'emp_carla').ok).toBe(true);

    expect(buyShopRobotInRun(run).ok).toBe(true);
    const rng = createRng(4);
    let banned = false;
    for (let i = 0; i < 12; i++) {
      const shift = runShopShift(run.business, rng);
      if (shift.angryCustomer) {
        banned = true;
        break;
      }
    }
    expect(banned).toBe(true);
    expect(run.business.bannedCustomers.length).toBeGreaterThan(0);
    expect(runMyShopShiftInRun(run).msg.length).toBeGreaterThan(0);
  });

  it('inventário limitado a 50 itens e descartar excesso polui e enche aterro sanitário', () => {
    const run = startRun(['pipo'], ['ataque'], 1, 45);
    expect(MAX_INVENTORY_ITEMS).toBe(50);
    expect(totalInventoryItems(run)).toBeLessThan(50);
    const ecoBefore = run.eco.biomeHealth[0];
    const landfillBefore = run.envSim.cityLandfills[0];
    expect(discardExcessItem(run).ok).toBe(true);
    expect(run.eco.biomeHealth[0]).toBeLessThan(ecoBefore);
    expect(run.envSim.cityLandfills[0]).toBeGreaterThan(landfillBefore);
  });
});
