import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  Euler,
  Group,
  IcosahedronGeometry,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  OctahedronGeometry,
  Quaternion,
  TetrahedronGeometry,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Element } from '../game/data/elements';
import { getSpecies } from '../game/data/species';

/**
 * Everything here is built from a handful of primitives and merged into ONE geometry with
 * vertex colors per model: one draw call per creature, no textures, a few hundred triangles,
 * flat shading. That is the N64-style budget the game targets.
 */

type V3 = [number, number, number];

interface PartOptions {
  pos?: V3;
  rot?: V3;
  scale?: V3;
  /** Per-face brightness jitter, gives the faceted hand-painted look. */
  jitter?: number;
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
  const colors = new Float32Array(count * 3);
  const jitter = o.jitter ?? 0.06;
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

export function merge(parts: BufferGeometry[]): BufferGeometry {
  const merged = mergeGeometries(parts, false);
  for (const p of parts) p.dispose();
  if (!merged) throw new Error('Falha ao unir geometrias');
  merged.computeBoundingSphere();
  return merged;
}

export const lambert = () => new MeshLambertMaterial({ vertexColors: true, flatShading: true });

const ico = (r: number, detail = 0) => new IcosahedronGeometry(r, detail);
const box = (w: number, h: number, d: number) => new BoxGeometry(w, h, d);
const cone = (r: number, h: number, seg = 4) => new ConeGeometry(r, h, seg);
const cyl = (rt: number, rb: number, h: number, seg = 6) => new CylinderGeometry(rt, rb, h, seg);

function eyes(y: number, z: number, spread: number, size = 0.09): BufferGeometry[] {
  const out: BufferGeometry[] = [];
  for (const side of [-1, 1]) {
    out.push(
      part(box(size, size * 1.4, 0.04), 0xffffff, { pos: [side * spread, y, z], jitter: 0 })
    );
    out.push(
      part(box(size * 0.55, size * 0.9, 0.05), 0x141414, {
        pos: [side * spread, y - 0.01, z + 0.01],
        jitter: 0,
      })
    );
  }
  return out;
}

/** Element-specific accessory attached to the head/back. */
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
        part(cone(0.12, 0.35), detail, { pos: [0, 0.55, -0.55], rot: [-0.9, 0, 0] }),
        part(cone(0.07, 0.22), 0xfff1a8, { pos: [0, 0.62, -0.62], rot: [-0.9, 0, 0] }),
      ];
    case 'agua':
      return [
        part(cone(0.1, 0.32, 3), detail, {
          pos: [0, headY + 0.28, headZ - 0.05],
          rot: [-0.4, 0, 0],
        }),
      ];
    case 'eletrico':
      return [-1, 1].flatMap((side) => [
        part(cone(0.07, 0.4, 3), detail, {
          pos: [side * 0.17, headY + 0.32, headZ - 0.05],
          rot: [0, 0, -side * 0.35],
        }),
        part(cone(0.05, 0.14, 3), 0xf2c62f, {
          pos: [side * 0.25, headY + 0.52, headZ - 0.05],
          rot: [0, 0, -side * 0.35],
        }),
      ]);
    case 'terra':
      return [
        part(new TetrahedronGeometry(0.14), detail, { pos: [0.08, 0.5, -0.15] }),
        part(new TetrahedronGeometry(0.11), detail, { pos: [-0.12, 0.46, -0.35] }),
      ];
    case 'gelo':
      return [0, 1, 2].map((i) =>
        part(new OctahedronGeometry(0.08 + s * 0.02), 0xe9fbff, {
          pos: [(i - 1) * 0.12, headY + 0.28 + (i === 1 ? 0.08 : 0), headZ - 0.05],
          scale: [0.6, 1.6, 0.6],
        })
      );
    case 'venenoso':
      return [0, 1, 2].map((i) =>
        part(ico(0.06), detail, {
          pos: [Math.sin(i * 2.1) * 0.22, 0.35 + i * 0.04, -0.1 - i * 0.12],
        })
      );
    case 'psiquico':
      return [part(ico(0.08, 1), detail, { pos: [0, headY + 0.38, headZ] })];
    case 'fantasma':
      return [part(cone(0.18, 0.4, 5), detail, { pos: [0, -0.15, -0.35], rot: [-2.2, 0, 0] })];
    case 'fada':
      return [-1, 1].map((side) =>
        part(box(0.42, 0.3, 0.02), detail, {
          pos: [side * 0.28, 0.45, -0.2],
          rot: [0.2, side * 0.5, side * 0.4],
        })
      );
  }
}

/** Builds and caches one merged geometry per species and stage (0, 1, 2). */
const geometryCache = new Map<string, BufferGeometry>();

