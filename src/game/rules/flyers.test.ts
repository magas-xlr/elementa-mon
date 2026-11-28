import { describe, expect, it } from 'vitest';
import { createFlyerState, distributePlayerFlyers, maybeTriggerApartmentBroker } from './flyers';
import { createRng } from './rng';

describe('Annoying Apartment Brokers & Player Flyer Distribution', () => {
  it('spawns annoying apartment-broker NPCs handing out flyers while exploring', () => {
    const state = createFlyerState();
    state.brokerCooldownSteps = 0;
    const rng = createRng(42);
    let pitch = null;
    for (let i = 0; i < 60 && !pitch; i++) {
      state.brokerCooldownSteps = 0;
      pitch = maybeTriggerApartmentBroker(state, rng);
    }
    expect(pitch).not.toBeNull();
    expect(state.receivedFlyers).toBe(1);
    expect(pitch!.quote.toLowerCase()).toContain('panfleto');
  });

  it('lets player distribute flyers for job, apartment sale, or NGO — making NPCs find them annoying', () => {
    const state = createFlyerState();
    const job = distributePlayerFlyers(state, 'emprego');
    expect(job.coinsEarned).toBeGreaterThan(0);
    expect(job.npcBondPenalty).toBeLessThan(0);
    expect(job.paperLitterCreated).toBe(1);

    const apt = distributePlayerFlyers(state, 'apartamento');
    expect(apt.apartmentInterestBoost).toBeGreaterThan(0);
    expect(apt.npcBondPenalty).toBeLessThan(0);

    const ngo = distributePlayerFlyers(state, 'ong');
    expect(ngo.ngoRecruitGained).toBe(true);
    expect(ngo.npcBondPenalty).toBeLessThan(0);
    expect(state.annoyanceScore).toBe(3);
  });
});
