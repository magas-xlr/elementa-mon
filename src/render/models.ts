import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  Euler,
  Group,
  IcosahedronGeometry,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  OctahedronGeometry,
  Quaternion,
  RepeatWrapping,
  SphereGeometry,
  SRGBColorSpace,
  TetrahedronGeometry,
  TorusGeometry,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ELEMENT_INFO, type Element, type PetElement } from '../game/data/elements';
import { BUILDINGS, type BuildingKind } from '../game/data/buildings';
import { getSpecies } from '../game/data/species';
import { addOutline, toon } from './toon';

export { toon };

type V3 = [number, number, number];

interface PartOptions {
  pos?: V3;
  rot?: V3;
  scale?: V3;
  /** Per-face brightness jitter (0 = smooth watercolor color). */
  jitter?: number;
  /** Optional UV repeat scale when using `texturedPart`. */
  uvScale?: [number, number];
}

let jitterSeed = 1;
const jitterRand = () => {
  jitterSeed = (jitterSeed * 16807) % 2147483647;
  return jitterSeed / 2147483647;
};

export function part(geo: BufferGeometry, color: number, o: PartOptions = {}): BufferGeometry {
  const g = geo.index ? geo.toNonIndexed() : geo;
  if (g !== geo) geo.dispose();
  g.deleteAttribute('uv');
  const m = new Matrix4().compose(
    new Vector3(...(o.pos ?? [0, 0, 0])),
    new Quaternion().setFromEuler(new Euler(...(o.rot ?? [0, 0, 0]))),
    new Vector3(...(o.scale ?? [1, 1, 1]))
  );
  g.applyMatrix4(m);
  const base = new Color(color);
  const count = g.attributes.position.count;
  // Outline direction: from the part's center outwards, crack-free on every shape.
  g.computeBoundingBox();
  const center = g.boundingBox!.getCenter(new Vector3());
  const pos = g.attributes.position;
  const dirs = new Float32Array(count * 3);
  const d = new Vector3();
  for (let i = 0; i < count; i++) {
    d.set(pos.getX(i), pos.getY(i), pos.getZ(i)).sub(center).normalize();
    dirs[i * 3] = d.x;
    dirs[i * 3 + 1] = d.y;
    dirs[i * 3 + 2] = d.z;
  }
  g.setAttribute('outlineDir', new BufferAttribute(dirs, 3));
  const colors = new Float32Array(count * 3);
  const jitter = o.jitter ?? 0;
  for (let i = 0; i < count; i += 3) {
    const k = 1 + (jitterRand() - 0.5) * 2 * jitter;
    for (let v = 0; v < 3 && i + v < count; v++) {
      colors[(i + v) * 3] = base.r * k;
      colors[(i + v) * 3 + 1] = base.g * k;
      colors[(i + v) * 3 + 2] = base.b * k;
    }
  }
  g.setAttribute('color', new BufferAttribute(colors, 3));
  return g;
}

/** Same as `part()`, but keeps and optionally scales the UV attribute for textured toon meshes. */
export function texturedPart(
  geo: BufferGeometry,
  color = 0xffffff,
  o: PartOptions = {}
): BufferGeometry {
  const g = geo.index ? geo.toNonIndexed() : geo;
  if (g !== geo) geo.dispose();
  if (o.uvScale && g.attributes.uv) {
    const uv = g.attributes.uv;
    const [su, sv] = o.uvScale;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
  }
  const m = new Matrix4().compose(
    new Vector3(...(o.pos ?? [0, 0, 0])),
    new Quaternion().setFromEuler(new Euler(...(o.rot ?? [0, 0, 0]))),
    new Vector3(...(o.scale ?? [1, 1, 1]))
  );
  g.applyMatrix4(m);
  const base = new Color(color);
  const count = g.attributes.position.count;
  g.computeBoundingBox();
  const center = g.boundingBox!.getCenter(new Vector3());
  const pos = g.attributes.position;
  const dirs = new Float32Array(count * 3);
  const d = new Vector3();
  for (let i = 0; i < count; i++) {
    d.set(pos.getX(i), pos.getY(i), pos.getZ(i)).sub(center).normalize();
    dirs[i * 3] = d.x;
    dirs[i * 3 + 1] = d.y;
    dirs[i * 3 + 2] = d.z;
  }
  g.setAttribute('outlineDir', new BufferAttribute(dirs, 3));
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    colors[i * 3] = base.r;
    colors[i * 3 + 1] = base.g;
    colors[i * 3 + 2] = base.b;
  }
  g.setAttribute('color', new BufferAttribute(colors, 3));
  return g;
}

export function merge(parts: BufferGeometry[]): BufferGeometry {
  const merged = mergeGeometries(parts, false);
  for (const p of parts) p.dispose();
  if (!merged) throw new Error('Falha ao unir geometrias');
  merged.computeBoundingSphere();
  return merged;
}

export function ico(r: number, detail = 1): BufferGeometry {
  const g = new IcosahedronGeometry(r, detail);
  const pos = g.attributes.position;
  const n = g.attributes.normal;
  const v = new Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.set(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize();
    n.setXYZ(i, v.x, v.y, v.z);
  }
  return g;
}

const sph = (r: number, w = 14, h = 10) => new SphereGeometry(r, w, h);
const cap = (r: number, len: number) => new CapsuleGeometry(r, len, 5, 10);
const box = (w: number, h: number, d: number) => new BoxGeometry(w, h, d);
const cone = (r: number, h: number, seg = 10) => new ConeGeometry(r, h, seg);
const cyl = (rt: number, rb: number, h: number, seg = 10) => new CylinderGeometry(rt, rb, h, seg);

const mix = (a: number, b: number, k: number) => new Color(a).lerp(new Color(b), k).getHex();

/**
 * Caputino-style glossy anime eyes: dark warm espresso iris + big crisp upper highlight +
 * tiny lower sparkle + soft peach blush + optional button nose.
 */
function animeFace(
  y: number,
  z: number,
  spread: number,
  size = 0.078,
  iris = 0x3b241c,
  blush = true,
  withNose = true
): BufferGeometry[] {
  const out: BufferGeometry[] = [];
  const r = size;
  for (const side of [-1, 1]) {
    const x = side * spread;
    // Glossy dark anime eye base (like Caputino!)
    out.push(part(sph(r, 10, 8), 0x24171a, { pos: [x, y, z], scale: [0.85, 1.25, 0.35] }));
    // Warm colored lower iris crescent
    out.push(
      part(sph(r * 0.72, 10, 8), iris, {
        pos: [x, y - r * 0.24, z + r * 0.16],
        scale: [0.82, 0.85, 0.3],
      })
    );
    // Crisp bright upper catchlight
    out.push(
      part(sph(r * 0.34, 8, 6), 0xffffff, {
        pos: [x + side * r * 0.2, y + r * 0.36, z + r * 0.32],
        scale: [0.9, 1.05, 0.4],
      })
    );
    // Small secondary sparkle
    out.push(
      part(sph(r * 0.15, 6, 6), 0xfff8ec, {
        pos: [x - side * r * 0.22, y - r * 0.38, z + r * 0.32],
      })
    );
    if (blush) {
      out.push(
        part(sph(r * 0.58, 8, 6), 0xffa6b8, {
          pos: [x + side * r * 1.05, y - r * 0.95, z - r * 0.25],
          scale: [1.35, 0.6, 0.25],
        })
      );
    }
  }
  if (withNose) {
    out.push(
      part(sph(r * 0.34, 8, 6), 0x8b4a42, {
        pos: [0, y - r * 0.45, z + r * 0.55],
        scale: [1.2, 0.75, 0.7],
      })
    );
  }
  return out;
}

/** Element-specific magical accessory attached cleanly to the creature. */
function accessory(
  element: Element,
  detail: number,
  headY: number,
  headZ: number,
  s: number
): BufferGeometry[] {
  switch (element) {
    case 'fogo':
      return [
        part(cone(0.11, 0.32, 10), 0xff6b2b, { pos: [0, 0.55, -0.52], rot: [-0.85, 0, 0] }),
        part(cone(0.065, 0.2, 8), 0xfff099, { pos: [0, 0.62, -0.58], rot: [-0.85, 0, 0] }),
      ];
    case 'agua':
      return [
        part(sph(0.09, 10, 8), 0x6fd4ff, {
          pos: [0, headY + 0.32, headZ],
          scale: [0.75, 1.45, 0.75],
        }),
      ];
    case 'eletrico':
      return [-1, 1].flatMap((side) => [
        part(cone(0.06, 0.34, 6), detail, {
          pos: [side * 0.16, headY + 0.3, headZ - 0.04],
          rot: [0, 0, -side * 0.35],
        }),
        part(cone(0.045, 0.14, 6), 0xffe45e, {
          pos: [side * 0.23, headY + 0.48, headZ - 0.04],
          rot: [0, 0, -side * 0.35],
        }),
      ]);
    case 'terra':
      return [
        part(new TetrahedronGeometry(0.12), detail, { pos: [0.09, 0.55, -0.18] }),
        part(new TetrahedronGeometry(0.09), detail, { pos: [-0.11, 0.5, -0.32] }),
      ];
    case 'gelo':
      return [0, 1, 2].map((i) =>
        part(new OctahedronGeometry(0.075 + s * 0.015), 0xe6fbff, {
          pos: [(i - 1) * 0.11, headY + 0.3 + (i === 1 ? 0.07 : 0), headZ - 0.04],
          scale: [0.55, 1.5, 0.55],
        })
      );
    case 'venenoso':
      return [0, 1, 2].map((i) =>
        part(sph(0.055, 8, 6), detail, {
          pos: [Math.sin(i * 2.1) * 0.24, 0.42 + i * 0.06, -0.14 - i * 0.1],
        })
      );
    case 'psiquico':
      return [
        part(new TorusGeometry(0.14, 0.022, 8, 16), 0xd8a8ff, {
          pos: [0, headY + 0.38, headZ],
          rot: [Math.PI / 2, 0, 0],
        }),
        part(sph(0.06, 10, 8), detail, { pos: [0, headY + 0.38, headZ] }),
      ];
    case 'fantasma':
      return [
        part(sph(0.075, 10, 8), 0xc5a8ff, { pos: [-0.36, 0.72, -0.1] }),
        part(sph(0.06, 10, 8), 0x9b7cff, { pos: [0.34, 0.85, -0.15] }),
      ];
    case 'fada':
      return [-1, 1].map((side) =>
        part(sph(0.18, 10, 8), 0xffc8e6, {
          pos: [side * 0.32, 0.56, -0.22],
          rot: [0.15, side * 0.45, side * 0.35],
          scale: [1.3, 0.85, 0.18],
        })
      );
  }
}

