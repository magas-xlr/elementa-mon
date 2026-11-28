import { describe, expect, it } from 'vitest';
import { createEcoState } from './ecology';
import {
  buildCustomHouse,
  buyConstructionMaterials,
  createGovernanceState,
  elementalLawTax,
  governmentRestoreBiome,
  seizedHouseBuybackPrice,
  tickEcologicalResilience,
  tickGovernance,
} from './governance';
import { createRng } from './rng';
import { prefeituraForBiome } from '../data/governance';
import { npcGovernmentOpinion, STORY_NPCS } from '../data/npcs';

describe('prefeituras, saúde ecológica, construção, lenhador clandestino, IPTU e leis elementais', () => {
  it('ecossistema com saúde alta regenera naturalmente, mas em 0% nem o governo recupera', () => {
    const eco = createEcoState();
    eco.biomeHealth[0] = 70;
    tickEcologicalResilience(eco, 2);
    expect(eco.biomeHealth[0]).toBeGreaterThan(70);

    // At 0%, permanently dead: government cannot restore!
    eco.biomeHealth[1] = 0;
    expect(governmentRestoreBiome(eco, 1, 500).ok).toBe(false);
    // At 30%, government CAN restore!
    eco.biomeHealth[2] = 30;
    expect(governmentRestoreBiome(eco, 2, 500).ok).toBe(true);
    expect(eco.biomeHealth[2]).toBe(55);
  });

  it('madeira clandestina é barata mas devasta o bioma e faz a casa desabar; certificada preserva', () => {
    const eco = createEcoState();
    const gov = createGovernanceState();
    const cert = buyConstructionMaterials(gov, eco, 0, 'certificada', 200);
    expect(cert.ok).toBe(true);
    expect(eco.biomeHealth[0]).toBe(97);

    const clan = buyConstructionMaterials(gov, eco, 1, 'clandestina', 200);
    expect(clan.ok).toBe(true);
    expect(clan.cost).toBeLessThan(cert.cost);
    expect(eco.biomeHealth[1]).toBe(76);

    // Building requires Government Permit first!
    expect(buildCustomHouse(gov, 1, 0, 200).ok).toBe(false);
    gov.permits.push(1);
    expect(buildCustomHouse(gov, 1, 0, 200).ok).toBe(true);
    expect(gov.customHouse?.quality).toBe('clandestina');

    // Cheap house collapses under rain
    const rng = createRng(5);
    let collapsed = false;
    for (let i = 0; i < 4; i++) {
      gov.customHouse!.iptuOwed = 0;
      gov.customHouse!.unpaidDays = 0;
      if (tickGovernance(gov, rng, 1, true).houseCollapsed) {
        collapsed = true;
        break;
      }
    }
    expect(collapsed).toBe(true);
  });

  it('falta de pagamento de IPTU faz a prefeitura tomar a casa e permite recompra', () => {
    const gov = createGovernanceState();
    const eco = createEcoState();
    gov.permits.push(0);
    buyConstructionMaterials(gov, eco, 0, 'certificada', 200);
    buildCustomHouse(gov, 0, 2, 200);

    const rng = createRng(11);
    tickGovernance(gov, rng, 1, false); // IPTU billed
    expect(gov.customHouse?.iptuOwed).toBeGreaterThan(0);
    tickGovernance(gov, rng, 2, false); // unpaid -> seized!
    expect(gov.customHouse?.seizedByCity).toBe(true);
    expect(seizedHouseBuybackPrice(gov)).toBeGreaterThan(25);
  });

  it('leis de bairro taxam elementos específicos por bioma (Fogo no Prado, Água nas Ruínas)', () => {
    expect(elementalLawTax(0, 'fogo')).toBeGreaterThan(0);
    expect(elementalLawTax(0, 'agua')).toBe(0);
    expect(elementalLawTax(1, 'agua')).toBeGreaterThan(0);
  });

  it('prefeituras e NPCs têm posicionamento esquerda/direita, aprovação e perfil de fala política', () => {
    const prefLeft = prefeituraForBiome(0);
    const prefRight = prefeituraForBiome(4);
    expect(prefLeft.politicalLean).toBe('esquerda');
    expect(prefLeft.leftSharePct).toBeGreaterThan(50);
    expect(prefRight.politicalLean).toBe('direita');
    expect(prefRight.leftSharePct).toBeLessThan(50);

    const lira = STORY_NPCS.find((n) => n.id === 'lira')!;
    const kael = STORY_NPCS.find((n) => n.id === 'kael')!;
    const breno = STORY_NPCS.find((n) => n.id === 'breno')!;
    expect(npcGovernmentOpinion(lira, prefLeft).approves).toBe(true);
    expect(npcGovernmentOpinion(breno, prefLeft).approves).toBe(false);
    expect(npcGovernmentOpinion(breno, prefRight).approves).toBe(true);
    expect(npcGovernmentOpinion(kael, prefLeft).badge).toContain('Evita');
  });
});
