import type { PetElement } from '../game/data/elements';
import {
  Box3,
  CanvasTexture,
  Color,
  DirectionalLight,
  DoubleSide,
  HemisphereLight,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderTarget,
  type BufferGeometry,
  type Object3D,
  type WebGLRenderer,
} from 'three';
import { avatarGeometry, createCreature, disposeCreature } from './models';
import { addOutline, toon } from './toon';

/**
 * Painted characters and props: the toon models (watercolor shading + plum outline) are rendered
 * once into smooth, high-density images that the game shows as billboards in the 3D scenery.
 * The models stay the single source of art (no image files to ship).
 */

export interface SpriteImage {
  canvas: HTMLCanvasElement;
  texture: CanvasTexture;
  /** Size in world units (pixels / pixels-per-unit). */
  width: number;
  height: number;
  /** Where the model's ground point (0,0,0) lands, in 0..1 of the image (for Sprite.center). */
  anchor: [number, number];
}

/** Pixels per world unit: enough for a sharp billboard at 1080p (about 160 px per unit). */
export const PPU = 160;

const cache = new Map<string, SpriteImage>();
let renderer: WebGLRenderer | null = null;
let scene: Scene | null = null;
const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 40);

export function initSprites(r: WebGLRenderer): void {
  renderer = r;
}

function bakeScene(): Scene {
  if (scene) return scene;
  scene = new Scene();
  // Same light rig as the world views, so sprites match the toon-shaded scenery.
  scene.add(new HemisphereLight(0xeaf6ff, 0x6b8f5a, 1.1));
  const sun = new DirectionalLight(0xfff4e0, 2.6);
  sun.position.set(-3, 8, 5);
  scene.add(sun);
  return scene;
}

/**
 * Renders `obj` with an orthographic camera tilted down by `elevation` radians and turned by
 * `yaw`, crops it to its bounds and returns it as a smooth image (multisampled edges).
 */
function bake(obj: Object3D, yaw: number, elevation: number, ppu = PPU): SpriteImage {
  const s = bakeScene();
  obj.rotation.y = yaw;
  s.add(obj);
  obj.updateMatrixWorld(true);
  camera.position.set(0, Math.sin(elevation) * 20, Math.cos(elevation) * 20);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);

  // Bounds in camera space -> pixel size of the image.
  const box = new Box3().setFromObject(obj);
  const inv = camera.matrixWorldInverse;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const v = new Vector3();
  for (let i = 0; i < 8; i++) {
    v.set(
      i & 1 ? box.max.x : box.min.x,
      i & 2 ? box.max.y : box.min.y,
      i & 4 ? box.max.z : box.min.z
    );
    v.applyMatrix4(inv);
    minX = Math.min(minX, v.x);
    maxX = Math.max(maxX, v.x);
    minY = Math.min(minY, v.y);
    maxY = Math.max(maxY, v.y);
  }
  const pad = 2 / ppu; // room for the outline pixel
  minX -= pad;
  minY -= pad;
  const w = Math.ceil((maxX + pad - minX) * ppu);
  const h = Math.ceil((maxY + pad - minY) * ppu);
  camera.left = minX;
  camera.right = minX + w / ppu;
  camera.bottom = minY;
  camera.top = minY + h / ppu;
  camera.updateProjectionMatrix();
  const ground = new Vector3(0, 0, 0).applyMatrix4(inv);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const img = ctx.createImageData(w, h);
  if (renderer) {
    const target = new WebGLRenderTarget(w, h, { samples: 4 });
    target.texture.colorSpace = SRGBColorSpace;
    const prev = renderer.getRenderTarget();
    const prevAlpha = renderer.getClearAlpha();
    const prevColor = renderer.getClearColor(new Color());
    renderer.setRenderTarget(target);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(s, camera);
    const pixels = new Uint8Array(w * h * 4);
    renderer.readRenderTargetPixels(target, 0, 0, w, h, pixels);
    renderer.setRenderTarget(prev);
    renderer.setClearColor(prevColor, prevAlpha);
    target.dispose();
    // WebGL rows are bottom-up; edge pixels come premultiplied by alpha (canvas wants straight).
    for (let y = 0; y < h; y++)
      img.data.set(pixels.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const a = d[i + 3];
      if (a > 0 && a < 255)
        for (let c = 0; c < 3; c++) d[i + c] = Math.min(255, (d[i + c] * 255) / a);
    }
  }
  ctx.putImageData(img, 0, 0);
  s.remove(obj);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return {
    canvas,
    texture,
    width: w / ppu,
    height: h / ppu,
    anchor: [(ground.x - minX) / (w / ppu), (ground.y - minY) / (h / ppu)],
  };
}