const geometryCache = new Map<string, BufferGeometry>();

/**
 * Bespoke, smooth, Caputino-quality anime watercolor 3D creature sculptor.
 * Every single one of the 9 species has its own adorable silhouette, smooth organic forms,
 * glossy anime eyes, and clear visual evolution across stages 0, 1, 2.
 */
export function creatureGeometry(
  speciesId: string,
  stage: number,
  element: PetElement = 'neutro'
): BufferGeometry {
  const key = `${speciesId}:${stage}:${element}`;
  const cached = geometryCache.get(key);
  if (cached) return cached;
  const sp = getSpecies(speciesId);
  const tint =
    element === 'neutro' ? null : element === 'radioativo' ? 0x76ff03 : ELEMENT_INFO[element].color;
  const body = tint === null ? sp.colors.body : mix(sp.colors.body, tint, 0.45);
  const belly = tint === null ? sp.colors.belly : mix(sp.colors.belly, tint, 0.18);
  const detail = tint === null ? sp.colors.detail : mix(sp.colors.detail, tint, 0.65);
  const s = stage;
  const parts: BufferGeometry[] = [];
  let headY: number;
  let headZ: number;
  const iris = mix(detail, 0x3b241c, 0.45);

  switch (speciesId) {
    case 'pipo': {
      // Adorable cream-gold mochi-puff with musical curl tuft, floppy ears & rosy cheeks
      parts.push(part(sph(0.42, 16, 12), body, { pos: [0, 0.42, 0], scale: [1.05, 0.94, 0.98] }));
      parts.push(
        part(sph(0.32, 14, 10), belly, { pos: [0, 0.35, 0.16], scale: [0.95, 0.85, 0.65] })
      );
      // Cute curled musical-note top tuft
      parts.push(part(cap(0.055, 0.16), detail, { pos: [0, 0.88, -0.02], rot: [0.25, 0, -0.2] }));
      parts.push(part(sph(0.085, 10, 8), detail, { pos: [0.06, 0.96, 0.04] }));
      // Floppy soft bunny-nub ears + tiny paws
      for (const side of [-1, 1]) {
        parts.push(
          part(cap(0.085, 0.16 + s * 0.06), body, {
            pos: [side * 0.38, 0.64, -0.02],
            rot: [0, 0, -side * 0.85],
            scale: [1, 1, 0.7],
          })
        );
        parts.push(
          part(sph(0.09, 10, 8), belly, {
            pos: [side * 0.22, 0.1, 0.14],
            scale: [1.1, 0.7, 1.3],
          })
        );
        parts.push(
          part(sph(0.08, 10, 8), body, {
            pos: [side * 0.36, 0.34, 0.16],
            scale: [0.9, 0.8, 1.1],
          })
        );
      }
      // Fluffy pom-pom tail
      parts.push(part(sph(0.14, 10, 8), belly, { pos: [0, 0.28, -0.4] }));
      if (s >= 1) {
        // Fluffy collar ruff
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          parts.push(
            part(sph(0.11, 8, 6), belly, { pos: [Math.cos(a) * 0.34, 0.48, Math.sin(a) * 0.34] })
          );
        }
      }
      if (s >= 2) {
        // Floating golden cloud-halo crown
        parts.push(
          part(new TorusGeometry(0.24, 0.04, 8, 16), 0xffe484, {
            pos: [0, 1.05, 0],
            rot: [Math.PI / 2, 0, 0],
          })
        );
      }
      headY = 0.56;
      headZ = 0.2;
      parts.push(...animeFace(0.52, 0.38, 0.15, 0.082, iris, true, true));
      break;
    }

    case 'casquinho': {
      // Cute rounded armadillo/turtle cub with sculpted warm chestnut shell & stubby paws
      parts.push(part(sph(0.36, 14, 10), belly, { pos: [0, 0.34, 0], scale: [1.05, 0.78, 1.18] }));
      // Sculpted layered dome shell
      parts.push(
        part(sph(0.42, 16, 12), detail, { pos: [0, 0.48, -0.06], scale: [1.04, 0.85, 1.18] })
      );
      parts.push(
        part(new TorusGeometry(0.39, 0.055, 8, 18), mix(detail, 0xfff2d6, 0.4), {
          pos: [0, 0.34, -0.06],
          rot: [Math.PI / 2, 0, 0],
          scale: [1.04, 1.16, 1],
        })
      );
      // Shell ridge plates
      for (let i = 0; i < 3; i++) {
        parts.push(
          part(sph(0.14 - i * 0.015, 10, 8), mix(detail, body, 0.35), {
            pos: [0, 0.76 - i * 0.04, 0.08 - i * 0.22],
            scale: [1.1, 0.55, 0.9],
          })
        );
      }
      // Cute rounded head poking out forward
      headY = 0.5;
      headZ = 0.44;
      parts.push(
        part(sph(0.27, 14, 10), body, { pos: [0, headY, headZ], scale: [1.05, 0.92, 1.0] })
      );
      parts.push(
        part(sph(0.17, 10, 8), belly, {
          pos: [0, headY - 0.08, headZ + 0.15],
          scale: [1.1, 0.7, 0.8],
        })
      );
      // Cute ear nubs + 4 stubby rounded feet
      for (const side of [-1, 1]) {
        parts.push(
          part(sph(0.075, 8, 6), body, {
            pos: [side * 0.22, headY + 0.16, headZ - 0.04],
            scale: [0.8, 1.2, 0.7],
          })
        );
        parts.push(part(cap(0.08, 0.12), body, { pos: [side * 0.24, 0.14, 0.22] }));
        parts.push(part(cap(0.085, 0.12), body, { pos: [side * 0.25, 0.14, -0.26] }));
      }
      // Little wagging tail
      parts.push(part(cone(0.09, 0.28, 10), body, { pos: [0, 0.26, -0.56], rot: [-1.35, 0, 0] }));
      if (s >= 1) {
        for (const side of [-1, 1])
          parts.push(
            part(cone(0.06, 0.22, 8), 0xfff2d6, {
              pos: [side * 0.28, 0.66, -0.08],
              rot: [0, 0, -side * 0.6],
            })
          );
      }
      if (s >= 2) {
        parts.push(
          part(sph(0.16, 10, 8), 0x76b865, { pos: [0, 0.9, -0.08], scale: [1.2, 0.8, 1.2] })
        );
      }
      parts.push(...animeFace(headY + 0.03, headZ + 0.22, 0.11, 0.072, iris, true, true));
      break;
    }

    case 'bicudo': {
      // Plump, adorable anime songbird/owl-chick with layered feathered wings & golden beak
      parts.push(part(sph(0.36, 16, 12), body, { pos: [0, 0.46, 0], scale: [1.0, 1.04, 1.08] }));
      parts.push(
        part(sph(0.28, 14, 10), belly, { pos: [0, 0.42, 0.15], scale: [0.95, 0.95, 0.72] })
      );
      headY = 0.82;
      headZ = 0.08;
      parts.push(
        part(sph(0.28, 16, 12), body, { pos: [0, headY, headZ], scale: [1.06, 0.96, 1.0] })
      );
      // Cute golden curved beak
      parts.push(
        part(cone(0.068, 0.17, 8), 0xf6b83b, {
          pos: [0, headY - 0.04, headZ + 0.28],
          rot: [Math.PI / 2 + 0.12, 0, 0],
        })
      );
      // Head plume feathers
      parts.push(
        part(cap(0.042, 0.14 + s * 0.06), detail, {
          pos: [0, headY + 0.28, headZ - 0.02],
          rot: [-0.35, 0, 0],
        })
      );
      parts.push(
        part(cap(0.032, 0.1 + s * 0.05), body, {
          pos: [0.06, headY + 0.25, headZ - 0.06],
          rot: [-0.5, 0, -0.25],
        })
      );
      // Sculpted rounded wings + little orange feet
      for (const side of [-1, 1]) {
        parts.push(
          part(sph(0.22 + s * 0.04, 12, 8), detail, {
            pos: [side * 0.36, 0.5, -0.02],
            rot: [0.1, side * 0.2, -side * 0.45],
            scale: [0.45, 1.25, 0.95],
          })
        );
        parts.push(part(cap(0.035, 0.12), 0xf2a838, { pos: [side * 0.12, 0.1, 0.04] }));
        parts.push(
          part(sph(0.06, 8, 6), 0xf2a838, {
            pos: [side * 0.12, 0.04, 0.09],
            scale: [1.1, 0.5, 1.4],
          })
        );
      }
      // Fanned tail feathers
      for (const side of [-1, 0, 1]) {
        parts.push(
          part(cap(0.05, 0.22), detail, {
            pos: [side * 0.09, 0.36, -0.38],
            rot: [1.1, side * 0.25, 0],
            scale: [1, 1, 0.45],
          })
        );
      }
      parts.push(...animeFace(headY + 0.02, headZ + 0.23, 0.115, 0.072, iris, true, false));
      break;
    }

    case 'pulinho': {
      // Energetic spring-tailed fox/jerboa kit with huge expressive ears & scarf ruff
      parts.push(part(sph(0.3, 14, 10), body, { pos: [0, 0.48, 0], scale: [0.95, 1.15, 0.92] }));
      parts.push(part(sph(0.22, 12, 8), belly, { pos: [0, 0.46, 0.13], scale: [0.9, 1.05, 0.65] }));
      headY = 0.88;
      headZ = 0.06;
      parts.push(
        part(sph(0.27, 16, 12), body, { pos: [0, headY, headZ], scale: [1.08, 0.94, 1.0] })
      );
      // Huge expressive rabbit-fox ears
      for (const side of [-1, 1]) {
        parts.push(
          part(cap(0.075, 0.32 + s * 0.06), body, {
            pos: [side * 0.19, headY + 0.32, headZ - 0.04],
            rot: [-0.15, 0, -side * 0.28],
            scale: [0.9, 1, 0.55],
          })
        );
        parts.push(
          part(cap(0.042, 0.22), 0xffcbd6, {
            pos: [side * 0.19, headY + 0.3, headZ + 0.01],
            rot: [-0.15, 0, -side * 0.28],
            scale: [0.9, 1, 0.4],
          })
        );
        // Nimble paws & bouncy legs
        parts.push(part(cap(0.065, 0.18), body, { pos: [side * 0.16, 0.16, 0.03] }));
        parts.push(
          part(sph(0.085, 10, 8), belly, {
            pos: [side * 0.16, 0.06, 0.1],
            scale: [0.95, 0.65, 1.5],
          })
        );
        parts.push(
          part(cap(0.055, 0.15), body, {
            pos: [side * 0.28, 0.52, 0.1],
            rot: [0.4, 0, -side * 0.35],
          })
        );
      }
      // Big fluffy bouncing tail
      parts.push(
        part(cap(0.11, 0.36 + s * 0.08), detail, { pos: [0, 0.44, -0.36], rot: [-0.7, 0, 0] })
      );
      parts.push(part(sph(0.15, 10, 8), belly, { pos: [0, 0.64, -0.52] }));
      parts.push(...animeFace(headY, headZ + 0.24, 0.11, 0.074, iris, true, true));
      break;
    }

    case 'felpudo': {
      // Cloud-maned lion/puppy cub with lush scalloped mane & wagging plume tail
      parts.push(part(sph(0.36, 14, 10), body, { pos: [0, 0.44, -0.04], scale: [1.0, 0.9, 1.24] }));
      parts.push(part(sph(0.28, 12, 8), belly, { pos: [0, 0.38, 0.0], scale: [0.9, 0.78, 1.1] }));
      headY = 0.72;
      headZ = 0.34;
      // Fluffy scalloped cloud mane
      const puffs = 8;
      for (let i = 0; i < puffs; i++) {
        const a = (i / puffs) * Math.PI * 2;
        parts.push(
          part(sph(0.15 + s * 0.02, 10, 8), i % 2 ? belly : mix(body, belly, 0.5), {
            pos: [Math.cos(a) * 0.24, headY + Math.sin(a) * 0.24, headZ - 0.06],
          })
        );
      }
      parts.push(part(sph(0.26, 14, 10), body, { pos: [0, headY, headZ] }));
      for (const side of [-1, 1]) {
        parts.push(
          part(sph(0.08, 10, 8), detail, { pos: [side * 0.2, headY + 0.22, headZ - 0.02] })
        );
        parts.push(part(cap(0.075, 0.16), body, { pos: [side * 0.2, 0.15, 0.22] }));
        parts.push(part(cap(0.075, 0.16), body, { pos: [side * 0.2, 0.15, -0.28] }));
      }
      parts.push(part(cap(0.08, 0.28), body, { pos: [0, 0.54, -0.52], rot: [-0.8, 0, 0] }));
      parts.push(part(sph(0.16, 10, 8), belly, { pos: [0, 0.7, -0.66] }));
      parts.push(...animeFace(headY + 0.01, headZ + 0.22, 0.105, 0.072, iris, true, true));
      break;
    }

    case 'rabisco': {
      // Cute coiled brush-tailed spirit-serpent / axolotl dragon
      const segs = 6 + s;
      for (let i = 0; i < segs; i++) {
        const t = i / (segs - 1);
        const r = 0.21 * (1 - t * 0.48);
        parts.push(
          part(sph(r, 12, 8), i % 2 ? body : mix(body, belly, 0.35), {
            pos: [Math.sin(t * 4.2) * 0.24, 0.2 + (1 - t) * 0.18, 0.2 - t * 0.85],
          })
        );
      }
      // Calligraphy-brush tail tip
      parts.push(
        part(cone(0.11, 0.28, 10), detail, {
          pos: [Math.sin(4.2) * 0.24, 0.26, -0.78],
          rot: [-1.4, 0, 0],
        })
      );
      headY = 0.66;
      headZ = 0.3;
      parts.push(
        part(sph(0.27, 16, 12), body, { pos: [0, headY, headZ], scale: [1.08, 0.9, 1.06] })
      );
      parts.push(
        part(sph(0.18, 10, 8), belly, {
          pos: [0, headY - 0.1, headZ + 0.1],
          scale: [1.0, 0.65, 0.9],
        })
      );
      // Cute axolotl-like cheek frills
      for (const side of [-1, 1]) {
        for (const dy of [-0.05, 0.06]) {
          parts.push(
            part(cap(0.036, 0.13), detail, {
              pos: [side * 0.28, headY + dy, headZ - 0.04],
              rot: [0, 0, -side * (1.2 - dy * 3)],
            })
          );
        }
      }
      parts.push(...animeFace(headY + 0.04, headZ + 0.24, 0.115, 0.074, iris, true, true));
      break;
    }

    case 'orelhito': {
      // Caputino's evolutions (stages 1 & 2) matching Caputino's adorable squirrel-bunny design!
      parts.push(part(sph(0.34, 16, 12), body, { pos: [0, 0.44, 0], scale: [0.95, 1.12, 0.92] }));
      parts.push(
        part(sph(0.26, 14, 10), belly, { pos: [0, 0.42, 0.14], scale: [0.9, 1.05, 0.68] })
      );
      headY = 0.82;
      headZ = 0.06;
      parts.push(
        part(sph(0.28, 16, 12), body, { pos: [0, headY, headZ], scale: [1.05, 0.96, 0.98] })
      );
      parts.push(
        part(sph(0.18, 10, 8), belly, {
          pos: [0, headY - 0.08, headZ + 0.18],
          scale: [1.15, 0.72, 0.7],
        })
      );
      // Signature huge fluffy squirrel tail behind back
      parts.push(
        part(cap(0.22, 0.55 + s * 0.1), belly, { pos: [0, 0.64, -0.34], scale: [1.05, 1.0, 0.72] })
      );
      parts.push(part(cap(0.16, 0.45), body, { pos: [0, 0.68, -0.4], scale: [1.0, 1.0, 0.6] }));
      // Tall pointed squirrel ears
      for (const side of [-1, 1]) {
        parts.push(
          part(cone(0.09, 0.34 + s * 0.06, 10), body, {
            pos: [side * 0.17, headY + 0.32, headZ - 0.02],
            rot: [0, 0, -side * 0.22],
          })
        );
        parts.push(
          part(cone(0.052, 0.22, 8), 0xffcad6, {
            pos: [side * 0.17, headY + 0.3, headZ + 0.02],
            rot: [0, 0, -side * 0.22],
          })
        );
        parts.push(part(sph(0.08, 10, 8), body, { pos: [side * 0.22, 0.48, 0.22] }));
        parts.push(
          part(sph(0.085, 10, 8), belly, { pos: [side * 0.15, 0.08, 0.1], scale: [1, 0.7, 1.3] })
        );
      }
      parts.push(...animeFace(headY + 0.02, headZ + 0.24, 0.11, 0.078, iris, true, true));
      break;
    }

    case 'penugem': {
      // Silky cloud-feathered sky-griflet / dove with sweeping wings & golden crest
      parts.push(part(sph(0.34, 16, 12), body, { pos: [0, 0.48, 0], scale: [1.02, 0.96, 1.15] }));
      parts.push(part(sph(0.28, 14, 10), belly, { pos: [0, 0.45, 0.14], scale: [0.95, 0.9, 0.8] }));
      headY = 0.84;
      headZ = 0.12;
      parts.push(part(sph(0.26, 16, 12), belly, { pos: [0, headY, headZ] }));
      parts.push(
        part(cone(0.06, 0.15, 8), 0xf6c358, {
          pos: [0, headY - 0.03, headZ + 0.25],
          rot: [Math.PI / 2, 0, 0],
        })
      );
      // Golden forehead plume
      parts.push(
        part(cap(0.045, 0.18 + s * 0.06), 0xf6d365, {
          pos: [0, headY + 0.26, headZ + 0.04],
          rot: [-0.25, 0, 0],
        })
      );
      for (const side of [-1, 1]) {
        parts.push(
          part(sph(0.28 + s * 0.05, 12, 8), belly, {
            pos: [side * 0.42, 0.56, -0.06],
            rot: [0.15, side * 0.25, -side * 0.55],
            scale: [1.35, 0.55, 0.85],
          })
        );
        parts.push(
          part(sph(0.065, 8, 6), 0xf6c358, {
            pos: [side * 0.12, 0.06, 0.06],
            scale: [1.1, 0.55, 1.4],
          })
        );
      }
      parts.push(part(sph(0.22, 10, 8), body, { pos: [0, 0.44, -0.44], scale: [1.1, 0.5, 1.2] }));
      parts.push(...animeFace(headY + 0.03, headZ + 0.22, 0.11, 0.072, iris, true, false));
      break;
    }

    default: {
      // 'gosminha': Pastel raindrop-slime spirit with dew-drop crown & floating bubbles
      parts.push(part(sph(0.42, 16, 12), body, { pos: [0, 0.36, 0], scale: [1.15, 0.84, 1.08] }));
      parts.push(part(sph(0.32, 14, 10), belly, { pos: [0, 0.3, 0.16], scale: [1.0, 0.72, 0.72] }));
      // Glossy water-drop top crest
      parts.push(part(cone(0.16, 0.34, 12), body, { pos: [0, 0.76, -0.02] }));
      // Cute cat-like slime ear nubs + floating dew bubbles
      for (const side of [-1, 1]) {
        parts.push(
          part(sph(0.11, 10, 8), body, {
            pos: [side * 0.28, 0.62, 0.04],
            scale: [0.85, 1.25, 0.85],
          })
        );
        parts.push(
          part(sph(0.075 + s * 0.015, 10, 8), belly, {
            pos: [side * 0.52, 0.65 + side * 0.06, -0.05],
          })
        );
      }
      headY = 0.54;
      headZ = 0.2;
      parts.push(...animeFace(0.42, 0.4, 0.15, 0.08, iris, true, false));
      break;
    }
  }

  if (element !== 'neutro' && element !== 'radioativo') {
    parts.push(...accessory(element, detail, headY, headZ, s));
  }

  const geo = merge(parts);
  const scale = 0.88 + s * 0.22;
  geo.scale(scale, scale, scale);
  geometryCache.set(key, geo);
  return geo;
}

