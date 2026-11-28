import { CanvasTexture, Color, RepeatWrapping, SRGBColorSpace } from 'three';

/**
 * Procedural watercolor ground textures (grass, path, water, stone, river bed), painted from
 * the biome colors with a seeded RNG, so there are still no image files to ship. Each one is a
 * soft wash (seamless fbm), wet edges where pigment pooled, granulation and paper grain, then
 * a few translucent brush marks (tufts, pebbles, ripples, joints) glazed on top.
 */

/** Texture pixels per world tile. */
export const TILE_PX = 64;

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seamless value noise: `period` lattice cells across 0..1, wrapping at the edges. */
function periodicNoise(seed: number, period: number) {
  const rand = rng(seed);
  const grid = Float32Array.from({ length: period * period }, rand);
  const at = (i: number, j: number) => grid[(j % period) * period + (i % period)];
  return (u: number, v: number) => {
    const x = u * period;
    const y = v * period;
    const i = Math.floor(x);
    const j = Math.floor(y);
    let fx = x - i;
    let fy = y - j;
    fx = fx * fx * (3 - 2 * fx);
    fy = fy * fy * (3 - 2 * fy);
    const a = at(i, j) + (at(i + 1, j) - at(i, j)) * fx;
    const b = at(i, j + 1) + (at(i + 1, j + 1) - at(i, j + 1)) * fx;
    return a + (b - a) * fy;
  };
}

/** Seamless fbm in 0..1 (3 octaves), `base` cells for the widest one. */
function fbm(seed: number, base: number) {
  const o = [
    periodicNoise(seed, base),
    periodicNoise(seed + 1, base * 2),
    periodicNoise(seed + 2, base * 4),
  ];
  return (u: number, v: number) => 0.55 * o[0](u, v) + 0.3 * o[1](u, v) + 0.15 * o[2](u, v);
}

type Rgb = [number, number, number];

/** Pigment on paper: a bit less saturated and a touch warmer than the raw biome color. */
function pigment(hex: number): Rgb {
  const c = new Color(hex);
  const l = c.r * 0.299 + c.g * 0.587 + c.b * 0.114;
  const sat = 0.82;
  // Thin, transparent wash: the white paper shows through and lifts the value.
  const paper = 0.16;
  return [
    (l + (c.r - l) * sat) * 1.06 * (1 - paper) + paper * 0.98,
    (l + (c.g - l) * sat) * 1.06 * (1 - paper) + paper * 0.95,
    (l + (c.b - l) * sat) * 1.06 * (1 - paper) + paper * 0.88,
  ];
}

interface Wash {
  /** Pigment color. */
  color: number;
  /** How much the wash darkens/lightens across the blotches (0..1). */
  depth: number;
  /** Widest blotch count across the texture. */
  scale: number;
  /** Optional per-pixel color tweak (stripes, slabs), gets u, v and returns a multiplier. */
  tone?: (u: number, v: number) => number;
}

interface Brush {
  ctx: CanvasRenderingContext2D;
  size: number;
  rand: () => number;
  /** Draws `fn` 9 times (wrapped copies) so marks near an edge continue on the other side. */
  wrap(fn: () => void): void;
}

/**
 * Builds a seamless watercolor texture covering `tiles` × `tiles` world tiles: the wash first
 * (per pixel), then `marks` glazes translucent brush strokes over it.
 */
