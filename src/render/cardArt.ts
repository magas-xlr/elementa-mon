import { getCard, type CardDef } from '../game/data/cards';
import { ELEMENT_INFO, type Element } from '../game/data/elements';

/**
 * Magic: The Gathering-inspired painterly fantasy card illustrations.
 * Each card gets a rich, dramatic, cached 240×140 fantasy illustration (atmospheric
 * landscape/sky, dramatic chiaroscuro lighting, swirling elemental spell centerpiece,
 * and painterly brushwork) — replacing plain emoji icons!
 */

const cache = new Map<string, string>();

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

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const PALETTES: Record<Element | 'neutro', [string, string, string, string]> = {
  fogo: ['#240a08', '#8f2412', '#ff7b24', '#fff0a8'],
  agua: ['#081a30', '#16528e', '#46b8f2', '#dff8ff'],
  eletrico: ['#161430', '#383078', '#f4c834', '#fffbe0'],
  terra: ['#1c1610', '#5c4228', '#a67d46', '#f0dbb2'],
  gelo: ['#0e2236', '#2c6896', '#86d8f8', '#f2fdff'],
  venenoso: ['#160c22', '#421e5c', '#72d852', '#d8ff9e'],
  psiquico: ['#1c0c2e', '#62268a', '#e868d8', '#ffdcf8'],
  fantasma: ['#0c0a18', '#2a2052', '#8268f0', '#dfd6ff'],
  fada: ['#261428', '#8c3b76', '#ff8ec8', '#fff0f8'],
  neutro: ['#1c2432', '#44586e', '#d6b46c', '#fff6dc'],
};

/** Generates and caches a Magic: The Gathering-style fantasy illustration for a card. */
export function cardArtwork(card: CardDef | string): string {
  const c = typeof card === 'string' ? getCard(card) : card;
  const hit = cache.get(c.id);
  if (hit) return hit;

  const w = 240;
  const h = 136;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const rand = rng(hashStr(c.id));
  const [dark, mid, bright, glow] = PALETTES[c.element];
  const cx = w * (0.45 + rand() * 0.12);
  const cy = h * (0.46 + rand() * 0.1);

  // 1. Dramatic MTG atmospheric sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, dark);
  sky.addColorStop(0.58, mid);
  sky.addColorStop(1, dark);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // 2. Radiant focal backlight (chiaroscuro drama)
  const rad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 98);
  rad.addColorStop(0, glow);
  rad.addColorStop(0.32, bright);
  rad.addColorStop(0.72, 'rgba(0,0,0,0)');
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, w, h);

  // 3. Distant silhouetted fantasy mountain ridges / spires
  ctx.fillStyle = dark;
  ctx.globalAlpha = 0.72;
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 20) {
    const ridge = h * 0.72 + Math.sin(x * 0.03 + rand() * 0.6) * 18 - (x > 80 && x < 160 ? 12 : 0);
    ctx.lineTo(x, ridge);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // 4. Bespoke spell / creature focal painting based on card effect & kind
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (c.kind === 'invocacao') {
    // Towering ancient elemental titan / golem silhouette with glowing runic core
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.moveTo(cx - 42, h);
    ctx.lineTo(cx - 34, cy - 10);
    ctx.lineTo(cx - 18, cy - 36);
    ctx.lineTo(cx + 18, cy - 36);
    ctx.lineTo(cx + 34, cy - 10);
    ctx.lineTo(cx + 42, h);
    ctx.closePath();
    ctx.fill();
    // Glowing runes & eyes
    ctx.strokeStyle = glow;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx - 7, cy - 26, 3.5, 0, Math.PI * 2);
    ctx.arc(cx + 7, cy - 26, 3.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (c.effect.kind === 'escudo') {
    // Radiant paladin aegis barrier with sacred geometric runes
    ctx.strokeStyle = glow;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 42);
    ctx.lineTo(cx + 34, cy - 22);
    ctx.quadraticCurveTo(cx + 32, cy + 20, cx, cy + 44);
    ctx.quadraticCurveTo(cx - 32, cy + 20, cx - 34, cy - 22);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 250, 232, 0.16)';
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = bright;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.stroke();
  } else if (c.effect.kind === 'cura') {
    // Sunlit sacred fountain / healing light beam with rising golden motes
    const beam = ctx.createLinearGradient(cx, 0, cx, h);
    beam.addColorStop(0, glow);
    beam.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = beam;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(cx - 24, 0, 48, h);
    ctx.globalAlpha = 1;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(a) * 26, cy + Math.sin(a) * 18, 9, 4, a, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (c.effect.kind === 'fortalecer' || c.effect.kind === 'comprar') {
    // Swirling arcane astrolabe / focus rings
    for (let r = 18; r <= 48; r += 14) {
      ctx.strokeStyle = r === 32 ? glow : bright;
      ctx.lineWidth = r === 32 ? 3 : 1.8;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 1.2, r * 0.72, r * 0.04 - 0.3, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else {
    // Dramatic MTG offensive spell vortex / elemental strike
    for (let i = 0; i < 7; i++) {
      const a0 = (i / 7) * Math.PI * 2 + rand() * 0.4;
      const r = 18 + i * 7;
      ctx.strokeStyle = i % 2 === 0 ? glow : bright;
      ctx.lineWidth = 2.5 + (i % 3) * 1.6;
      ctx.beginPath();
      ctx.arc(cx, cy, r, a0, a0 + 1.5);
      ctx.stroke();
    }
    // Luminous spell core
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 11, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Painterly ember/sparkle flecks & subtle vignette framing
  for (let i = 0; i < 18; i++) {
    const px = rand() * w;
    const py = rand() * h;
    const pr = 1 + rand() * 2.5;
    ctx.fillStyle = i % 2 ? glow : bright;
    ctx.globalAlpha = 0.45 + rand() * 0.5;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Subtle corner vignette for classic MTG oil-painting depth
  const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, w * 0.65);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(12, 10, 20, 0.52)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  // Subtle elemental watermark glow in corner
  if (c.element !== 'neutro') {
    ctx.font = '14px sans-serif';
    ctx.globalAlpha = 0.78;
    ctx.fillText(ELEMENT_INFO[c.element].icon, w - 22, h - 8);
  }
  ctx.restore();

  const url = canvas.toDataURL('image/webp', 0.85);
  cache.set(c.id, url);
  return url;
}
