import {
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  Fog,
  HemisphereLight,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  TetrahedronGeometry,
  Vector3,
} from 'three';
import { ELEMENT_INFO, type Element } from '../game/data/elements';
import { stageOf } from '../game/rules/progression';
import type { View } from './engine';
import {
  animateCreature,
  createCreature,
  disposeCreature,
  lambert,
  merge,
  part,
  treeGeometry,
  type CreatureMesh,
} from './models';

export interface BattleActor {
  uid: string;
  speciesId: string;
  level: number;
  side: 'player' | 'enemy';
}

interface Tween {
  t: number;
  duration: number;
  step(k: number): void;
  done(): void;
}

interface Particle {
  mesh: Mesh;
  vel: Vector3;
  life: number;
}

const ARENA_SKY = [0x9fd8ff, 0xffc99a, 0x8d86c9, 0x2b2540];

export class BattleView implements View {
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(42, 4 / 3, 0.1, 60);
  private actors = new Map<string, CreatureMesh>();
  private home = new Map<string, Vector3>();
  private tweens: Tween[] = [];
  private particles: Particle[] = [];
  private summons: Mesh[] = [];
  private particleGeo = new TetrahedronGeometry(0.08);
  private orbGeo = new OctahedronGeometry(0.22);
  private showcase = false;
  private shake = 0;

  constructor() {
    this.scene.add(new HemisphereLight(0xeaf6ff, 0x4a6b3a, 1.7));
    const sun = new DirectionalLight(0xffffff, 2);
    sun.position.set(-3, 8, 5);
    this.scene.add(sun);
    this.buildArena();
    this.setBiome(0);
  }

  setBiome(index: number): void {
    const sky = ARENA_SKY[index % ARENA_SKY.length];
    this.scene.background = new Color(sky);
    this.scene.fog = new Fog(sky, 12, 30);
  }

  private buildArena(): void {
    const ground = merge([
      part(new PlaneGeometry(50, 50), 0x5fae45, { rot: [-Math.PI / 2, 0, 0], jitter: 0 }),
      part(new CylinderGeometry(2.3, 2.5, 0.16, 10), 0xc9b27c, { pos: [-2.1, 0.0, 0.9] }),
      part(new CylinderGeometry(2.3, 2.5, 0.16, 10), 0xc9b27c, { pos: [2.0, 0.0, -1.0] }),
      part(new CylinderGeometry(1.9, 2.1, 0.17, 10), 0x9fd07a, { pos: [-2.1, 0.01, 0.9] }),
      part(new CylinderGeometry(1.9, 2.1, 0.17, 10), 0x9fd07a, { pos: [2.0, 0.01, -1.0] }),
    ]);
    this.scene.add(new Mesh(ground, lambert()));

    // Background forest ring and hills: one instanced draw + one merged mesh.
    const trees: Vector3[] = [];
    for (let i = 0; i < 46; i++) {
      const a = (i / 46) * Math.PI * 2;
      const r = 11 + (i % 3) * 1.6;
      trees.push(new Vector3(Math.cos(a) * r, 0, Math.sin(a) * r - 2));
    }
    const mesh = new InstancedMesh(treeGeometry(), lambert(), trees.length);
    const m = new Matrix4();
    trees.forEach((p, i) => {
      const s = 1.4 + (i % 4) * 0.25;
      m.compose(p, new Quaternion(), new Vector3(s, s, s));
      mesh.setMatrixAt(i, m);
    });
    mesh.computeBoundingSphere();
    this.scene.add(mesh);
    const hills: BufferGeometry[] = [];
    for (let i = 0; i < 7; i++) {
      hills.push(
        part(new ConeGeometry(5 + (i % 3), 4 + (i % 2) * 2, 5), i % 2 ? 0x4f8f5a : 0x5c9e63, {
          pos: [-18 + i * 6, 0, -20 - (i % 2) * 3],
          jitter: 0.1,
        })
      );
    }
    this.scene.add(new Mesh(merge(hills), lambert()));
  }

  resize(aspect: number): void {
    this.camera.aspect = aspect;
    // Keep both teams in frame on narrow (portrait) screens.
    this.camera.fov = aspect < 1 ? 62 : 42;
    this.camera.updateProjectionMatrix();
  }

  setup(actors: BattleActor[], showcase = false): void {
    for (const a of this.actors.values()) {
      this.scene.remove(a);
      disposeCreature(a);
    }
    this.actors.clear();
    this.home.clear();
    this.clearSummons();
    this.tweens = [];
    this.showcase = showcase;
    const players = actors.filter((a) => a.side === 'player');
    const enemies = actors.filter((a) => a.side === 'enemy');
    const layout = (list: BattleActor[], cx: number, cz: number, rot: number) => {
      list.forEach((a, i) => {
        const c = createCreature(a.speciesId, stageOf(a.level));
        const offset = (i - (list.length - 1) / 2) * 1.55;
        const pos = new Vector3(cx + offset * 0.75, 0.09, cz + offset * 0.55);
        c.position.copy(pos);
        c.rotation.y = rot;
        this.scene.add(c);
        this.actors.set(a.uid, c);
        this.home.set(a.uid, pos.clone());
      });
    };
    if (showcase && enemies.length === 0) layout(players, 0, 0.6, 0);
    else {
      layout(players, -2.1, 0.9, Math.PI / 2 - 0.45);
      layout(enemies, 2.0, -1.0, -Math.PI / 2 - 0.35);
    }
  }

  /** Swaps the model after an evolution or to show a different stage. */
  replace(uid: string, speciesId: string, level: number): void {
    const old = this.actors.get(uid);
    if (!old) return;
    const c = createCreature(speciesId, stageOf(level));
    c.position.copy(old.position);
    c.rotation.copy(old.rotation);
    this.scene.remove(old);
    disposeCreature(old);
    this.scene.add(c);
    this.actors.set(uid, c);
  }