export interface CreatureMesh extends Group {
  userData: { body: Mesh; material: MeshToonMaterial; baseY: number; phase: number };
}

/** A group with the smooth sculpted anime creature mesh and a soft contact shadow. */
export function createCreature(
  speciesId: string,
  stage: number,
  element: PetElement = 'neutro'
): CreatureMesh {
  const group = new Group() as CreatureMesh;
  const material = toon();
  const body = addOutline(new Mesh(creatureGeometry(speciesId, stage, element), material), 0.022);
  group.add(body);
  group.add(blobShadow(0.48 + stage * 0.12));
  group.userData = { body, material, baseY: 0, phase: Math.random() * Math.PI * 2 };
  return group;
}

let shadowGeo: BufferGeometry | null = null;
const shadowMat = new MeshBasicMaterial({
  color: 0x241c34,
  transparent: true,
  opacity: 0.22,
  depthWrite: false,
});
export function blobShadow(radius: number): Mesh {
  shadowGeo ??= new CylinderGeometry(1, 1, 0.01, 14);
  const m = new Mesh(shadowGeo, shadowMat);
  m.scale.set(radius, 1, radius);
  m.position.y = 0.01;
  return m;
}

/** Lively anime idle breathing + subtle bobbing. */
export function animateCreature(c: CreatureMesh, time: number): void {
  const { body, phase } = c.userData;
  const t = time * 2.8 + phase;
  body.position.y = Math.abs(Math.sin(t)) * 0.055;
  body.scale.set(
    1 + Math.sin(t * 2) * 0.025,
    1 - Math.sin(t * 2) * 0.03,
    1 + Math.sin(t * 2) * 0.02
  );
}

