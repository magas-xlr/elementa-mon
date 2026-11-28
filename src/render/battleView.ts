import {
  BufferGeometry,
  ConeGeometry,
  DirectionalLight,
  DoubleSide,
  Fog,
  Group,
  HemisphereLight,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshToonMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  SphereGeometry,
  TetrahedronGeometry,
  Vector3,
  type Texture,
} from 'three';
import { audio } from '../audio';
import { ELEMENT_INFO, type Element, type PetElement } from '../game/data/elements';
import { stageOf } from '../game/rules/progression';
import type { View } from './engine';
import { createHeroModel, type HeroModel } from './heroModel';
import {
  animateCreature,
  createCreature,
  creatureGeometry,
  disposeCreature,
  ico,
  merge,
  part,
  toon,
  treeCanopyGeometry,
  treeTrunkGeometry,
  type CreatureMesh,
} from './models';
import { createPetModel, hasPetModel, type PetModel } from './petModels';
import { CREATURE_YAW, type Facing } from './sprites';
import { pradoGroundTexture, treeTextures } from './biomeAssets';
import { skyHorizon, skyTexture } from './pixelTextures';
import { addOutline } from './toon';
import { FrameVfxManager, vfxKindForElement } from './vfx';

/**
 * A 3D pet actor in battle or title showcase: smooth sculpted anime-watercolor 3D model
 * (or hand-made rigged GLB when available, like Caputino).
 */
interface Actor extends Group {
  userData: {
    creature: CreatureMesh;
    material: MeshToonMaterial;
    phase: number;
    h: number;
    pet?: PetModel;
    aura?: Group;
    auraElement?: PetElement;
    disposed?: boolean;
    stepT?: number;
  };
}

/** Builds a distinctive 3D elemental form aura around a transformed pet (e.g. blazing flames for Fire!). */
function buildElementalAura(element: PetElement): Group | undefined {
  if (element === 'neutro') return undefined;
  const group = new Group();
  const col = element === 'radioativo' ? 0x76ff03 : ELEMENT_INFO[element].color;
  const mat = new MeshBasicMaterial({ color: col, transparent: true, opacity: 0.88 });
  const coreMat = new MeshBasicMaterial({
    color: element === 'fogo' ? 0xfff078 : 0xffffff,
    transparent: true,
    opacity: 0.92,
  });

  if (element === 'fogo') {
    // Blazing sculpted 3D flame tongues licking upward around the pet!
    const flameGeo = new ConeGeometry(0.14, 0.52, 7);
    const innerGeo = new ConeGeometry(0.08, 0.34, 6);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const r = 0.42 + (i % 2) * 0.1;
      const outer = new Mesh(flameGeo, mat);
      outer.position.set(Math.cos(a) * r, 0.32 + (i % 2) * 0.14, Math.sin(a) * r);
      const inner = new Mesh(innerGeo, coreMat);
      inner.position.set(Math.cos(a) * r, 0.25 + (i % 2) * 0.12, Math.sin(a) * r);
      group.add(outer, inner);
    }
    // Crown flame on top of head
    const crown = new Mesh(new ConeGeometry(0.16, 0.46, 7), mat);
    crown.position.set(0, 1.05, 0);
    group.add(crown);
  } else {
    // Orbiting elemental manifestations (water droplets, lightning spikes, ice crystals, rocks, etc.)
    const shardGeo =
      element === 'agua'
        ? new SphereGeometry(0.12, 8, 6)
        : element === 'eletrico'
          ? new ConeGeometry(0.08, 0.46, 4)
          : new OctahedronGeometry(0.14);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const m = new Mesh(shardGeo, i % 2 ? mat : coreMat);
      m.position.set(Math.cos(a) * 0.56, 0.48 + (i % 2) * 0.24, Math.sin(a) * 0.56);
      if (element === 'eletrico') m.rotation.z = Math.PI * 0.22;
      group.add(m);
    }
  }
  return group;
}

