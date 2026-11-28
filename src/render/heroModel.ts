import {
  BufferAttribute,
  CanvasTexture,
  CapsuleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  RepeatWrapping,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  type BufferGeometry,
} from 'three';
import { addOutline, toon } from './toon';
import { blobShadow, merge, part } from './models';

export type HeroExpression = 'normal' | 'blink' | 'talk' | 'startled';
export type HeroAction = 'attack' | 'hit' | 'startled' | 'celebrate' | 'pickup';

export interface HeroModel {
  root: Group;
  update(dt: number, time: number, walking: boolean): void;
  setColors(bodyColor: number, hatColor: number): void;
  setExpression(expr: HeroExpression): void;
  playAction(action: HeroAction): void;
  dispose(): void;
}

const sph = (r: number, w = 16, h = 12) => new SphereGeometry(r, w, h);
const cap = (r: number, len: number) => new CapsuleGeometry(r, len, 6, 12);
const cyl = (rt: number, rb: number, h: number, seg = 14) => new CylinderGeometry(rt, rb, h, seg);
const cone = (r: number, h: number, seg = 10) => new ConeGeometry(r, h, seg);

const mixHex = (a: number, b: number, k: number) => new Color(a).lerp(new Color(b), k).getHex();

/**
 * Deforms a sphere into Image 4's exact feminine anime face shape:
 * smooth rounded cheeks tapering gently into a soft, balanced chin (never too long or pointy).
 * Applied identically to the head and facePatch so eyes & smile sit seamlessly on the surface.
 */
