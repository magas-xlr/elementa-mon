import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  Fog,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshToonMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  SphereGeometry,
  Vector3,
  type Texture,
} from 'three';
import { BIOMES, type Biome } from '../game/data/biomes';
import { ELEMENT_INFO, type PetElement } from '../game/data/elements';
import { stageOf } from '../game/rules/progression';
import { biomeAt, isWalkable, tileAt, type Tile, type WorldMap } from '../game/rules/world';
import type { View } from './engine';
import { createHeroModel, type HeroAction, type HeroExpression, type HeroModel } from './heroModel';
import {
  animateCreature,
  blobShadow,
  blockerGeometry,
  blockerVariants,
  bushGeometry,
  chestGeometry,
  createCreature,
  creatureGeometry,
  crystalGeometry,
  disposeCreature,
  establishmentGeometry,
  establishmentWallGeometry,
  fenceGeometry,
  healGeometry,
  lanternPostGeometry,
  lilyPadGeometry,
  merge,
  NEIGHBORHOOD_VARIANTS,
  neighborhoodGeometry,
  neighborhoodRoofGeometry,
  part,
  portalCoreGeometry,
  portalGeometry,
  signpostGeometry,
  sunflowerGeometry,
  toon,
  treeCanopyGeometry,
  treeTrunkGeometry,
  type CreatureMesh,
} from './models';
import { createPetModel, hasPetModel, type PetModel } from './petModels';
import {
  bedTexture,
  grassSpriteTexture,
  grassTexture,
  lawnTexture,
  liquidTexture,
  pathTexture,
  skyHorizon,
  skyTexture,
  stoneTexture,
} from './pixelTextures';
import { addOutline, toonRamp, watercolor } from './toon';
import {
  pradoGroundTexture,
  pradoPlantTextures,
  roofTextures,
  treeTextures,
  wallTextures,
  type WallMaterialKind,
} from './biomeAssets';
import { BUILDINGS, type BuildingKind } from '../game/data/buildings';

function biomeTextures(b: Biome): { ground: Texture; path: Texture; liquid: Texture } {
  const p = b.palette;
  return {
    ground:
      b.ground === 'gramado'
        ? lawnTexture(p.ground)
        : b.ground === 'grama'
          ? grassTexture(p.ground)
          : stoneTexture(p.ground),
    path: b.ground === 'pedra' ? stoneTexture(p.path) : pathTexture(p.path),
    liquid: liquidTexture(p.liquid),
  };
}

const MOVE_TIME = 0.17;
/** Scale of a tree that borders a walkable tile (mutable slot so place3D can read it per kind). */
const EDGE_TREE_SCALE = [1.05];
/** Trees closer than this (in tiles, towards the camera) to the hero shrink out of the way. */
const OCCLUDE_DEPTH = 2.8;
const OCCLUDE_HALF_W = 1.4;
const HERO_SCALE = 1.08;

/** Open BotW-inspired scenic angle showing cottages, stream, trees, and sunlit horizon. */
const CAM_UP = 5.8;
const CAM_BACK = 6.8;
const CAM_LOOK = 0.55;

function tileQuads(tiles: [number, number][], y: number, size = 1): BufferGeometry {
  const pos = new Float32Array(tiles.length * 18);
  const uv = new Float32Array(tiles.length * 12);
  const nrm = new Float32Array(tiles.length * 18);
  tiles.forEach(([tx, tz], i) => {
    const x0 = tx - 0.5;
    const z0 = tz - 0.5;
    const corners = [
      [x0, z0 + size],
      [x0 + size, z0 + size],
      [x0 + size, z0],
      [x0, z0 + size],
      [x0 + size, z0],
      [x0, z0],
    ];
    corners.forEach(([x, z], k) => {
      pos.set([x, y, z], i * 18 + k * 3);
      nrm.set([0, 1, 0], i * 18 + k * 3);
      uv.set([x + 0.5, -(z + 0.5)], i * 12 + k * 2);
    });
  });
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(pos, 3));
  g.setAttribute('normal', new BufferAttribute(nrm, 3));
  g.setAttribute('uv', new BufferAttribute(uv, 2));
  g.computeBoundingSphere();
  return g;
}

const groundMaterial = (map: Texture) =>
  watercolor(new MeshToonMaterial({ map, gradientMap: toonRamp() }));

/** Wooden bridge plank geometry placed where a trail crosses a stream. */
const bridgePlankGeometry = () =>
  merge([
    part(new BoxGeometry(0.98, 0.08, 0.96), 0xb8824e, { pos: [0, 0.04, 0] }),
    part(new BoxGeometry(0.98, 0.14, 0.08), 0x8a5b34, { pos: [0, 0.11, -0.46] }),
    part(new BoxGeometry(0.98, 0.14, 0.08), 0x8a5b34, { pos: [0, 0.11, 0.46] }),
  ]);

interface BreezeMote {
  mesh: Mesh;
  offset: Vector3;
  speed: number;
  phase: number;
}

interface Butterfly {
  group: Group;
  leftWing: Mesh;
  rightWing: Mesh;
  offset: Vector3;
  speed: number;
  phase: number;
}

export class OverworldView implements View {
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(44, 4 / 3, 0.1, 48);
  private world = new Group();
  private player: Group;
  private hero: HeroModel;
  private followerGroup = new Group();
  private followerKey = '';
  private followerCreature: CreatureMesh | null = null;
  private followerGlb: PetModel | null = null;
  private followerPos = new Vector3();
  private followerTarget = new Vector3();
  private followerYaw = 0;
  private followerMoving = false;
  private followerLoadToken = 0;
  private sun: DirectionalLight;
  private ownTextures: Texture[] = [];
  private objects = new Map<number, Object3D>();
  private animated: { obj: Object3D; kind: 'portal' | 'heal' | 'bau' | 'cristal' | 'selvagem' }[] =
    [];
  private map!: WorldMap;
  private hemi: HemisphereLight;
  private sky = new Color();
  private biome = -1;
  private skies = new Map<number, Texture>();
  private from = new Vector3();
  private to = new Vector3();
  private t = 1;
  private facing = 0;
  private camTarget = new Vector3();
  private liquids: Mesh[] = [];
  private terrainMat: MeshToonMaterial | null = null;
  private motes: BreezeMote[] = [];
  private butterflies: Butterfly[] = [];
  private dayPhase: 'amanhecer' | 'dia' | 'entardecer' | 'noite' = 'dia';
  private ecoHealth = 100;
  private mudBiome = false;
  private idleFor = 0;
  // Reusable scratch objects (zero per-frame GC allocations in updateOccluders & blendBiome!)
  private readonly _occM = new Matrix4();
  private readonly _occSc = new Matrix4();
  private readonly _tmpSky = new Color();
  private readonly _tmpLight = new Color();
  private readonly _tmpCol = new Color();
  /** Tall instanced props (trees, boulders) that shrink when they stand between camera and hero. */
  private occluders: {
    mesh: InstancedMesh;
    base: Float32Array;
    pos: [number, number][];
    fade: Float32Array;
  }[] = [];
  onArrive: ((x: number, y: number) => void) | null = null;