function createActor(
  speciesId: string,
  stage: number,
  facing: Facing,
  element: PetElement = 'neutro'
): Actor {
  const creature = createCreature(speciesId, stage, element);
  creature.rotation.y = CREATURE_YAW[facing];
  const geo = creatureGeometry(speciesId, stage, element);
  geo.computeBoundingBox();
  const h = geo.boundingBox ? geo.boundingBox.max.y - geo.boundingBox.min.y : 1;
  const g = new Group() as Actor;
  g.add(creature);
  const aura = buildElementalAura(element);
  if (aura) g.add(aura);
  g.userData = {
    creature,
    material: creature.userData.material,
    phase: Math.random() * Math.PI * 2,
    h,
    aura,
    auraElement: element,
  };
  return g;
}

const disposeActor = (a: Actor) => {
  a.userData.disposed = true;
  disposeCreature(a.userData.creature);
  a.userData.pet?.dispose();
};

/** Loads the hand-made rigged GLB model (e.g. Caputino) and swaps it in seamlessly. */
async function attachModel(
  a: Actor,
  speciesId: string,
  stage: number,
  facing: Facing,
  element: PetElement = 'neutro'
) {
  if (!hasPetModel(speciesId, stage)) return null;
  try {
    const pet = await createPetModel(speciesId, stage, a.userData.h, true, element);
    if (a.userData.disposed) {
      pet.dispose();
      return null;
    }
    pet.root.rotation.y = CREATURE_YAW[facing];
    a.userData.creature.userData.body.visible = false;
    a.userData.pet = pet;
    a.add(pet.root);
    return pet;
  } catch {
    return null;
  }
}

const FOOTFALLS: Partial<Record<string, number[]>> = { walk: [0.02, 0.52], hop: [0.66] };
const voicePitch = (stage: number) => 1 - stage * 0.18;

export interface BattleActor {
  uid: string;
  speciesId: string;
  level: number;
  side: 'player' | 'enemy';
  element?: PetElement;
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

interface Mote {
  mesh: Mesh;
  base: Vector3;
  speed: number;
  phase: number;
}

const ARENA_SKY = [0x6fc2ff, 0xffc694, 0x8d86c9, 0x2b2540];

export class BattleView implements View {
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(40, 4 / 3, 0.1, 70);
  private actors = new Map<string, Actor>();
  private home = new Map<string, Vector3>();
  private tweens: Tween[] = [];
  private particles: Particle[] = [];
  private motes: Mote[] = [];
  private summons: Mesh[] = [];
  private particleGeo = new TetrahedronGeometry(0.08);
  private orbGeo = new OctahedronGeometry(0.22);
  private showcase = false;
  private shake = 0;
  private facing = new Map<string, Facing>();
  private clouds: Mesh | null = null;
  private showcaseHero: HeroModel | null = null;
  private vfx: FrameVfxManager;
  private sky = -1;

  constructor() {
    this.vfx = new FrameVfxManager(this.scene);
    this.scene.add(new HemisphereLight(0xeef8ff, 0x6b9a5e, 1.2));
    const sun = new DirectionalLight(0xfff4dc, 2.7);
    sun.position.set(-4, 9, 6);
    this.scene.add(sun);
    this.buildArena();
    this.setBiome(0);
  }

  setBiome(index: number): void {
    this.setSky(ARENA_SKY[index % ARENA_SKY.length]);
  }

  setSky(sky: number): void {
    if (this.sky === sky) return;
    this.sky = sky;
    (this.scene.background as Texture | null)?.dispose?.();
    this.scene.background = skyTexture(sky);
    this.scene.fog = new Fog(skyHorizon(sky), 15, 42);
  }

  /** Shows or updates the 3D anime protagonist on the Title Showcase stage. */
  setShowcaseHero(bodyColor: number, hatColor: number): void {
    if (!this.showcaseHero) {
      this.showcaseHero = createHeroModel(bodyColor, hatColor);
      this.showcaseHero.root.scale.setScalar(1.25);
      this.showcaseHero.root.position.set(1.45, 0.08, -0.35);
      this.showcaseHero.root.rotation.y = -0.35;
      this.scene.add(this.showcaseHero.root);
    } else {
      this.showcaseHero.setColors(bodyColor, hatColor);
    }
    this.showcaseHero.root.visible = this.showcase;
  }

  private buildArena(): void {
    // Lush painted watercolor meadow field (Image 1 reference texture)
    const field = new PlaneGeometry(60, 60);
    const uv = field.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 10, uv.getY(i) * 10);
    field.rotateX(-Math.PI / 2);
    this.scene.add(new Mesh(field, toon({ map: pradoGroundTexture() })));

