import {
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  WebGLRenderTarget,
  type WebGLRenderer,
} from 'three';
import { createCreature, disposeCreature } from './models';

const SIZE = 96;
const cache = new Map<string, string>();
let scene: Scene | null = null;
let camera: PerspectiveCamera | null = null;
let target: WebGLRenderTarget | null = null;
let renderer: WebGLRenderer | null = null;

export function initThumbnails(r: WebGLRenderer): void {
  renderer = r;
}

/**
 * Renders a creature once into a 96×96 offscreen target and returns a data URL. Cards and menus
 * show these portraits, so the 3D models are the only art the game needs.
 */
export function creatureThumbnail(speciesId: string, stage: number): string {
  const key = `${speciesId}:${stage}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (!renderer) return '';
  if (!scene) {
    scene = new Scene();
    scene.add(new HemisphereLight(0xffffff, 0x556655, 2));
    const sun = new DirectionalLight(0xffffff, 1.8);
    sun.position.set(2, 4, 5);
    scene.add(sun);
    camera = new PerspectiveCamera(35, 1, 0.1, 20);
    target = new WebGLRenderTarget(SIZE, SIZE);
    target.texture.colorSpace = SRGBColorSpace;
  }
  const creature = createCreature(speciesId, stage);
  creature.rotation.y = 0.6;
  creature.children[1].visible = false; // no shadow in portraits
  scene.add(creature);
  const radius = creature.userData.body.geometry.boundingSphere?.radius ?? 1;
  const cam = camera as PerspectiveCamera;
  cam.position.set(0, radius * 0.9, radius * 3.6);
  cam.lookAt(0, radius * 0.75, 0);

  const prev = renderer.getRenderTarget();
  renderer.setRenderTarget(target);
  renderer.setClearColor(0x000000, 0);
  renderer.clear();
  renderer.render(scene, cam);
  const pixels = new Uint8Array(SIZE * SIZE * 4);
  renderer.readRenderTargetPixels(target as WebGLRenderTarget, 0, 0, SIZE, SIZE, pixels);
  renderer.setRenderTarget(prev);
  scene.remove(creature);
  disposeCreature(creature);

  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const img = ctx.createImageData(SIZE, SIZE);
  // WebGL rows are bottom-up.
  for (let y = 0; y < SIZE; y++) {
    img.data.set(pixels.subarray((SIZE - 1 - y) * SIZE * 4, (SIZE - y) * SIZE * 4), y * SIZE * 4);
  }
  ctx.putImageData(img, 0, 0);
  const url = canvas.toDataURL();
  cache.set(key, url);
  return url;
}
