import { BIOMES } from '../data/biomes';
import type { BuildingKind } from '../data/buildings';
import type { Element, PetElement } from '../data/elements';
import { createPet, type PetInstance } from './progression';
import { chance, createRng, int, next, pick, shuffle, type RngState } from './rng';

/**
 * Tiles are biome-agnostic: the renderer draws each one with the look of the biome it is in
 * ('arvore' is a tree in the meadow, a column in the ruins, a building in the city...).
 * 'cristal' is an element crystal pickup; 'portal' is the gate to the final boss.
 */
export type Tile =
  | 'grama'
  | 'matoAlto'
  | 'arvore'
  | 'agua'
  | 'caminho'
  | 'bau'
  | 'cura'
  | 'treinador'
  | 'selvagem'
  | 'cristal'
  | 'portal'
  /** House or apartment building (the first biome is a neighborhood). */
  | 'predio'
  /** Entire mud environment created when a dam explodes from government neglect. */
  | 'lama';

export interface WildSpawn {
  speciesId: string;
  level: number;
  element: PetElement;
}

export interface Point {
  x: number;
  y: number;
}

/** The whole open world: seven biome regions joined by gates. */
export interface WorldMap {
  width: number;
  height: number;
  tiles: Tile[];
  /** Biome index (into BIOMES) of each tile. */
  biomes: number[];
  /** Tile index → element of the crystal lying there. */
  loot: Record<number, Element>;
  /** Tile index of a physical 'predio' tile → which establishment building it is! */
  buildings: Record<number, BuildingKind>;
  /** Tile index of the walkable doorway directly in front of a physical building → BuildingKind! */
  doors: Record<number, BuildingKind>;
  /** Tile indices with buried dinosaur fossils (searching/walking can unearth a fossil bone!). */
  fossils: Record<number, boolean>;
  /** Visible Legends: Arceus-style wild pets roaming the overworld (tile index → spawn info). */
  wildSpawns: Record<number, WildSpawn>;
  start: Point;
  portal: Point;
}

export const ENCOUNTER_CHANCE = 0.04;
export const REGION_W = 24;
export const REGION_H = 20;
/**
 * Region layout (biome index per grid cell). The sky fortress spans two cells; every pair of
 * neighbouring regions is joined by a gate, so the world can be crossed in any order.
 */
export const REGION_GRID: readonly (readonly number[])[] = [
  [0, 1, 2, 3],
  [6, 6, 5, 4],
];
export const WORLD_W = REGION_W * REGION_GRID[0].length;
export const WORLD_H = REGION_H * REGION_GRID.length;

export const BLOCKING: ReadonlySet<Tile> = new Set<Tile>(['arvore', 'agua', 'predio']);

const inside = (map: WorldMap, x: number, y: number) =>
  x >= 0 && y >= 0 && x < map.width && y < map.height;

export const tileAt = (map: WorldMap, x: number, y: number): Tile =>
  inside(map, x, y) ? map.tiles[y * map.width + x] : 'arvore';

export const setTile = (map: WorldMap, x: number, y: number, tile: Tile): void => {
  map.tiles[y * map.width + x] = tile;
};

/** Biome index at a tile (clamped to the map edge). */
export function biomeAt(map: WorldMap, x: number, y: number): number {
  const cx = Math.min(map.width - 1, Math.max(0, x));
  const cy = Math.min(map.height - 1, Math.max(0, y));
  return map.biomes[cy * map.width + cx];
}

export const isWalkable = (map: WorldMap, x: number, y: number): boolean =>
  !BLOCKING.has(tileAt(map, x, y));

/** Returns the physical establishment whose door is at tile (x, y), if any. */
export const doorAt = (map: WorldMap, x: number, y: number): BuildingKind | null =>
  inside(map, x, y) ? (map.doors[y * map.width + x] ?? null) : null;

interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** Bounding rectangle (inclusive) of each biome's cells. */
export function regionRects(): Rect[] {
  const rects: Rect[] = BIOMES.map(() => ({ x0: Infinity, y0: Infinity, x1: -1, y1: -1 }));
  REGION_GRID.forEach((row, r) =>
    row.forEach((b, c) => {
      const rect = rects[b];
      rect.x0 = Math.min(rect.x0, c * REGION_W);
      rect.y0 = Math.min(rect.y0, r * REGION_H);
      rect.x1 = Math.max(rect.x1, (c + 1) * REGION_W - 1);
      rect.y1 = Math.max(rect.y1, (r + 1) * REGION_H - 1);
    })
  );
  return rects;
}