export function disposeCreature(c: CreatureMesh): void {
  c.userData.material.dispose();
}

/** Cached hand-painted woven fabric & trim texture shared by all NPCs (zero per-NPC VRAM cost!). */
let npcClothTex: CanvasTexture | null = null;
function npcClothTexture(): CanvasTexture {
  if (npcClothTex) return npcClothTex;
  const s = 128;
  const c = document.createElement('canvas');
  c.width = s;
  c.height = s;
  const ctx = c.getContext('2d') as CanvasRenderingContext2D;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, s, s);
  // Subtle watercolor woven linen cross-hatch
  ctx.strokeStyle = 'rgba(70, 52, 38, 0.08)';
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
  // Soft vertical cloth pleats + warm stitched hem band
  for (let i = 0; i < s; i += 16) {
    ctx.fillStyle = 'rgba(40, 28, 20, 0.05)';
    ctx.fillRect(i, 0, 5, s);
  }
  ctx.fillStyle = 'rgba(255, 240, 200, 0.25)';
  ctx.fillRect(0, s - 14, s, 8);
  ctx.strokeStyle = 'rgba(90, 62, 30, 0.18)';
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(0, s - 14);
  ctx.lineTo(s, s - 14);
  ctx.stroke();
  npcClothTex = new CanvasTexture(c);
  npcClothTex.wrapS = RepeatWrapping;
  npcClothTex.wrapT = RepeatWrapping;
  npcClothTex.colorSpace = SRGBColorSpace;
  return npcClothTex;
}

const NPC_HAIR_PALETTE = [0x3b2a26, 0x7c3e26, 0xd8a84a, 0x262c44, 0x7c5a9e, 0xc9d4e2] as const;
const NPC_EYE_PALETTE = [0x2d7894, 0x3b8c52, 0x9c4a6b, 0x4b58b0, 0xb8742a, 0x6c4aa6] as const;

/** Clean, unique anime NPC geometry with varied hairstyles, headgear, outfits & accessories! */
const avatarCache = new Map<string, BufferGeometry>();
export function avatarGeometry(
  bodyColor: number,
  hatColor: number,
  variantSeed?: number
): BufferGeometry {
  const v = Math.abs((variantSeed ?? bodyColor ^ (hatColor >> 2)) % 6);
  const key = `${bodyColor}:${hatColor}:${v}`;
  const cached = avatarCache.get(key);
  if (cached) return cached;

  const skin = v % 3 === 1 ? 0xf2c8a2 : v % 3 === 2 ? 0xdba57e : 0xfde2c8;
  const hair = NPC_HAIR_PALETTE[v];
  const eyeCol = NPC_EYE_PALETTE[v];
  const trim = mix(bodyColor, 0xfff3d4, 0.55);
  const accent = mix(hatColor, 0xf2c85b, 0.35);
  const pants = mix(bodyColor, 0x2a3142, 0.65);

  const pieces: BufferGeometry[] = [
    // Torso (flared coat or tunic) + waist sash + trim hem
    part(cyl(0.135, v % 2 === 0 ? 0.215 : 0.18, 0.44, 12), bodyColor, {
      pos: [0, 0.51, 0],
      scale: [1.06, 1, 0.86],
    }),
    part(cyl(0.15, 0.155, 0.05, 12), accent, { pos: [0, 0.53, 0], scale: [1.08, 1, 0.88] }),
    part(cyl(0.2, 0.21, 0.032, 12), trim, { pos: [0, 0.31, 0], scale: [1.06, 1, 0.86] }),
    // Collar / scarf
    part(cyl(0.13, 0.16, 0.07, 12), trim, { pos: [0, 0.72, 0], scale: [1.08, 1, 0.9] }),
    // Legs + boots
    part(cap(0.052, 0.16), pants, { pos: [-0.088, 0.17, 0] }),
    part(cap(0.052, 0.16), pants, { pos: [0.088, 0.17, 0] }),
    part(sph(0.058, 8, 6), 0x4c3426, { pos: [-0.088, 0.055, 0.03], scale: [0.95, 0.7, 1.35] }),
    part(sph(0.058, 8, 6), 0x4c3426, { pos: [0.088, 0.055, 0.03], scale: [0.95, 0.7, 1.35] }),
    // Sleeves + hands
    part(cap(0.046, 0.2), bodyColor, { pos: [-0.22, 0.54, 0], rot: [0, 0, 0.18] }),
    part(cap(0.046, 0.2), bodyColor, { pos: [0.22, 0.54, 0], rot: [0, 0, -0.18] }),
    part(sph(0.038, 8, 6), skin, { pos: [-0.25, 0.39, 0.01] }),
    part(sph(0.038, 8, 6), skin, { pos: [0.25, 0.39, 0.01] }),
    // Head + base hair cap
    part(sph(0.215, 14, 10), skin, { pos: [0, 0.93, 0] }),
    part(sph(0.23, 14, 10), hair, { pos: [0, 0.97, -0.04] }),
    // Satchel / backpack
    part(cap(0.095, 0.14), 0x7c5035, { pos: [0, 0.56, -0.17] }),
    ...animeFace(0.91, 0.195, 0.082, 0.05, eyeCol, true, false),
  ];

  // Unique hairstyles + signature headgear / accessories per variant!
  if (v === 0) {
    // Explorer wide-brim hat + long flowing hair locks
    pieces.push(
      part(cyl(0.24, 0.32, 0.035, 14), hatColor, { pos: [0, 1.11, -0.01], rot: [-0.1, 0, 0] }),
      part(sph(0.2, 12, 8), hatColor, { pos: [0, 1.16, -0.02], scale: [1, 0.72, 1] }),
      part(cap(0.05, 0.2), hair, { pos: [-0.18, 0.84, 0.02] }),
      part(cap(0.05, 0.2), hair, { pos: [0.18, 0.84, 0.02] })
    );
  } else if (v === 1) {
    // Pointed witch / alchemist hat + shoulder capelet
    pieces.push(
      part(cyl(0.22, 0.33, 0.03, 14), hatColor, { pos: [0, 1.1, -0.01], rot: [-0.08, 0, 0.06] }),
      part(cone(0.18, 0.36, 12), hatColor, { pos: [0.02, 1.28, -0.03], rot: [-0.15, 0, -0.12] }),
      part(cyl(0.14, 0.24, 0.16, 12), mix(hatColor, bodyColor, 0.4), { pos: [0, 0.68, -0.02] })
    );
  } else if (v === 2) {
    // Artist/Merchant tilted beret + round scholar spectacles + side bob
    pieces.push(
      part(sph(0.23, 12, 8), hatColor, {
        pos: [0.05, 1.14, -0.02],
        rot: [0, 0, -0.22],
        scale: [1.1, 0.45, 1.05],
      }),
      part(new TorusGeometry(0.048, 0.009, 6, 12), 0xdcb44a, { pos: [-0.075, 0.92, 0.205] }),
      part(new TorusGeometry(0.048, 0.009, 6, 12), 0xdcb44a, { pos: [0.075, 0.92, 0.205] }),
      part(sph(0.07, 8, 6), hair, { pos: [-0.2, 0.87, 0] }),
      part(sph(0.07, 8, 6), hair, { pos: [0.2, 0.87, 0] })
    );
  } else if (v === 3) {
    // Martial-arts headband + spiky anime hair + trailing ribbon tails
    pieces.push(
      part(cyl(0.225, 0.225, 0.045, 14), hatColor, { pos: [0, 1.02, -0.01] }),
      part(cone(0.07, 0.18, 7), hair, { pos: [-0.1, 1.16, 0.02], rot: [0.1, 0, 0.35] }),
      part(cone(0.07, 0.2, 7), hair, { pos: [0.02, 1.19, -0.02], rot: [-0.1, 0, -0.1] }),
      part(cone(0.07, 0.17, 7), hair, { pos: [0.12, 1.15, 0.01], rot: [0.1, 0, -0.4] }),
      part(cone(0.04, 0.22, 6), hatColor, { pos: [-0.05, 0.96, -0.25], rot: [-0.8, 0, 0.2] }),
      part(cone(0.04, 0.22, 6), hatColor, { pos: [0.05, 0.96, -0.25], rot: [-0.8, 0, -0.2] })
    );
  } else if (v === 4) {
    // Twin buns / pigtails + botanical flower crest
    pieces.push(
      part(sph(0.095, 10, 8), hair, { pos: [-0.22, 1.1, -0.04] }),
      part(sph(0.095, 10, 8), hair, { pos: [0.22, 1.1, -0.04] }),
      part(sph(0.055, 8, 6), hatColor, { pos: [-0.16, 1.13, 0.08] }),
      part(sph(0.032, 6, 6), 0xfff282, { pos: [-0.16, 1.13, 0.12] })
    );
  } else {
    // Artisan newsboy cap + high ponytail + brass goggles
    pieces.push(
      part(sph(0.22, 12, 8), hatColor, { pos: [0, 1.1, -0.01], scale: [1.05, 0.52, 1.12] }),
      part(cyl(0.18, 0.22, 0.025, 10), mix(hatColor, 0x222222, 0.3), {
        pos: [0, 1.07, 0.11],
        rot: [0.12, 0, 0],
      }),
      part(cone(0.08, 0.28, 8), hair, { pos: [0, 0.95, -0.24], rot: [-0.5, 0, 0] }),
      part(sph(0.045, 8, 6), 0x7de6ff, { pos: [-0.07, 1.1, 0.18], scale: [1, 0.85, 0.5] }),
      part(sph(0.045, 8, 6), 0x7de6ff, { pos: [0.07, 1.1, 0.18], scale: [1, 0.85, 0.5] })
    );
  }

  const geo = merge(pieces);
  // Seamless cylindrical UVs so the woven linen & hem cloth texture wraps every unique NPC!
  const pos = geo.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    uvs[i * 2] = Math.atan2(x, z) / (Math.PI * 2) + 0.5;
    uvs[i * 2 + 1] = Math.max(0, Math.min(1, y / 1.35));
  }
  geo.setAttribute('uv', new BufferAttribute(uvs, 2));
  avatarCache.set(key, geo);
  return geo;
}