export function creatureGeometry(speciesId: string, stage: number): BufferGeometry {
  const key = `${speciesId}:${stage}`;
  const cached = geometryCache.get(key);
  if (cached) return cached;
  const sp = getSpecies(speciesId);
  const { body, belly, detail } = sp.colors;
  const s = stage;
  const parts: BufferGeometry[] = [];
  let headY = 0.75;
  let headZ = 0.2;

  switch (sp.shape) {
    case 'quadrupede': {
      parts.push(part(ico(0.42), body, { pos: [0, 0.45, -0.05], scale: [1, 0.85, 1.3] }));
      parts.push(part(ico(0.3), belly, { pos: [0, 0.36, 0], scale: [0.9, 0.7, 1.2] }));
      headY = 0.72;
      headZ = 0.48;
      parts.push(part(ico(0.3), body, { pos: [0, headY, headZ], scale: [1, 0.9, 1] }));
      parts.push(part(box(0.26, 0.14, 0.2), belly, { pos: [0, headY - 0.1, headZ + 0.22] }));
      for (const [x, z] of [
        [-0.22, 0.25],
        [0.22, 0.25],
        [-0.22, -0.32],
        [0.22, -0.32],
      ]) {
        parts.push(part(box(0.14, 0.3, 0.14), body, { pos: [x, 0.13, z] }));
      }
      parts.push(part(cone(0.1, 0.45), body, { pos: [0, 0.5, -0.65], rot: [-1.9, 0, 0] }));
      if (s >= 1)
        for (let i = 0; i < 2 + s; i++)
          parts.push(part(cone(0.07, 0.2), detail, { pos: [0, 0.8, 0.15 - i * 0.18] }));
      if (s >= 2)
        for (const side of [-1, 1])
          parts.push(
            part(cone(0.06, 0.3), 0xf4f0e0, {
              pos: [side * 0.16, headY + 0.3, headZ],
              rot: [0.3, 0, -side * 0.3],
            })
          );
      parts.push(...eyes(headY + 0.06, headZ + 0.27, 0.12));
      break;
    }
    case 'bipede': {
      parts.push(part(ico(0.36), body, { pos: [0, 0.55, 0], scale: [1, 1.2, 0.9] }));
      parts.push(part(ico(0.25), belly, { pos: [0, 0.5, 0.12], scale: [0.9, 1.1, 0.7] }));
      headY = 1.05;
      headZ = 0.05;
      parts.push(part(ico(0.3), body, { pos: [0, headY, headZ] }));
      for (const side of [-1, 1]) {
        parts.push(part(box(0.13, 0.28, 0.15), body, { pos: [side * 0.17, 0.13, 0.02] }));
        parts.push(
          part(box(0.1, 0.32, 0.1), body, {
            pos: [side * 0.38, 0.6, 0.05],
            rot: [0, 0, side * 0.5],
          })
        );
      }
      if (s >= 1)
        parts.push(part(cone(0.1, 0.4), detail, { pos: [0, 0.4, -0.35], rot: [-2, 0, 0] }));
      if (s >= 2)
        parts.push(
          part(cyl(0.2, 0.25, 0.12, 6), detail, { pos: [0, 0.48, 0], scale: [1.6, 1, 1.4] })
        );
      parts.push(...eyes(headY + 0.04, headZ + 0.27, 0.11));
      break;
    }
    case 'ave': {
      parts.push(part(ico(0.35), body, { pos: [0, 0.5, 0], scale: [1, 1, 1.15] }));
      parts.push(part(ico(0.25), belly, { pos: [0, 0.45, 0.12], scale: [0.9, 0.9, 0.8] }));
      headY = 0.88;
      headZ = 0.15;
      parts.push(part(ico(0.24), body, { pos: [0, headY, headZ] }));
      parts.push(
        part(cone(0.07, 0.2, 4), 0xf2b134, {
          pos: [0, headY - 0.03, headZ + 0.28],
          rot: [Math.PI / 2, 0, 0],
        })
      );
      for (const side of [-1, 1]) {
        parts.push(
          part(box(0.5 + s * 0.15, 0.06, 0.3), detail, {
            pos: [side * (0.42 + s * 0.06), 0.55, -0.05],
            rot: [0, 0, side * 0.4],
          })
        );
        parts.push(part(box(0.05, 0.2, 0.05), 0xf2b134, { pos: [side * 0.12, 0.12, 0.05] }));
      }
      parts.push(part(box(0.25, 0.05, 0.3), detail, { pos: [0, 0.45, -0.42], rot: [0.4, 0, 0] }));
      if (s >= 1)
        parts.push(part(cone(0.06, 0.25, 3), detail, { pos: [0, headY + 0.27, headZ - 0.05] }));
      if (s >= 2)
        parts.push(
          part(cone(0.05, 0.22, 3), detail, {
            pos: [0, headY + 0.22, headZ - 0.18],
            rot: [-0.5, 0, 0],
          })
        );
      parts.push(...eyes(headY + 0.05, headZ + 0.21, 0.1, 0.08));
      break;
    }
    case 'bolha': {
      parts.push(part(ico(0.48, 1), body, { pos: [0, 0.45, 0], scale: [1, 0.9, 1] }));
      parts.push(part(ico(0.3, 1), belly, { pos: [0, 0.38, 0.22], scale: [1, 0.85, 0.6] }));
      headY = 0.6;
      headZ = 0.25;
      parts.push(part(cone(0.18, 0.35, 6), body, { pos: [0, 0.95, -0.02] }));
      if (s >= 1)
        for (const side of [-1, 1])
          parts.push(
            part(cone(0.12, 0.3, 3), detail, {
              pos: [side * 0.48, 0.45, 0],
              rot: [0, 0, -side * 1.4],
            })
          );
      if (s >= 2)
        for (let i = 0; i < 5; i++)
          parts.push(
            part(cone(0.05, 0.16, 3), 0xf2d16b, {
              pos: [Math.cos(i * 1.256) * 0.14, 1.12, Math.sin(i * 1.256) * 0.14],
            })
          );
      parts.push(...eyes(0.62, 0.44, 0.14, 0.11));
      break;
    }
    case 'serpente': {
      const segments = 4 + s;
      for (let i = 0; i < segments; i++) {
        const t = i / segments;
        parts.push(
          part(ico(0.24 - t * 0.08), i % 2 ? body : detail, {
            pos: [Math.sin(t * 5) * 0.25, 0.2 + (i === 0 ? 0.25 : 0), -t * 1.0 + 0.2],
          })
        );
      }
      headY = 0.7;
      headZ = 0.3;
      parts.push(part(ico(0.26), body, { pos: [0, headY, headZ], scale: [1, 0.85, 1.15] }));
      parts.push(part(box(0.22, 0.08, 0.2), belly, { pos: [0, headY - 0.13, headZ + 0.15] }));
      for (const side of [-1, 1])
        parts.push(
          part(cone(0.03, 0.12, 3), 0xffffff, {
            pos: [side * 0.07, headY - 0.2, headZ + 0.22],
            rot: [Math.PI, 0, 0],
          })
        );
      if (s >= 1)
        parts.push(
          part(cone(0.22, 0.12, 6), detail, {
            pos: [0, headY + 0.1, headZ - 0.2],
            rot: [-1.3, 0, 0],
            scale: [1.4, 1, 1],
          })
        );
      parts.push(...eyes(headY + 0.07, headZ + 0.27, 0.11));
      break;
    }
  }
  parts.push(...accessory(sp.element, detail, headY, headZ, s));

  const geo = merge(parts);
  const scale = 0.85 + s * 0.28;
  geo.scale(scale, scale, scale);
  geometryCache.set(key, geo);
  return geo;
}