function blob(rng: RngState, map: WorldMap, rect: Rect, tile: Tile, count: number, radius: number) {
  for (let i = 0; i < count; i++) {
    const cx = int(rng, rect.x0 + 3, rect.x1 - 3);
    const cy = int(rng, rect.y0 + 3, rect.y1 - 3);
    const r = radius + next(rng) * 1.5;
    for (let y = Math.floor(cy - r); y <= cy + r; y++) {
      for (let x = Math.floor(cx - r); x <= cx + r; x++) {
        if (x <= rect.x0 || y <= rect.y0 || x >= rect.x1 || y >= rect.y1) continue;
        if ((x - cx) ** 2 + (y - cy) ** 2 > r * r || next(rng) <= 0.15) continue;
        if (tileAt(map, x, y) === 'grama') setTile(map, x, y, tile);
      }
    }
  }
}

/** Carves a wandering 1-tile path so `to` is always reachable from `from`. */
function carvePath(rng: RngState, map: WorldMap, from: Point, to: Point): void {
  let { x, y } = from;
  for (;;) {
    const tile = tileAt(map, x, y);
    if (BLOCKING.has(tile) || tile === 'grama' || tile === 'matoAlto')
      setTile(map, x, y, 'caminho');
    if (x === to.x && y === to.y) break;
    const horizontal = x !== to.x && (y === to.y || next(rng) < 0.5);
    if (horizontal) x += Math.sign(to.x - x);
    else y += Math.sign(to.y - y);
  }
}

