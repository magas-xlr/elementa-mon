import { describe, expect, it } from 'vitest';
import {
  esgScoreOf,
  rankLowestWasteProducers,
  RAW_MATERIALS_ESG,
  RSA_LAWS,
  verifyCleanerProduction,
} from './sustainability';
import {
  startRun,
  maintainBiomeInRun,
  createReserveInRun,
  runRsaAuditInRun,
  tickRunLife,
} from '../state/run';

describe('manutenção urbano/rural, reserva natural, RSA (protagonista e NPCs), ESG, P+L e auditoria de resíduos', () => {
  it('manutenção ambiental urbana e rural e criação de preservação natural por bairro', () => {
    const run = startRun(['pipo'], ['ataque'], 1, 61);
    run.coins = 300;
    run.economy.wallets[0] = 300;
    run.eco.biomeHealth[0] = 60;

    expect(maintainBiomeInRun(run, 'urbano').ok).toBe(true);
    expect(maintainBiomeInRun(run, 'rural').ok).toBe(true);
    expect(run.sustainability.urbanMaintenance[0]).toBeGreaterThan(50);
    expect(run.sustainability.ruralMaintenance[0]).toBeGreaterThan(50);
    expect(run.eco.biomeHealth[0]).toBeGreaterThan(70);

    expect(createReserveInRun(run).ok).toBe(true);
    expect(run.sustainability.naturalReserves[0]).toBe(true);
    const hpBefore = run.eco.biomeHealth[0];
    run.litter.groundLitter = [];
    // Advance 1 day -> Natural Preservation Reserve heals the neighborhood!
    tickRunLife(run, 960, false);
    expect(run.eco.biomeHealth[0]).toBeGreaterThanOrEqual(hpBefore);
  });

  it('leis RSA se aplicam à protagonista e aos NPCs; ESG de matérias-primas, P+L e ranking de menor resíduo', () => {
    expect(RSA_LAWS.length).toBeGreaterThanOrEqual(3);
    const run = startRun(['pipo'], ['ataque'], 1, 62);
    const audit = runRsaAuditInRun(run);
    expect(audit.playerCompliant).toBe(true);
    // Evil NPCs with low initial RSA compliance get audited & fined too!
    expect(audit.finedNpcs.length).toBeGreaterThan(0);

    // ESG scoring: bamboo/certified wood score A+, clandestine/coal score D
    const bamboo = RAW_MATERIALS_ESG.find((m) => m.id === 'bambu_organico')!;
    const coal = RAW_MATERIALS_ESG.find((m) => m.id === 'carvao_mineral')!;
    expect(esgScoreOf(bamboo).grade).toBe('A+');
    expect(esgScoreOf(coal).grade).toBe('D');

    // Cleaner Production verification
    expect(verifyCleanerProduction(2, false).certified).toBe(true);
    expect(verifyCleanerProduction(10, true).certified).toBe(false);

    // Shop vs Factory waste generation ranking (lowest waste first!)
    const ranked = rankLowestWasteProducers();
    expect(ranked[0].id).toBe('reparo');
    expect(ranked[0].wastePerUnit).toBeLessThan(ranked[ranked.length - 1].wastePerUnit);
    const factories = rankLowestWasteProducers('fabrica');
    expect(factories.every((f) => f.kind === 'fabrica')).toBe(true);
  });
});