function cached(key: string, make: () => SpriteImage): SpriteImage {
  let hit = cache.get(key);
  if (!hit) {
    hit = make();
    // Without a renderer (tests, early calls) the image is blank: don't keep it.
    if (renderer) cache.set(key, hit);
  }
  return hit;
}

export type Facing = 'right' | 'left' | 'front';
export const CREATURE_YAW: Record<Facing, number> = { right: 0.95, left: -0.95, front: 0.6 };

/** A pet (species + stage) as pixel art, turned to the right (player side) or left (enemies). */
export function creatureSprite(
  speciesId: string,
  stage: number,
  facing: Facing,
  element: PetElement = 'neutro'
): SpriteImage {
  return cached(`c:${speciesId}:${stage}:${facing}:${element}`, () => {
    const c = createCreature(speciesId, stage, element);
    c.children[1].visible = false; // the blob shadow stays a 3D mesh in the scene
    const img = bake(c, CREATURE_YAW[facing], 0.36);
    disposeCreature(c);
    return img;
  });
}

/** Directions of the avatar sheet: 0 down (towards camera), 1 right, 2 up, 3 left. */
export const DIRECTIONS = 4;
const DIR_YAW = [0, Math.PI / 2, Math.PI, -Math.PI / 2];

export function avatarSprite(body: number, hat: number, dir: number): SpriteImage {
  return cached(`a:${body}:${hat}:${dir}`, () => {
    const m = addOutline(new Mesh(avatarGeometry(body, hat), toon()), 0.03);
    const img = bake(m, DIR_YAW[dir % DIRECTIONS], 0.5);
    (m.material as { dispose(): void }).dispose();
    return img;
  });
}

/** Scenery prop (tree, tall grass) as a pixel-art image, keyed by name. */
export function propSprite(
  name: string,
  geometry: () => BufferGeometry,
  outline = 0.04
): SpriteImage {
  return cached(`p:${name}`, () => {
    const geo = geometry();
    const m = new Mesh(geo, toon());
    if (outline) addOutline(m, outline);
    const img = bake(m, 0.3, 0.5);
    geo.dispose();
    (m.material as { dispose(): void }).dispose();
    return img;
  });
}

/** Square, centered copy as a data URL, for <img> portraits in cards and menus. */
export function spriteDataUrl(img: SpriteImage): string {
  const size = Math.max(img.canvas.width, img.canvas.height);
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d') as CanvasRenderingContext2D;
  ctx.drawImage(
    img.canvas,
    Math.floor((size - img.canvas.width) / 2),
    Math.floor((size - img.canvas.height) / 2)
  );
  return c.toDataURL();
}

/**
 * Flat quad for an image, with the ground anchor at the origin and tilted back by `pitch` so it
 * faces a camera that looks down by that angle. Shared by instanced billboards (trees, grass).
 */
export function billboardGeometry(img: SpriteImage, pitch: number): PlaneGeometry {
  const g = new PlaneGeometry(img.width, img.height);
  g.translate((0.5 - img.anchor[0]) * img.width, (0.5 - img.anchor[1]) * img.height, 0);
  g.rotateX(-pitch);
  return g;
}

export interface BillboardSpot {
  x: number;
  z: number;
  scale: number;
  flip?: boolean;
}

/** Many copies of one image in a single draw call (2 triangles each). */
export function billboardInstances(
  img: SpriteImage,
  spots: BillboardSpot[],
  pitch: number,
  geometry = billboardGeometry(img, pitch)
): InstancedMesh {
  // Alpha to coverage: smooth cut-out edges through MSAA, still depth-sorted like opaque.
  const mat = new MeshBasicMaterial({
    map: img.texture,
    alphaTest: 0.1,
    alphaToCoverage: true,
    side: DoubleSide,
  });
  const mesh = new InstancedMesh(geometry, mat, spots.length);
  const m = new Matrix4();
  const q = new Quaternion();
  spots.forEach((p, i) => {
    m.compose(
      new Vector3(p.x, 0, p.z),
      q,
      new Vector3(p.flip ? -p.scale : p.scale, p.scale, p.scale)
    );
    mesh.setMatrixAt(i, m);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
  return mesh;
}