    // Yu-Gi-Oh!-inspired sacred stone & gold Duel Field right in the sunlit BotW meadow!
    const fieldBorder = new Mesh(
      new PlaneGeometry(9.6, 5.8),
      new MeshBasicMaterial({
        color: 0xf5cd5b,
        transparent: true,
        opacity: 0.22,
      })
    );
    fieldBorder.rotation.x = -Math.PI / 2;
    fieldBorder.position.set(0, 0.015, 0);
    this.scene.add(fieldBorder);

    // Center duel divider line
    const divider = new Mesh(
      new PlaneGeometry(9.2, 0.08),
      new MeshBasicMaterial({ color: 0xfff2be, transparent: true, opacity: 0.65 })
    );
    divider.rotation.x = -Math.PI / 2;
    divider.position.set(0, 0.025, 0);
    this.scene.add(divider);

    // 4 Player Monster Zones (near row) + 4 Enemy Monster Zones (far row)
    const zoneGeo = new PlaneGeometry(1.42, 1.85);
    const zoneRimGeo = new PlaneGeometry(1.54, 1.98);
    const playerZoneMat = new MeshBasicMaterial({
      color: 0x4db8ff,
      transparent: true,
      opacity: 0.22,
    });
    const enemyZoneMat = new MeshBasicMaterial({
      color: 0xff6b7a,
      transparent: true,
      opacity: 0.22,
    });
    const rimMat = new MeshBasicMaterial({
      color: 0xffe594,
      transparent: true,
      opacity: 0.5,
    });
    for (const side of [-1, 1]) {
      const zPos = side === 1 ? 1.55 : -1.55;
      const mat = side === 1 ? playerZoneMat : enemyZoneMat;
      for (const col of [-2.85, -0.95, 0.95, 2.85]) {
        const rim = new Mesh(zoneRimGeo, rimMat);
        rim.rotation.x = -Math.PI / 2;
        rim.position.set(col, 0.02, zPos);
        const pad = new Mesh(zoneGeo, mat);
        pad.rotation.x = -Math.PI / 2;
        pad.position.set(col, 0.026, zPos);
        this.scene.add(rim, pad);
      }
    }

    // Textured BotW watercolor trees around the meadow clearing (matching Image 3!)
    const treeTex = treeTextures();
    const count = 26;
    const trunks = addOutline(
      new InstancedMesh(treeTrunkGeometry(), toon({ map: treeTex.bark }), count),
      0.028
    );
    const canopies = addOutline(
      new InstancedMesh(treeCanopyGeometry(), toon({ map: treeTex.canopyTile }), count),
      0.024
    );
    const m = new Matrix4();
    const q = new Quaternion();
    const up = new Vector3(0, 1, 0);
    const treePositions: { pos: Vector3; scale: number; variant: number }[] = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const r = 10.5 + (i % 3) * 2.1;
      const s = 1.55 + (i % 4) * 0.28;
      const pos = new Vector3(Math.cos(a) * r, 0, Math.sin(a) * r - 2);
      q.setFromAxisAngle(up, i * 1.7);
      m.compose(pos, q, new Vector3(s, s, s));
      trunks.setMatrixAt(i, m);
      canopies.setMatrixAt(i, m);
      treePositions.push({ pos, scale: s, variant: i % treeTex.foliageClusters.length });
    }
    trunks.instanceMatrix.needsUpdate = true;
    canopies.instanceMatrix.needsUpdate = true;
    this.scene.add(trunks, canopies);

    // Crisp hand-painted Image 4 watercolor foliage cluster cutouts (single camera-facing card, zero edge-on seam!)
    treeTex.foliageClusters.forEach((fTex, fi) => {
      const sub = treePositions.filter((t) => t.variant === fi);
      if (!sub.length) return;
      const card = new PlaneGeometry(3.05, 2.85);
      const fMat = new MeshBasicMaterial({ map: fTex, alphaTest: 0.45, side: DoubleSide });
      const inst = new InstancedMesh(card, fMat, sub.length);
      let idx = 0;
      for (const t of sub) {
        const baseYaw = Math.atan2(-t.pos.x, 4 - t.pos.z);
        q.setFromAxisAngle(up, baseYaw);
        m.compose(
          new Vector3(t.pos.x, 1.98 * t.scale, t.pos.z),
          q,
          new Vector3(t.scale, t.scale, t.scale)
        );
        inst.setMatrixAt(idx++, m);
      }
      inst.instanceMatrix.needsUpdate = true;
      this.scene.add(inst);
    });