export function createAvatar(bodyColor: number, hatColor: number, variantSeed?: number): Group {
  const g = new Group();
  g.add(
    addOutline(
      new Mesh(
        avatarGeometry(bodyColor, hatColor, variantSeed),
        toon({ map: npcClothTexture(), vertexColors: true })
      ),
      0.022
    )
  );
  g.add(blobShadow(0.35));
  return g;
}

// --- BotW-inspired 3D Scenery Pieces ---

/**
 * Zelda: Breath of the Wild-inspired sculpted watercolor oak tree (matching the user's reference):
 * - Flared gnarled root buttresses gripping the meadow
 * - Organic curved/twisted weathered grey-brown trunk splitting into 4 visible spreading branches
 * - Airy, asymmetrical multi-bough watercolor foliage clusters (deep olive underside -> meadow green -> sunlit lime crown)
 *   with open gaps revealing the gnarled branches underneath!
 */
/**
 * Textured BotW gnarled oak tree trunk & spreading boughs (UV-mapped to `tree_bark.webp` from Image 4!).
 */
export const treeTrunkGeometry = () =>
  merge([
    // Flared gnarled root buttresses gripping the meadow
    texturedPart(cone(0.22, 0.44, 7), 0xffffff, {
      pos: [-0.22, 0.13, 0.14],
      rot: [0.35, 0.2, 0.78],
      uvScale: [1, 1],
    }),
    texturedPart(cone(0.21, 0.42, 7), 0xf4eee6, {
      pos: [0.22, 0.13, -0.1],
      rot: [-0.3, -0.1, -0.76],
      uvScale: [1, 1],
    }),
    texturedPart(cone(0.19, 0.38, 7), 0xebe4da, {
      pos: [0.06, 0.11, 0.22],
      rot: [0.72, 0, -0.2],
      uvScale: [1, 1],
    }),
    texturedPart(cone(0.18, 0.38, 7), 0xf0e9df, {
      pos: [-0.08, 0.11, -0.2],
      rot: [-0.7, 0, 0.22],
      uvScale: [1, 1],
    }),
    // Organic curved/twisted two-segment main trunk
    texturedPart(cyl(0.16, 0.27, 0.64, 10), 0xffffff, {
      pos: [-0.03, 0.31, 0],
      rot: [0.04, 0, -0.12],
      uvScale: [1.5, 1.2],
    }),
    texturedPart(cyl(0.125, 0.165, 0.58, 10), 0xffffff, {
      pos: [0.03, 0.8, 0.02],
      rot: [-0.05, 0, 0.14],
      uvScale: [1.3, 1.1],
    }),
    // 4 gnarled spreading boughs reaching outward into the airy canopy
    texturedPart(cyl(0.06, 0.115, 0.72, 8), 0xf6f0e8, {
      pos: [-0.28, 1.14, 0.08],
      rot: [0.16, 0, 0.72],
      uvScale: [1, 1.1],
    }),
    texturedPart(cyl(0.056, 0.105, 0.68, 8), 0xffffff, {
      pos: [0.3, 1.16, -0.06],
      rot: [-0.14, 0, -0.68],
      uvScale: [1, 1.1],
    }),
    texturedPart(cyl(0.05, 0.09, 0.56, 8), 0xf0e9e0, {
      pos: [0.04, 1.18, 0.24],
      rot: [0.64, 0, -0.12],
      uvScale: [1, 1],
    }),
    texturedPart(cyl(0.048, 0.085, 0.54, 8), 0xede6dc, {
      pos: [-0.06, 1.2, -0.22],
      rot: [-0.62, 0, 0.18],
      uvScale: [1, 1],
    }),
  ]);

/**
 * Textured BotW watercolor canopy puffs (UV-mapped to `tree_canopy_tile.webp` from Image 4!)
 * Softly tinted from shaded lower boughs up to sunlit lime crown.
 */
export const treeCanopyGeometry = (tint = 0xffffff) => {
  const shade = mix(tint, 0x769a74, 0.25);
  const mid = mix(tint, 0xffffff, 0.1);
  const top = mix(tint, 0xf8ffcf, 0.22);
  // Inner volumetric 3D canopy core (slightly inset so the hand-painted Image 4 foliage cards define the outer serrated silhouette!)
  return merge([
    texturedPart(sph(0.38, 12, 10), shade, {
      pos: [-0.36, 1.38, 0.12],
      scale: [1.12, 0.76, 1.02],
      uvScale: [1.4, 1.3],
    }),
    texturedPart(sph(0.36, 12, 10), shade, {
      pos: [0.38, 1.4, -0.06],
      scale: [1.1, 0.74, 1.0],
      uvScale: [1.4, 1.3],
    }),
    texturedPart(sph(0.34, 12, 10), mid, {
      pos: [0.06, 1.38, 0.32],
      scale: [1.08, 0.72, 0.94],
      uvScale: [1.3, 1.2],
    }),
    texturedPart(sph(0.34, 12, 10), shade, {
      pos: [-0.08, 1.38, -0.3],
      scale: [1.08, 0.72, 0.94],
      uvScale: [1.3, 1.2],
    }),
    texturedPart(sph(0.4, 12, 10), mid, {
      pos: [-0.16, 1.66, 0.08],
      scale: [1.1, 0.8, 1.02],
      uvScale: [1.5, 1.4],
    }),
    texturedPart(sph(0.38, 12, 10), mid, {
      pos: [0.22, 1.68, 0.1],
      scale: [1.08, 0.78, 1.0],
      uvScale: [1.5, 1.4],
    }),
    texturedPart(sph(0.32, 12, 10), top, {
      pos: [-0.02, 1.92, 0.06],
      scale: [1.1, 0.74, 1.0],
      uvScale: [1.4, 1.3],
    }),
  ]);
};

export const treeGeometry = () =>
  merge([
    // Flared gnarled root buttresses gripping the ground
    part(cone(0.2, 0.42, 6), 0x5c4c3e, { pos: [-0.22, 0.12, 0.14], rot: [0.35, 0.2, 0.78] }),
    part(cone(0.19, 0.4, 6), 0x6b5848, { pos: [0.22, 0.12, -0.1], rot: [-0.3, -0.1, -0.76] }),
    part(cone(0.18, 0.36, 6), 0x544538, { pos: [0.06, 0.11, 0.22], rot: [0.72, 0, -0.2] }),
    part(cone(0.17, 0.36, 6), 0x625040, { pos: [-0.08, 0.11, -0.2], rot: [-0.7, 0, 0.22] }),
    // Organic curved/twisted two-segment main trunk
    part(cyl(0.145, 0.25, 0.62, 9), 0x6d5a49, { pos: [-0.03, 0.3, 0], rot: [0.04, 0, -0.12] }),
    part(cyl(0.115, 0.15, 0.56, 9), 0x786350, { pos: [0.03, 0.78, 0.02], rot: [-0.05, 0, 0.14] }),
    // 4 gnarled spreading boughs reaching outward into the airy canopy
    part(cyl(0.055, 0.105, 0.68, 7), 0x685646, { pos: [-0.26, 1.12, 0.08], rot: [0.16, 0, 0.72] }),
    part(cyl(0.052, 0.1, 0.64, 7), 0x735f4d, { pos: [0.28, 1.14, -0.06], rot: [-0.14, 0, -0.68] }),
    part(cyl(0.048, 0.085, 0.54, 7), 0x615041, { pos: [0.04, 1.16, 0.24], rot: [0.64, 0, -0.12] }),
    part(cyl(0.045, 0.08, 0.52, 7), 0x5e4d3f, { pos: [-0.06, 1.18, -0.22], rot: [-0.62, 0, 0.18] }),
    // Deep olive-sage shaded lower foliage boughs (leaving branches visible!)
    part(ico(0.46, 1), 0x3b6e44, { pos: [-0.46, 1.38, 0.14], scale: [1.18, 0.78, 1.05] }),
    part(ico(0.44, 1), 0x417848, { pos: [0.48, 1.4, -0.08], scale: [1.16, 0.76, 1.04] }),
    part(ico(0.4, 1), 0x46804a, { pos: [0.08, 1.36, 0.42], scale: [1.12, 0.74, 0.96] }),
    part(ico(0.4, 1), 0x386942, { pos: [-0.1, 1.38, -0.38], scale: [1.1, 0.76, 0.98] }),
    // Vibrant BotW meadow-green mid-canopy clusters
    part(ico(0.48, 1), 0x5d9e48, { pos: [-0.22, 1.68, 0.1], scale: [1.14, 0.84, 1.08] }),
    part(ico(0.44, 1), 0x67a84c, { pos: [0.28, 1.72, 0.14], scale: [1.12, 0.82, 1.04] }),
    part(ico(0.38, 1), 0x569445, { pos: [-0.48, 1.56, -0.14], scale: [1.05, 0.76, 1.0] }),
    // Sunlit warm lime-gold crown puffs (BotW sunlit top-lighting!)
    part(ico(0.38, 1), 0x8ec452, { pos: [-0.06, 1.98, 0.08], scale: [1.16, 0.78, 1.06] }),
    part(ico(0.3, 1), 0xb2d860, { pos: [0.16, 2.08, 0.12], scale: [1.08, 0.72, 1.0] }),
    part(ico(0.28, 1), 0xa4cf5a, { pos: [-0.34, 1.76, 0.24], scale: [1.04, 0.68, 0.96] }),
  ]);

/** Slender BotW silver-birch tree variant (matching the airy pale-bark birch on the right of the reference!). */
const pineTreeGeometry = () =>
  merge([
    part(cyl(0.065, 0.125, 1.18, 8), 0xcac3b8, { pos: [0, 0.58, 0], rot: [0.03, 0, -0.06] }),
    part(cyl(0.038, 0.062, 0.68, 7), 0xbdb6aa, { pos: [0.2, 1.18, 0.04], rot: [0.08, 0, -0.52] }),
    part(cyl(0.035, 0.058, 0.62, 7), 0xc4bdb2, {
      pos: [-0.18, 1.24, -0.04],
      rot: [-0.08, 0, 0.48],
    }),
    part(ico(0.38, 1), 0x4c8a4c, { pos: [-0.3, 1.48, 0.06], scale: [1.15, 0.74, 1.02] }),
    part(ico(0.36, 1), 0x5c9e50, { pos: [0.32, 1.44, -0.04], scale: [1.12, 0.74, 1.0] }),
    part(ico(0.4, 1), 0x7ab854, { pos: [0, 1.74, 0.04], scale: [1.18, 0.8, 1.05] }),
    part(ico(0.28, 1), 0xa8d462, { pos: [0.08, 1.98, 0.06], scale: [1.08, 0.72, 1.0] }),
  ]);