/** Breadth-first search over walkable tiles. */
export function reachable(map: WorldMap, from: Point): Set<number> {
  const seen = new Set<number>([from.y * map.width + from.x]);
  const queue: Point[] = [from];
  for (let head = 0; head < queue.length; head++) {
    const p = queue[head];
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

/**
 * Handcrafted + seed-varied BotW-inspired starter valley for Biome 1 (Prado das Colinas):
 * - West: cozy village clearing (4–6 cottages, welcoming plaza, side treasure grove)
 * - Center: curved crystal stream with a wooden/dirt bridge crossing
 * - East: whisper-meadow tall grass glades, Breeze Healing Fountain, and stage gate to Biome 2
 */
export const STREET_ROWS = [6, 13];

function buildStarterValley(rng: RngState, map: WorldMap, rect: Rect, exitGateY: number): void {
  // Clear interior of Biome 1 so our handcrafted landmarks read cleanly.
  for (let y = rect.y0 + 2; y <= rect.y1 - 2; y++) {
    for (let x = rect.x0 + 2; x <= rect.x1 - 2; x++) {
      setTile(map, x, y, 'grama');
    }
  }

  // Soft natural tree clusters along the north & south valley edges
  for (let x = rect.x0 + 2; x <= rect.x1 - 2; x++) {
    if (next(rng) < 0.55) setTile(map, x, rect.y0 + 1, 'arvore');
    if (next(rng) < 0.55) setTile(map, x, rect.y1 - 1, 'arvore');
  }

  // Cozy village plaza on the west side (clean, airy, not a sterile grid of boxes!)
  const plazaX = rect.x0 + 6;
  const plazaY = rect.y0 + 10;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      setTile(map, plazaX + dx, plazaY + dy, 'caminho');
    }
  }
  // All 13 physical establishments arranged along scenic walkable village lanes!
  const physicalTown: [number, number, BuildingKind][] = [
    [rect.x0 + 3, rect.y0 + 4, 'moradia'],
    [rect.x0 + 6, rect.y0 + 4, 'banco'],
    [rect.x0 + 9, rect.y0 + 4, 'prefeitura'],
    [rect.x0 + 14, rect.y0 + 4, 'laboratorio'],
    [rect.x0 + 17, rect.y0 + 4, 'hospital'],
    [rect.x0 + 20, rect.y0 + 4, 'dojo'],
    [rect.x0 + 3, rect.y0 + 9, 'comida'],
    [rect.x0 + 6, rect.y0 + 9, 'roupinhas'],
    [rect.x0 + 9, rect.y0 + 9, 'minhaloja'],
    [rect.x0 + 3, rect.y0 + 15, 'livros'],
    [rect.x0 + 6, rect.y0 + 15, 'apostas'],
    [rect.x0 + 9, rect.y0 + 15, 'garagem'],
    [rect.x0 + 15, rect.y0 + 15, 'cemiterio'],
    [rect.x0 + 18, rect.y0 + 15, 'reparo'],
  ];
  for (const [cx, cy, kind] of physicalTown) {
    setTile(map, cx, cy, 'predio');
    map.buildings[cy * map.width + cx] = kind;
    // Carve clean walkable doorway right in front of each physical building!
    const dy = cy + 1;
    setTile(map, cx, dy, 'caminho');
    map.doors[dy * map.width + cx] = kind;
  }
  // Connect the village lanes cleanly so every single doorway is connected to the main plaza
  for (let x = rect.x0 + 3; x <= rect.x0 + 20; x++) {
    if (x !== rect.x0 + 12) setTile(map, x, rect.y0 + 5, 'caminho');
  }
  for (let x = rect.x0 + 3; x <= rect.x0 + 15; x++) {
    if (x !== rect.x0 + 12) setTile(map, x, rect.y0 + 16, 'caminho');
  }
  for (let y = rect.y0 + 5; y <= rect.y0 + 16; y++) {
    setTile(map, rect.x0 + 7, y, 'caminho');
    setTile(map, rect.x0 + 15, y, 'caminho');
  }
  // Buried fossil spots in the eastern meadow
  map.fossils[(rect.y0 + 7) * map.width + (rect.x0 + 18)] = true;
  map.fossils[(rect.y0 + 13) * map.width + (rect.x0 + 19)] = true;

  // Scenic curved stream cutting through the middle of the valley (straight at the bridge!)
  const streamBaseX = rect.x0 + 12;
  const bridgeY = rect.y0 + 10;
  for (let y = rect.y0 + 2; y <= rect.y1 - 2; y++) {
    const nearBridge = Math.abs(y - bridgeY) <= 1;
    const bend = nearBridge ? 0 : Math.round(Math.sin((y - rect.y0) * 0.35) * 1.1);
    const sx = streamBaseX + bend;
    setTile(map, sx, y, 'agua');
    if (nearBridge) setTile(map, sx + 1, y, 'agua');
  }
  // Clean orthogonal trail from village plaza across the straight wooden bridge to the east gate
  for (let x = plazaX; x <= rect.x1 - 2; x++) {
    setTile(map, x, bridgeY, 'caminho');
    if (x >= streamBaseX && x <= streamBaseX + 1) setTile(map, x, bridgeY - 1, 'caminho');
  }
  const turnX = rect.x0 + 18;
  const stepY = Math.sign(exitGateY - bridgeY);
  if (stepY !== 0) {
    for (let y = bridgeY; y !== exitGateY + stepY; y += stepY) {
      setTile(map, turnX, y, 'caminho');
    }
    for (let x = turnX; x <= rect.x1 - 2; x++) {
      setTile(map, x, exitGateY, 'caminho');
    }
  }

  // Curated tall-grass wild pet glades (east & north-west meadow pockets)
  const glades: [number, number, number][] = [
    [rect.x0 + 16, rect.y0 + 5, 2.3],
    [rect.x0 + 18, rect.y0 + 14, 2.4],
    [rect.x0 + 9, rect.y0 + 6, 1.8],
  ];
  for (const [gx, gy, r] of glades) {
    for (let y = Math.floor(gy - r); y <= Math.ceil(gy + r); y++) {
      for (let x = Math.floor(gx - r); x <= Math.ceil(gx + r); x++) {
        if (x <= rect.x0 + 1 || y <= rect.y0 + 1 || x >= rect.x1 - 1 || y >= rect.y1 - 1) continue;
        if ((x - gx) ** 2 + (y - gy) ** 2 <= r * r && tileAt(map, x, y) === 'grama') {
          setTile(map, x, y, 'matoAlto');
        }
      }
    }
  }

  // A few scenic trees & boulders framing the eastern meadow
  const accents: [number, number][] = [
    [rect.x0 + 15, rect.y0 + 3],
    [rect.x0 + 20, rect.y0 + 4],
    [rect.x0 + 15, rect.y0 + 16],
    [rect.x0 + 20, rect.y0 + 16],
    [rect.x0 + 9, rect.y0 + 12],
  ];
  for (const [ax, ay] of accents) {
    if (tileAt(map, ax, ay) === 'grama') setTile(map, ax, ay, 'arvore');
  }
}