export interface CreatureMesh extends Group {
  userData: { body: Mesh; material: MeshLambertMaterial; baseY: number; phase: number };
}

/** A group with the creature mesh and a cheap blob shadow. */
export function createCreature(speciesId: string, stage: number): CreatureMesh {
  const group = new Group() as CreatureMesh;
  const material = lambert();
  const body = new Mesh(creatureGeometry(speciesId, stage), material);
  group.add(body);
  group.add(blobShadow(0.55 + stage * 0.15));
  group.userData = { body, material, baseY: 0, phase: Math.random() * Math.PI * 2 };
  return group;
}

let shadowGeo: BufferGeometry | null = null;
const shadowMat = new MeshLambertMaterial({
  color: 0x000000,
  transparent: true,
  opacity: 0.28,
  depthWrite: false,
});
export function blobShadow(radius: number): Mesh {
  shadowGeo ??= new CylinderGeometry(1, 1, 0.01, 10);
  const m = new Mesh(shadowGeo, shadowMat);
  m.scale.set(radius, 1, radius);
  m.position.y = 0.01;
  return m;
}

/** Idle bounce + squash, called every frame. */
export function animateCreature(c: CreatureMesh, time: number): void {
  const { body, phase } = c.userData;
  const t = time * 3 + phase;
  body.position.y = Math.abs(Math.sin(t)) * 0.08;
  body.scale.set(1 + Math.sin(t * 2) * 0.02, 1 - Math.sin(t * 2) * 0.03, 1);
}

export function disposeCreature(c: CreatureMesh): void {
  c.userData.material.dispose();
}