/** Mossy BotW meadow boulder with sunlit grass cap and wildflower accent. */
const boulderGeometry = () =>
  merge([
    part(ico(0.44, 1), 0x8e9394, { pos: [0, 0.3, 0], scale: [1.15, 0.78, 1.05] }),
    part(ico(0.28, 1), 0x7a8082, { pos: [0.32, 0.2, 0.15], scale: [1.1, 0.7, 0.95] }),
    part(sph(0.34, 10, 6), 0x5db05a, { pos: [-0.04, 0.56, -0.02], scale: [1.15, 0.32, 1.05] }),
  ]);

export const tallGrassGeometry = () =>
  merge(
    [
      [-0.24, -0.2, 0.48, 0.14],
      [0.22, -0.22, 0.52, -0.18],
      [0, 0.04, 0.56, 0.08],
      [-0.22, 0.22, 0.44, 0.2],
      [0.24, 0.2, 0.5, -0.14],
      [0.05, -0.24, 0.42, 0.12],
    ].map(([x, z, h, lean], i) =>
      part(cone(0.11, h, 5), i % 2 ? 0x4ca848 : 0x72c858, {
        pos: [x, h * 0.46, z],
        rot: [lean, i * 1.1, lean * 0.6],
      })
    )
  );

export const flowerGeometry = () =>
  merge([
    part(cyl(0.018, 0.02, 0.18, 5), 0x49a646, { pos: [0, 0.09, 0] }),
    part(sph(0.065, 8, 6), 0xffffff, { pos: [0, 0.19, 0], scale: [1, 0.55, 1] }),
  ]);

export const chestGeometry = () =>
  merge([
    part(box(0.62, 0.34, 0.44), 0x9b5f32, { pos: [0, 0.17, 0] }),
    part(cyl(0.22, 0.22, 0.64, 10), 0xb8743c, { pos: [0, 0.35, 0], rot: [0, 0, Math.PI / 2] }),
    part(box(0.66, 0.06, 0.48), 0xf4c94e, { pos: [0, 0.33, 0] }),
    part(sph(0.065, 8, 6), 0xffe478, { pos: [0, 0.32, 0.24], scale: [1.1, 1.3, 0.5] }),
  ]);

/** BotW-inspired Goddess / Breeze Healing Fountain Shrine. */
export const healGeometry = () =>
  merge([
    part(cyl(0.46, 0.54, 0.16, 12), 0xdad4c8, { pos: [0, 0.08, 0] }),
    part(cyl(0.36, 0.36, 0.06, 12), 0x6fd8f4, { pos: [0, 0.17, 0] }),
    part(cyl(0.14, 0.18, 0.55, 10), 0xe8e2d6, { pos: [0, 0.44, 0] }),
    part(new OctahedronGeometry(0.18), 0x7ef2c8, { pos: [0, 0.92, 0], scale: [0.8, 1.35, 0.8] }),
    part(new TorusGeometry(0.24, 0.03, 8, 16), 0xffe484, {
      pos: [0, 0.92, 0],
      rot: [Math.PI / 2, 0, 0],
    }),
  ]);

export const portalGeometry = () =>
  merge([
    part(cyl(0.66, 0.74, 0.16, 12), 0xb8b2a8, { pos: [0, 0.08, 0] }),
    part(cyl(0.12, 0.15, 1.45, 10), 0xd2ccc0, { pos: [-0.52, 0.78, 0] }),
    part(cyl(0.12, 0.15, 1.45, 10), 0xd2ccc0, { pos: [0.52, 0.78, 0] }),
    part(box(1.3, 0.22, 0.26), 0xc8c2b6, { pos: [0, 1.56, 0] }),
    part(new OctahedronGeometry(0.16), 0xf4c94e, { pos: [0, 1.8, 0] }),
  ]);

export const portalCoreGeometry = () =>
  merge([part(box(0.88, 1.3, 0.06), 0x8e6bff, { pos: [0, 0.8, 0] })]);

const tufts = (a: number, b: number, r = 0.12, h = 0.45, seg = 5) =>
  merge(
    [
      [-0.25, -0.2],
      [0.2, -0.25],
      [0, 0.05],
      [-0.2, 0.25],
      [0.25, 0.22],
    ].map(([x, z], i) =>
      part(cone(r, h + (i % 2) * 0.1, seg), i % 2 ? a : b, { pos: [x, h / 2, z], rot: [0, i, 0] })
    )
  );

export const sunflowerGeometry = () =>
  merge([
    part(cyl(0.022, 0.028, 0.56, 6), 0x4ca644, { pos: [0, 0.28, 0] }),
    part(sph(0.09, 8, 6), 0x5ec252, {
      pos: [0.09, 0.26, 0],
      scale: [1.4, 0.4, 0.7],
      rot: [0, 0, 0.4],
    }),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
      const a = (i / 8) * Math.PI * 2;
      return part(sph(0.055, 6, 6), 0xffd43b, {
        pos: [Math.cos(a) * 0.1, 0.62 + Math.sin(a) * 0.1, 0.02],
        scale: [0.7, 1.25, 0.35],
        rot: [0, 0, a],
      });
    }),
    part(sph(0.075, 8, 6), 0x7a4822, { pos: [0, 0.62, 0.04], scale: [1, 1, 0.5] }),
  ]);

/**
 * Cozy hand-painted watercolor timber cottages modeled after the user's cottage reference:
 * - Stepped cobblestone foundation + 2 front stone porch steps
 * - Vertical honey-oak timber plank walls with thick corner log posts & gable crossbeam
 * - Front-facing steep golden-shingle A-frame gable roof with chunky top ridge beam
 * - Left-side cobblestone chimney with rising wispy smoke puffs
 * - Arched-window wooden front door with brass doorknob
 * - 2 lavender-curtained ground windows with colorful flower boxes + 1 centered attic window
 */
const HOUSE_COLORS = [
  {
    wall: 0xc99250,
    wallAlt: 0xb67e3e,
    roof: 0xe0b24a,
    roofDark: 0xb8812d,
    trim: 0x764927,
    curtain: 0xb87ad6,
  },
  {
    wall: 0xc48b4c,
    wallAlt: 0xaf773a,
    roof: 0xd8a246,
    roofDark: 0xa87128,
    trim: 0x6c4223,
    curtain: 0x9c82d8,
  },
  {
    wall: 0xce9a58,
    wallAlt: 0xb88342,
    roof: 0xe6ba56,
    roofDark: 0xbd8a32,
    trim: 0x7d4e2a,
    curtain: 0xc87ec4,
  },
  {
    wall: 0xbf8648,
    wallAlt: 0xaa7236,
    roof: 0xd49c42,
    roofDark: 0xa46d26,
    trim: 0x683f22,
    curtain: 0x8ea4d8,
  },
];