export interface Gate {
  /** Biome on each side and the first walkable tile on that side. */
  a: number;
  b: number;
  inA: Point;
  inB: Point;
}

/** Progressive stage connections: 0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6 (easiest to hardest!). */
const isStageLink = (a: number, b: number) => Math.abs(a - b) === 1;

export function generateWorld(seed: number): WorldMap {
  const rng = createRng(seed * 31 + 7919);
  const width = WORLD_W;
  const height = WORLD_H;
  const biomes = new Array<number>(width * height);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      biomes[y * width + x] = REGION_GRID[Math.floor(y / REGION_H)][Math.floor(x / REGION_W)];
  const map: WorldMap = {
    width,
    height,
    tiles: new Array<Tile>(width * height).fill('grama'),
    biomes,
    loot: {},
    buildings: {},
    doors: {},
    fossils: {},
    wildSpawns: {},
    start: { x: 0, y: 0 },
    portal: { x: 0, y: 0 },
  };
  const rects = regionRects();
  const hubs = rects.map((r) => ({
    x: Math.floor((r.x0 + r.x1) / 2),
    y: Math.floor((r.y0 + r.y1) / 2),
  }));

  // Biome scenery first, so walls and gates drawn afterwards stay clean.
  BIOMES.forEach((b, i) => {
    const big = (rects[i].x1 - rects[i].x0 + 1) / REGION_W;
    blob(rng, map, rects[i], 'matoAlto', Math.round(b.density.patches * big), 2);
    blob(rng, map, rects[i], 'arvore', Math.round(b.density.blockers * big), 1.2);
    blob(rng, map, rects[i], 'agua', Math.round(b.density.liquid * big), 1.5);
  });

  // Outer border and two-tile walls between different biomes.
  for (let x = 0; x < width; x++) {
    setTile(map, x, 0, 'arvore');
    setTile(map, x, height - 1, 'arvore');
  }
  for (let y = 0; y < height; y++) {
    setTile(map, 0, y, 'arvore');
    setTile(map, width - 1, y, 'arvore');
  }
  const gates: Gate[] = [];
  let pradoExitY = rects[0].y0 + 10;
  REGION_GRID.forEach((row, r) =>
    row.forEach((b, c) => {
      // Wall with the cell on the left.
      if (c > 0 && row[c - 1] !== b) {
        const wx = c * REGION_W;
        for (let y = r * REGION_H; y < (r + 1) * REGION_H; y++) {
          setTile(map, wx - 1, y, 'arvore');
          setTile(map, wx, y, 'arvore');
        }
        if (isStageLink(row[c - 1], b)) {
          const gy = r * REGION_H + int(rng, 5, REGION_H - 8);
          if (row[c - 1] === 0 && b === 1) pradoExitY = gy + 1;
          for (let k = 0; k < 3; k++) {
            setTile(map, wx - 1, gy + k, 'caminho');
            setTile(map, wx, gy + k, 'caminho');
          }
          gates.push({
            a: row[c - 1],
            b,
            inA: { x: wx - 2, y: gy + 1 },
            inB: { x: wx + 1, y: gy + 1 },
          });
        }
      }
      // Wall with the cell above.
      if (r > 0 && REGION_GRID[r - 1][c] !== b) {
        const wy = r * REGION_H;
        for (let x = c * REGION_W; x < (c + 1) * REGION_W; x++) {
          setTile(map, x, wy - 1, 'arvore');
          setTile(map, x, wy, 'arvore');
        }
        if (isStageLink(REGION_GRID[r - 1][c], b)) {
          const gx = c * REGION_W + int(rng, 6, REGION_W - 9);
          for (let k = 0; k < 3; k++) {
            setTile(map, gx + k, wy - 1, 'caminho');
            setTile(map, gx + k, wy, 'caminho');
          }
          gates.push({
            a: REGION_GRID[r - 1][c],
            b,
            inA: { x: gx + 1, y: wy - 2 },
            inB: { x: gx + 1, y: wy + 1 },
          });
        }
      }
    })
  );

  // Build the handcrafted starter valley in Biome 1 (Prado das Colinas) aligned with its exit gate!
  buildStarterValley(rng, map, rects[0], pradoExitY);
  map.start = { x: rects[0].x0 + 6, y: rects[0].y0 + 10 };

  // Each region's hub connects to every gate on its side (stages 2..7).
  for (const g of gates) {
    if (g.a !== 0) carvePath(rng, map, hubs[g.a], g.inA);
    if (g.b !== 0) carvePath(rng, map, hubs[g.b], g.inB);
  }
  setTile(map, map.start.x, map.start.y, 'caminho');

  // Unreachable pockets become blockers so nothing is placed where the player cannot go.
  const reach = reachable(map, map.start);
  for (let i = 0; i < map.tiles.length; i++) {
    if (!reach.has(i) && !BLOCKING.has(map.tiles[i])) map.tiles[i] = 'arvore';
  }
  const nearGate = (x: number, y: number) =>
    gates.some((g) => [g.inA, g.inB].some((p) => Math.abs(p.x - x) + Math.abs(p.y - y) < 3));

  BIOMES.forEach((b, bi) => {
    const free = shuffle(
      rng,
      [...reach].filter((i) => {
        const x = i % width;
        const y = Math.floor(i / width);
        const t = map.tiles[i];
        const nearStart = Math.abs(x - map.start.x) + Math.abs(y - map.start.y) < 3;
        return (
          biomes[i] === bi && (t === 'grama' || t === 'caminho') && !nearStart && !nearGate(x, y)
        );
      })
    );
    if (b.id === 'fortaleza') {
      // The boss gate sits in the far corner of the fortress.
      free.sort((i, j) => (i % width) - (i / width) * 0.5 - ((j % width) - (j / width) * 0.5));
      const idx = free.shift() as number;
      map.tiles[idx] = 'portal';
      map.portal = { x: idx % width, y: Math.floor(idx / width) };
      shuffle(rng, free);
    }
    const place = (tile: Tile, n: number) => {
      for (let k = 0; k < n && free.length; k++) {
        const idx = free.pop() as number;
        map.tiles[idx] = tile;
        if (tile === 'cristal') map.loot[idx] = pick(rng, b.elements);
        if (tile === 'selvagem') {
          const level = Math.min(3, 1 + Math.floor(b.tier / 2));
          const element: PetElement = chance(rng, b.neutralChance)
            ? 'neutro'
            : pick(rng, b.elements);
          map.wildSpawns[idx] = { speciesId: pick(rng, b.wild), level, element };
        }
      }
    };
    const big = (rects[bi].x1 - rects[bi].x0 + 1) / REGION_W;
    place('bau', Math.round(2 * big));
    place('cura', 1);
    place('treinador', Math.round((1 + Math.floor(b.tier / 3)) * big));
    place('cristal', Math.round(2 * big));
    // Sparse visible wild Elementa-Mons roaming in the overworld (Legends: Arceus style — only 2-3 per biome!)
    place('selvagem', Math.max(2, Math.round(2 * big)));
  });
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
  biome: number;
}