  constructor(map: WorldMap, avatar: { body: number; hat: number }) {
    // Hand-painted sunlit lighting: airy sky fill + shadow-casting golden sun + sky rim fill
    this.hemi = new HemisphereLight(0xf2faff, 0x6ea462, 1.25);
    this.scene.add(this.hemi);
    this.sun = new DirectionalLight(0xfff2d6, 2.75);
    this.sun.position.set(6, 12, 6);
    this.sun.castShadow = true;
    // 512x512 shadow map (4x fewer shadow texels than 1024x1024) for high FPS!
    this.sun.shadow.mapSize.set(512, 512);
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 30;
    this.sun.shadow.camera.left = -9;
    this.sun.shadow.camera.right = 9;
    this.sun.shadow.camera.top = 9;
    this.sun.shadow.camera.bottom = -9;
    this.sun.shadow.bias = -0.0015;
    this.scene.add(this.sun, this.sun.target);
    const rimFill = new DirectionalLight(0xd8ecff, 0.55);
    rimFill.position.set(-6, 4, -5);
    this.scene.add(rimFill, this.world);

    this.player = new Group();
    this.hero = createHeroModel(avatar.body, avatar.hat);
    this.hero.root.scale.setScalar(HERO_SCALE);
    this.hero.root.traverse((o) => {
      if (o instanceof Mesh && o.name !== 'outline') o.castShadow = true;
    });
    this.player.add(this.hero.root);
    this.scene.add(this.player, this.followerGroup);

    // Subtle sunlit pollen/petal motes drifting around the player
    const moteGeo = new SphereGeometry(0.035, 6, 6);
    const moteMat = new MeshBasicMaterial({
      color: 0xfff8d4,
      transparent: true,
      opacity: 0.7,
    });
    for (let i = 0; i < 8; i++) {
      const mesh = new Mesh(moteGeo, moteMat);
      const offset = new Vector3(
        (Math.random() - 0.5) * 12,
        0.5 + Math.random() * 2.6,
        (Math.random() - 0.5) * 10
      );
      this.scene.add(mesh);
      this.motes.push({
        mesh,
        offset,
        speed: 0.5 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Ultra-lightweight animated anime butterflies fluttering around the meadow
    const wingGeo = new PlaneGeometry(0.14, 0.11);
    wingGeo.translate(0.07, 0, 0);
    const wingColors = [0xffe066, 0x7fd8ff, 0xffa8cc, 0xfff6d6];
    for (let i = 0; i < 3; i++) {
      const wMat = new MeshBasicMaterial({
        color: wingColors[i % wingColors.length],
        side: DoubleSide,
      });
      const group = new Group();
      const leftWing = new Mesh(wingGeo, wMat);
      const rightWing = new Mesh(wingGeo, wMat);
      rightWing.scale.x = -1;
      group.add(leftWing, rightWing);
      this.scene.add(group);
      this.butterflies.push({
        group,
        leftWing,
        rightWing,
        offset: new Vector3(
          (Math.random() - 0.5) * 10,
          0.65 + Math.random() * 1.1,
          (Math.random() - 0.5) * 8
        ),
        speed: 0.7 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    this.setMap(map);
  }

  get moving(): boolean {
    return this.t < 1;
  }

  resize(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  get currentBiome(): number {
    return biomeAt(this.map, Math.round(this.to.x), Math.round(this.to.z));
  }

  setMap(map: WorldMap, pos = map.start): void {
    this.map = map;
    for (const child of [...this.world.children]) {
      this.world.remove(child);
      child.traverse((o) => {
        if (o instanceof InstancedMesh) o.dispose();
        if (o instanceof Mesh) {
          o.geometry?.dispose();
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          for (const rawMat of mats) {
            const mat = rawMat as MeshLambertMaterial;
            if (mat?.map && this.ownTextures.includes(mat.map)) mat.map.dispose();
            mat?.dispose();
          }
        }
      });
    }
    this.objects.clear();
    this.animated = [];
    this.occluders = [];
    this.ownTextures = [];
    const start = biomeAt(map, pos.x, pos.y);
    const biome = BIOMES[start];
    this.sky.setHex(skyHorizon(biome.palette.sky));
    this.scene.background = this.skyFor(start);
    this.scene.fog = new Fog(this.sky.getHex(), 14, 28);
    this.biome = -1;
    this.buildGround();
    this.buildInstanced();
    this.buildProps();
    this.player.position.set(pos.x, 0, pos.y);
    this.from.copy(this.player.position);
    this.to.copy(this.player.position);
    this.followerPos.set(pos.x - 0.85, 0, pos.y + 0.45);
    this.followerTarget.copy(this.followerPos);
    this.followerGroup.position.copy(this.followerPos);
    this.t = 1;
    this.camTarget.copy(this.player.position);
    this.updateCamera(1);
  }

  private buildGround(): void {
    const { width, height } = this.map;
    const tex = BIOMES.map((b) => biomeTextures(b));
    for (const t of tex) this.ownTextures.push(t.ground, t.path, t.liquid);
    const liquid = BIOMES.map(() => [] as [number, number][]);
    const bridges: [number, number][] = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = tileAt(this.map, x, y);
        const b = biomeAt(this.map, x, y);
        if (tile === 'agua') liquid[b].push([x, y]);
        else if (tile === 'caminho') {
          const nearWater =
            tileAt(this.map, x, y - 1) === 'agua' || tileAt(this.map, x, y + 1) === 'agua';
          if (nearWater) {
            liquid[b].push([x, y]);
            bridges.push([x, y]);
          }
        }
      }
    }

    // Continuous smooth organic terrain mesh (2 subdivisions per tile = smooth blended paths,
    // soft curved riverbanks, gentle meadow relief — ZERO harsh square checkerboard edges!).
    const step = 0.5;
    const pad = 8;
    const cols = Math.round((width + pad * 2) / step);
    const rows = Math.round((height + pad * 2) / step);
    const vCount = (cols + 1) * (rows + 1);
    const positions = new Float32Array(vCount * 3);
    const colors = new Float32Array(vCount * 3);
    const uvs = new Float32Array(vCount * 2);

    const cGround = new Color();
    const cPath = new Color();
    const cBank = new Color(0x8a795c);
    const cOut = new Color();

    const isPathTile = (tx: number, tz: number) => {
      const t = tileAt(this.map, tx, tz);
      if (t === 'portal' || t === 'cristal') return true;
      if (t !== 'caminho') return false;
      return !(tileAt(this.map, tx, tz - 1) === 'agua' || tileAt(this.map, tx, tz + 1) === 'agua');
    };

    for (let rz = 0; rz <= rows; rz++) {
      const wz = -pad + rz * step - 0.5;
      for (let cx = 0; cx <= cols; cx++) {
        const wx = -pad + cx * step - 0.5;
        const idx = rz * (cols + 1) + cx;

        // Smooth 4-tap neighborhood sampling for organic path & riverbank transitions
        let wPath = 0;
        let wWater = 0;
        for (const [ox, oz] of [
          [-0.28, -0.28],
          [0.28, -0.28],
          [-0.28, 0.28],
          [0.28, 0.28],
        ]) {
          const tx = Math.round(wx + ox);
          const tz = Math.round(wz + oz);
          const t = tileAt(this.map, tx, tz);
          if (t === 'agua') wWater += 0.25;
          else if (isPathTile(tx, tz)) wPath += 0.25;
        }

        const bi = biomeAt(this.map, Math.round(wx), Math.round(wz));
        const pal = BIOMES[bi].palette;
        // For Biome 1 (prado), keep vertex color near-white so the exact Image 1 watercolor
        // green wash shines through vividly, while sandy paths tint warm sunlit ochre!
        cGround.setHex(bi === 0 ? 0xf6fbf0 : pal.ground);
        cPath.setHex(bi === 0 ? 0xf2d29b : pal.path);

        // Organic elevation: depressed stream beds, rolling hills around edges, gentle meadow relief
        const outDist = Math.max(0, -wx, wx - (width - 1), -wz, wz - (height - 1));
        const hill =
          outDist > 1.5
            ? Math.min(2.6, (outDist - 1.5) * 0.32 * (0.7 + 0.45 * Math.sin(wx * 0.35 + wz * 0.28)))
            : 0;
        const relief =
          wWater > 0 || wPath > 0.25 ? 0 : Math.sin(wx * 0.55) * Math.cos(wz * 0.5) * 0.055;
        const dip = -0.36 * wWater;
        const wy = hill + relief + dip;

        positions[idx * 3] = wx;
        positions[idx * 3 + 1] = wy;
        positions[idx * 3 + 2] = wz;
        uvs[idx * 2] = wx * 0.22;
        uvs[idx * 2 + 1] = -wz * 0.22;

        // Smooth watercolor pigment blend between grass, warm sandy-earth path & stream bank
        cOut.copy(cGround);
        if (wPath > 0) cOut.lerp(cPath, Math.min(1, wPath * 1.15));
        if (wWater > 0) cOut.lerp(cBank, Math.min(1, wWater * 0.95));
        if (outDist > 0.5) cOut.multiplyScalar(0.88);
        colors[idx * 3] = cOut.r;
        colors[idx * 3 + 1] = cOut.g;
        colors[idx * 3 + 2] = cOut.b;
      }
    }

    const indices: number[] = [];
    for (let rz = 0; rz < rows; rz++) {
      for (let cx = 0; cx < cols; cx++) {
        const a = rz * (cols + 1) + cx;
        const b = a + 1;
        const c = a + (cols + 1);
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }

    const terrainGeo = new BufferGeometry();
    terrainGeo.setAttribute('position', new BufferAttribute(positions, 3));
    terrainGeo.setAttribute('color', new BufferAttribute(colors, 3));
    terrainGeo.setAttribute('uv', new BufferAttribute(uvs, 2));
    terrainGeo.setIndex(indices);
    terrainGeo.computeVertexNormals();
    terrainGeo.computeBoundingSphere();

    const terrainMat = watercolor(
      new MeshToonMaterial({
        map: pradoGroundTexture(),
        vertexColors: true,
        gradientMap: toonRamp(),
      })
    );
    this.terrainMat = terrainMat;
    const terrainMesh = new Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    this.world.add(terrainMesh);

    // Distant scenic Xenoblade / BotW mountain horizon silhouettes (safely outside the playable valley!)
    const peaks: BufferGeometry[] = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const rx = width / 2 + Math.cos(angle) * (width * 0.72 + 22);
      const rz = height / 2 + Math.sin(angle) * (height * 0.72 + 22);
      const mh = 6 + (i % 3) * 3.5;
      peaks.push(
        part(new IcosahedronGeometry(7 + (i % 3) * 2, 1), i % 2 ? 0x7aa89a : 0x8cb8a2, {
          pos: [rx, mh * 0.15, rz],
          scale: [1.5, mh * 0.12, 1.3],
        })
      );
    }
    this.world.add(new Mesh(merge(peaks), toon()));

    this.liquids = [];
    BIOMES.forEach((b, i) => {
      if (!liquid[i].length) return;
      const bed = bedTexture();
      this.ownTextures.push(bed);
      const mat = groundMaterial(tex[i].liquid);
      mat.transparent = true;
      mat.opacity = 0.82;
      if (b.id === 'ruinas' || b.id === 'cidade' || b.id === 'sucata') {
        mat.emissive.setHex(b.palette.liquid);
        mat.emissiveIntensity = 0.42;
      }
      const mesh = new Mesh(tileQuads(liquid[i], -0.11), mat);
      mesh.receiveShadow = true;
      this.world.add(mesh);
      this.liquids.push(mesh);
    });

    // Instanced wooden bridges over streams
    if (bridges.length) {
      const geo = bridgePlankGeometry();
      const mesh = addOutline(new InstancedMesh(geo, toon(), bridges.length), 0.018);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const m = new Matrix4();
      bridges.forEach(([x, y], i) => {
        m.makeTranslation(x, 0.02, y);
        mesh.setMatrixAt(i, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
      this.world.add(mesh);
    }
  }

  private buildInstanced(): void {
    const trees = BIOMES.map(() => [] as [number, number][]);
    const grass = BIOMES.map(() => [] as [number, number][]);
    const flowers: [number, number][] = [];
    const flowerColors: number[] = [];
    const buildings: [number, number][] = [];
    const lawn: [number, number][] = [];

    this.map.tiles.forEach((t, i) => {
      const x = i % this.map.width;
      const y = Math.floor(i / this.map.width);
      const b = this.map.biomes[i];
      if (t === 'arvore') trees[b].push([x, y]);
      else if (t === 'predio') buildings.push([x, y]);
      else if (t === 'matoAlto') grass[b].push([x, y]);
      else if (t === 'grama') {
        if (BIOMES[b].id === 'prado') lawn.push([x, y]);
        if ((x * 7 + y * 13) % 7 === 0) {
          flowers.push([x, y]);
          const deco = BIOMES[b].palette.deco;
          flowerColors.push(deco[(x + y) % deco.length]);
        }
      }
    });

    for (let k = -1; k <= this.map.width; k++) {
      trees[biomeAt(this.map, k, 0)].push([k, -1]);
      trees[biomeAt(this.map, k, this.map.height - 1)].push([k, this.map.height]);
      if (k >= 0 && k < this.map.height) {
        trees[biomeAt(this.map, 0, k)].push([-1, k]);
        trees[biomeAt(this.map, this.map.width - 1, k)].push([this.map.width, k]);
      }
    }

    const m = new Matrix4();
    const q = new Quaternion();
    const up = new Vector3(0, 1, 0);
    const hash = (x: number, y: number) => {
      const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return h - Math.floor(h);
    };

    /** Places real 3D instanced BotW meshes with subtle organic rotation & scale variation. */
    const place3D = (
      geo: BufferGeometry,
      list: [number, number][],
      jitter: number,
      baseScale = 1,
      outline = 0.024,
      randomRot = true,
      mat?: MeshToonMaterial,
      /** Trees: shrink the ones that border a walkable tile and register them for occlusion fade. */
      tree = false
    ) => {
      if (!list.length) {
        geo.dispose();
        return;
      }
      const mesh = new InstancedMesh(geo, mat ?? toon(), list.length);
      list.forEach(([x, y], i) => {
        const r = hash(x, y);
        q.setFromAxisAngle(up, randomRot ? r * Math.PI * 2 : 0);
        const edge = tree && besidePath(x, y);
        const s = (edge ? EDGE_TREE_SCALE[0] : baseScale) * (1 - jitter / 2 + r * jitter);
        const ox = randomRot && !edge ? (r - 0.5) * 0.16 : 0;
        const oz = randomRot && !edge ? (hash(y, x) - 0.5) * 0.16 : 0;
        m.compose(new Vector3(x + ox, 0, y + oz), q, new Vector3(s, s, s));
        mesh.setMatrixAt(i, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (outline > 0) addOutline(mesh, outline);
      this.world.add(mesh);
      if (tree) {
        this.occluders.push({
          mesh,
          base: Float32Array.from(mesh.instanceMatrix.array),
          pos: list,
          fade: new Float32Array(list.length).fill(1),
        });
      }
    };
    /** True when any of the 8 neighbours can be walked on (a passage, gate or path border). */
    const besidePath = (x: number, y: number) => {
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++)
          if ((dx || dy) && isWalkable(this.map, x + dx, y + dy)) return true;
      return false;
    };

    const treeTex = treeTextures();
    const roofTex = roofTextures();

    BIOMES.forEach((b, i) => {
      const n = blockerVariants(b.id);
      for (let v = 0; v < n; v++) {
        const list = trees[i].filter(([x, y]) => Math.floor(hash(y, x) * n) === v);
        if (!list.length) continue;
        if (b.id === 'prado' && (v === 0 || v === 1)) {
          // Textured BotW gnarled oak trees: mossy bark trunk + lush volumetric watercolor leaf canopy (zero flat card seams from top-down!)
          const sc = v === 0 ? 1.62 : 1.5;
          EDGE_TREE_SCALE[0] = 1.05;
          place3D(
            treeTrunkGeometry(),
            list,
            0.22,
            sc,
            0.022,
            true,
            toon({ map: treeTex.bark }),
            true
          );
          EDGE_TREE_SCALE[0] = 1.05 * 1.12;
          place3D(
            treeCanopyGeometry(v === 0 ? 0xf2ffe8 : 0xfff5cc),
            list,
            0.22,
            sc * 1.12,
            0.024,
            true,
            toon({ map: treeTex.canopyTile }),
            true
          );
        } else {
          // Larger, grander trees & boulders than the player!
          const treeScale = b.id === 'prado' && v === 2 ? 1.05 : 1.3;
          EDGE_TREE_SCALE[0] = Math.min(treeScale, 1.05);
          place3D(blockerGeometry(b.id, v), list, 0.22, treeScale, 0.022, true, undefined, true);
        }
      }
      // Lush hand-brushed 2D anime grass sprites (crossed billboards, zero cones!)
      if (grass[i].length) {
        if (b.id === 'prado') {
          // Use the 4 extracted Image 3 hand-drawn anime tall grass sprites!
          const grassTexList = pradoPlantTextures().grass;
          grassTexList.forEach((tex, v) => {
            const sub = grass[i].filter(
              ([x, y]) => Math.floor(hash(x + 7, y + 3) * grassTexList.length) === v
            );
            if (!sub.length) return;
            const card = new PlaneGeometry(1.02, 0.82);
            card.translate(0, 0.39, 0);
            const gMat = new MeshLambertMaterial({
              map: tex,
              alphaTest: 0.45,
              side: DoubleSide,
            });
            const inst = new InstancedMesh(card, gMat, sub.length * 2);
            let idx = 0;
            for (const [x, y] of sub) {
              const r = hash(x, y);
              const s = 0.88 + r * 0.32;
              const ox = (r - 0.5) * 0.16;
              const oz = (hash(y, x) - 0.5) * 0.16;
              for (const yaw of [0.18 + (r - 0.5) * 0.28, -0.45 + (r - 0.5) * 0.28]) {
                q.setFromAxisAngle(up, yaw);
                m.compose(new Vector3(x + ox, 0, y + oz), q, new Vector3(s, s, s));
                inst.setMatrixAt(idx++, m);
              }
            }
            inst.instanceMatrix.needsUpdate = true;
            inst.computeBoundingSphere();
            this.world.add(inst);
          });
        } else {
          const tex = grassSpriteTexture(b.id);
          const card = new PlaneGeometry(0.92, 0.72);
          card.translate(0, 0.34, 0);
          const gMat = new MeshBasicMaterial({
            map: tex,
            alphaTest: 0.35,
            side: DoubleSide,
          });
          const inst = new InstancedMesh(card, gMat, grass[i].length * 2);
          let idx = 0;
          for (const [x, y] of grass[i]) {
            const r = hash(x, y);
            const s = 0.85 + r * 0.32;
            const ox = (r - 0.5) * 0.16;
            const oz = (hash(y, x) - 0.5) * 0.16;
            for (const yaw of [0.22 + (r - 0.5) * 0.3, -0.42 + (r - 0.5) * 0.3]) {
              q.setFromAxisAngle(up, yaw);
              m.compose(new Vector3(x + ox, 0, y + oz), q, new Vector3(s, s, s));
              inst.setMatrixAt(idx++, m);
            }
          }
          inst.instanceMatrix.needsUpdate = true;
          inst.computeBoundingSphere();
          this.world.add(inst);
        }
      }
    });

    // Physical 3D village establishments (larger, unique toon wall textures: wood, bamboo, cement, stone, brick; NO floating labels!)
    const wallTex = wallTextures();
    const BUILDING_WALL_MAT: Record<BuildingKind, WallMaterialKind> = {
      moradia: 'wood',
      dojo: 'bamboo',
      garagem: 'cement',
      banco: 'stone',
      prefeitura: 'cement',
      laboratorio: 'cement',
      comida: 'wood',
      roupinhas: 'brick',
      minhaloja: 'bamboo',
      hospital: 'cement',
      livros: 'brick',
      apostas: 'stone',
      cemiterio: 'stone',
      reparo: 'brick',
    };
    const genericBuildings: [number, number][] = [];
    for (const [bx, by] of buildings) {
      const kind = this.map.buildings[by * this.map.width + bx];
      if (!kind) {
        genericBuildings.push([bx, by]);
        continue;
      }
      const def = BUILDINGS[kind];
      const bScale = kind === 'banco' || kind === 'prefeitura' || kind === 'hospital' ? 2.08 : 1.96;
      // Textured toon wall shell (wood / bamboo / cement / stone / brick)
      const wMesh = addOutline(
        new Mesh(establishmentWallGeometry(kind), toon({ map: wallTex[BUILDING_WALL_MAT[kind]] })),
        0.024
      );
      wMesh.position.set(bx, 0, by);
      wMesh.scale.setScalar(bScale);
      wMesh.castShadow = true;
      wMesh.receiveShadow = true;
      this.world.add(wMesh);
      // Architectural details (pillars, domes, awnings, doors, windows, chimneys)
      const extMesh = addOutline(new Mesh(establishmentGeometry(kind), toon()), 0.024);
      extMesh.position.set(bx, 0, by);
      extMesh.scale.setScalar(bScale);
      extMesh.castShadow = true;
      extMesh.receiveShadow = true;
      this.world.add(extMesh);
      // Textured terracotta or golden-straw pitched roof
      if (
        kind !== 'laboratorio' &&
        kind !== 'dojo' &&
        kind !== 'cemiterio' &&
        kind !== 'hospital' &&
        kind !== 'garagem'
      ) {
        const rTex =
          kind === 'moradia' || kind === 'comida' || kind === 'minhaloja'
            ? roofTex.straw
            : roofTex.tiles;
        const rMesh = addOutline(new Mesh(neighborhoodRoofGeometry(0), toon({ map: rTex })), 0.02);
        rMesh.position.set(bx, 0, by);
        rMesh.scale.setScalar(bScale);
        this.world.add(rMesh);
      }
      // Subtle welcome doormat on the walkable doorway tile (bx, by + 1)
      const matGeo = new PlaneGeometry(0.78, 0.46);
      matGeo.rotateX(-Math.PI / 2);
      const matMesh = new Mesh(
        matGeo,
        new MeshBasicMaterial({ color: def.accentColor, transparent: true, opacity: 0.65 })
      );
      matMesh.position.set(bx, 0.03, by + 1);
      this.world.add(matMesh);
    }

    // Any remaining generic residences — larger & unique per house (wood, bamboo, cement, stone, brick)!
    const matCycle: WallMaterialKind[] = ['wood', 'bamboo', 'cement', 'stone', 'brick'];
    for (let v = 0; v < NEIGHBORHOOD_VARIANTS; v++) {
      const list = genericBuildings.filter(
        ([x, y]) => Math.floor(hash(y, x) * NEIGHBORHOOD_VARIANTS) === v
      );
      if (list.length) {
        place3D(
          neighborhoodGeometry(v),
          list,
          0.08,
          2.02,
          0.024,
          false,
          toon({ map: wallTex[matCycle[v % matCycle.length]] })
        );
        const rTex = v % 2 === 1 ? roofTex.straw : roofTex.tiles;
        place3D(neighborhoodRoofGeometry(v), list, 0.08, 2.02, 0.022, false, toon({ map: rTex }));
      }
    }

    // Sunflowers & wildflowers dotting the sunlit meadow
    const sunflowers = lawn.filter(([x, y]) => hash(x + 3, y) < 0.06);
    if (sunflowers.length) place3D(sunflowerGeometry(), sunflowers, 0.25, 0.85, 0.012, true);

    // Living village & nature details in Biome 1 (instanced: 1 draw call per prop type!)
    const fences: [number, number][] = [];
    const lanterns: [number, number][] = [];
    const signs: [number, number][] = [];
    const bushes: [number, number][] = [];
    const lilies: [number, number][] = [];

    for (const [x, y] of lawn) {
      const nearPath =
        tileAt(this.map, x, y + 1) === 'caminho' || tileAt(this.map, x, y - 1) === 'caminho';
      const nearHouse =
        tileAt(this.map, x - 1, y) === 'predio' || tileAt(this.map, x + 1, y) === 'predio';
      const r = hash(x + 19, y + 7);
      if (nearHouse && r < 0.55) fences.push([x, y]);
      else if (nearPath && (x + y) % 5 === 0 && r < 0.45) lanterns.push([x, y]);
      else if (nearPath && x === this.map.start.x + 2 && y === this.map.start.y - 1)
        signs.push([x, y]);
      else if (!nearPath && r > 0.88) bushes.push([x, y]);
    }
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        if (this.map.biomes[y * this.map.width + x] === 0 && tileAt(this.map, x, y) === 'agua') {
          if (hash(x + 11, y + 23) < 0.32) lilies.push([x, y]);
        }
      }
    }

    if (fences.length) place3D(fenceGeometry(), fences, 0.05, 0.92, 0.014, false);
    if (lanterns.length) place3D(lanternPostGeometry(), lanterns, 0.04, 0.95, 0.014, false);
    if (signs.length) place3D(signpostGeometry(), signs, 0.02, 0.95, 0.014, false);

    // Hand-drawn Image 3 anime bushes & wildflowers across Biome 1 (prado)!
    const pradoPlants = pradoPlantTextures();
    const placePlantSprites = (
      list: [number, number][],
      textures: Texture[],
      w: number,
      h: number,
      crossed = false
    ) => {
      if (!list.length) return;
      textures.forEach((tex, v) => {
        const sub = list.filter(
          ([x, y]) => Math.floor(hash(x + 17, y + 29) * textures.length) === v
        );
        if (!sub.length) return;
        const card = new PlaneGeometry(w, h);
        card.translate(0, h * 0.48, 0);
        const sMat = new MeshLambertMaterial({ map: tex, alphaTest: 0.45, side: DoubleSide });
        const mult = crossed ? 2 : 1;
        const inst = new InstancedMesh(card, sMat, sub.length * mult);
        let idx = 0;
        for (const [x, y] of sub) {
          const r = hash(x, y);
          const s = 0.82 + r * 0.34;
          const ox = (r - 0.5) * 0.3;
          const oz = (hash(y, x) - 0.5) * 0.3;
          const yaws = crossed
            ? [0.2 + (r - 0.5) * 0.25, -0.55 + (r - 0.5) * 0.25]
            : [(r - 0.5) * 0.25];
          for (const yaw of yaws) {
            q.setFromAxisAngle(up, yaw);
            m.compose(new Vector3(x + ox, 0, y + oz), q, new Vector3(s, s, s));
            inst.setMatrixAt(idx++, m);
          }
        }
        inst.instanceMatrix.needsUpdate = true;
        inst.computeBoundingSphere();
        this.world.add(inst);
      });
    };

    if (bushes.length) placePlantSprites(bushes, pradoPlants.bushes, 0.95, 0.85, true);
    const pradoFlowers = lawn.filter(([x, y]) => hash(x + 5, y + 13) < 0.22);
    if (pradoFlowers.length)
      placePlantSprites(pradoFlowers, pradoPlants.flowers, 0.58, 0.58, false);
    // Keep 3D bushes available for non-prado biomes if needed
    void bushGeometry;
    if (lilies.length) {
      const lilyMesh = new InstancedMesh(lilyPadGeometry(), toon(), lilies.length);
      lilies.forEach(([x, y], i) => {
        const r = hash(x, y);
        q.setFromAxisAngle(up, r * Math.PI * 2);
        const s = 0.8 + r * 0.4;
        m.compose(
          new Vector3(x + (r - 0.5) * 0.3, -0.09, y + (hash(y, x) - 0.5) * 0.3),
          q,
          new Vector3(s, s, s)
        );
        lilyMesh.setMatrixAt(i, m);
      });
      lilyMesh.instanceMatrix.needsUpdate = true;
      lilyMesh.computeBoundingSphere();
      this.world.add(lilyMesh);
    }

    if (flowers.length) {
      const flowerMesh = new InstancedMesh(
        merge([part(new IcosahedronGeometry(0.075), 0xffffff, { pos: [0, 0.07, 0] })]),
        toon(),
        flowers.length
      );
      flowers.forEach(([x, y], i) => {
        const r = hash(x, y);
        q.setFromAxisAngle(up, r * Math.PI * 2);
        const s = 0.75 + r * 0.55;
        m.compose(
          new Vector3(x + (r - 0.5) * 0.35, 0, y + (hash(y, x) - 0.5) * 0.35),
          q,
          new Vector3(s, s, s)
        );
        flowerMesh.setMatrixAt(i, m);
        flowerMesh.setColorAt(i, new Color(flowerColors[i]));
      });
      flowerMesh.instanceMatrix.needsUpdate = true;
      flowerMesh.computeBoundingSphere();
      this.world.add(flowerMesh);
    }
  }

  private buildProps(): void {
    const shared: Partial<Record<Tile, BufferGeometry>> = {
      bau: chestGeometry(),
      cura: healGeometry(),
    };
    this.map.tiles.forEach((t, i) => {
      const x = i % this.map.width;
      const y = Math.floor(i / this.map.width);
      let obj: Object3D | null = null;
      if (t === 'bau' || t === 'cura') {
        obj = new Group();
        obj.add(addOutline(new Mesh(shared[t], toon()), 0.022), blobShadow(0.42));
        this.animated.push({ obj, kind: t === 'bau' ? 'bau' : 'heal' });
      } else if (t === 'cristal') {
        const element = this.map.loot[i];
        const color = element ? ELEMENT_INFO[element].color : 0xffffff;
        obj = new Group();
        const gem = addOutline(new Mesh(crystalGeometry(color), toon()), 0.022);
        obj.add(gem, blobShadow(0.32));
        this.animated.push({ obj: gem, kind: 'cristal' });
      } else if (t === 'treinador') {
        const colors = [0x45a05a, 0x8e5ec8, 0xe8a838, 0x3b6cb8];
        const trainer = createHeroModel(colors[i % colors.length], 0xd95448);
        obj = trainer.root;
        obj.scale.setScalar(1.02);
      } else if (t === 'selvagem') {
        // Visible Legends: Arceus-style wild 3D Elementa-Mon roaming in the overworld!
        const sp = this.map.wildSpawns[i];
        if (sp) {
          const wild = createCreature(sp.speciesId, stageOf(sp.level), sp.element);
          wild.scale.setScalar(0.95);
          obj = wild;
          this.animated.push({ obj: wild, kind: 'selvagem' });
        }
      } else if (t === 'portal') {
        obj = new Group();
        const core = new Mesh(
          portalCoreGeometry(),
          new MeshLambertMaterial({
            vertexColors: true,
            emissive: 0x6b3fe8,
            emissiveIntensity: 0.9,
          })
        );
        obj.add(addOutline(new Mesh(portalGeometry(), toon()), 0.026), core);
        this.animated.push({ obj: core, kind: 'portal' });
      }
      if (obj) {
        obj.position.set(x, 0, y);
        this.world.add(obj);
        this.objects.set(i, obj);
      }
    });
  }

  removeAt(x: number, y: number): void {
    const key = y * this.map.width + x;
    const obj = this.objects.get(key);
    if (!obj) return;
    this.world.remove(obj);
    this.objects.delete(key);
    this.animated = this.animated.filter((a) => a.obj !== obj);
  }

  move(dx: number, dy: number): 'moved' | 'blocked' | 'busy' {
    if (this.moving) return 'busy';
    this.facing = Math.atan2(dx, dy);
    const nx = Math.round(this.to.x) + dx;
    const ny = Math.round(this.to.z) + dy;
    const nextTile = tileAt(this.map, nx, ny);
    // Ground items (bau, cristal, cura) have normal solid collision — player must press Action to bend down & pick them up!
    if (
      !isWalkable(this.map, nx, ny) ||
      nextTile === 'treinador' ||
      nextTile === 'selvagem' ||
      nextTile === 'bau' ||
      nextTile === 'cristal' ||
      nextTile === 'cura'
    ) {
      return 'blocked';
    }
    this.from.copy(this.to);
    this.followerTarget.copy(this.from);
    this.to.set(nx, 0, ny);
    this.t = 0;
    return 'moved';
  }

  facingTile(): { x: number; y: number } {
    return {
      x: Math.round(this.to.x + Math.sin(this.facing)),
      y: Math.round(this.to.z + Math.cos(this.facing)),
    };
  }

  setAvatar(body: number, hat: number): void {
    this.hero.setColors(body, hat);
  }

  setHeroExpression(expr: HeroExpression): void {
    this.hero.setExpression(expr);
  }

  /** Turns the protagonist directly toward the camera (4th-wall break for item-get lifts!). */
  faceCamera(): void {
    this.facing = 0;
    this.player.rotation.y = 0;
  }

  playHeroAction(action: HeroAction): void {
    if (action === 'celebrate') this.faceCamera();
    this.hero.playAction(action);
  }

  /** Displays the 1 active companion pet following the protagonist across the overworld. */
  setFollowerPet(pet: { speciesId: string; level: number; element: PetElement } | null): void {
    if (!pet) {
      this.followerKey = '';
      this.followerLoadToken += 1;
      if (this.followerCreature) {
        this.followerGroup.remove(this.followerCreature);
        disposeCreature(this.followerCreature);
        this.followerCreature = null;
      }
      if (this.followerGlb) {
        this.followerGroup.remove(this.followerGlb.root);
        this.followerGlb.dispose();
        this.followerGlb = null;
      }
      return;
    }
    const stage = stageOf(pet.level);
    const key = `${pet.speciesId}:${stage}:${pet.element}`;
    if (key === this.followerKey) return;
    this.followerKey = key;
    const token = ++this.followerLoadToken;

    if (this.followerCreature) {
      this.followerGroup.remove(this.followerCreature);
      disposeCreature(this.followerCreature);
      this.followerCreature = null;
    }
    if (this.followerGlb) {
      this.followerGroup.remove(this.followerGlb.root);
      this.followerGlb.dispose();
      this.followerGlb = null;
    }

    const creature = createCreature(pet.speciesId, stage, pet.element);
    creature.scale.setScalar(0.76);
    creature.traverse((o) => {
      if (o instanceof Mesh && o.name !== 'outline') o.castShadow = true;
    });
    this.followerCreature = creature;
    this.followerGroup.add(creature);

    if (hasPetModel(pet.speciesId, stage)) {
      const geo = creatureGeometry(pet.speciesId, stage, pet.element);
      geo.computeBoundingBox();
      const h = geo.boundingBox ? geo.boundingBox.max.y - geo.boundingBox.min.y : 1;
      void createPetModel(pet.speciesId, stage, h * 0.8, true, pet.element).then((glb) => {
        if (token !== this.followerLoadToken) {
          glb.dispose();
          return;
        }
        creature.userData.body.visible = false;
        this.followerGlb = glb;
        this.followerGroup.add(glb.root);
        void glb.play('idle');
      });
    }
  }

  /** Adjusts sunlight, hemisphere fill & sky mood smoothly for Dawn / Day / Sunset / Night. */
  setTimePhase(phase: 'amanhecer' | 'dia' | 'entardecer' | 'noite'): void {
    this.dayPhase = phase;
  }

  /** Turns the entire visible biome terrain into a murky brown mud sea after a government-neglect dam explosion! */
  setMudMode(isMud: boolean): void {
    this.mudBiome = isMud;
    this.setEcoHealth(this.ecoHealth);
  }

  /** Updates environmental health (0..100): degraded biomes turn visibly greyer & emptier! */
  setEcoHealth(health: number): void {
    this.ecoHealth = Math.max(0, Math.min(100, health));
    for (const bf of this.butterflies) {
      bf.group.visible = !this.mudBiome && this.ecoHealth > 45;
    }
    // Visibly degrade the terrain: mud catastrophe turns the entire ground into toxic mud brown!
    if (this.terrainMat) {
      if (this.mudBiome) {
        this.terrainMat.color.setHex(0x6b4728);
      } else {
        const k = Math.max(0, (100 - this.ecoHealth) / 100);
        this.terrainMat.color.setHex(0xffffff).lerp(this._tmpCol.setHex(0x7c746a), k * 0.78);
      }
    }
  }

  private updateCamera(lerp: number): void {
    this.camTarget.lerp(this.player.position, lerp);
    this.camera.position.set(
      this.camTarget.x,
      this.camTarget.y + CAM_UP,
      this.camTarget.z + CAM_BACK
    );
    this.camera.lookAt(this.camTarget.x, this.camTarget.y + CAM_LOOK, this.camTarget.z);
    // Keep soft shadow frustum centered around the player
    this.sun.position.set(this.camTarget.x + 6, 12, this.camTarget.z + 6);
    this.sun.target.position.copy(this.camTarget);
  }

  /**
   * Shrinks the trees standing between the camera and the hero (the camera sits on +z), so the
   * hero and the passage ahead stay visible; they grow back once the hero walks away.
   */
  private updateOccluders(dt: number): void {
    const hx = this.player.position.x;
    const hz = this.player.position.z;
    const k = Math.min(1, dt * 10);
    const m = this._occM;
    const sc = this._occSc;
    for (const o of this.occluders) {
      let dirty = false;
      for (let i = 0; i < o.pos.length; i++) {
        const [x, z] = o.pos[i];
        const f = o.fade[i];
        // Fast spatial early-out: skip trees far from hero that are already at full scale!
        const dz = z - hz;
        if (f === 1 && (dz <= -0.4 || dz >= OCCLUDE_DEPTH || Math.abs(x - hx) > 4.5)) continue;
        const near =
          dz > -0.4 && dz < OCCLUDE_DEPTH && Math.abs(x - hx) < OCCLUDE_HALF_W + dz * 0.25;
        const target = near ? 0.22 : 1;
        if (f === target) continue;
        const nf = Math.abs(target - f) < 0.01 ? target : f + (target - f) * k;
        o.fade[i] = nf;
        m.fromArray(o.base, i * 16);
        if (nf !== 1) {
          // scale about the tree's own base point
          const px = m.elements[12];
          const pz = m.elements[14];
          sc.makeScale(nf, nf, nf).setPosition(px * (1 - nf), 0, pz * (1 - nf));
          m.premultiply(sc);
        }
        o.mesh.setMatrixAt(i, m);
        dirty = true;
      }
      if (dirty) o.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  update(dt: number, time: number): void {
    if (this.t < 1) {
      this.t = Math.min(1, this.t + dt / MOVE_TIME);
      this.player.position.lerpVectors(this.from, this.to, this.t);
      if (this.t === 1) this.onArrive?.(Math.round(this.to.x), Math.round(this.to.z));
    }

    // Smooth hero rotation + lively articulated walk/idle animation
    let d = this.facing - this.hero.root.rotation.y;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    this.hero.root.rotation.y += d * Math.min(1, dt * 15);
    this.idleFor = this.t < 1 ? 0 : this.idleFor + dt;
    this.hero.update(dt, time, this.idleFor < 0.08);

    // Smoothly trot the 1 active companion pet behind the protagonist!
    if (this.followerCreature || this.followerGlb) {
      const dx = this.followerTarget.x - this.followerPos.x;
      const dz = this.followerTarget.z - this.followerPos.z;
      const dist = Math.hypot(dx, dz);
      const movingNow = dist > 0.08;
      if (movingNow) {
        const step = Math.min(dist, dt * 5.6);
        this.followerPos.x += (dx / dist) * step;
        this.followerPos.z += (dz / dist) * step;
        const targetYaw = Math.atan2(dx, dz);
        let dy = targetYaw - this.followerYaw;
        dy = Math.atan2(Math.sin(dy), Math.cos(dy));
        this.followerYaw += dy * Math.min(1, dt * 12);
      } else {
        const px = this.player.position.x - this.followerPos.x;
        const pz = this.player.position.z - this.followerPos.z;
        if (Math.hypot(px, pz) > 0.05) {
          const lookYaw = Math.atan2(px, pz);
          let dy = lookYaw - this.followerYaw;
          dy = Math.atan2(Math.sin(dy), Math.cos(dy));
          this.followerYaw += dy * Math.min(1, dt * 6);
        }
      }
      this.followerGroup.position.set(
        this.followerPos.x,
        movingNow ? Math.abs(Math.sin(time * 12)) * 0.14 : 0,
        this.followerPos.z
      );
      this.followerGroup.rotation.y = this.followerYaw;
      if (this.followerCreature) {
        animateCreature(this.followerCreature, time + 0.4);
      }
      if (this.followerGlb) {
        if (movingNow !== this.followerMoving) {
          this.followerMoving = movingNow;
          void this.followerGlb.play(movingNow ? 'walk' : 'idle');
        }
        this.followerGlb.mixer.update(dt);
      }
    }

    this.updateCamera(Math.min(1, dt * 8));
    // Trees stay full-size with normal solid collision (no shrinking when passing behind them!)
    void this.updateOccluders;

    // Drifting sunlit breeze motes & fluttering butterflies around player
    for (const m of this.motes) {
      m.mesh.position.set(
        this.camTarget.x + m.offset.x + Math.sin(time * m.speed + m.phase) * 0.7,
        m.offset.y + Math.sin(time * m.speed * 0.7 + m.phase) * 0.25,
        this.camTarget.z + m.offset.z + Math.cos(time * m.speed * 0.6 + m.phase) * 0.6
      );
    }
    for (const bf of this.butterflies) {
      const a = time * bf.speed + bf.phase;
      bf.group.position.set(
        this.camTarget.x + bf.offset.x + Math.sin(a) * 1.4,
        bf.offset.y + Math.sin(a * 2.3) * 0.22,
        this.camTarget.z + bf.offset.z + Math.cos(a * 0.8) * 1.1
      );
      bf.group.rotation.y = Math.atan2(Math.cos(a) * 1.4, -Math.sin(a * 0.8) * 0.88);
      const flap = Math.sin(time * 16 + bf.phase) * 0.75;
      bf.leftWing.rotation.z = flap;
      bf.rightWing.rotation.z = -flap;
    }

    const hx = this.player.position.x;
    const hz = this.player.position.z;
    for (const a of this.animated) {
      // Distance-cull off-screen prop/wild-pet animations to save CPU!
      if (Math.abs(a.obj.position.x - hx) > 15 || Math.abs(a.obj.position.z - hz) > 13) continue;
      if (a.kind === 'portal') a.obj.rotation.y = Math.sin(time * 2) * 0.3;
      else if (a.kind === 'heal') a.obj.rotation.y = time * 1.1;
      else if (a.kind === 'cristal') {
        a.obj.rotation.y = time * 1.5;
        a.obj.position.y = Math.sin(time * 2.5) * 0.08;
      } else if (a.kind === 'selvagem') {
        animateCreature(a.obj as CreatureMesh, time + a.obj.position.x * 0.7);
        a.obj.rotation.y = Math.sin(time * 0.8 + a.obj.position.z) * 0.55;
      } else a.obj.position.y = Math.abs(Math.sin(time * 2 + a.obj.position.x)) * 0.05;
    }
    for (const l of this.liquids) l.position.y = Math.sin(time * 1.6) * 0.035;
    this.blendBiome(dt);
  }

  private skyFor(biome: number): Texture {
    let tex = this.skies.get(biome);
    if (!tex) {
      tex = skyTexture(BIOMES[biome].palette.sky, 5 + biome);
      this.skies.set(biome, tex);
    }
    return tex;
  }

  private blendBiome(dt: number): void {
    const biome = this.currentBiome;
    const b = BIOMES[biome];
    const k = this.biome === -1 ? 1 : Math.min(1, dt * 2.5);
    this.biome = biome;
    if (this.scene.background !== this.skyFor(biome)) this.scene.background = this.skyFor(biome);
    const baseSky = this._tmpSky.setHex(skyHorizon(b.palette.sky));
    const baseLight = this._tmpLight.setHex(b.palette.light);
    const tmp = this._tmpCol;
    if (this.dayPhase === 'noite') {
      baseSky.lerp(tmp.setHex(0x161d3a), 0.78);
      baseLight.lerp(tmp.setHex(0x4b5e9c), 0.72);
      this.sun.intensity += (0.85 - this.sun.intensity) * k;
      this.sun.color.lerp(tmp.setHex(0x9cb8ff), k);
    } else if (this.dayPhase === 'entardecer') {
      baseSky.lerp(tmp.setHex(0xff9b62), 0.45);
      baseLight.lerp(tmp.setHex(0xffc98e), 0.4);
      this.sun.intensity += (2.25 - this.sun.intensity) * k;
      this.sun.color.lerp(tmp.setHex(0xffb878), k);
    } else if (this.dayPhase === 'amanhecer') {
      baseSky.lerp(tmp.setHex(0xffd2c2), 0.35);
      this.sun.intensity += (2.35 - this.sun.intensity) * k;
      this.sun.color.lerp(tmp.setHex(0xffe6cc), k);
    } else {
      this.sun.intensity += (2.75 - this.sun.intensity) * k;
      this.sun.color.lerp(tmp.setHex(0xfff2d6), k);
    }
    if (this.ecoHealth < 85) {
      // Progressive environmental degradation: ash-grey smog & lifeless lighting!
      const decay = Math.min(1, (85 - this.ecoHealth) / 85);
      baseSky.lerp(tmp.setHex(0x6e7378), decay * 0.78);
      baseLight.lerp(tmp.setHex(0x7c8084), decay * 0.72);
      this.sun.color.lerp(tmp.setHex(0xb5b8ba), decay * 0.55);
      this.sun.intensity *= 1 - decay * 0.28;
    }
    this.sky.lerp(baseSky, k);
    (this.scene.fog as Fog).color.copy(this.sky);
    this.hemi.color.lerp(baseLight, k);
  }
}