function sculptAnimeHeadGeo(geo: SphereGeometry, radius: number): SphereGeometry {
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    const ny = y / radius; // -1 (chin) .. +1 (top)
    const nz = z / radius; // +1 (front) .. -1 (back)

    if (ny < 0.05) {
      const t = Math.min(1, (0.05 - ny) / 1.05);
      // Soft feminine jawline taper matching Image 4's cheek-to-chin curve
      const jawTaper = 1 - Math.pow(t, 1.45) * 0.28;
      x *= jawTaper;
      // Gently shorten bottom chin so face proportions feel natural & balanced
      y *= 0.94;
      if (nz > -0.1) {
        const front = Math.max(0, nz);
        z += Math.pow(t, 1.55) * front * 0.016;
      }
      z *= 1 - t * 0.04;
    } else {
      x *= 0.98;
      z *= 0.96;
    }
    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

/** Sculpted wavy wide-brimmed floppy explorer hat brim matching Image 4. */
function floppyHatBrimGeo(): BufferGeometry {
  const geo = new CylinderGeometry(0.185, 0.375, 0.024, 28, 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    let y = pos.getY(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    const ang = Math.atan2(z, x);
    if (r > 0.21) {
      const k = (r - 0.21) / 0.165;
      // Gentle organic droop + subtle cloth waviness around brim edge
      y -= k * k * 0.032;
      y += Math.sin(ang * 3 + 0.7) * 0.009 * k;
    }
    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

/** Generates seamless cylindrical cloth UVs (vertical pleats & hem band align cleanly!). */
function addClothUvs(geo: BufferGeometry, minY: number, maxY: number): BufferGeometry {
  const pos = geo.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  const span = Math.max(0.01, maxY - minY);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    uvs[i * 2] = Math.atan2(x, z) / (Math.PI * 2) + 0.5;
    uvs[i * 2 + 1] = Math.max(0, Math.min(1, (y - minY) / span));
  }
  geo.setAttribute('uv', new BufferAttribute(uvs, 2));
  return geo;
}

const faceTexCache: Partial<Record<HeroExpression, CanvasTexture>> = {};

let heroClothTex: CanvasTexture | null = null;

/**
 * Hand-painted watercolor linen & gold-embroidered cloth texture for the protagonist's outfit!
 * Multiplies cleanly with vertexColors so every outfit color keeps its charm while gaining
 * tactile woven fabric grain, pleated drape shading, and stitched filigree trim.
 */
function heroClothTexture(): CanvasTexture {
  if (heroClothTex) return heroClothTex;
  const s = 256;
  const c = document.createElement('canvas');
  c.width = s;
  c.height = s;
  const ctx = c.getContext('2d') as CanvasRenderingContext2D;

  // Warm off-white watercolor base so vertex colors shine cleanly
  const bg = ctx.createLinearGradient(0, 0, 0, s);
  bg.addColorStop(0, '#ffffff');
  bg.addColorStop(0.55, '#faf6ef');
  bg.addColorStop(1, '#ebe2d4');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, s, s);

  // Fine woven linen cross-hatch texture
  ctx.strokeStyle = 'rgba(72, 48, 34, 0.085)';
  ctx.lineWidth = 1;
  for (let i = 0; i < s; i += 6) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(s, i);
    ctx.stroke();
  }

  // Soft vertical cloth pleats / painterly brushstroke shadows
  for (let i = 0; i < s; i += 24) {
    const g = ctx.createLinearGradient(i, 0, i + 14, 0);
    g.addColorStop(0, 'rgba(42, 26, 20, 0.09)');
    g.addColorStop(0.5, 'rgba(255, 250, 240, 0.06)');
    g.addColorStop(1, 'rgba(42, 26, 20, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(i, 0, 14, s);
  }

  // Subtle botanical diamond embroidery motif across fabric
  ctx.strokeStyle = 'rgba(220, 185, 110, 0.18)';
  ctx.lineWidth = 1.5;
  for (let y = 16; y < s - 32; y += 32) {
    for (let x = 16; x < s; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, y - 7);
      ctx.lineTo(x + 7, y);
      ctx.lineTo(x, y + 7);
      ctx.lineTo(x - 7, y);
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Gold-cream stitched ornamental hem band near bottom of cloth
  ctx.fillStyle = 'rgba(246, 224, 162, 0.34)';
  ctx.fillRect(0, s - 26, s, 14);
  ctx.strokeStyle = 'rgba(130, 88, 32, 0.28)';
  ctx.lineWidth = 1.6;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(0, s - 26);
  ctx.lineTo(s, s - 26);
  ctx.moveTo(0, s - 12);
  ctx.lineTo(s, s - 12);
  ctx.stroke();

  heroClothTex = new CanvasTexture(c);
  heroClothTex.wrapS = RepeatWrapping;
  heroClothTex.wrapT = RepeatWrapping;
  heroClothTex.repeat.set(2, 2);
  heroClothTex.colorSpace = SRGBColorSpace;
  return heroClothTex;
}

/**
 * Paints crisp 256×256 anime face textures calibrated directly to Image 4:
 * - Larger, expressive almond slate-blue eyes with dark winged upper eyeliner
 * - Bold, cleanly arched dark-brown eyebrows
 * - Subtle warm nose contour + soft peach-coral blush
 * - Balanced warm confident smile lower on the chin
 * Supports 4 expressions: 'normal', 'blink', 'talk', and 'startled'.
 */
function animeFaceTexture(expr: HeroExpression): CanvasTexture {
  const cached = faceTexCache[expr];
  if (cached) return cached;

  const s = 256;
  const canvas = document.createElement('canvas');
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.clearRect(0, 0, s, s);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const ink = '#281b18';
  const browCol = '#3b2822';

  for (const side of [-1, 1]) {
    const ex = s / 2 + side * 48;
    const ey = 128;

    if (expr === 'blink') {
      ctx.strokeStyle = ink;
      ctx.lineWidth = 6.8;
      ctx.beginPath();
      ctx.moveTo(ex - side * 25, ey + 2);
      ctx.quadraticCurveTo(ex, ey + 15, ex + side * 28, ey - 2);
      ctx.stroke();
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(ex + side * 25, ey - 1);
      ctx.lineTo(ex + side * 33, ey - 7);
      ctx.stroke();
    } else {
      const startled = expr === 'startled';
      const rx = startled ? 26 : 30;
      const ry = startled ? 22 : 17.5;

      // 1. Clean almond white sclera
      ctx.fillStyle = '#fcfaf7';
      ctx.beginPath();
      ctx.ellipse(ex, ey, rx, ry, side * -0.07, 0, Math.PI * 2);
      ctx.fill();

      // 2. Clip inside eye almond so slate-blue iris sits cleanly like hand-drawn anime
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(ex, ey, rx - 0.5, ry - 0.5, side * -0.07, 0, Math.PI * 2);
      ctx.clip();

      // Slate-blue / periwinkle iris gradient (Image 4 eye color!)
      const irisR = startled ? 14 : 17.5;
      const irisGrad = ctx.createLinearGradient(ex, ey - irisR, ex, ey + irisR);
      irisGrad.addColorStop(0, '#3d5172');
      irisGrad.addColorStop(0.45, '#6882ac');
      irisGrad.addColorStop(0.84, '#9ab6da');
      irisGrad.addColorStop(1, '#cde2f6');
      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.ellipse(ex - side * 1, ey + 1, irisR, irisR * 1.04, 0, 0, Math.PI * 2);
      ctx.fill();

      // Deep dark pupil
      const pupR = startled ? 5.8 : 8.0;
      ctx.fillStyle = '#191b26';
      ctx.beginPath();
      ctx.arc(ex - side * 1, ey + 1, pupR, 0, Math.PI * 2);
      ctx.fill();

      // Crisp upper-left anime specular catchlight + tiny lower sparkle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(ex - 6, ey - 5.5, 5.2, 4.4, -0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(ex + 6.5, ey + 6.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. Bold winged upper eyeliner (Image 4 signature!)
      ctx.strokeStyle = ink;
      ctx.lineWidth = startled ? 5.8 : 7.2;
      ctx.beginPath();
      ctx.moveTo(ex - side * (rx - 1), ey + 2);
      ctx.quadraticCurveTo(ex, ey - ry - 5, ex + side * (rx + 5), ey - 3);
      ctx.stroke();

      // Elegant outer lash wing flick
      ctx.lineWidth = 4.4;
      ctx.beginPath();
      ctx.moveTo(ex + side * (rx + 2), ey - 2);
      ctx.lineTo(ex + side * (rx + 10), ey - 8);
      ctx.stroke();

      // Delicate lower lash contour
      ctx.strokeStyle = 'rgba(54, 34, 30, 0.45)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(ex - side * (rx - 6), ey + ry * 0.72);
      ctx.quadraticCurveTo(ex, ey + ry + 1.5, ex + side * (rx - 5), ey + ry * 0.62);
      ctx.stroke();
    }

    // 4. Bold, expressive arched dark-brown eyebrows (Image 4!)
    const browY = expr === 'startled' ? ey - 36 : ey - 28;
    ctx.strokeStyle = browCol;
    ctx.lineWidth = 7.0;
    ctx.beginPath();
    ctx.moveTo(ex - side * 26, browY + 3);
    ctx.quadraticCurveTo(ex - side * 2, browY - 8, ex + side * 26, browY + 3);
    ctx.stroke();

    // 5. Soft warm coral-peach cheek blush
    const blush = ctx.createRadialGradient(ex + side * 14, ey + 28, 2, ex + side * 14, ey + 28, 24);
    blush.addColorStop(0, 'rgba(235, 122, 114, 0.42)');
    blush.addColorStop(1, 'rgba(235, 122, 114, 0)');
    ctx.fillStyle = blush;
    ctx.beginPath();
    ctx.ellipse(ex + side * 14, ey + 28, 24, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. Subtle sculpted nose shadow
  ctx.strokeStyle = 'rgba(182, 122, 92, 0.75)';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(s / 2 - 5, 162);
  ctx.quadraticCurveTo(s / 2, 167, s / 2 + 6, 162);
  ctx.stroke();

  // 7. Expressive mouth positioned lower for balanced Image 4 proportions
  if (expr === 'talk') {
    ctx.fillStyle = '#8b3e42';
    ctx.beginPath();
    ctx.ellipse(s / 2, 192, 14, 9.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e58886';
    ctx.beginPath();
    ctx.ellipse(s / 2, 197, 8.5, 4.5, 0, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#753838';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.ellipse(s / 2, 192, 14, 9.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (expr === 'startled') {
    ctx.fillStyle = '#8c3b42';
    ctx.beginPath();
    ctx.ellipse(s / 2, 193, 8.5, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#682b30';
    ctx.lineWidth = 2.8;
    ctx.stroke();
  } else {
    // Image 4's warm, gentle, confident smile + subtle lower lip shading
    ctx.fillStyle = 'rgba(218, 134, 122, 0.4)';
    ctx.beginPath();
    ctx.ellipse(s / 2, 196.5, 13, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#99524c';
    ctx.lineWidth = 3.8;
    ctx.beginPath();
    ctx.moveTo(s / 2 - 19, 189);
    ctx.quadraticCurveTo(s / 2, 198, s / 2 + 19, 189);
    ctx.stroke();
  }

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  faceTexCache[expr] = tex;
  return tex;
}

/**
 * Stylized Anime Explorer Protagonist modeled directly after Image 4:
 * - ~3.8-head graceful feminine anime proportions
 * - Wide-brimmed floppy royal-blue hat with gold right-side crest (zero hair poke-through!)
 * - Dark espresso-brown layered bob with smooth side-parted sweeping bangs & outward-curled ends
 * - Tapered anime jawline + 256×256 almond slate-blue eyes (normal / blink / talk / startled)
 * - Split slate-periwinkle shoulder capelet with front V-notch, gold clasp & flowing split back cape
 * - Fitted crimson-terracotta tunic with cream cuffs & hem, leather belt + brass ring buckle + hip pouch
 * - Dark charcoal-navy leggings & tall warm-brown cuffed boots
 * - Smooth, clip-free animations for idle (breathing), walk, blink, talk, startled, and combat!
 */
export function createHeroModel(bodyColor: number, hatColor: number): HeroModel {
  const root = new Group();
  const bodyPivot = new Group();
  root.add(bodyPivot, blobShadow(0.32));

  const mat = toon();
  const faceMat = new MeshBasicMaterial({
    map: animeFaceTexture('normal'),
    transparent: true,
    depthWrite: false,
  });
  const clothMat = toon({ map: heroClothTexture(), vertexColors: true });
  const outlineWidth = 0.011;

  const headPivot = new Group();
  const leftArmPivot = new Group();
  const rightArmPivot = new Group();
  const leftLegPivot = new Group();
  const rightLegPivot = new Group();
  const capePivot = new Group();

  // Graceful ~3.8-head anime proportions matching Image 4 (arms cleanly clear of belt & pouch!)
  headPivot.position.set(0, 0.87, 0);
  leftArmPivot.position.set(-0.17, 0.755, 0.005);
  rightArmPivot.position.set(0.17, 0.755, 0.005);
  leftLegPivot.position.set(-0.072, 0.43, 0);
  rightLegPivot.position.set(0.072, 0.43, 0);
  capePivot.position.set(0, 0.81, -0.055);

  bodyPivot.add(headPivot, leftArmPivot, rightArmPivot, leftLegPivot, rightLegPivot, capePivot);

  const builtMeshes: Mesh[] = [];
  const builtGeos: BufferGeometry[] = [];

  const addMesh = (parent: Group, geo: BufferGeometry, outline = outlineWidth, customMat = mat) => {
    builtGeos.push(geo);
    const m = new Mesh(geo, customMat);
    if (outline > 0) addOutline(m, outline);
    parent.add(m);
    builtMeshes.push(m);
    return m;
  };

  const rebuild = (rawTunic: number, rawHat: number) => {
    for (const m of builtMeshes) m.parent?.remove(m);
    for (const g of builtGeos) g.dispose();
    builtMeshes.length = 0;
    builtGeos.length = 0;

    // Harmonize default palette to match the official 4-view protagonist turnaround!
    const tunic = rawTunic === 0xd94a4a ? 0x9e2d39 : rawTunic;
    const hat = rawHat === 0x3a6fd9 ? 0x423f92 : rawHat;

    const skin = 0xfce0c8;
    const skinWarm = 0xeec1a0;
    // Deep plum-purple wavy bob hair from turnaround
    const hair = 0x3c2440;
    const hairMid = 0x5c365c;
    const capeColor = hat;
    const capeTrim = 0xecc974;
    const tunicTrim = 0xf2dec1;
    const pants = 0x362e36;
    const glove = 0x4a3028;
    const boot = 0x6b4532;
    const bootCuff = 0x825740;
    const bootSole = 0x352319;
    const leather = 0x5d3d2a;
    const gold = 0xf0c44e;
    const hatBand = mixHex(hat, 0x1e1c4a, 0.35);

    // --- Torso: slender fitted crimson tunic + cream hem + leather belt + brass ring buckle + hip pouch + split periwinkle capelet ---
    const torsoGeo = merge([
      // Upper chest & slender waist
      part(cyl(0.112, 0.098, 0.25, 14), tunic, { pos: [0, 0.675, 0], scale: [1.06, 1, 0.78] }),
      // Flared tunic skirt below belt
      part(cyl(0.105, 0.165, 0.19, 14), tunic, { pos: [0, 0.455, 0], scale: [1.05, 1, 0.84] }),
      // Cream tunic bottom hem trim
      part(cyl(0.164, 0.169, 0.026, 14), tunicTrim, { pos: [0, 0.368, 0], scale: [1.05, 1, 0.84] }),
      // Slender neck
      part(cyl(0.042, 0.048, 0.1, 10), skinWarm, { pos: [0, 0.84, 0] }),
      // Tailored split shoulder capelet: back & shoulders arc leaving a crisp open front V-notch!
      part(
        new CylinderGeometry(0.128, 0.218, 0.15, 18, 1, false, Math.PI * 0.26, Math.PI * 1.48),
        capeColor,
        {
          pos: [0, 0.778, -0.01],
          rot: [0, Math.PI, 0],
          scale: [1.16, 1, 0.9],
        }
      ),
      // Distinct left & right front capelet lapels framing a clear center V-split over the red tunic
      part(cone(0.088, 0.155, 10), capeColor, {
        pos: [-0.095, 0.772, 0.055],
        rot: [-0.14, 0.24, 0.3],
        scale: [1.05, 1, 0.48],
      }),
      part(cone(0.088, 0.155, 10), capeColor, {
        pos: [0.095, 0.772, 0.055],
        rot: [-0.14, -0.24, -0.3],
        scale: [1.05, 1, 0.48],
      }),
      // Embroidered cream/gold capelet collar
      part(new TorusGeometry(0.102, 0.02, 8, 16), capeTrim, {
        pos: [0, 0.835, 0.005],
        rot: [Math.PI / 2, 0, 0],
        scale: [1.08, 0.88, 1],
      }),
      // Diamond gold brooch clasp at center throat (turnaround signature!)
      part(cone(0.03, 0.048, 4), gold, {
        pos: [0, 0.822, 0.112],
        rot: [0, Math.PI / 4, 0],
        scale: [1.1, 0.9, 0.5],
      }),
      part(cone(0.03, 0.048, 4), gold, {
        pos: [0, 0.798, 0.112],
        rot: [Math.PI, Math.PI / 4, 0],
        scale: [1.1, 0.9, 0.5],
      }),
      // Folded indigo hood resting on her upper back (visible in side & back turnaround views!)
      part(sph(0.11, 12, 8), capeColor, { pos: [0, 0.79, -0.115], scale: [1.18, 0.68, 0.75] }),
      // Leather belt around cinched waist
      part(cyl(0.11, 0.116, 0.046, 14), leather, { pos: [0, 0.545, 0], scale: [1.07, 1, 0.84] }),
      // Round brass ring buckle (turnaround signature!)
      part(new TorusGeometry(0.029, 0.009, 8, 14), gold, {
        pos: [0, 0.545, 0.104],
        scale: [1.05, 1.05, 0.65],
      }),
      // Symmetrical dual brown leather hip pouches (left & right hips from turnaround!)
      part(cap(0.038, 0.046), leather, { pos: [0.125, 0.505, 0.045], scale: [0.78, 1, 0.72] }),
      part(cap(0.038, 0.046), leather, { pos: [-0.125, 0.505, 0.045], scale: [0.78, 1, 0.72] }),
    ]);
    addMesh(bodyPivot, addClothUvs(torsoGeo, 0.35, 0.85), outlineWidth, clothMat);

    // --- Flowing Split Back Cape Tail ---
    const capeGeo = merge([
      part(cyl(0.105, 0.18, 0.42, 10), capeColor, {
        pos: [-0.052, -0.21, -0.065],
        rot: [0.2, 0.08, -0.08],
        scale: [0.75, 1, 0.25],
      }),
      part(cyl(0.105, 0.18, 0.42, 10), capeColor, {
        pos: [0.052, -0.21, -0.065],
        rot: [0.2, -0.08, 0.08],
        scale: [0.75, 1, 0.25],
      }),
    ]);
    addMesh(capePivot, addClothUvs(capeGeo, -0.44, 0), 0.009, clothMat);

    // --- Head + Smooth Side-Parted Layered Dark-Brown Bob + Wide Floppy Royal-Blue Hat ---
    const headBase = sculptAnimeHeadGeo(new SphereGeometry(0.195, 22, 16), 0.195);
    const headGeo = merge([
      part(headBase, skin, { pos: [0, 0.205, 0] }),
      part(sph(0.028, 8, 6), skinWarm, { pos: [-0.182, 0.175, -0.01], scale: [0.55, 1.05, 0.6] }),
      part(sph(0.028, 8, 6), skinWarm, { pos: [0.182, 0.175, -0.01], scale: [0.55, 1.05, 0.6] }),

      // Smooth dark-brown bob crown (sits cleanly BELOW the hat brim — zero poke-through!)
      part(sph(0.202, 18, 14), hair, { pos: [0, 0.23, -0.032], scale: [1.03, 0.9, 1.03] }),
      part(sph(0.188, 14, 10), hair, { pos: [0, 0.145, -0.068], scale: [1.1, 0.86, 0.92] }),

      // Smooth asymmetric side-parted sweeping bangs (Image 4 signature: parted top-right, sweeping left!)
      part(sph(0.105, 12, 10), hair, {
        pos: [-0.062, 0.288, 0.128],
        rot: [0.15, 0.28, 0.34],
        scale: [1.28, 0.56, 0.58],
      }),
      part(sph(0.092, 12, 10), hairMid, {
        pos: [0.065, 0.295, 0.132],
        rot: [0.14, -0.24, -0.32],
        scale: [1.08, 0.52, 0.55],
      }),
      // Sweeping diagonal bang lock draping gracefully across upper forehead toward viewer's left
      part(cone(0.044, 0.145, 10), hair, {
        pos: [-0.04, 0.268, 0.168],
        rot: [0.32, 0.22, 2.08],
        scale: [1.0, 1.0, 0.55],
      }),
      part(cone(0.038, 0.125, 10), hairMid, {
        pos: [0.035, 0.278, 0.172],
        rot: [0.3, -0.1, 2.38],
        scale: [1.0, 1.0, 0.55],
      }),
      // Right-side (viewer's right) framing sweep curving down along temple
      part(cone(0.044, 0.145, 10), hair, {
        pos: [0.132, 0.252, 0.128],
        rot: [0.22, -0.38, -2.52],
        scale: [1.0, 1.0, 0.6],
      }),

      // Soft, full layered chin-to-neck bob locks framing cheeks with gentle outward curl at tips!
      part(cap(0.046, 0.15), hair, { pos: [-0.184, 0.165, 0.035], rot: [0.06, 0, -0.14] }),
      part(cone(0.048, 0.13, 10), hairMid, { pos: [-0.205, 0.088, 0.015], rot: [0.04, 0.1, 2.38] }),
      part(cap(0.036, 0.12), hair, { pos: [-0.165, 0.138, 0.088], rot: [0.14, 0.18, -0.12] }),

      part(cap(0.046, 0.15), hair, { pos: [0.184, 0.165, 0.035], rot: [0.06, 0, 0.14] }),
      part(cone(0.048, 0.13, 10), hairMid, {
        pos: [0.205, 0.088, 0.015],
        rot: [0.04, -0.1, -2.38],
      }),
      part(cap(0.036, 0.12), hair, { pos: [0.165, 0.138, 0.088], rot: [0.14, -0.18, 0.12] }),

      // Soft curved back bob locks around nape
      part(cone(0.068, 0.19, 10), hair, { pos: [-0.125, 0.072, -0.142], rot: [-0.4, 0.15, 2.7] }),
      part(cone(0.072, 0.19, 10), hairMid, { pos: [0, 0.062, -0.168], rot: [-0.44, 0, Math.PI] }),
      part(cone(0.068, 0.19, 10), hair, { pos: [0.125, 0.072, -0.142], rot: [-0.4, -0.15, -2.7] }),

      // Pointed indigo witch hat with floppy curved tip & golden star coin emblem (from turnaround!)
      part(floppyHatBrimGeo(), hat, { pos: [0, 0.358, -0.024], rot: [-0.14, 0, 0.035] }),
      part(cone(0.205, 0.28, 18), hat, { pos: [0, 0.49, -0.04], rot: [-0.18, 0, 0.05] }),
      // Curved floppy witch hat tip drooping toward her left-back!
      part(cone(0.088, 0.22, 12), hat, { pos: [0.095, 0.56, -0.085], rot: [-0.45, 0.1, -0.95] }),
      part(cyl(0.196, 0.208, 0.042, 18), hatBand, {
        pos: [0, 0.386, -0.028],
        rot: [-0.14, 0, 0.035],
      }),
      // Golden star coin emblem on character's left side of hat band
      part(cyl(0.048, 0.048, 0.016, 14), gold, {
        pos: [0.185, 0.425, 0.03],
        rot: [0, 0.22, Math.PI / 2 - 0.14],
      }),
    ]);
    addMesh(headPivot, headGeo, outlineWidth);

    // --- Curved sculpted face patch carrying the crisp 256×256 Image 4 anime eyes & expressions! ---
    const facePatch = sculptAnimeHeadGeo(
      new SphereGeometry(
        0.199,
        18,
        14,
        Math.PI * 0.2,
        Math.PI * 0.6,
        Math.PI * 0.26,
        Math.PI * 0.56
      ),
      0.199
    );
    facePatch.translate(0, 0.205, 0);
    addMesh(headPivot, facePatch, 0, faceMat as unknown as ReturnType<typeof toon>);

    // --- Slender Arms + Crimson Sleeves + Cream Folded Cuffs + Dark Brown Gloves (from turnaround!) ---
    const makeArm = (side: -1 | 1) =>
      merge([
        part(cap(0.034, 0.145), tunic, { pos: [side * 0.01, -0.105, 0] }),
        part(cyl(0.042, 0.046, 0.044, 10), tunicTrim, { pos: [side * 0.012, -0.19, 0] }),
        part(cap(0.027, 0.06), glove, { pos: [side * 0.014, -0.248, 0.004] }),
        part(sph(0.032, 10, 8), glove, {
          pos: [side * 0.016, -0.294, 0.01],
          scale: [0.78, 1.12, 0.68],
        }),
      ]);
    addMesh(leftArmPivot, addClothUvs(makeArm(-1), -0.32, 0), outlineWidth, clothMat);
    addMesh(rightArmPivot, addClothUvs(makeArm(1), -0.32, 0), outlineWidth, clothMat);

    // --- Slender Charcoal-Navy Leggings + Tall Warm-Brown Cuffed Boots ---
    const makeLeg = () =>
      merge([
        part(cap(0.042, 0.18), pants, { pos: [0, -0.115, 0] }),
        part(cyl(0.047, 0.042, 0.175, 12), boot, { pos: [0, -0.295, 0.006] }),
        part(cyl(0.055, 0.051, 0.045, 12), bootCuff, { pos: [0, -0.212, 0.006] }),
        part(sph(0.049, 10, 8), boot, { pos: [0, -0.388, 0.038], scale: [0.9, 0.68, 1.42] }),
        part(cyl(0.049, 0.052, 0.022, 10), bootSole, {
          pos: [0, -0.418, 0.032],
          scale: [0.95, 1, 1.42],
        }),
      ]);
    addMesh(leftLegPivot, addClothUvs(makeLeg(), -0.44, 0), outlineWidth, clothMat);
    addMesh(rightLegPivot, addClothUvs(makeLeg(), -0.44, 0), outlineWidth, clothMat);
  };

  rebuild(bodyColor, hatColor);
  let disposed = false;

  let walkPhase = 0;
  let baseExpr: HeroExpression = 'normal';
  let appliedExpr: HeroExpression = 'normal';
  let blinkCooldown = 2.8 + Math.random() * 1.8;
  let blinkLeft = 0;
  let actionKind: HeroAction | null = null;
  let actionT = 0;
  let actionDur = 0.5;

  const setFace = (e: HeroExpression) => {
    if (appliedExpr === e) return;
    appliedExpr = e;
    faceMat.map = animeFaceTexture(e);
    faceMat.needsUpdate = true;
  };

  return {
    root,
    setExpression(expr: HeroExpression) {
      baseExpr = expr;
      if (expr === 'startled') {
        actionKind = 'startled';
        actionT = 0;
        actionDur = 0.55;
      }
      setFace(expr);
    },
    playAction(action: HeroAction) {
      actionKind = action;
      actionT = 0;
      actionDur =
        action === 'celebrate' ? 1.85 : action === 'attack' ? 0.52 : action === 'hit' ? 0.44 : 0.58;
      if (action === 'startled' || action === 'hit') setFace('startled');
      else if (action === 'celebrate') setFace('talk');
    },
    update(dt: number, time: number, walking: boolean) {
      // 1. Automatic natural blinking + talking lip-sync
      if (actionKind === 'startled' || actionKind === 'hit' || baseExpr === 'startled') {
        setFace('startled');
      } else if (baseExpr === 'blink') {
        setFace('blink');
      } else if (baseExpr === 'talk') {
        setFace(Math.sin(time * 18) > -0.15 ? 'talk' : 'normal');
      } else {
        if (blinkLeft > 0) {
          blinkLeft -= dt;
          if (blinkLeft <= 0) setFace('normal');
        } else {
          blinkCooldown -= dt;
          if (blinkCooldown <= 0) {
            blinkLeft = 0.13;
            blinkCooldown = 3.0 + Math.random() * 2.2;
            setFace('blink');
          } else {
            setFace('normal');
          }
        }
      }

      // 2. One-shot action poses (combat attack, hit recoil, startled hop)
      let actK = 0;
      if (actionKind) {
        actionT += dt;
        const p = Math.min(1, actionT / actionDur);
        actK = Math.sin(p * Math.PI);
        if (p >= 1) {
          actionKind = null;
          if (baseExpr !== 'startled') setFace(baseExpr);
        }
      }

      // 3. Base locomotion vs breathing idle (arms angled slightly outward so hands never clip belt/pouch!)
      if (walking) {
        walkPhase += dt * 10.6;
        const swing = Math.sin(walkPhase);
        const bounce = Math.abs(Math.cos(walkPhase));
        bodyPivot.position.y = bounce * 0.042;
        bodyPivot.rotation.z = swing * 0.028;
        bodyPivot.rotation.x = 0.04;
        leftLegPivot.rotation.x = swing * 0.48;
        rightLegPivot.rotation.x = -swing * 0.48;
        leftArmPivot.rotation.x = -swing * 0.42;
        rightArmPivot.rotation.x = swing * 0.42;
        leftArmPivot.rotation.z = -0.12;
        rightArmPivot.rotation.z = 0.12;
        headPivot.rotation.x = 0.03;
        headPivot.rotation.y = Math.sin(walkPhase * 0.5) * 0.035;
        capePivot.rotation.x = 0.24 + Math.sin(time * 8.2) * 0.12;
      } else {
        const k = Math.min(1, dt * 10);
        const breath = Math.sin(time * 2.2);
        const targetY = breath * 0.011;
        bodyPivot.position.y += (targetY - bodyPivot.position.y) * k;
        bodyPivot.rotation.z *= 1 - k;
        bodyPivot.rotation.x *= 1 - k;
        leftLegPivot.rotation.x *= 1 - k;
        rightLegPivot.rotation.x *= 1 - k;
        leftArmPivot.rotation.x *= 1 - k;
        rightArmPivot.rotation.x *= 1 - k;
        leftArmPivot.rotation.z = -0.14 - breath * 0.015;
        rightArmPivot.rotation.z = 0.14 + breath * 0.015;

        const talkNod = baseExpr === 'talk' ? Math.sin(time * 8.5) * 0.06 : 0;
        const talkHand = baseExpr === 'talk' ? -0.35 - Math.sin(time * 7) * 0.12 : 0;
        if (baseExpr === 'talk')
          rightArmPivot.rotation.x += (talkHand - rightArmPivot.rotation.x) * k;
        headPivot.rotation.x += (breath * 0.018 + talkNod - headPivot.rotation.x) * k;
        headPivot.rotation.y += (Math.sin(time * 0.72) * 0.05 - headPivot.rotation.y) * k;
        capePivot.rotation.x = 0.05 + Math.sin(time * 2.6) * 0.05;
      }

      // 4. Overlay combat / startled pose cleanly on top
      if (actionKind === 'attack') {
        bodyPivot.rotation.x = 0.14 * actK;
        bodyPivot.position.y += 0.035 * actK;
        rightArmPivot.rotation.x = -1.25 * actK;
        rightArmPivot.rotation.z = 0.18 + 0.16 * actK;
        leftArmPivot.rotation.x = 0.35 * actK;
        capePivot.rotation.x = 0.45 * actK;
      } else if (actionKind === 'hit') {
        bodyPivot.rotation.x = -0.22 * actK;
        bodyPivot.position.y += 0.025 * actK;
        leftArmPivot.rotation.x = -0.55 * actK;
        rightArmPivot.rotation.x = -0.55 * actK;
        leftArmPivot.rotation.z = -0.38 * actK;
        rightArmPivot.rotation.z = 0.38 * actK;
      } else if (actionKind === 'startled') {
        bodyPivot.position.y += 0.07 * actK;
        headPivot.rotation.x = -0.08 * actK;
        leftArmPivot.rotation.x = -0.6 * actK;
        rightArmPivot.rotation.x = -0.6 * actK;
        leftArmPivot.rotation.z = -0.18 - 0.32 * actK;
        rightArmPivot.rotation.z = 0.18 + 0.32 * actK;
        capePivot.rotation.x = 0.3 * actK;
      } else if (actionKind === 'pickup') {
        // Bend down / crouch toward the ground to pick up an item!
        bodyPivot.position.y -= 0.14 * actK;
        bodyPivot.rotation.x = 0.58 * actK;
        headPivot.rotation.x = 0.25 * actK;
        leftLegPivot.rotation.x = -0.35 * actK;
        rightLegPivot.rotation.x = -0.35 * actK;
        leftArmPivot.rotation.x = -0.78 * actK;
        rightArmPivot.rotation.x = -0.78 * actK;
        capePivot.rotation.x = 0.42 * actK;
      } else if (actionKind === 'celebrate') {
        // Zelda: Ocarina of Time-style triumphant item-hold pose (both arms raised overhead!)
        const hold = Math.min(1, actK * 2.2);
        bodyPivot.position.y += 0.03 * hold;
        headPivot.rotation.x = -0.12 * hold;
        leftArmPivot.rotation.x = -2.75 * hold;
        rightArmPivot.rotation.x = -2.75 * hold;
        leftArmPivot.rotation.z = -0.22 * hold;
        rightArmPivot.rotation.z = 0.22 * hold;
        capePivot.rotation.x = 0.24 * hold;
      }
    },
    setColors(b: number, h: number) {
      rebuild(b, h);
    },
    dispose() {
      disposed = true;
      void disposed;
      for (const g of builtGeos) g.dispose();
      mat.dispose();
      clothMat.dispose();
      faceMat.dispose();
    },
  };
}