const houseGeometry = (v: number) => {
  // Variant 3 is a cozy 3-story residential Apartment Building with balconies & NPC apartments!
  if (v % HOUSE_COLORS.length === 3) {
    const wall = 0xd9c2a3;
    const trim = 0x7a5436;
    const roof = 0xc97b42;
    const glass = 0x627392;
    return merge([
      part(box(1.14, 0.2, 1.02), 0x84929e, { pos: [0, 0.1, 0] }),
      part(box(1.06, 1.65, 0.92), wall, { pos: [0, 1.02, 0] }),
      part(box(1.18, 0.14, 1.04), roof, { pos: [0, 1.9, 0] }),
      part(box(0.32, 0.44, 0.06), trim, { pos: [0, 0.42, 0.46] }),
      part(box(0.22, 0.38, 0.07), 0x9b6236, { pos: [0, 0.4, 0.47] }),
      // 3 floors of apartment windows & cozy wooden balconies
      ...[0.54, 1.04, 1.54].flatMap((wy, fl) => [
        part(box(1.1, 0.06, 0.96), trim, { pos: [0, wy - 0.2, 0] }),
        ...[-0.3, 0.3].flatMap((wx) => [
          part(box(0.24, 0.24, 0.05), trim, { pos: [wx, wy, 0.46] }),
          part(box(0.18, 0.18, 0.06), fl === 1 ? 0xffe494 : glass, { pos: [wx, wy, 0.465] }),
          ...(fl > 0 ? [part(box(0.34, 0.09, 0.14), trim, { pos: [wx, wy - 0.14, 0.51] })] : []),
        ]),
      ]),
    ]);
  }
  const c = HOUSE_COLORS[v % HOUSE_COLORS.length];
  const stoneLight = 0x9ba9b4;
  const stoneMid = 0x84929e;
  const stoneDark = 0x6a7782;
  const glass = 0x5c6882;
  const parts: BufferGeometry[] = [
    // 1. Stepped cobblestone foundation + textured stone blocks along front edge
    part(box(1.12, 0.19, 1.02), stoneMid, { pos: [0, 0.095, 0] }),
    ...[-0.42, -0.2, 0.2, 0.42].map((sx, idx) =>
      part(box(0.2, 0.16, 0.06), idx % 2 ? stoneLight : stoneDark, { pos: [sx, 0.09, 0.51] })
    ),
    // 2 stepped front cobblestone stairs leading to the door
    part(box(0.42, 0.13, 0.18), stoneLight, { pos: [0, 0.065, 0.57] }),
    part(box(0.44, 0.07, 0.18), stoneMid, { pos: [0, 0.035, 0.72] }),

    // 2. Vertical honey-oak timber plank walls + subtle vertical plank relief strips
    part(box(1.0, 0.72, 0.9), c.wall, { pos: [0, 0.54, 0] }),
    ...[-0.36, -0.18, 0.18, 0.36].map((px) =>
      part(box(0.08, 0.7, 0.92), c.wallAlt, { pos: [px, 0.54, 0] })
    ),
    // Thick carved corner log posts + horizontal gable crossbeam
    ...[-0.49, 0.49].flatMap((cx) =>
      [-0.44, 0.44].map((cz) => part(box(0.11, 0.76, 0.11), c.trim, { pos: [cx, 0.55, cz] }))
    ),
    part(box(1.12, 0.09, 0.98), c.trim, { pos: [0, 0.9, 0] }),

    // 3. Triangular front-facing timber gable wall (fills under the steep A-frame roof!)
    part(cyl(0.62, 0.62, 0.92, 3), c.wall, {
      pos: [0, 1.15, 0],
      rot: [Math.PI / 2, Math.PI / 3, 0],
      scale: [0.92, 1.0, 0.98],
    }),
    // Steep roof slopes are rendered separately via `houseRoofGeometry(v)` with hand-painted terracotta/straw tile textures!
    // Roof underside eaves trim
    part(box(0.88, 0.05, 1.2), c.trim, {
      pos: [-0.33, 1.18, 0],
      rot: [0, 0, 0.84],
    }),
    part(box(0.88, 0.05, 1.2), c.trim, {
      pos: [0.33, 1.18, 0],
      rot: [0, 0, -0.84],
    }),
    // Chunky timber ridge beam + protruding front peak block (signature of the reference!)
    part(box(0.18, 0.2, 1.22), c.roofDark, { pos: [0, 1.58, 0] }),
    part(box(0.16, 0.26, 0.14), c.wallAlt, { pos: [0, 1.62, 0.56] }),

    // 4. Left-slope cobblestone chimney + cap + soft rising watercolor smoke puffs!
    part(box(0.22, 0.52, 0.22), stoneMid, { pos: [-0.34, 1.38, -0.05] }),
    part(box(0.27, 0.08, 0.27), stoneLight, { pos: [-0.34, 1.65, -0.05] }),
    part(sph(0.11, 8, 6), 0xf4f7fa, { pos: [-0.35, 1.82, -0.05], scale: [1.0, 1.2, 1.0] }),
    part(sph(0.14, 8, 6), 0xedf2f7, { pos: [-0.39, 2.02, -0.06], scale: [1.1, 1.1, 1.0] }),

    // 5. Timber-framed front door with arched window inset & brass doorknob
    part(box(0.32, 0.54, 0.06), c.trim, { pos: [0, 0.46, 0.45] }),
    part(box(0.24, 0.48, 0.07), c.wallAlt, { pos: [0, 0.44, 0.46] }),
    part(box(0.14, 0.14, 0.08), 0xe6c88a, { pos: [0, 0.55, 0.465] }),
    part(sph(0.028, 8, 6), 0xf7ce52, { pos: [0.085, 0.42, 0.505] }),

    // 6. Centered 4-pane square attic window in the upper timber gable
    part(box(0.24, 0.24, 0.06), c.trim, { pos: [0, 1.18, 0.46] }),
    part(box(0.18, 0.18, 0.07), glass, { pos: [0, 1.18, 0.465] }),
    part(box(0.028, 0.18, 0.08), c.trim, { pos: [0, 1.18, 0.47] }),
    part(box(0.18, 0.028, 0.08), c.trim, { pos: [0, 1.18, 0.47] }),

    // 7. Two ground-floor 4-pane windows with lavender curtains & colorful flower boxes!
    ...[-0.31, 0.31].flatMap((wx) => [
      part(box(0.24, 0.25, 0.06), c.trim, { pos: [wx, 0.57, 0.455] }),
      part(box(0.18, 0.19, 0.07), glass, { pos: [wx, 0.57, 0.46] }),
      // Soft lavender curtains inside the window sides
      part(box(0.055, 0.18, 0.074), c.curtain, { pos: [wx - 0.06, 0.57, 0.462] }),
      part(box(0.055, 0.18, 0.074), c.curtain, { pos: [wx + 0.06, 0.57, 0.462] }),
      // Window cross mullions
      part(box(0.026, 0.19, 0.08), c.trim, { pos: [wx, 0.57, 0.468] }),
      part(box(0.18, 0.026, 0.08), c.trim, { pos: [wx, 0.57, 0.468] }),
      // Wooden flower box + pink/yellow/blue wildflowers!
      part(box(0.26, 0.08, 0.13), 0xa8646e, { pos: [wx, 0.41, 0.5] }),
      part(sph(0.048, 6, 6), 0xff75a8, { pos: [wx - 0.07, 0.47, 0.51] }),
      part(sph(0.048, 6, 6), 0xffe055, { pos: [wx, 0.48, 0.52] }),
      part(sph(0.046, 6, 6), 0x5cc4ff, { pos: [wx + 0.07, 0.47, 0.51] }),
    ]),
  ];
  return merge(parts);
};

export const NEIGHBORHOOD_VARIANTS = HOUSE_COLORS.length;
export const neighborhoodGeometry = (v: number) => houseGeometry(v);

/**
 * Unique physical 3D exterior geometry for each of the 13 village establishments!
 * Matches the game's watercolor + ink-outline cottage design system while giving every
 * building its own unmistakable silhouette (Bank columns, Dojo torii roof, Lab dome, Cemetery crypt, etc.).
 */
/**
 * UV-mapped main wall shell for physical establishments & residences (pairs with wood, bamboo, cement, stone, or brick toon textures!).
 */
export function establishmentWallGeometry(kind: BuildingKind): BufferGeometry {
  const tall = kind === 'banco' || kind === 'prefeitura' || kind === 'hospital';
  const h = tall ? 0.92 : 0.82;
  const w = kind === 'garagem' ? 1.18 : 1.08;
  const d = 0.96;
  return merge([
    texturedPart(box(w, h, d), 0xffffff, {
      pos: [0, 0.18 + h / 2, 0],
      uvScale: [1.35, 1.15],
    }),
  ]);
}

export function establishmentGeometry(kind: BuildingKind): BufferGeometry {
  const b = BUILDINGS[kind];
  const base = [
    // Stone foundation + steps + door + warm lit windows + carved timber corner posts (walls rendered separately with toon texture!)
    part(box(1.22, 0.2, 1.08), 0x84929e, { pos: [0, 0.1, 0] }),
    part(box(0.46, 0.12, 0.22), 0x9ba9b4, { pos: [0, 0.06, 0.6] }),
    // Corner trim posts
    ...[-0.53, 0.53].flatMap((cx) =>
      [-0.47, 0.47].map((cz) => part(box(0.09, 0.84, 0.09), 0x6b4628, { pos: [cx, 0.6, cz] }))
    ),
    part(box(0.34, 0.54, 0.08), 0x6b4628, { pos: [0, 0.46, 0.48] }),
    part(box(0.24, 0.46, 0.09), 0x9c6b3e, { pos: [0, 0.44, 0.49] }),
    ...[-0.35, 0.35].map((wx) => part(box(0.24, 0.24, 0.08), 0xffe494, { pos: [wx, 0.62, 0.48] })),
  ];
  if (kind === 'banco' || kind === 'prefeitura') {
    // Classical pillars + golden civic/bank emblem on top!
    for (const cx of [-0.46, -0.22, 0.22, 0.46]) {
      base.push(part(cyl(0.055, 0.06, 0.8, 8), 0xf4f0e6, { pos: [cx, 0.58, 0.48] }));
    }
    base.push(part(new OctahedronGeometry(0.18), b.accentColor, { pos: [0, 1.65, 0.3] }));
  } else if (kind === 'laboratorio') {
    // Glass dome & glowing cyan genetic spire!
    base.push(
      part(sph(0.46, 12, 8), 0xb8e8f8, { pos: [0, 1.25, 0], scale: [1.1, 0.85, 1.1] }),
      part(cyl(0.08, 0.1, 0.55, 8), 0x52f2d6, { pos: [0.35, 1.45, 0] })
    );
  } else if (kind === 'dojo') {
    // Curved crimson Japanese martial-arts roof tiers + hanging lantern!
    base.push(
      part(box(1.36, 0.14, 1.22), b.roofColor, { pos: [0, 1.04, 0] }),
      part(box(1.06, 0.18, 0.96), b.roofColor, { pos: [0, 1.24, 0] }),
      part(box(0.86, 0.14, 0.16), 0x2c2530, { pos: [0, 1.42, 0] }),
      part(sph(0.1, 8, 6), 0xff6b52, { pos: [0.46, 0.78, 0.5] })
    );
  } else if (kind === 'cemiterio') {
    // Spooky stone witch cottage + gravestones + glowing purple cauldron out front!
    base.push(
      part(cone(0.74, 0.78, 4), b.roofColor, { pos: [0, 1.32, 0], rot: [0, Math.PI / 4, 0] }),
      part(box(0.22, 0.42, 0.08), 0x8a8e9c, { pos: [-0.52, 0.24, 0.56] }),
      part(sph(0.14, 8, 6), 0xb86bff, { pos: [0.46, 0.24, 0.56] })
    );
  } else if (kind === 'hospital') {
    // Crisp white clinic + red cross emblem on roof!
    base.push(
      part(box(1.16, 0.18, 1.06), b.roofColor, { pos: [0, 1.04, 0] }),
      part(box(0.42, 0.12, 0.12), 0xffffff, { pos: [0, 1.22, 0.48] }),
      part(box(0.12, 0.42, 0.12), 0xffffff, { pos: [0, 1.22, 0.48] })
    );
  } else if (kind === 'garagem') {
    // Wide garage arch + orange awning!
    base.push(
      part(box(1.22, 0.16, 1.12), b.roofColor, { pos: [0, 1.02, 0] }),
      part(box(0.68, 0.48, 0.09), 0x3b4452, { pos: [0, 0.42, 0.46] })
    );
  } else {
    // Market awning / pitched gable trim + colorful accent crest
    base.push(
      part(box(1.14, 0.12, 0.34), b.accentColor, { pos: [0, 0.84, 0.56], rot: [0.32, 0, 0] }),
      part(cyl(0.62, 0.62, 0.92, 3), b.wallColor, {
        pos: [0, 1.16, 0],
        rot: [Math.PI / 2, Math.PI / 3, 0],
        scale: [0.92, 1.0, 0.98],
      }),
      part(box(0.18, 0.18, 1.22), b.roofColor, { pos: [0, 1.56, 0] })
    );
  }
  return merge(base);
}

/**
 * UV-mapped roof geometry for cottages & apartments (pairs with `roof_tiles.webp` / `roof_straw.webp`).
 * Rotated so roof tile rows run cleanly from ridge down to eaves, matching Image 1!
 */
