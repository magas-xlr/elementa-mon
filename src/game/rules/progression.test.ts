import { describe, expect, it } from 'vitest';
import { createPet, gainPetXp, petStats, playerLevelFor, playerLevelProgress } from './progression';

describe('progressão', () => {
  it('pets começam no nível 1 com 10 de vida', () => {
    const pet = createPet('pipo');
    expect(pet.level).toBe(1);
    expect(pet.hp).toBe(10);
    expect(petStats(pet).name).toBe('Pipo');
  });

  it('evolui no nível 2 e para no nível 3', () => {
    const pet = createPet('pipo');
    expect(gainPetXp(pet, 2)).toEqual({ leveledUp: true, evolvedTo: 'Pipão' });
    expect(petStats(pet).maxHp).toBe(15);
    expect(pet.hp).toBe(15);
    gainPetXp(pet, 100);
    expect(pet.level).toBe(3);
    expect(petStats(pet).name).toBe('Pipaltar');
    expect(gainPetXp(pet, 5).leveledUp).toBe(false);
  });

  it('calcula o nível persistente do jogador', () => {
    expect(playerLevelFor(0)).toBe(1);
    expect(playerLevelFor(10)).toBe(2);
    expect(playerLevelFor(9999)).toBe(10);
    expect(playerLevelProgress(15)).toEqual({ level: 2, current: 5, needed: 15 });
  });
});
