import {
  BufferGeometry,
  Color,
  DirectionalLight,
  Fog,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  Vector3,
} from 'three';
import { isWalkable, tileAt, type FloorMap, type Tile } from '../game/rules/world';
import type { View } from './engine';
import {
  avatarGeometry,
  blobShadow,
  chestGeometry,
  createAvatar,
  healGeometry,
  lambert,
  merge,
  part,
  portalCoreGeometry,
  portalGeometry,
  tallGrassGeometry,
  treeGeometry,
} from './models';

/** Sky/fog and grass tint per floor, so each floor feels like a new biome. */
const BIOMES = [
  { sky: 0x9fd8ff, grass: 0x6cc24a, path: 0xd9c58b },
  { sky: 0xffc99a, grass: 0x9bbf4a, path: 0xd8b47a },
  { sky: 0x8d86c9, grass: 0x4e8f6a, path: 0xa99bc0 },
];

const MOVE_TIME = 0.18;

export class OverworldView implements View {
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(48, 4 / 3, 0.1, 40);
  private world = new Group();
  private player: Group;
  private objects = new Map<number, Object3D>();
  private animated: { obj: Object3D; kind: 'portal' | 'heal' | 'bau' }[] = [];
  private map!: FloorMap;
  private from = new Vector3();
  private to = new Vector3();
  private t = 1;
  private facing = 0;
  private camTarget = new Vector3();
  private water: Mesh | null = null;
  onArrive: ((x: number, y: number) => void) | null = null;

  constructor(map: FloorMap, avatar: { body: number; hat: number }) {
    this.scene.add(new HemisphereLight(0xeaf6ff, 0x4a6b3a, 1.7));
    const sun = new DirectionalLight(0xffffff, 1.9);
    sun.position.set(3, 8, 4);
    this.scene.add(sun, this.world);
    this.player = createAvatar(avatar.body, avatar.hat);
    this.scene.add(this.player);
    this.setMap(map);
  }

  get moving(): boolean {
    return this.t < 1;
  }