export const neighborhoodRoofGeometry = (v: number): BufferGeometry => {
  if (v % HOUSE_COLORS.length === 3) {
    // Apartment pitched terracotta roof slopes
    return merge([
      texturedPart(box(0.76, 0.12, 1.16), 0xffffff, {
        pos: [-0.28, 2.08, 0],
        rot: [0, 0, 0.58],
        uvScale: [1.4, 1.4],
      }),
      texturedPart(box(0.76, 0.12, 1.16), 0xffffff, {
        pos: [0.28, 2.08, 0],
        rot: [0, 0, -0.58],
        uvScale: [1.4, 1.4],
      }),
    ]);
  }
  // Steep A-frame cottage roof slopes: rotate BoxGeometry 90° around Y inside local space?
  // Note: Box top face (+Y) has U along X (slope down) and V along Z (ridge length).
  // Rotating the UV coordinates 90° makes the vertical terracotta tile columns run from ridge -> eaves!
  const makeSlope = (side: -1 | 1) => {
    const g = box(0.88, 0.12, 1.2);
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      const u = uv.getX(i);
      const vv = uv.getY(i);
      // Swap U and V so chunky terracotta tile courses step downward along the slope (X) matching Image 1!
      uv.setXY(i, vv * 0.78, (side < 0 ? 1 - u : u) * 0.72);
    }
    return texturedPart(g, 0xffffff, {
      pos: [side * 0.33, 1.24, 0],
      rot: [0, 0, -side * 0.84],
    });
  };
  return merge([makeSlope(-1), makeSlope(1)]);
};

const MEADOW_BLOCKERS = [treeGeometry, pineTreeGeometry, boulderGeometry];

const BLOCKERS: Record<string, () => BufferGeometry> = {
  prado: treeGeometry,
  ruinas: () =>
    merge([
      part(box(0.62, 0.14, 0.62), 0xd9cdb8, { pos: [0, 0.07, 0] }),
      part(cyl(0.22, 0.25, 1.0, 10), 0xf1e9dc, { pos: [0, 0.6, 0] }),
      part(box(0.56, 0.16, 0.56), 0xe2d6c2, { pos: [0, 1.15, 0], rot: [0, 0, 0.12] }),
      part(box(0.5, 0.04, 0.06), 0xff7a2a, { pos: [0, 0.16, 0.31] }),
    ]),
  molas: () =>
    merge([
      part(cyl(0.1, 0.12, 0.7, 8), 0xffffff, { pos: [0, 0.35, 0] }),
      part(cyl(0.11, 0.11, 0.1, 8), 0xff5fa8, { pos: [0, 0.3, 0] }),
      part(sph(0.38, 12, 8), 0xff5fa8, { pos: [0, 0.95, 0], scale: [1, 0.8, 1] }),
      part(cyl(0.39, 0.39, 0.1, 12), 0xffe066, { pos: [0, 0.95, 0] }),
    ]),
  labirinto: () =>
    merge([
      part(box(0.8, 0.9, 0.8), 0x7f978c, { pos: [0, 0.45, 0] }),
      part(box(0.84, 0.12, 0.84), 0x4fa86a, { pos: [0, 0.94, 0] }),
      part(box(0.3, 0.4, 0.05), 0x3e5650, { pos: [0, 0.2, 0.41] }),
    ]),
  cidade: () =>
    merge([
      part(box(0.7, 1.5, 0.7), 0x2f3460, { pos: [0, 0.75, 0] }),
      ...[0.35, 0.75, 1.15].flatMap((y) =>
        [-0.17, 0.17].map((x) =>
          part(box(0.14, 0.16, 0.02), 0xfff27a, { pos: [x, y, 0.36], jitter: 0 })
        )
      ),
      part(box(0.04, 0.4, 0.04), 0x9a9ac8, { pos: [0.2, 1.7, 0] }),
      part(sph(0.055, 8, 6), 0xff5f7a, { pos: [0.2, 1.92, 0] }),
    ]),
  sucata: () =>
    merge([
      part(box(0.55, 0.4, 0.5), 0x8a5a3a, { pos: [-0.1, 0.2, 0], rot: [0, 0.3, 0] }),
      part(box(0.4, 0.35, 0.4), 0x8f8f8f, { pos: [0.18, 0.55, 0.05], rot: [0.2, 0.6, 0.15] }),
      part(cyl(0.08, 0.08, 0.8, 8), 0xb87333, { pos: [0.05, 0.5, -0.2], rot: [0, 0, 1.2] }),
      part(cyl(0.26, 0.26, 0.08, 10), 0xc9a640, { pos: [-0.15, 0.85, 0], rot: [1.3, 0, 0] }),
    ]),
  fortaleza: () =>
    merge([
      part(cyl(0.34, 0.38, 1.1, 10), 0xc4cede, { pos: [0, 0.55, 0] }),
      part(cyl(0.4, 0.4, 0.12, 10), 0x9aa8c0, { pos: [0, 1.12, 0] }),
      part(cone(0.42, 0.5, 10), 0x5a78c8, { pos: [0, 1.43, 0] }),
      part(box(0.02, 0.3, 0.02), 0x5a5a5a, { pos: [0, 1.8, 0] }),
      part(box(0.2, 0.1, 0.02), 0xf2c62f, { pos: [0.1, 1.88, 0] }),
    ]),
};

const PATCHES: Record<string, () => BufferGeometry> = {
  prado: tallGrassGeometry,
  ruinas: () => tufts(0xe8552d, 0xffa23c),
  molas: () =>
    merge([
      ...[
        [-0.2, -0.15, 0xff5fa8],
        [0.2, -0.1, 0xffe066],
        [0, 0.2, 0x5fc8e8],
      ].flatMap(([x, z, c]) => [
        part(cyl(0.02, 0.02, 0.45, 5), 0x3f9e3a, { pos: [x, 0.22, z] }),
        part(sph(0.11, 8, 6), c, { pos: [x, 0.5, z], scale: [1, 0.65, 1] }),
      ]),
      part(cone(0.1, 0.25, 5), 0x5fb85a, { pos: [-0.25, 0.12, 0.2] }),
      part(cone(0.1, 0.25, 5), 0x7fd06a, { pos: [0.25, 0.12, 0.15] }),
    ]),
  labirinto: () => tufts(0x3f8f7a, 0x6fc0a0, 0.07, 0.6),
  cidade: () =>
    merge(
      [
        [-0.2, -0.1, 0x7af2ff],
        [0.18, -0.2, 0xff7ae0],
        [0.05, 0.2, 0xb88aff],
      ].map(([x, z, c]) =>
        part(new OctahedronGeometry(0.14), c, { pos: [x, 0.2, z], scale: [0.7, 1.5, 0.7] })
      )
    ),
  sucata: () => tufts(0x5f6a3a, 0x8a8a5a, 0.1, 0.4, 5),
  fortaleza: () =>
    merge(
      [
        [-0.2, -0.1, 0.22],
        [0.18, -0.15, 0.18],
        [0.02, 0.18, 0.2],
      ].map(([x, z, r]) => part(sph(r, 10, 8), 0xffffff, { pos: [x, r * 0.8, z] }))
    ),
};

export const blockerVariants = (biomeId: string) =>
  biomeId === 'prado' ? MEADOW_BLOCKERS.length : 1;
export const blockerGeometry = (biomeId: string, variant = 0) =>
  biomeId === 'prado'
    ? MEADOW_BLOCKERS[variant % MEADOW_BLOCKERS.length]()
    : (BLOCKERS[biomeId] ?? treeGeometry)();
export const patchGeometry = (biomeId: string) => (PATCHES[biomeId] ?? tallGrassGeometry)();

/** Floating element crystal (pickup): a glowing crystal hovering above a carved stone plinth. */
export const crystalGeometry = (color: number) =>
  merge([
    part(cyl(0.24, 0.28, 0.12, 8), 0xd4ccc0, { pos: [0, 0.06, 0] }),
    part(new OctahedronGeometry(0.24), color, { pos: [0, 0.58, 0], scale: [0.78, 1.45, 0.78] }),
  ]);

// --- Living-World Lightweight Anime Props (instanced: 1 draw call each!) ---

/** Rustic wooden village fence section for cozy BotW / Trails in the Sky paths. */
export const fenceGeometry = () =>
  merge([
    part(cyl(0.045, 0.055, 0.52, 6), 0x8a5d3b, { pos: [-0.36, 0.26, 0] }),
    part(cyl(0.045, 0.055, 0.52, 6), 0x8a5d3b, { pos: [0.36, 0.26, 0] }),
    part(box(0.92, 0.06, 0.05), 0xa8764c, { pos: [0, 0.38, 0] }),
    part(box(0.92, 0.06, 0.05), 0x9b6b43, { pos: [0, 0.19, 0] }),
  ]);

/** Charming Trails in the Sky wooden street lantern with warm glowing glass. */
export const lanternPostGeometry = () =>
  merge([
    part(cyl(0.055, 0.08, 0.14, 6), 0x9c968e, { pos: [0, 0.07, 0] }),
    part(cyl(0.038, 0.048, 1.15, 6), 0x6e4a32, { pos: [0, 0.65, 0] }),
    part(box(0.28, 0.045, 0.045), 0x6e4a32, { pos: [0.12, 1.18, 0] }),
    part(box(0.14, 0.2, 0.14), 0xffe994, { pos: [0.22, 1.03, 0] }),
    part(cone(0.14, 0.1, 4), 0x45334a, { pos: [0.22, 1.16, 0], rot: [0, Math.PI / 4, 0] }),
  ]);

/** Wooden crossroads signpost pointing travelers along the valley. */
export const signpostGeometry = () =>
  merge([
    part(cyl(0.045, 0.055, 0.78, 6), 0x7c5234, { pos: [0, 0.39, 0] }),
    part(box(0.46, 0.14, 0.045), 0xc4945c, { pos: [0.06, 0.66, 0.03], rot: [0, 0, 0.05] }),
    part(box(0.38, 0.12, 0.045), 0xb4844e, { pos: [-0.04, 0.48, -0.03], rot: [0, 0.2, -0.06] }),
  ]);

/** Lush anime flowering shrub / berry bush to break up open meadow edges. */
export const bushGeometry = () =>
  merge([
    part(sph(0.28, 10, 8), 0x3b8c4e, { pos: [0, 0.2, 0], scale: [1.25, 0.85, 1.15] }),
    part(sph(0.22, 8, 6), 0x52a85a, { pos: [-0.18, 0.24, 0.08], scale: [1.1, 0.85, 1.0] }),
    part(sph(0.2, 8, 6), 0x6ec464, { pos: [0.16, 0.26, -0.06], scale: [1.1, 0.85, 1.0] }),
    part(sph(0.045, 6, 6), 0xff82a8, { pos: [-0.12, 0.34, 0.2] }),
    part(sph(0.045, 6, 6), 0xffe46b, { pos: [0.15, 0.35, 0.14] }),
  ]);

/** Floating stream lily pad with a tiny lotus blossom. */
export const lilyPadGeometry = () =>
  merge([
    part(cyl(0.2, 0.2, 0.025, 10), 0x4ca85a, { pos: [0, 0.02, 0] }),
    part(sph(0.065, 8, 6), 0xffc6df, { pos: [0.04, 0.07, 0.02], scale: [1, 0.7, 1] }),
  ]);
