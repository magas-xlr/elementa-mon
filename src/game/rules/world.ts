import { SPECIES } from '../data/species';
import { createPet, type PetInstance } from './progression';
import { chance, createRng, int, next, pick, type RngState } from './rng';

export type Tile =
  'grama' | 'matoAlto' | 'arvore' | 'agua' | 'caminho' | 'bau' | 'cura' | 'treinador' | 'portal';

export interface Point {
  x: number;
  y: number;
}

export interface FloorMap {
  floor: number;
  width: number;
  height: number;
  tiles: Tile[];
  start: Point;
  portal: Point;
}

export const FLOORS_PER_RUN = 3;
export const ENCOUNTER_CHANCE = 0.12;
export const MAP_SIZE = 22;

export const BLOCKING: ReadonlySet<Tile> = new Set<Tile>(['arvore', 'agua']);

export const tileAt = (map: FloorMap, x: number, y: number): Tile =>
  x < 0 || y < 0 || x >= map.width || y >= map.height ? 'arvore' : map.tiles[y * map.width + x];

export const setTile = (map: FloorMap, x: number, y: number, tile: Tile): void => {
  map.tiles[y * map.width + x] = tile;
};

export function isWalkable(map: FloorMap, x: number, y: number): boolean {
  return !BLOCKING.has(tileAt(map, x, y));
}

function blob(rng: RngState, map: FloorMap, tile: Tile, count: number, radius: number): void {
  for (let i = 0; i < count; i++) {
    const cx = int(rng, 2, map.width - 3);
    const cy = int(rng, 2, map.height - 3);
    const r = radius + next(rng) * 1.5;
    for (let y = Math.floor(cy - r); y <= cy + r; y++) {
      for (let x = Math.floor(cx - r); x <= cx + r; x++) {
        if (x < 1 || y < 1 || x >= map.width - 1 || y >= map.height - 1) continue;
        if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r && next(rng) > 0.15) setTile(map, x, y, tile);
      }
    }
  }
}

/** Carves a wandering 1-tile path so the portal is always reachable from the start. */
function carvePath(rng: RngState, map: FloorMap, from: Point, to: Point): void {
  let { x, y } = from;
  while (x !== to.x || y !== to.y) {
    if (BLOCKING.has(tileAt(map, x, y)) || tileAt(map, x, y) === 'grama')
      setTile(map, x, y, 'caminho');
    const horizontal = x !== to.x && (y === to.y || next(rng) < 0.5);
    if (horizontal) x += Math.sign(to.x - x);
    else y += Math.sign(to.y - y);
  }
}

/** Breadth-first search over walkable tiles. */
export function reachable(map: FloorMap, from: Point): Set<number> {
  const seen = new Set<number>([from.y * map.width + from.x]);
  const queue: Point[] = [from];
  while (queue.length) {
    const p = queue.shift() as Point;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = p.x + dx;
      const ny = p.y + dy;
      const key = ny * map.width + nx;
      if (!seen.has(key) && isWalkable(map, nx, ny)) {
        seen.add(key);
        queue.push({ x: nx, y: ny });
      }
    }
  }
  return seen;
}

export function generateFloor(seed: number, floor: number): FloorMap {
  const rng = createRng(seed * 31 + floor * 7919);
  const width = MAP_SIZE;
  const height = MAP_SIZE;
  const map: FloorMap = {
    floor,
    width,
    height,
    tiles: new Array<Tile>(width * height).fill('grama'),
    start: { x: 2, y: height - 3 },
    portal: { x: width - 3, y: 2 },
  };
  for (let x = 0; x < width; x++) {
    setTile(map, x, 0, 'arvore');
    setTile(map, x, height - 1, 'arvore');
  }
  for (let y = 0; y < height; y++) {
    setTile(map, 0, y, 'arvore');
    setTile(map, width - 1, y, 'arvore');
  }

  blob(rng, map, 'matoAlto', 6 + floor, 2);
  blob(rng, map, 'arvore', 5 + floor, 1.2);
  blob(rng, map, 'agua', 2, 1.5);

  // A waypoint in the middle makes paths less straight.
  const mid = { x: int(rng, 6, width - 7), y: int(rng, 6, height - 7) };
  carvePath(rng, map, map.start, mid);
  carvePath(rng, map, mid, map.portal);
  setTile(map, map.start.x, map.start.y, 'caminho');
  setTile(map, map.portal.x, map.portal.y, 'portal');

  // Unreachable pockets become trees so nothing is placed where the player cannot go.
  const reach = reachable(map, map.start);
  for (let i = 0; i < map.tiles.length; i++) {
    if (!reach.has(i) && !BLOCKING.has(map.tiles[i])) map.tiles[i] = 'arvore';
  }

  const free = [...reach].filter((i) => {
    const t = map.tiles[i];
    const x = i % width;
    const y = Math.floor(i / width);
    const nearStart = Math.abs(x - map.start.x) + Math.abs(y - map.start.y) < 3;
    return (t === 'grama' || t === 'caminho') && !nearStart;
  });
  const place = (tile: Tile, n: number) => {
    for (let k = 0; k < n && free.length; k++) {
      const idx = free.splice(int(rng, 0, free.length - 1), 1)[0];
      map.tiles[idx] = tile;
    }
  };
  place('bau', 3);
  place('cura', 1);
  place('treinador', floor + 1);
  return map;
}

export function rollEncounter(rng: RngState, tile: Tile): boolean {
  return tile === 'matoAlto' && chance(rng, ENCOUNTER_CHANCE);
}

export type EncounterKind = 'selvagem' | 'treinador' | 'chefe';

export interface Encounter {
  kind: EncounterKind;
  enemies: PetInstance[];
  enemyPower: number;
}

/** Enemies grow with the floor; species are limited by what the player level has seen. */
export function createEncounter(
  rng: RngState,
  kind: EncounterKind,
  floor: number,
  playerLevel: number
): Encounter {
  const pool = SPECIES.filter((s) => s.requiredLevel <= Math.max(2, playerLevel + 1));
  const count =
    kind === 'chefe'
      ? 3
      : kind === 'treinador'
        ? Math.min(3, floor + 1)
        : int(rng, 1, Math.min(2, floor));
  const level =
    kind === 'chefe' ? 3 : Math.min(3, Math.max(1, floor - 1 + (kind === 'treinador' ? 1 : 0)));
  const enemies = Array.from({ length: count }, () => createPet(pick(rng, pool).id, level));
  const enemyPower = kind === 'chefe' ? 2 : floor - 1;
  return { kind, enemies, enemyPower };
}
