import {
  CanvasTexture,
  Color,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  Vector3,
  type Camera,
  type Scene,
} from 'three';
import type { Element } from '../game/data/elements';

/**
 * Hand-crafted frame-by-frame anime watercolor VFX sprites (8 frames per animation,
 * baked onto crisp 2D canvas frames at 12–16 fps like traditional 2D sakuga animation).
 * Lightweight: each effect is a single textured quad (2 triangles) cycling through frames!
 */

export type VfxKind = 'slash' | 'fire' | 'water' | 'spark' | 'heal' | 'heart' | 'burst';

const FRAME_SIZE = 128;
const FRAME_COUNT = 8;

const sheetCache = new Map<string, CanvasTexture[]>();

function hexCss(color: number, alpha = 1): string {
  const c = new Color(color);
  return `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${alpha})`;
}

/** Paints one frame (0..FRAME_COUNT-1) of a traditional anime 2D effect onto a 128×128 canvas. */
function paintFrame(kind: VfxKind, frame: number, colorHex: number): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = FRAME_SIZE;
  canvas.height = FRAME_SIZE;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const t = frame / (FRAME_COUNT - 1); // 0 -> 1
  const cx = FRAME_SIZE / 2;
  const cy = FRAME_SIZE / 2;
  const fade = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (kind === 'slash') {
    // Classic anime curved brushstroke slash arc + ink rim + impact sparks
    const startA = -Math.PI * 0.75 + t * 0.4;
    const endA = startA + Math.PI * (0.25 + Math.sin(t * Math.PI) * 0.95);
    const r = 32 + t * 18;
    // Outer watercolor wash glow
    ctx.strokeStyle = hexCss(colorHex, 0.55 * fade);
    ctx.lineWidth = (18 - t * 10) * fade;
    ctx.beginPath();
    ctx.arc(cx, cy, r, startA, endA);
    ctx.stroke();
    // Bright white anime core stroke
    ctx.strokeStyle = `rgba(255, 252, 240, ${0.95 * fade})`;
    ctx.lineWidth = Math.max(2, (8 - t * 5) * fade);
    ctx.beginPath();
    ctx.arc(cx, cy, r, startA + 0.08, endA - 0.05);
    ctx.stroke();
    // 4-point impact star at tip
    if (t > 0.15 && t < 0.85) {
      const sx = cx + Math.cos(endA) * r;
      const sy = cy + Math.sin(endA) * r;
      const sr = 12 * Math.sin(t * Math.PI);
      ctx.fillStyle = `rgba(255, 255, 245, ${0.9 * fade})`;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const rad = i % 2 === 0 ? sr : sr * 0.28;
        if (i === 0) ctx.moveTo(sx + Math.cos(a) * rad, sy + Math.sin(a) * rad);
        else ctx.lineTo(sx + Math.cos(a) * rad, sy + Math.sin(a) * rad);
      }
      ctx.closePath();
      ctx.fill();
    }
  } else if (kind === 'fire') {
    // Rising anime cel-shaded flame tongues + floating embers
    const tongues = 5;
    for (let i = 0; i < tongues; i++) {
      const a = (i / tongues) * Math.PI * 2 + t * 0.6;
      const dist = 8 + t * 34;
      const px = cx + Math.cos(a) * dist * 0.7;
      const py = cy + Math.sin(a) * dist * 0.5 - t * 24;
      const rad = (18 - t * 11) * (0.8 + (i % 2) * 0.35);
      if (rad <= 1) continue;
      ctx.fillStyle = hexCss(colorHex, 0.85 * fade);
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 244, 170, ${0.9 * fade})`;
      ctx.beginPath();
      ctx.arc(px, py + rad * 0.15, rad * 0.52, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 'water') {
    // Expanding painted water ripple ring + splashing anime droplets
    const r = 14 + t * 44;
    ctx.strokeStyle = hexCss(colorHex, 0.8 * fade);
    ctx.lineWidth = Math.max(2, 7 * (1 - t));
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.3;
      const d = 14 + t * 46;
      const dx = cx + Math.cos(a) * d;
      const dy = cy + Math.sin(a) * d - Math.sin(t * Math.PI) * 14;
      ctx.fillStyle = i % 2 ? hexCss(colorHex, 0.9 * fade) : `rgba(235, 250, 255, ${0.95 * fade})`;
      ctx.beginPath();
      ctx.ellipse(dx, dy, 6 * fade, 9 * fade, a + Math.PI / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 'spark') {
    // Jagged anime lightning bolts + electric halo
    ctx.strokeStyle = hexCss(colorHex, 0.95 * fade);
    ctx.lineWidth = 4.5 * fade;
    for (let b = 0; b < 4; b++) {
      const baseA = (b / 4) * Math.PI * 2 + frame * 0.7;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      for (let s = 1; s <= 3; s++) {
        const d = (s / 3) * (24 + t * 34);
        const jag = (s % 2 ? 1 : -1) * 10 * (1 - t * 0.4);
        ctx.lineTo(
          cx + Math.cos(baseA) * d - Math.sin(baseA) * jag,
          cy + Math.sin(baseA) * d + Math.cos(baseA) * jag
        );
      }
      ctx.stroke();
    }
    ctx.fillStyle = `rgba(255, 255, 230, ${0.9 * fade})`;
    ctx.beginPath();
    ctx.arc(cx, cy, 12 * (1 - t * 0.6), 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'heal') {
    // Rising golden-emerald anime sparkles & gentle halo ring
    ctx.strokeStyle = hexCss(colorHex, 0.55 * fade);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy + 12 - t * 24, 18 + t * 26, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + t * 1.4;
      const sx = cx + Math.cos(a) * (22 + t * 18);
      const sy = cy + 18 - t * 44 + Math.sin(a) * 10;
      const sr = 8 * Math.sin(Math.min(1, t * 1.2) * Math.PI);
      ctx.fillStyle = i % 2 ? `rgba(255, 252, 210, ${0.95 * fade})` : hexCss(colorHex, 0.9 * fade);
      ctx.beginPath();
      for (let k = 0; k < 8; k++) {
        const ka = (k / 8) * Math.PI * 2;
        const rad = k % 2 === 0 ? sr : sr * 0.3;
        if (k === 0) ctx.moveTo(sx + Math.cos(ka) * rad, sy + Math.sin(ka) * rad);
        else ctx.lineTo(sx + Math.cos(ka) * rad, sy + Math.sin(ka) * rad);
      }
      ctx.closePath();
      ctx.fill();
    }
  } else if (kind === 'heart') {
    // Cute bouncing watercolor hearts when petting wild monsters!
    for (let i = 0; i < 3; i++) {
      const ox = (i - 1) * (16 + t * 18);
      const oy = 18 - t * 46 - (i === 1 ? 10 : 0);
      const s = (10 + (i === 1 ? 4 : 0)) * Math.sin(Math.min(1, t * 1.15) * Math.PI);
      if (s <= 0.5) continue;
      ctx.save();
      ctx.translate(cx + ox, cy + oy);
      ctx.fillStyle =
        i === 1 ? `rgba(255, 118, 178, ${0.95 * fade})` : `rgba(255, 178, 212, ${0.9 * fade})`;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.45);
      ctx.bezierCurveTo(-s * 1.1, -s * 0.25, -s * 0.6, -s * 1.1, 0, -s * 0.35);
      ctx.bezierCurveTo(s * 0.6, -s * 1.1, s * 1.1, -s * 0.25, 0, s * 0.45);
      ctx.fill();
      ctx.restore();
    }
  } else {
    // Classic anime watercolor impact burst (radial brushstrokes + ink ring)
    const r = 12 + t * 42;
    ctx.strokeStyle = hexCss(colorHex, 0.75 * fade);
    ctx.lineWidth = Math.max(2, 8 * (1 - t));
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r0 = 8 + t * 24;
      const r1 = 22 + t * 38;
      ctx.strokeStyle = i % 2 ? `rgba(255, 252, 240, ${0.9 * fade})` : hexCss(colorHex, 0.9 * fade);
      ctx.lineWidth = 4.5 * fade;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.stroke();
    }
  }

  ctx.restore();
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function framesFor(kind: VfxKind, colorHex: number): CanvasTexture[] {
  const key = `${kind}:${colorHex}`;
  let list = sheetCache.get(key);
  if (!list) {
    list = Array.from({ length: FRAME_COUNT }, (_, f) => paintFrame(kind, f, colorHex));
    sheetCache.set(key, list);
  }
  return list;
}

export function vfxKindForElement(element: Element | 'neutro'): VfxKind {
  switch (element) {
    case 'fogo':
      return 'fire';
    case 'agua':
    case 'gelo':
      return 'water';
    case 'eletrico':
      return 'spark';
    case 'fada':
    case 'psiquico':
      return 'heal';
    case 'neutro':
      return 'slash';
    default:
      return 'burst';
  }
}

interface ActiveVfx {
  mesh: Mesh;
  mat: MeshBasicMaterial;
  frames: CanvasTexture[];
  elapsed: number;
  duration: number;
}

const quadGeo = new PlaneGeometry(1.75, 1.75);

/** Manages lightweight 2D frame-by-frame anime VFX quads inside a Three.js scene. */
export class FrameVfxManager {
  private active: ActiveVfx[] = [];
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  spawn(kind: VfxKind, at: Vector3, colorHex: number, scale = 1, duration = 0.48): void {
    const frames = framesFor(kind, colorHex);
    const mat = new MeshBasicMaterial({
      map: frames[0],
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
    const mesh = new Mesh(quadGeo, mat);
    mesh.position.copy(at).add(new Vector3(0, 0.72, 0.15));
    mesh.scale.setScalar(scale);
    mesh.renderOrder = 10;
    this.scene.add(mesh);
    this.active.push({ mesh, mat, frames, elapsed: 0, duration });
  }

  update(dt: number, camera: Camera): void {
    this.active = this.active.filter((v) => {
      v.elapsed += dt;
      const idx = Math.floor((v.elapsed / v.duration) * v.frames.length);
      if (idx >= v.frames.length) {
        this.scene.remove(v.mesh);
        v.mat.dispose();
        return false;
      }
      v.mat.map = v.frames[idx];
      v.mesh.quaternion.copy(camera.quaternion);
      return true;
    });
  }
}