function paint(tiles: number, seed: number, wash: Wash, marks?: (b: Brush) => void): CanvasTexture {
  const size = TILE_PX * tiles;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const img = ctx.createImageData(size, size);
  const blot = fbm(seed, wash.scale);
  const hue = fbm(seed + 7, wash.scale + 1);
  const gran = periodicNoise(seed + 13, size / 4);
  const paper = periodicNoise(seed + 17, size / 2);
  const base = pigment(wash.color);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const f = blot(u, v);
      // Wet edge: pigment pools a little darker where the wash dried along a blotch border.
      const edge = 1 - Math.min(1, Math.abs(f - 0.5) / 0.035);
      let k = 1 + (0.5 - f) * wash.depth * 1.6 - edge * 0.06;
      k *= 0.97 + 0.06 * gran(u, v); // granulation
      k *= wash.tone ? wash.tone(u, v) : 1;
      // Warm in the light patches, cool lilac in the deeper ones.
      const h = hue(u, v) - 0.5;
      const p = 0.965 + 0.05 * paper(u, v); // paper grain
      const i = (y * size + x) * 4;
      img.data[i] = Math.min(255, base[0] * k * (1 + h * 0.08) * p * 255);
      img.data[i + 1] = Math.min(255, base[1] * k * p * 255);
      img.data[i + 2] = Math.min(255, base[2] * k * (1 - h * 0.1) * p * 255);
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  if (marks) {
    const rand = rng(seed * 31 + 5);
    marks({
      ctx,
      size,
      rand,
      wrap(fn) {
        for (const dy of [-size, 0, size])
          for (const dx of [-size, 0, size]) {
            ctx.save();
            ctx.translate(dx, dy);
            fn();
            ctx.restore();
          }
      },
    });
  }
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  // Ground UVs are world coordinates: one texture covers `tiles` × `tiles` tiles.
  tex.repeat.set(1 / tiles, 1 / tiles);
  return tex;
}

const css = (hex: number, k: number, a: number) => {
  const [r, g, b] = pigment(hex).map((c) => Math.round(Math.min(1, c * k) * 255));
  return `rgba(${r},${g},${b},${a})`;
};

/** Little brushed grass tufts: two or three thin curved strokes from one root. */
function tufts(b: Brush, color: number, count: number, darkness = 0.72) {
  const { ctx, size, rand } = b;
  ctx.lineCap = 'round';
  for (let n = 0; n < count; n++) {
    const x = rand() * size;
    const y = rand() * size;
    const h = size * (0.04 + rand() * 0.04);
    const light = rand() < 0.3;
    const style = light ? css(color, 1.2, 0.5) : css(color, darkness, 0.45 + rand() * 0.2);
    const blades = 2 + Math.floor(rand() * 2);
    const lean = (rand() - 0.5) * 0.6;
    b.wrap(() => {
      ctx.strokeStyle = style;
      ctx.lineWidth = size * 0.01;
      for (let i = 0; i < blades; i++) {
        const s = (i - (blades - 1) / 2) * 0.55 + lean;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + s * h * 0.3, y - h * 0.6, x + s * h * 0.7, y - h);
        ctx.stroke();
      }
    });
  }
}

/** Soft round dabs (pebbles, lily spots, specks): a pale body and a darker pooled rim. */
function dabs(b: Brush, color: number, count: number, radius: number, k = 0.8) {
  const { ctx, size, rand } = b;
  for (let n = 0; n < count; n++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = size * radius * (0.6 + rand() * 0.8);
    const sx = 1 + rand() * 0.6;
    b.wrap(() => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(sx, 1);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = css(color, k, 0.22);
      ctx.fill();
      ctx.lineWidth = r * 0.25;
      ctx.strokeStyle = css(color, k * 0.85, 0.2);
      ctx.stroke();
      ctx.restore();
    });
  }
}

export function grassTexture(color: number): CanvasTexture {
  return paint(2, 11, { color, depth: 0.18, scale: 3 }, (b) => tufts(b, color, 40));
}