/** Player avatar / trainers: a tiny low-poly kid with a cap. */
const avatarCache = new Map<string, BufferGeometry>();
export function avatarGeometry(bodyColor: number, hatColor: number): BufferGeometry {
  const key = `${bodyColor}:${hatColor}`;
  const cached = avatarCache.get(key);
  if (cached) return cached;
  const skin = 0xf1c79e;
  const geo = merge([
    part(box(0.36, 0.42, 0.24), bodyColor, { pos: [0, 0.55, 0] }),
    part(box(0.14, 0.3, 0.16), 0x2d3a6b, { pos: [-0.09, 0.17, 0] }),
    part(box(0.14, 0.3, 0.16), 0x2d3a6b, { pos: [0.09, 0.17, 0] }),
    part(box(0.1, 0.36, 0.12), bodyColor, { pos: [-0.25, 0.55, 0], rot: [0, 0, 0.15] }),
    part(box(0.1, 0.36, 0.12), bodyColor, { pos: [0.25, 0.55, 0], rot: [0, 0, -0.15] }),
    part(ico(0.22), skin, { pos: [0, 0.96, 0] }),
    part(cyl(0.24, 0.24, 0.1, 8), hatColor, { pos: [0, 1.12, 0] }),
    part(box(0.3, 0.04, 0.2), hatColor, { pos: [0, 1.08, 0.2] }),
    part(box(0.16, 0.22, 0.1), 0x8a5a32, { pos: [0, 0.6, -0.17] }),
    ...eyes(0.98, 0.2, 0.08, 0.06),
  ]);
  avatarCache.set(key, geo);
  return geo;
}

export function createAvatar(bodyColor: number, hatColor: number): Group {
  const g = new Group();
  g.add(new Mesh(avatarGeometry(bodyColor, hatColor), lambert()));
  g.add(blobShadow(0.35));
  return g;
}

// --- Scenery pieces (shared geometries for InstancedMesh) ---

export const treeGeometry = () =>
  merge([
    part(box(0.18, 0.5, 0.18), 0x7a4e2a, { pos: [0, 0.25, 0] }),
    part(cone(0.55, 0.9, 5), 0x2f8f46, { pos: [0, 0.9, 0] }),
    part(cone(0.38, 0.75, 5), 0x48b862, { pos: [0, 1.4, 0], rot: [0, 0.6, 0] }),
  ]);

export const tallGrassGeometry = () =>
  merge(
    [
      [-0.25, -0.2],
      [0.2, -0.25],
      [0, 0.05],
      [-0.2, 0.25],
      [0.25, 0.22],
    ].map(([x, z], i) =>
      part(cone(0.12, 0.45 + (i % 2) * 0.1, 3), i % 2 ? 0x3f9e3a : 0x57b84a, {
        pos: [x, 0.22, z],
        rot: [0, i, 0],
      })
    )
  );

export const flowerGeometry = () =>
  merge([
    part(box(0.03, 0.16, 0.03), 0x3f9e3a, { pos: [0, 0.08, 0] }),
    part(ico(0.06), 0xffffff, { pos: [0, 0.18, 0] }),
  ]);

export const chestGeometry = () =>
  merge([
    part(box(0.6, 0.36, 0.42), 0xa0632e, { pos: [0, 0.18, 0] }),
    part(box(0.62, 0.16, 0.44), 0xc07a3a, { pos: [0, 0.42, 0] }),
    part(box(0.64, 0.06, 0.06), 0xf2c62f, { pos: [0, 0.3, 0.2] }),
    part(box(0.1, 0.12, 0.04), 0xf2c62f, { pos: [0, 0.3, 0.23] }),
  ]);

export const healGeometry = () =>
  merge([
    part(cyl(0.4, 0.45, 0.12, 8), 0xdcdcdc, { pos: [0, 0.06, 0] }),
    part(box(0.12, 0.5, 0.12), 0xe84a5f, { pos: [0, 0.45, 0] }),
    part(box(0.4, 0.12, 0.12), 0xe84a5f, { pos: [0, 0.5, 0] }),
  ]);

export const portalGeometry = () =>
  merge([
    part(cyl(0.6, 0.65, 0.15, 10), 0x6d6d6d, { pos: [0, 0.07, 0] }),
    part(box(0.15, 1.4, 0.15), 0x8f8f8f, { pos: [-0.5, 0.75, 0] }),
    part(box(0.15, 1.4, 0.15), 0x8f8f8f, { pos: [0.5, 0.75, 0] }),
    part(box(1.2, 0.18, 0.2), 0x8f8f8f, { pos: [0, 1.5, 0] }),
  ]);

export const portalCoreGeometry = () =>
  merge([part(box(0.85, 1.25, 0.05), 0x9b6bff, { pos: [0, 0.78, 0], jitter: 0.2 })]);