    // Drifting sunlit golden pollen / dandelion motes (BotW atmosphere!)
    const moteGeo = new SphereGeometry(0.04, 6, 6);
    const moteMat = new MeshBasicMaterial({
      color: 0xfff6c4,
      transparent: true,
      opacity: 0.72,
    });
    for (let i = 0; i < 24; i++) {
      const mesh = new Mesh(moteGeo, moteMat);
      const base = new Vector3(
        (Math.random() - 0.5) * 14,
        0.5 + Math.random() * 3.8,
        (Math.random() - 0.5) * 10
      );
      mesh.position.copy(base);
      this.scene.add(mesh);
      this.motes.push({
        mesh,
        base,
        speed: 0.4 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Soft anime watercolor clouds
    const puffs: BufferGeometry[] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const cx = Math.cos(a) * 17;
      const cz = Math.sin(a) * 17 - 4;
      const cy = 7.5 + (i % 3) * 1.1;
      puffs.push(
        part(ico(1.15, 1), 0xfffdf8, { pos: [cx, cy, cz], scale: [1.5, 0.75, 1] }),
        part(ico(0.85, 1), 0xfffaf2, { pos: [cx + 1.4, cy - 0.2, cz], scale: [1.3, 0.7, 1] }),
        part(ico(0.75, 1), 0xf4f0ff, { pos: [cx - 1.3, cy - 0.25, cz], scale: [1.3, 0.7, 1] }),
        part(ico(0.95, 1), 0xdbe2f4, { pos: [cx, cy - 0.45, cz + 0.2], scale: [2.2, 0.35, 1] })
      );
    }
    this.clouds = new Mesh(merge(puffs), toon());
    this.scene.add(this.clouds);

    // Rolling distant BotW watercolor hills
    const hills: BufferGeometry[] = [];
    for (let i = 0; i < 8; i++) {
      hills.push(
        part(ico(4.5 + (i % 3), 1), i % 2 ? 0x76b088 : 0x8cc48a, {
          pos: [-24 + i * 7, -0.9, -24 - (i % 2) * 3.5],
          scale: [1.55, 0.48 + (i % 2) * 0.16, 1.1],
        })
      );
    }
    this.scene.add(addOutline(new Mesh(merge(hills), toon()), 0.045));
  }

  resize(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.fov = aspect < 1 ? 58 : 40;
    this.camera.updateProjectionMatrix();
  }

  setup(actors: BattleActor[], showcase = false): void {
    for (const a of this.actors.values()) {
      this.scene.remove(a);
      disposeActor(a);
    }
    this.actors.clear();
    this.home.clear();
    this.clearSummons();
    this.tweens = [];
    this.showcase = showcase;
    if (this.showcaseHero) this.showcaseHero.root.visible = showcase;

    const players = actors.filter((a) => a.side === 'player');
    const enemies = actors.filter((a) => a.side === 'enemy');
    const layout = (list: BattleActor[], cx: number, cz: number, facing: Facing) => {
      list.forEach((a, i) => {
        const c = createActor(a.speciesId, stageOf(a.level), facing, a.element);
        const spacing = showcase ? 1.7 : list.length >= 4 ? 1.9 : 2.2;
        const offset = (i - (list.length - 1) / 2) * spacing;
        const pos = showcase
          ? new Vector3(cx + offset * 1.05, 0.04, cz + Math.abs(offset) * 0.22)
          : new Vector3(cx + offset, 0.04, cz);
        c.position.copy(pos);
        this.scene.add(c);
        this.actors.set(a.uid, c);
        this.home.set(a.uid, pos.clone());
        void this.enter(c, a.speciesId, stageOf(a.level), facing, pos, a.element);
      });
    };
    if (showcase && enemies.length === 0) layout(players, 1.55, 1.15, 'front');
    else {
      // Yu-Gi-Oh! Duelist alignment: Player monsters in the near zones, Enemy monsters in the far zones!
      layout(players, 0, 1.55, 'front');
      layout(enemies, 0, -1.55, 'front');
      for (const a of players) {
        const actor = this.actors.get(a.uid);
        if (actor) actor.rotation.y = Math.PI; // face the enemy across the duel field
      }
    }
    this.facing.clear();
    for (const a of actors)
      this.facing.set(
        a.uid,
        showcase && !enemies.length ? 'front' : a.side === 'player' ? 'right' : 'left'
      );
  }

  private async enter(
    c: Actor,
    speciesId: string,
    stage: number,
    facing: Facing,
    home: Vector3,
    element: PetElement = 'neutro'
  ) {
    const pet = await attachModel(c, speciesId, stage, facing, element);
    if (!pet) return;
    if (this.showcase) {
      void pet.play('idle');
      return;
    }
    const back = new Vector3(Math.sin(CREATURE_YAW[facing]), 0, 1).multiplyScalar(-1.1);
    void pet.play('walk');
    await this.tween(1.0, (k) => c.position.copy(home).addScaledVector(back, 1 - k));
    c.position.copy(home);
    void pet.play('idle');
    audio.voice('chirp', voicePitch(stage));
  }

  replace(uid: string, speciesId: string, level: number, element: PetElement = 'neutro'): void {
    const old = this.actors.get(uid);
    if (!old) return;
    const facing = this.facing.get(uid) ?? 'right';
    const c = createActor(speciesId, stageOf(level), facing, element);
    c.position.copy(old.position);
    this.scene.remove(old);
    disposeActor(old);
    this.scene.add(c);
    this.actors.set(uid, c);
    void attachModel(c, speciesId, stageOf(level), facing, element);
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
    const pet = src.userData.pet;
    if (pet) {
      audio.voice('growl', voicePitch(0));
      void pet.play('attack');
      await this.tween(0.32, () => undefined);
      toward.multiplyScalar(0.55);
    }
    await this.tween(0.16, (k) => {
      src.position.copy(home).addScaledVector(toward, k);
      src.position.y = home.y + Math.sin(k * Math.PI) * 0.25;
    });
    await this.tween(0.18, (k) => src.position.copy(home).addScaledVector(toward, 1 - k));
  }

  async hit(uid: string, element: Element | 'neutro'): Promise<void> {
    const target = this.actors.get(uid);
    if (!target) return;
    const color = element === 'neutro' ? 0xf5cd5b : ELEMENT_INFO[element].color;
    this.vfx.spawn(vfxKindForElement(element), target.position, color, 1.25, 0.46);
    this.burst(target.position, color, 8);
    this.shake = 0.12;
    if (target.userData.pet) {
      audio.voice('yelp', voicePitch(0));
      void target.userData.pet.play('hit');
    }
    const mat = target.userData.material;
    const orig = target.rotation.z;
    await this.tween(0.3, (k) => {
      mat.emissive.setHex(k < 0.5 ? 0xffffff : 0x000000);
      mat.emissiveIntensity = k < 0.5 ? 0.7 * (1 - k * 2) : 0;
      target.rotation.z = orig + Math.sin(k * Math.PI * 6) * 0.12 * (1 - k);
    });
    mat.emissive.setHex(0x000000);
    mat.emissiveIntensity = 0;
    target.rotation.z = orig;
  }

  async glow(uid: string, color: number): Promise<void> {
    const target = this.actors.get(uid);
    if (!target) return;
    const isAffection = color === 0xff7eb9 || color === 0xff5fa8 || color === 0xff8fc8;
    this.vfx.spawn(isAffection ? 'heart' : 'heal', target.position, color, 1.15, 0.56);
    this.burst(target.position, color, 6, true);
    if (target.userData.pet) {
      audio.voice('happy', voicePitch(0));
      await target.userData.pet.play('hop');
      return;
    }
    const mat = target.userData.material;
    await this.tween(0.4, (k) => {
      mat.emissive.setHex(color);
      mat.emissiveIntensity = Math.sin(k * Math.PI) * 0.55;
    });
    mat.emissive.setHex(0x000000);
    mat.emissiveIntensity = 0;
  }

  async faint(uid: string): Promise<void> {
    const target = this.actors.get(uid);
    if (!target) return;
    if (target.userData.pet) audio.voice('whine', voicePitch(0));
    await this.tween(0.45, (k) => {
      target.scale.setScalar(Math.max(0.05, 1 - k * 0.92));
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
    while (this.summons.length) this.removeSummonsItem();
  }

  private removeSummonsItem(): void {
    this.removeSummon();
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

  screenPos(
    uid: string,
    canvas: HTMLCanvasElement,
    height?: number
  ): { x: number; y: number } | null {
    const a = this.actors.get(uid);
    if (!a) return null;
    height ??= a.userData.h + 0.25;
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
    for (const c of this.actors.values()) {
      if (!c.visible) continue;
      if (c.userData.aura) {
        const aura = c.userData.aura;
        aura.rotation.y = time * (c.userData.auraElement === 'eletrico' ? 4.2 : 2.1);
        const flicker =
          c.userData.auraElement === 'fogo'
            ? 0.92 + Math.sin(time * 16 + c.userData.phase) * 0.16
            : 1 + Math.sin(time * 4 + c.userData.phase) * 0.08;
        aura.scale.set(1, flicker, 1);
      }
      const pet = c.userData.pet;
      if (!pet) {
        animateCreature(c.userData.creature, time);
        continue;
      }
      pet.mixer.update(dt);
      const { clip, t } = pet.phase();
      const prev = c.userData.stepT ?? t;
      for (const f of FOOTFALLS[clip] ?? [])
        if (prev < t ? prev < f && f <= t : f > prev || f <= t)
          audio.pawStep(clip === 'hop' ? 1.3 : 0.8);
      c.userData.stepT = t;
    }
    if (this.showcase && this.showcaseHero) {
      this.showcaseHero.update(dt, time, false);
    }
    for (const m of this.motes) {
      m.mesh.position.set(
        m.base.x + Math.sin(time * m.speed + m.phase) * 0.6,
        m.base.y + Math.sin(time * m.speed * 0.8 + m.phase) * 0.35,
        m.base.z + Math.cos(time * m.speed * 0.7 + m.phase) * 0.5
      );
    }
    if (this.tweens.length > 0) {
      this.tweens = this.tweens.filter((tw) => {
        tw.t = Math.min(1, tw.t + dt / tw.duration);
        tw.step(tw.t);
        if (tw.t >= 1) tw.done();
        return tw.t < 1;
      });
    }
    if (this.particles.length > 0) {
      this.particles = this.particles.filter((p) => {
        p.life -= dt;
        p.vel.y -= 6 * dt;
        p.mesh.position.addScaledVector(p.vel, dt);
        p.mesh.rotation.x += dt * 8;
        p.mesh.scale.setScalar(Math.max(0.01, p.life / 0.6));
        if (p.life <= 0) {
          this.scene.remove(p.mesh);
          if (Array.isArray(p.mesh.material)) p.mesh.material.forEach((m) => m.dispose());
          else p.mesh.material.dispose();
        }
        return p.life > 0;
      });
    }
    this.vfx.update(dt, this.camera);
    if (this.clouds) this.clouds.rotation.y = time * 0.008;
    this.summons.forEach((orb, i) => {
      orb.position.y = 1.8 + Math.sin(time * 3 + i) * 0.15;
      orb.rotation.y = time * 2;
    });

    if (this.showcase) {
      const a = Math.sin(time * 0.22) * 0.32 - 0.18;
      this.camera.position.set(
        Math.sin(a) * 6.8 + 0.4,
        2.25 + Math.sin(time * 0.4) * 0.12,
        Math.cos(a) * 6.8 + 0.8
      );
      this.camera.lookAt(0.45, 0.95, 0.2);
      return;
    }
    this.shake = Math.max(0, this.shake - dt);
    const s = this.shake * 0.6;
    // Dramatic Yu-Gi-Oh! TCG over-the-field duelist camera
    this.camera.position.set((Math.random() - 0.5) * s, 4.5 + (Math.random() - 0.5) * s, 7.6);
    this.camera.lookAt(0, 0.35, -0.35);
  }
}
