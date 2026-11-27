import { describe, expect, it } from 'vitest';
import { createRng } from './rng';
import { createEncounter, generateFloor, reachable, tileAt } from './world';

describe('mundo procedural', () => {
  it('é determinístico pela seed', () => {
    expect(generateFloor(123, 1).tiles).toEqual(generateFloor(123, 1).tiles);
    expect(generateFloor(123, 1).tiles).not.toEqual(generateFloor(124, 1).tiles);
  });

  it('sempre deixa o portal e os itens alcançáveis', () => {
    for (let seed = 0; seed < 40; seed++) {
      for (let floor = 1; floor <= 3; floor++) {
        const map = generateFloor(seed, floor);
        const reach = reachable(map, map.start);
        expect(reach.has(map.portal.y * map.width + map.portal.x)).toBe(true);
        map.tiles.forEach((t, i) => {
          if (t === 'bau' || t === 'cura' || t === 'treinador') expect(reach.has(i)).toBe(true);
        });
        expect(tileAt(map, map.portal.x, map.portal.y)).toBe('portal');
        expect(map.tiles.filter((t) => t === 'treinador')).toHaveLength(floor + 1);
      }
    }
  });

  it('chefe tem 3 pets evoluídos', () => {
    const boss = createEncounter(createRng(3), 'chefe', 3, 1);
    expect(boss.enemies).toHaveLength(3);
    expect(boss.enemies.every((p) => p.level === 3)).toBe(true);
  });
});
