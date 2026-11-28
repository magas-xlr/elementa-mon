import { RepeatWrapping, SRGBColorSpace, TextureLoader, type Texture } from 'three';
import groundPradoUrl from '../assets/ground_prado.webp';
import grass0Url from '../assets/plants/grass_0.webp';
import grass1Url from '../assets/plants/grass_1.webp';
import grass2Url from '../assets/plants/grass_2.webp';
import grass3Url from '../assets/plants/grass_3.webp';
import flowerBlueUrl from '../assets/plants/flower_blue.webp';
import flowerDandelionUrl from '../assets/plants/flower_dandelion.webp';
import flowerRedUrl from '../assets/plants/flower_red.webp';
import flowerPurpleUrl from '../assets/plants/flower_purple.webp';
import flowerWhiteUrl from '../assets/plants/flower_white.webp';
import bush0Url from '../assets/plants/bush_0.webp';
import bush1Url from '../assets/plants/bush_1.webp';
import roofTilesUrl from '../assets/roof_tiles.webp';
import roofStrawUrl from '../assets/roof_straw.webp';
import treeBarkUrl from '../assets/tree_bark.webp';
import treeCanopyTileUrl from '../assets/tree_canopy_tile.webp';
import treeFoliage0Url from '../assets/tree_foliage_0.webp';
import treeFoliage1Url from '../assets/tree_foliage_1.webp';
import treeFoliage2Url from '../assets/tree_foliage_2.webp';
import wallWoodUrl from '../assets/wall_wood.webp';
import wallBambooUrl from '../assets/wall_bamboo.webp';
import wallCementUrl from '../assets/wall_cement.webp';
import wallStoneUrl from '../assets/wall_stone.webp';
import wallBrickUrl from '../assets/wall_brick.webp';

const loader = new TextureLoader();
const cache = new Map<string, Texture>();

function loadTex(url: string, repeat = false): Texture {
  const existing = cache.get(url);
  if (existing) return existing;
  const tex = loader.load(url);
  tex.colorSpace = SRGBColorSpace;
  if (repeat) {
    tex.wrapS = RepeatWrapping;
    tex.wrapT = RepeatWrapping;
  }
  cache.set(url, tex);
  return tex;
}

/** Seamless hand-painted watercolor green meadow ground texture (Biome 1 & Title/Battle field). */
export function pradoGroundTexture(): Texture {
  return loadTex(groundPradoUrl, true);
}

/** Hand-drawn anime plant sprites for Biome 1 (tall grass, wildflowers & leafy bushes). */
export function pradoPlantTextures(): {
  grass: Texture[];
  flowers: Texture[];
  bushes: Texture[];
} {
  return {
    grass: [grass0Url, grass1Url, grass2Url, grass3Url].map((u) => loadTex(u)),
    flowers: [flowerBlueUrl, flowerDandelionUrl, flowerRedUrl, flowerPurpleUrl, flowerWhiteUrl].map(
      (u) => loadTex(u)
    ),
    bushes: [bush0Url, bush1Url].map((u) => loadTex(u)),
  };
}

/** Hand-painted terracotta roof tiles (Image 2 UV sheet) & golden-straw cottage shingles. */
export function roofTextures(): { tiles: Texture; straw: Texture } {
  return {
    tiles: loadTex(roofTilesUrl, true),
    straw: loadTex(roofStrawUrl, true),
  };
}

/** Hand-painted BotW tree mossy bark & watercolor foliage cluster textures (Image 4 UV sheet). */
export function treeTextures(): {
  bark: Texture;
  canopyTile: Texture;
  foliageClusters: Texture[];
} {
  return {
    bark: loadTex(treeBarkUrl, true),
    canopyTile: loadTex(treeCanopyTileUrl, true),
    foliageClusters: [treeFoliage0Url, treeFoliage1Url, treeFoliage2Url].map((u) => loadTex(u)),
  };
}

export type WallMaterialKind = 'wood' | 'bamboo' | 'cement' | 'stone' | 'brick';

/** Hand-painted toon wall textures (wood planks, bamboo, cement, stone, brick) for unique residences! */
export function wallTextures(): Record<WallMaterialKind, Texture> {
  return {
    wood: loadTex(wallWoodUrl, true),
    bamboo: loadTex(wallBambooUrl, true),
    cement: loadTex(wallCementUrl, true),
    stone: loadTex(wallStoneUrl, true),
    brick: loadTex(wallBrickUrl, true),
  };
}
