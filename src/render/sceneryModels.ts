import { BufferGeometry, Mesh } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const ASSETS: Record<string, () => Promise<{ default: string }>> = {
  oak_tree: () => import('../assets/scenery/oak_tree.glb?inline'),
  cottage: () => import('../assets/scenery/cottage.glb?inline'),
};

const cache = new Map<string, Promise<BufferGeometry | null>>();

function decode(dataUrl: string): ArrayBuffer {
  const bin = atob(dataUrl.slice(dataUrl.indexOf(',') + 1));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

/** Loads a lightweight Blender-sculpted scenery GLB geometry (cached for instancing). */
export function loadSceneryGeometry(id: 'oak_tree' | 'cottage'): Promise<BufferGeometry | null> {
  let hit = cache.get(id);
  if (!hit) {
    hit = ASSETS[id]()
      .then(
        (mod) =>
          new Promise<BufferGeometry | null>((resolve) => {
            new GLTFLoader().parse(
              decode(mod.default),
              '',
              (gltf) => {
                let geo: BufferGeometry | null = null;
                gltf.scene.traverse((o) => {
                  if (!geo && o instanceof Mesh) geo = o.geometry.clone();
                });
                resolve(geo);
              },
              () => resolve(null)
            );
          })
      )
      .catch(() => null);
    cache.set(id, hit);
  }
  return hit;
}