/**
 * Wild pets and trainers come from the biome: its species, its elements, and a strength that
 * grows with the biome tier. The boss brings three evolved pets of different elements.
 */
export function createEncounter(rng: RngState, kind: EncounterKind, biome: number): Encounter {
  const b = BIOMES[biome];
  const tier = b.tier;
  if (kind === 'chefe') {
    const elements = shuffle(rng, [...BIOMES[BIOMES.length - 1].elements]).slice(0, 3);
    const enemies = elements.map((e) => createPet(pick(rng, b.wild), 3, e));
    return { kind, enemies, enemyPower: 3, biome };
  }
  const half = Math.ceil(tier / 2);
  const count =
    kind === 'treinador'
      ? Math.min(3, 1 + half)
      : int(rng, 1, Math.min(3, 1 + Math.floor(tier / 2)));
  const level = Math.min(3, 1 + (kind === 'treinador' ? half : Math.floor(tier / 2)));
  const element = (): PetElement =>
    kind === 'selvagem' && chance(rng, b.neutralChance) ? 'neutro' : pick(rng, b.elements);
  const enemies = Array.from({ length: count }, () =>
    createPet(pick(rng, b.wild), level, element())
  );
  const enemyPower = Math.floor((tier + (kind === 'treinador' ? 1 : 0)) / 2);
  return { kind, enemies, enemyPower, biome };
}