export function pathTexture(color: number): CanvasTexture {
  // Authentic warm painted sand & packed earth: organic soil wash, subtle sand ripples,
  // warm earthy speckles and scattered river pebbles.
  return paint(2, 23, { color, depth: 0.24, scale: 3 }, (b) => {
    const { ctx, size, rand } = b;
    // Soft wind-blown sand / dirt ripples
    ctx.lineCap = 'round';
    for (let n = 0; n < 18; n++) {
      const x = rand() * size;
      const y = rand() * size;
      const w = size * (0.1 + rand() * 0.14);
      const light = n % 2 === 0;
      b.wrap(() => {
        ctx.strokeStyle = light ? css(color, 1.18, 0.28) : css(color, 0.72, 0.24);
        ctx.lineWidth = size * (0.012 + rand() * 0.01);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + w * 0.5, y + (rand() - 0.5) * size * 0.04, x + w, y + size * 0.01);
        ctx.stroke();
      });
    }
    // Warm earth clods & sunlit quartz sand grains
    dabs(b, color, 26, 0.014, 0.74);
    dabs(b, color, 22, 0.01, 1.18);
    // Tiny scattered pebbles
    for (let n = 0; n < 28; n++) {
      const x = rand() * size;
      const y = rand() * size;
      const r = size * (0.005 + rand() * 0.009);
      b.wrap(() => {
        ctx.fillStyle = n % 3 === 0 ? css(0x8a7558, 0.85, 0.55) : css(color, 0.62, 0.45);
        ctx.beginPath();
        ctx.ellipse(x, y, r * 1.3, r, rand() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  });
}

const grassSpriteCache = new Map<string, CanvasTexture>();

/**
 * Hand-brushed 128×128 anime watercolor tall-grass sprite (transparent background) —
 * lush curved grass blades with sunlit tips and tiny wildflowers, replacing 3D cones!
 */
export function grassSpriteTexture(biomeId: string): CanvasTexture {
  const hit = grassSpriteCache.get(biomeId);
  if (hit) return hit;
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  const palettes: Record<string, [string, string, string, string]> = {
    prado: ['#2f7d42', '#49a84c', '#82d462', '#ffe066'],
    ruinas: ['#a83e24', '#de6b2c', '#ffb04a', '#ffe494'],
    molas: ['#3b8f54', '#63c46c', '#9be67c', '#ff7eb8'],
    labirinto: ['#296b5c', '#459c84', '#7fd4b8', '#c8fff0'],
    cidade: ['#3b3f7a', '#6b68c4', '#9a8eff', '#7af2ff'],
    sucata: ['#5c6138', '#80874a', '#aab068', '#f2c62f'],
    fortaleza: ['#7fa2c8', '#a8c6e8', '#e6f2ff', '#fff4c2'],
  };
  const [dark, mid, light, flower] = palettes[biomeId] ?? palettes.prado;

  ctx.lineCap = 'round';
  const blades = [
    [22, 122, 12, 62, 7, dark],
    [34, 122, 22, 44, 8, mid],
    [48, 122, 36, 28, 9, dark],
    [60, 122, 56, 22, 9, mid],
    [72, 122, 78, 26, 9, dark],
    [86, 122, 98, 40, 8, mid],
    [102, 122, 114, 58, 7, dark],
    [42, 122, 30, 50, 6, light],
    [64, 122, 68, 36, 7, light],
    [82, 122, 96, 52, 6, light],
  ] as const;

  for (const [bx, by, tx, ty, lw, col] of blades) {
    // Soft plum anime ink outline behind each blade
    ctx.strokeStyle = 'rgba(69, 51, 74, 0.55)';
    ctx.lineWidth = lw + 3;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo((bx + tx) * 0.5, (by + ty) * 0.5 - 8, tx, ty);
    ctx.stroke();

    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo((bx + tx) * 0.5, (by + ty) * 0.5 - 8, tx, ty);
    ctx.stroke();
  }

  // Tiny painted flower/dew accents tucked into the blades
  for (const [fx, fy, r] of [
    [32, 64, 5],
    [88, 56, 4.5],
    [62, 76, 4],
  ]) {
    ctx.fillStyle = flower;
    ctx.beginPath();
    ctx.arc(fx, fy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(fx - 1, fy - 1, r * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  grassSpriteCache.set(biomeId, tex);
  return tex;
}

/** Moving-liquid wash (water, lava, sludge, clouds) in any color: soft wavy light ripples. */
export function liquidTexture(color: number): CanvasTexture {
  return paint(2, 37 + (color % 97), { color, depth: 0.25, scale: 2 }, (b) => {
    const { ctx, size, rand } = b;
    ctx.lineCap = 'round';
    for (let n = 0; n < 16; n++) {
      const x = rand() * size;
      const y = rand() * size;
      const w = size * (0.08 + rand() * 0.12);
      const light = n % 3 !== 0;
      b.wrap(() => {
        ctx.strokeStyle = light ? 'rgba(255,255,255,0.32)' : css(color, 0.75, 0.22);
        ctx.lineWidth = size * (light ? 0.008 : 0.01);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.bezierCurveTo(x + w * 0.3, y - size * 0.012, x + w * 0.6, y + size * 0.012, x + w, y);
        ctx.stroke();
      });
    }
  });
}

export const waterTexture = (): CanvasTexture => liquidTexture(0x3b8ee8);

export function bedTexture(): CanvasTexture {
  return paint(1, 41, { color: 0x7a6a4a, depth: 0.3, scale: 2 }, (b) =>
    dabs(b, 0x7a6a4a, 6, 0.03, 0.8)
  );
}

/** Paved slabs (marble, flagstones, asphalt, metal plates): each slab its own wash, soft joints. */
export function stoneTexture(color: number): CanvasTexture {
  const slab = (u: number, v: number) => {
    const row = Math.floor(v * 4);
    const col = Math.floor(u * 2 + (row % 2) * 0.5);
    const r = rng(row * 7 + col * 13 + 3)();
    return 0.94 + r * 0.1;
  };
  return paint(2, 53, { color, depth: 0.14, scale: 3, tone: slab }, (b) => {
    const { ctx, size } = b;
    ctx.lineCap = 'round';
    ctx.strokeStyle = css(color, 0.7, 0.4);
    ctx.lineWidth = size * 0.012;
    const rowH = size / 4;
    for (let row = 0; row < 4; row++) {
      const y = row * rowH;
      b.wrap(() => {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y + size * 0.004);
        ctx.stroke();
        for (let k = 0; k < 2; k++) {
          const x = ((k + (row % 2) * 0.5) * size) / 2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + size * 0.004, y + rowH);
          ctx.stroke();
        }
      });
    }
    dabs(b, color, 8, 0.006, 0.8);
  });
}

/** Mowed lawn: soft alternating stripes one tile wide, with brushed tufts. */
export function lawnTexture(color: number): CanvasTexture {
  const stripe = (u: number) => 1 + 0.06 * Math.cos(u * Math.PI * 4);
  return paint(2, 61, { color, depth: 0.15, scale: 3, tone: stripe }, (b) =>
    tufts(b, color, 22, 0.76)
  );
}

/** Horizon tone of a painted sky: the sky color thinned out over warm paper (for the fog). */
export const skyHorizon = (sky: number): number =>
  new Color(sky).lerp(new Color(0xfaf1e2), 0.4).getHex();

/**
 * Painted sky for a scene background: a graded wash from the sky color at the top to a pale
 * warm horizon, with soft cloud blooms (white tops, lilac undersides) and paper grain.
 */
export function skyTexture(sky: number, seed = 5): CanvasTexture {
  const w = 256;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const img = ctx.createImageData(w, h);
  const top = pigment(sky).map((c) => c * 0.92);
  const hor = pigment(skyHorizon(sky));
  const blot = fbm(seed, 3);
  const paper = periodicNoise(seed + 3, 128);
  for (let y = 0; y < h; y++) {
    const t = Math.pow(y / h, 1.4);
    for (let x = 0; x < w; x++) {
      const k = (0.94 + 0.12 * blot(x / w, y / h)) * (0.975 + 0.04 * paper(x / w, y / h));
      const i = (y * w + x) * 4;
      for (let c = 0; c < 3; c++)
        img.data[i + c] = Math.min(255, (top[c] + (hor[c] - top[c]) * t) * k * 255);
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  // Cloud blooms: a few overlapping soft puffs per cloud, in the upper two thirds.
  const rand = rng(seed * 17 + 1);
  const under = `rgba(${Math.round(top[0] * 200)},${Math.round(top[1] * 190)},${Math.round(Math.min(1, top[2] * 1.1) * 255)},0.18)`;
  for (let n = 0; n < 6; n++) {
    const cx = rand() * w;
    const cy = h * (0.12 + rand() * 0.45);
    const s = w * (0.06 + rand() * 0.06);
    for (let p = 0; p < 5; p++) {
      const px = cx + (p - 2) * s * 0.7 + (rand() - 0.5) * s * 0.4;
      const py = cy - Math.sin((p / 4) * Math.PI) * s * 0.5;
      const r = s * (0.6 + rand() * 0.5);
      for (const [dy, fill] of [
        [r * 0.25, under],
        [0, 'rgba(255,253,248,0.42)'],
      ] as const) {
        const g = ctx.createRadialGradient(px, py + dy, 0, px, py + dy, r);
        g.addColorStop(0, fill);
        g.addColorStop(0.7, fill);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(px, py + dy, r * 1.4, r, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}
