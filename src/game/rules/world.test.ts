import { describe, expect, it } from 'vitest';
import { BIOMES } from '../data/biomes';
import { SPECIES } from '../data/species';
import { createRng } from './rng';
import {
  biomeAt,
  createEncounter,
  generateWorld,
  isWalkable,
  reachable,
  tileAt,
  WORLD_H,
  WORLD_W,
} from './world';

describe('mundo aberto', () => {
  it('é determinístico pela seed', () => {
    expect(generateWorld(123).tiles).toEqual(generateWorld(123).tiles);
    expect(generateWorld(123).tiles).not.toEqual(generateWorld(124).tiles);
  });

  it('tem os 7 biomas, todos alcançáveis a partir do início', () => {
    for (let seed = 0; seed < 25; seed++) {
      const map = generateWorld(seed);
      expect(map.width).toBe(WORLD_W);
      expect(map.height).toBe(WORLD_H);
      const reach = reachable(map, map.start);
      const reachedBiomes = new Set([...reach].map((i) => map.biomes[i]));
      expect(reachedBiomes.size).toBe(BIOMES.length);
      expect(reach.has(map.portal.y * map.width + map.portal.x)).toBe(true);
      expect(tileAt(map, map.portal.x, map.portal.y)).toBe('portal');
      expect(BIOMES[biomeAt(map, map.portal.x, map.portal.y)].id).toBe('fortaleza');
      expect(BIOMES[biomeAt(map, map.start.x, map.start.y)].id).toBe('prado');
      map.tiles.forEach((t, i) => {
        if (['bau', 'cura', 'treinador', 'cristal'].includes(t)) expect(reach.has(i)).toBe(true);
      });
    }
  });

  it('cada bioma tem cristais dos seus próprios elementos', () => {
    const map = generateWorld(9);
    const perBiome = BIOMES.map(() => 0);
    map.tiles.forEach((t, i) => {
      if (t !== 'cristal') return;
      const b = BIOMES[map.biomes[i]];
      expect(b.elements).toContain(map.loot[i]);
      perBiome[map.biomes[i]] += 1;
    });
    expect(perBiome.every((n) => n > 0)).toBe(true);
  });

  it('encontros usam as espécies e elementos do bioma e ficam mais fortes adiante', () => {
    const rng = createRng(5);
    BIOMES.forEach((b, i) => {
      for (let k = 0; k < 20; k++) {
        const enc = createEncounter(rng, 'selvagem', i);
        for (const p of enc.enemies) {
          expect(b.wild).toContain(p.speciesId);
          if (p.element !== 'neutro') expect(b.elements).toContain(p.element);
        }
      }
    });
    const easy = createEncounter(createRng(1), 'treinador', 0);
    const hard = createEncounter(createRng(1), 'treinador', 6);
    expect(hard.enemyPower).toBeGreaterThan(easy.enemyPower);
    expect(hard.enemies[0].level).toBeGreaterThan(easy.enemies[0].level);
    expect(BIOMES.flatMap((b) => b.wild).every((id) => SPECIES.some((s) => s.id === id))).toBe(
      true
    );
  });

  it('chefe tem 3 pets evoluídos de elementos diferentes', () => {
    const boss = createEncounter(createRng(3), 'chefe', 6);
    expect(boss.enemies).toHaveLength(3);
    expect(boss.enemies.every((p) => p.level === 3)).toBe(true);
    expect(new Set(boss.enemies.map((p) => p.element)).size).toBe(3);
  });

  it('o primeiro bioma é um vale inicial com vila, riacho, ponte e mato alto', () => {
    for (let seed = 0; seed < 10; seed++) {
      const map = generateWorld(seed);
      const houses = map.tiles.filter((t, i) => t === 'predio' && map.biomes[i] === 0);
      expect(houses.length).toBeGreaterThanOrEqual(4);
      expect(map.tiles.some((t, i) => t === 'predio' && map.biomes[i] !== 0)).toBe(false);
      expect(isWalkable(map, map.start.x, map.start.y)).toBe(true);
      // Wild grass and scenic water stream exist in Biome 1.
      expect(map.tiles.some((t, i) => t === 'matoAlto' && map.biomes[i] === 0)).toBe(true);
      expect(map.tiles.some((t, i) => t === 'agua' && map.biomes[i] === 0)).toBe(true);
    }
  });
});