  resize(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  setMap(map: FloorMap, pos = map.start): void {
    this.map = map;
    for (const child of [...this.world.children]) {
      this.world.remove(child);
      if (child instanceof Mesh || child instanceof InstancedMesh) {
        child.geometry.dispose();
        (child.material as MeshLambertMaterial).dispose();
      }
    }
    this.objects.clear();
    this.animated = [];
    const biome = BIOMES[(map.floor - 1) % BIOMES.length];
    this.scene.background = new Color(biome.sky);
    this.scene.fog = new Fog(biome.sky, 10, 21);
    this.buildGround(biome);
    this.buildInstanced();
    this.buildProps();
    this.player.position.set(pos.x, 0, pos.y);
    this.from.copy(this.player.position);
    this.to.copy(this.player.position);
    this.t = 1;
    this.camTarget.copy(this.player.position);
    this.updateCamera(1);
  }

  private buildGround(biome: (typeof BIOMES)[number]): void {
    const parts: BufferGeometry[] = [];
    const waterParts: BufferGeometry[] = [];
    const { width, height } = this.map;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = tileAt(this.map, x, y);
        if (tile === 'agua') {
          waterParts.push(
            part(new PlaneGeometry(1, 1), 0x3b8ee8, {
              pos: [x, -0.12, y],
              rot: [-Math.PI / 2, 0, 0],
              jitter: 0.12,
            })
          );
          parts.push(
            part(new PlaneGeometry(1, 1), 0x7a6a4a, {
              pos: [x, -0.3, y],
              rot: [-Math.PI / 2, 0, 0],
            })
          );
          continue;
        }
        const checker = (x + y) % 2 === 0 ? 1 : 0.94;
        const color = new Color(
          tile === 'caminho' || tile === 'portal' ? biome.path : biome.grass
        ).multiplyScalar(checker);
        parts.push(
          part(new PlaneGeometry(1, 1), color.getHex(), {
            pos: [x, 0, y],
            rot: [-Math.PI / 2, 0, 0],
            jitter: 0.05,
          })
        );
      }
    }
    // Outer ground so the fog fades into land, not void.
    parts.push(
      part(new PlaneGeometry(60, 60), new Color(biome.grass).multiplyScalar(0.8).getHex(), {
        pos: [width / 2, -0.02, height / 2],
        rot: [-Math.PI / 2, 0, 0],
        jitter: 0,
      })
    );
    this.world.add(new Mesh(merge(parts), lambert()));
    if (waterParts.length) {
      const mat = new MeshLambertMaterial({
        vertexColors: true,
        flatShading: true,
        transparent: true,
        opacity: 0.85,
      });
      this.water = new Mesh(merge(waterParts), mat);
      this.world.add(this.water);
    } else this.water = null;
  }

  private buildInstanced(): void {
    const trees: [number, number][] = [];
    const grass: [number, number][] = [];
    const flowers: [number, number][] = [];
    this.map.tiles.forEach((t, i) => {
      const x = i % this.map.width;
      const y = Math.floor(i / this.map.width);
      if (t === 'arvore') trees.push([x, y]);
      else if (t === 'matoAlto') grass.push([x, y]);
      else if (t === 'grama' && (x * 7 + y * 13) % 9 === 0) flowers.push([x, y]);
    });
    // One ring of trees outside the border so the edge reads as forest (fog hides the rest).
    for (let k = -1; k <= this.map.width; k++) {
      trees.push([k, -1], [k, this.map.height]);
      if (k >= 0 && k < this.map.height) trees.push([-1, k], [this.map.width, k]);
    }
    const m = new Matrix4();
    const q = new Quaternion();
    const up = new Vector3(0, 1, 0);
    // Instances are split into 8×8-tile chunks so frustum culling skips what the camera can't see.
    const chunked = (geo: BufferGeometry, list: [number, number][], jitter: number) => {
      const chunks = new Map<string, [number, number][]>();
      for (const p of list) {
        const key = `${Math.floor(p[0] / 8)}:${Math.floor(p[1] / 8)}`;
        chunks.set(key, [...(chunks.get(key) ?? []), p]);
      }
      const mat = lambert();
      return [...chunks.values()].map((c) => place(geo, c, jitter, mat));
    };
    const place = (
      geo: BufferGeometry,
      list: [number, number][],
      jitter: number,
      mat = lambert()
    ) => {
      const mesh = new InstancedMesh(geo, mat, list.length);
      list.forEach(([x, y], i) => {
        const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        const r = h - Math.floor(h);
        q.setFromAxisAngle(up, r * Math.PI * 2);
        const s = 1 - jitter / 2 + r * jitter;
        m.compose(
          new Vector3(x + (r - 0.5) * 0.2, 0, y + (r - 0.5) * 0.2),
          q,
          new Vector3(s, s, s)
        );
        mesh.setMatrixAt(i, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
      this.world.add(mesh);
      return mesh;
    };
    chunked(treeGeometry(), trees, 0.35);
    chunked(tallGrassGeometry(), grass, 0.2);
    const flowerMesh = place(
      merge([part(new IcosahedronGeometry(0.07), 0xffffff, { pos: [0, 0.07, 0], jitter: 0 })]),
      flowers,
      0.5
    );
    const palette = [0xffffff, 0xffe066, 0xff8fb8, 0xb8a6ff];
    flowers.forEach((_, i) => flowerMesh.setColorAt(i, new Color(palette[i % palette.length])));
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
        obj.add(new Mesh(shared[t], lambert()), blobShadow(0.4));
        this.animated.push({ obj, kind: t === 'bau' ? 'bau' : 'heal' });
      } else if (t === 'treinador') {
        const colors = [0x3fa34d, 0x9b59d0, 0xf2b134, 0x222222];
        obj = new Group();
        obj.add(
          new Mesh(avatarGeometry(colors[i % colors.length], 0xd94a4a), lambert()),
          blobShadow(0.35)
        );
        obj.rotation.y = Math.PI / 4 + (i % 4) * (Math.PI / 2);
      } else if (t === 'portal') {
        obj = new Group();
        const core = new Mesh(
          portalCoreGeometry(),
          new MeshLambertMaterial({
            vertexColors: true,
            emissive: 0x5a2bd6,
            emissiveIntensity: 0.9,
          })
        );
        obj.add(new Mesh(portalGeometry(), lambert()), core);
        this.animated.push({ obj: core, kind: 'portal' });
      }
      if (obj) {
        obj.position.set(x, 0, y);
        this.world.add(obj);
        this.objects.set(i, obj);
      }
    });
  }

  /** Removes the prop at a tile (opened chest, beaten trainer). */
  removeAt(x: number, y: number): void {
    const key = y * this.map.width + x;
    const obj = this.objects.get(key);
    if (!obj) return;
    this.world.remove(obj);
    this.objects.delete(key);
    this.animated = this.animated.filter((a) => a.obj !== obj);
  }

  /** Starts a one-tile step. Trainers block movement but can be faced. */
  move(dx: number, dy: number): 'moved' | 'blocked' | 'busy' {
    if (this.moving) return 'busy';
    this.facing = Math.atan2(dx, dy);
    const nx = Math.round(this.to.x) + dx;
    const ny = Math.round(this.to.z) + dy;
    if (!isWalkable(this.map, nx, ny) || tileAt(this.map, nx, ny) === 'treinador') return 'blocked';
    this.from.copy(this.to);
    this.to.set(nx, 0, ny);
    this.t = 0;
    return 'moved';
  }

  /** Tile in front of the player (for talking to trainers). */
  facingTile(): { x: number; y: number } {
    return {
      x: Math.round(this.to.x + Math.sin(this.facing)),
      y: Math.round(this.to.z + Math.cos(this.facing)),
    };
  }

  setAvatar(body: number, hat: number): void {
    const mesh = this.player.children[0] as Mesh;
    mesh.geometry = avatarGeometry(body, hat);
  }

  private updateCamera(lerp: number): void {
    this.camTarget.lerp(this.player.position, lerp);
    this.camera.position.set(this.camTarget.x, this.camTarget.y + 7.6, this.camTarget.z + 4.4);
    this.camera.lookAt(this.camTarget.x, this.camTarget.y + 0.4, this.camTarget.z);
  }

  update(dt: number, time: number): void {
    if (this.t < 1) {
      this.t = Math.min(1, this.t + dt / MOVE_TIME);
      this.player.position.lerpVectors(this.from, this.to, this.t);
      this.player.position.y = Math.sin(this.t * Math.PI) * 0.12;
      if (this.t === 1) this.onArrive?.(Math.round(this.to.x), Math.round(this.to.z));
    }
    // Smallest-angle turn towards the facing direction.
    const diff = Math.atan2(
      Math.sin(this.facing - this.player.rotation.y),
      Math.cos(this.facing - this.player.rotation.y)
    );
    this.player.rotation.y += diff * Math.min(1, dt * 14);
    this.updateCamera(Math.min(1, dt * 8));

    for (const a of this.animated) {
      if (a.kind === 'portal') a.obj.rotation.y = Math.sin(time * 2) * 0.3;
      else if (a.kind === 'heal') a.obj.rotation.y = time;
      else a.obj.position.y = Math.abs(Math.sin(time * 2 + a.obj.position.x)) * 0.06;
    }
    if (this.water) this.water.position.y = Math.sin(time * 1.5) * 0.03;
  }
}