  private tween(duration: number, step: (k: number) => void): Promise<void> {
    return new Promise((resolve) => {
      this.tweens.push({ t: 0, duration, step, done: resolve });
    });
  }

  async attack(sourceUid: string, targetUid: string): Promise<void> {
    const src = this.actors.get(sourceUid);
    const home = this.home.get(sourceUid);
    const dst = this.actors.get(targetUid);
    if (!src || !home || !dst) return;
    const toward = dst.position.clone().sub(home).multiplyScalar(0.35);
    await this.tween(0.16, (k) => src.position.copy(home).addScaledVector(toward, k));
    await this.tween(0.18, (k) => src.position.copy(home).addScaledVector(toward, 1 - k));
  }

  async hit(uid: string, element: Element | 'neutro'): Promise<void> {
    const target = this.actors.get(uid);
    if (!target) return;
    const color = element === 'neutro' ? 0xffffff : ELEMENT_INFO[element].color;
    this.burst(target.position, color, 10);
    this.shake = 0.12;
    const mat = target.userData.material;
    await this.tween(0.3, (k) => {
      mat.emissive.setHex(k < 0.5 ? 0xffffff : 0x000000);
      mat.emissiveIntensity = 1 - k;
      target.rotation.z = Math.sin(k * Math.PI * 6) * 0.12 * (1 - k);
    });
    mat.emissive.setHex(0x000000);
    target.rotation.z = 0;
  }

  async glow(uid: string, color: number): Promise<void> {
    const target = this.actors.get(uid);
    if (!target) return;
    this.burst(target.position, color, 6, true);
    const mat = target.userData.material;
    mat.emissive.setHex(color);
    await this.tween(0.4, (k) => (mat.emissiveIntensity = Math.sin(k * Math.PI) * 0.7));
    mat.emissive.setHex(0x000000);
  }

  async faint(uid: string): Promise<void> {
    const target = this.actors.get(uid);
    if (!target) return;
    await this.tween(0.45, (k) => {
      target.scale.setScalar(1 - k * 0.9);
      target.rotation.y += 0.25;
    });
    target.visible = false;
  }

  addSummon(element: Element | 'neutro'): void {
    const color = element === 'neutro' ? 0xffffff : ELEMENT_INFO[element].color;
    const mat = new MeshLambertMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.6,
      flatShading: true,
    });
    const orb = new Mesh(this.orbGeo, mat);
    orb.position.set(-3.4 + this.summons.length * 0.6, 1.8, 0.2);
    this.summons.push(orb);
    this.scene.add(orb);
  }

  removeSummon(): void {
    const orb = this.summons.shift();
    if (orb) {
      this.scene.remove(orb);
      (orb.material as MeshLambertMaterial).dispose();
    }
  }

  private clearSummons(): void {
    while (this.summons.length) this.removeSummon();
  }

  private burst(at: Vector3, color: number, count: number, rise = false): void {
    const mat = new MeshLambertMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.5,
      flatShading: true,
    });
    for (let i = 0; i < count; i++) {
      const mesh = new Mesh(this.particleGeo, mat);
      mesh.position.copy(at).add(new Vector3(0, 0.6, 0));
      const a = (i / count) * Math.PI * 2;
      const vel = rise
        ? new Vector3(Math.cos(a) * 0.6, 1.6 + Math.random(), Math.sin(a) * 0.6)
        : new Vector3(Math.cos(a) * 2.2, 1.5 + Math.random() * 1.5, Math.sin(a) * 2.2);
      this.particles.push({ mesh, vel, life: 0.6 });
      this.scene.add(mesh);
    }
  }

  /** Screen position (CSS pixels) of a point above an actor, for floating numbers and labels. */
  screenPos(uid: string, canvas: HTMLCanvasElement, height = 1.5): { x: number; y: number } | null {
    const a = this.actors.get(uid);
    if (!a) return null;
    const p = a.position
      .clone()
      .add(new Vector3(0, height * a.scale.y, 0))
      .project(this.camera);
    const rect = canvas.getBoundingClientRect();
    return {
      x: rect.left + ((p.x + 1) / 2) * rect.width,
      y: rect.top + ((1 - p.y) / 2) * rect.height,
    };
  }

  update(dt: number, time: number): void {
    for (const c of this.actors.values()) if (c.visible) animateCreature(c, time);
    this.tweens = this.tweens.filter((tw) => {
      tw.t = Math.min(1, tw.t + dt / tw.duration);
      tw.step(tw.t);
      if (tw.t >= 1) tw.done();
      return tw.t < 1;
    });
    this.particles = this.particles.filter((p) => {
      p.life -= dt;
      p.vel.y -= 6 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.rotation.x += dt * 8;
      p.mesh.scale.setScalar(Math.max(0.01, p.life / 0.6));
      if (p.life <= 0) this.scene.remove(p.mesh);
      return p.life > 0;
    });
    this.summons.forEach((orb, i) => {
      orb.position.y = 1.8 + Math.sin(time * 3 + i) * 0.15;
      orb.rotation.y = time * 2;
    });

    if (this.showcase) {
      const a = Math.sin(time * 0.2) * 0.6;
      this.camera.position.set(Math.sin(a) * 8, 2.6, Math.cos(a) * 8);
      this.camera.lookAt(0, 1.2, 0);
      return;
    }
    this.shake = Math.max(0, this.shake - dt);
    const s = this.shake * 0.6;
    this.camera.position.set(
      -0.4 + (Math.random() - 0.5) * s,
      3.9 + (Math.random() - 0.5) * s,
      8.4
    );
    this.camera.lookAt(0.1, 0.3, 0);
  }
}
