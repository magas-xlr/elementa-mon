import type { WebGLRenderer } from 'three';
import type { PetElement } from '../game/data/elements';
import { creatureSprite, initSprites, spriteDataUrl } from './sprites';

const cache = new Map<string, string>();
let ready = false;

export function initThumbnails(r: WebGLRenderer): void {
  initSprites(r);
  ready = true;
}

/**
 * Portrait used by cards and menus: the same pixel-art sprite the battle shows (see sprites.ts),
 * centered in a square image.
 */
export function creatureThumbnail(
  speciesId: string,
  stage: number,
  element: PetElement = 'neutro'
): string {
  const key = `${speciesId}:${stage}:${element}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (!ready) return '';
  const url = spriteDataUrl(creatureSprite(speciesId, stage, 'front', element));
  cache.set(key, url);
  return url;
}
