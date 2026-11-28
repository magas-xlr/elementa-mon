import {
  AnimationMixer,
  BackSide,
  Color,
  LoopOnce,
  LoopRepeat,
  MeshBasicMaterial,
  MeshToonMaterial,
  SkinnedMesh,
  type AnimationAction,
  type AnimationClip,
  type Material,
  type Object3D,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { ELEMENT_INFO, type PetElement } from '../game/data/elements';
import { INK, toon } from './toon';

/**
 * Hand-made 3D pets (rigged, animated, watercolor texture), used instead of the procedural
 * model when a species/stage has one. Each GLB is its own lazy chunk, so it only downloads
 * when that pet shows up. It is embedded (base64) instead of fetched, because the desktop
 * build runs from file:// where fetch() is not available.
 */
const MODELS: Record<string, () => Promise<{ default: string }>> = {
  'orelhito:0': () => import('../assets/pets/orelhito.glb?inline'),
};

/** Model height in its own units (feet at y = 0). */
const MODEL_HEIGHT: Record<string, number> = { 'orelhito:0': 1.1 };

export type PetClip = 'idle' | 'hop' | 'walk' | 'run' | 'happy' | 'attack' | 'hit';

export interface PetModel {
  root: Object3D;
  mixer: AnimationMixer;
  /** Plays a clip; one-shot clips return to idle by themselves. Resolves when it ends. */
  play(clip: PetClip): Promise<void>;
  /** Current looping clip and its normalized time (0..1), for syncing footsteps. */
  phase(): { clip: PetClip; t: number };
  dispose(): void;
}

export const hasPetModel = (speciesId: string, stage: number): boolean =>
  `${speciesId}:${stage}` in MODELS;

const cache = new Map<string, Promise<{ scene: Object3D; clips: AnimationClip[] }>>();

function decode(dataUrl: string): ArrayBuffer {
  const bin = atob(dataUrl.slice(dataUrl.indexOf(',') + 1));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

function loadGltf(key: string): Promise<{ scene: Object3D; clips: AnimationClip[] }> {
  let hit = cache.get(key);
  if (!hit) {
    hit = MODELS[key]().then(
      (mod) =>
        new Promise((resolve, reject) => {
          new GLTFLoader().parse(
            decode(mod.default),
            '',
            (gltf) => resolve({ scene: gltf.scene, clips: gltf.animations }),
            reject
          );
        })
    );
    cache.set(key, hit);
  }
  return hit;
}

/** Ink outline for a skinned mesh: back faces pushed out along the skinned normal. */
function skinnedOutline(thickness: number): MeshBasicMaterial {
  const mat = new MeshBasicMaterial({ color: INK, side: BackSide });
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <skinning_vertex>',
      `#include <skinning_vertex>\ntransformed += normalize(objectNormal) * ${thickness.toFixed(4)};`
    );
  };
  mat.customProgramCacheKey = () => `pet-outline-${thickness}`;
  return mat;
}

/**
 * Loads (once) and instantiates a pet model scaled to `height` world units, with the game's
 * toon shading on the painted texture and an ink outline.
 */
export async function createPetModel(
  speciesId: string,
  stage: number,
  height: number,
  withOutline = true,
  element: PetElement = 'neutro'
): Promise<PetModel> {
  const src = await loadGltf(`${speciesId}:${stage}`);
  const root = cloneSkinned(src.scene);
  const materials: Material[] = [];
  const outline = withOutline ? skinnedOutline(0.011) : null;
  if (outline) materials.push(outline);
  const tintColor =
    element === 'neutro'
      ? null
      : new Color(0xffffff).lerp(
          new Color(element === 'radioativo' ? 0x76ff03 : ELEMENT_INFO[element].color),
          element === 'radioativo' ? 0.45 : 0.28
        );
  root.traverse((o) => {
    if (!(o instanceof SkinnedMesh)) return;
    o.frustumCulled = false;
    const mat = o.material as Material & { map?: MeshToonMaterial['map'] };
    if (mat.name === 'pele') {
      // Same BotW watercolor shading as the rest of the game, over the painted texture.
      const toonMat = toon(mat.map ? { map: mat.map } : { vertexColors: true });
      if (tintColor) toonMat.color.copy(tintColor);
      o.material = toonMat;
      materials.push(toonMat);
      if (!outline) return;
      const line = new SkinnedMesh(o.geometry, outline);
      line.bind(o.skeleton, o.bindMatrix);
      line.frustumCulled = false;
      line.renderOrder = -1;
      o.parent?.add(line);
    }
  });
  root.scale.setScalar(height / (MODEL_HEIGHT[`${speciesId}:${stage}`] ?? 1));

  const mixer = new AnimationMixer(root);
  const actions = new Map<string, AnimationAction>();
  for (const clip of src.clips) actions.set(clip.name, mixer.clipAction(clip));
  let current: PetClip = 'idle';
  let currentAction = actions.get('idle');
  currentAction?.play();

  const play = (clip: PetClip): Promise<void> => {
    const next = actions.get(clip);
    if (!next) return Promise.resolve();
    const once = clip === 'attack' || clip === 'hit' || clip === 'hop';
    next.reset();
    next.setLoop(once ? LoopOnce : LoopRepeat, Infinity);
    next.clampWhenFinished = once;
    if (currentAction && currentAction !== next) next.crossFadeFrom(currentAction, 0.12, false);
    next.play();
    currentAction = next;
    current = clip;
    if (!once) return Promise.resolve();
    return new Promise((resolve) => {
      const onDone = (e: { action: AnimationAction }) => {
        if (e.action !== next) return;
        mixer.removeEventListener('finished', onDone);
        if (currentAction === next) void play('idle');
        resolve();
      };
      mixer.addEventListener('finished', onDone);
    });
  };

  return {
    root,
    mixer,
    play,
    phase: () => {
      const a = currentAction;
      const d = a?.getClip().duration ?? 1;
      return { clip: current, t: a ? (a.time % d) / d : 0 };
    },
    dispose: () => {
      mixer.stopAllAction();
      for (const m of materials) m.dispose();
    },
  };
}
