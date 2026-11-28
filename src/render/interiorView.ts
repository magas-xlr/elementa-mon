import {
  BoxGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  OctahedronGeometry,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector3,
} from 'three';
import { BUILDINGS, type BuildingKind } from '../game/data/buildings';
import type { PetElement } from '../game/data/elements';
import type { View } from './engine';
import { createHeroModel, type HeroModel } from './heroModel';
import {
  animateCreature,
  createAvatar,
  createCreature,
  disposeCreature,
  merge,
  part,
  toon,
  type CreatureMesh,
} from './models';
import { addOutline } from './toon';

/** Paints a cozy parchment/wood floating sign sprite for 3D buildings & interior NPCs. */
export function makeWorldSignSprite(text: string, bg = '#fff5dc', border = '#5c3c24'): Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = bg;
  ctx.strokeStyle = border;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(6, 6, 244, 52, 16);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#2b1e16';
  ctx.font = 'bold 26px "Nunito", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 34);
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  const mat = new SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new Sprite(mat);
  sprite.scale.set(1.75, 0.44, 1);
  return sprite;
}

/**
 * Walkable 3D Watercolor Interior Room for EVERY physical establishment in the game!
 * Features unique 3D props/furniture per building, the exclusive 3D NPC + their active 3D pet,
 * the walking protagonist, and a physical exit doormat back to the village street.
 */
export class InteriorView implements View {
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(42, 4 / 3, 0.1, 40);
  private roomGroup = new Group();
  private hero: HeroModel;
  private player = new Group();
  private playerPos = new Vector3(0, 0, 1.8);
  private playerYaw = Math.PI;
  private npcPos = new Vector3(0, 0, -1.6);
  private readonly _followerTarget = new Vector3();
  private npcPet: CreatureMesh | null = null;
  private followerPet: CreatureMesh | null = null;
  private currentKind: BuildingKind = 'banco';
  private moving = false;

  constructor(avatar: { body: number; hat: number }) {
    this.scene.background = new Color(0x1f1b28);
    this.scene.add(new HemisphereLight(0xfff8e8, 0x6a5848, 1.35));
    const sun = new DirectionalLight(0xfff0d0, 2.2);
    sun.position.set(4, 9, 5);
    this.scene.add(sun, this.roomGroup);

    this.hero = createHeroModel(avatar.body, avatar.hat);
    this.hero.root.scale.setScalar(1.05);
    this.player.add(this.hero.root);
    this.scene.add(this.player);

    this.camera.position.set(0, 5.4, 6.4);
    this.camera.lookAt(0, 0.7, -0.3);
  }

  get kind(): BuildingKind {
    return this.currentKind;
  }

  /** True when protagonist is standing near the exclusive building NPC. */
  get nearNpc(): boolean {
    return this.playerPos.distanceTo(this.npcPos) < 2.25;
  }

  /** True when protagonist steps onto the south exit doormat. */
  get onExitMat(): boolean {
    return this.playerPos.z > 2.55 && Math.abs(this.playerPos.x) < 1.15;
  }

  setAvatar(body: number, hat: number): void {
    this.hero.setColors(body, hat);
  }

  setFollowerPet(speciesId: string | null, stage = 0, element: PetElement = 'neutro'): void {
    if (this.followerPet) {
      this.scene.remove(this.followerPet);
      disposeCreature(this.followerPet);
      this.followerPet = null;
    }
    if (!speciesId) return;
    this.followerPet = createCreature(speciesId, stage, element);
    this.followerPet.scale.setScalar(0.76);
    this.followerPet.position.set(this.playerPos.x - 0.85, 0, this.playerPos.z + 0.35);
    this.scene.add(this.followerPet);
  }

  /** Builds the unique 3D interior room, custom furniture props, exclusive NPC & their active 3D pet! */
  enter(kind: BuildingKind): void {
    this.currentKind = kind;
    const def = BUILDINGS[kind];
    for (const c of [...this.roomGroup.children]) {
      this.roomGroup.remove(c);
      c.traverse((o) => {
        if (o instanceof Mesh) {
          o.geometry?.dispose();
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material?.dispose();
        }
      });
    }
    if (this.npcPet) {
      disposeCreature(this.npcPet);
      this.npcPet = null;
    }

    // 1. Cozy 3D Room Shell (Floor + Back/Left/Right Watercolor Walls + Rug + Exit Mat)
    const roomParts = [
      part(new BoxGeometry(8.6, 0.2, 6.8), def.floorColor, { pos: [0, -0.1, 0] }),
      // Back wall + Left & Right walls
      part(new BoxGeometry(8.8, 3.2, 0.25), def.interiorWallColor, { pos: [0, 1.5, -3.4] }),
      part(new BoxGeometry(0.25, 3.2, 6.8), def.interiorWallColor, { pos: [-4.3, 1.5, 0] }),
      part(new BoxGeometry(0.25, 3.2, 6.8), def.interiorWallColor, { pos: [4.3, 1.5, 0] }),
      // Warm timber baseboards & trim
      part(new BoxGeometry(8.6, 0.16, 0.3), 0x6b482c, { pos: [0, 0.08, -3.32] }),
      part(new BoxGeometry(8.6, 0.18, 0.32), 0x6b482c, { pos: [0, 3.05, -3.32] }),
      // Center woven rug
      part(new BoxGeometry(3.8, 0.03, 2.4), def.accentColor, { pos: [0, 0.015, 0.3] }),
      // Glowing exit doormat at south entrance
      part(new BoxGeometry(1.7, 0.04, 0.85), 0x5cd685, { pos: [0, 0.02, 2.85] }),
    ];

    // 2. Unique 3D Props & Furniture exclusive to each establishment!
    const props = this.buildUniqueProps(kind, def.accentColor);
    const roomMesh = addOutline(new Mesh(merge([...roomParts, ...props]), toon()), 0.022);
    this.roomGroup.add(roomMesh);

    // 3. Exclusive Building NPC standing behind their desk/station + floating name tag
    const npcSeed = kind.split('').reduce((sum, ch, idx) => sum + ch.charCodeAt(0) * (idx + 1), 0);
    const npcAvatar = createAvatar(def.npc.outfitColor, def.npc.hatColor, npcSeed);
    npcAvatar.position.copy(this.npcPos);
    npcAvatar.scale.setScalar(1.08);
    this.roomGroup.add(npcAvatar);

    const npcSign = makeWorldSignSprite(`${def.icon} ${def.npc.name}`);
    npcSign.position.set(this.npcPos.x, 1.95, this.npcPos.z);
    this.roomGroup.add(npcSign);

    const exitSign = makeWorldSignSprite('🚪 Sair', '#d8ffe4', '#2c6b42');
    exitSign.position.set(0, 0.55, 2.95);
    exitSign.scale.set(1.15, 0.32, 1);
    this.roomGroup.add(exitSign);

    // 4. Exclusive NPC's own Active 3D Pet standing right next to them!
    this.npcPet = createCreature(def.npc.activePetSpecies, 1, 'neutro');
    this.npcPet.position.set(1.35, 0, -1.55);
    this.npcPet.scale.setScalar(0.9);
    this.roomGroup.add(this.npcPet);

    // Reset protagonist near the entrance facing the NPC
    this.playerPos.set(0, 0, 1.85);
    this.playerYaw = Math.PI;
    this.player.position.copy(this.playerPos);
    this.player.rotation.y = this.playerYaw;
    if (this.followerPet) {
      this.followerPet.position.set(-0.9, 0, 2.1);
    }
  }

  private buildUniqueProps(kind: BuildingKind, accent: number) {
    const out = [
      // Main wooden service counter in front of the NPC
      part(new BoxGeometry(2.6, 0.85, 0.65), 0x8a5b34, { pos: [0, 0.42, -0.75] }),
      part(new BoxGeometry(2.72, 0.1, 0.76), 0xb8824e, { pos: [0, 0.86, -0.75] }),
    ];
    switch (kind) {
      case 'banco':
        // Steel vault door on back wall + golden coin stacks!
        out.push(
          part(new CylinderGeometry(0.9, 0.9, 0.18, 14), 0x7b8896, {
            pos: [-2.6, 1.25, -3.2],
            rot: [Math.PI / 2, 0, 0],
          }),
          part(new CylinderGeometry(0.25, 0.25, 0.25, 8), 0xf4c94e, {
            pos: [-2.6, 1.25, -3.12],
            rot: [Math.PI / 2, 0, 0],
          }),
          part(new BoxGeometry(0.45, 0.22, 0.25), 0xffd43b, { pos: [2.6, 0.5, -2.5] }),
          part(new BoxGeometry(0.45, 0.22, 0.25), 0xffd43b, { pos: [2.6, 0.74, -2.5] })
        );
        break;
      case 'laboratorio':
        // Glowing cyan transmodification pods + dinosaur fossil table!
        out.push(
          part(new CylinderGeometry(0.55, 0.55, 1.8, 12), 0x52f2d6, { pos: [-2.8, 0.95, -2.2] }),
          part(new CylinderGeometry(0.62, 0.62, 0.22, 12), 0x455a6e, { pos: [-2.8, 0.12, -2.2] }),
          part(new CylinderGeometry(0.55, 0.55, 1.8, 12), 0x6fd8ff, { pos: [2.8, 0.95, -2.2] }),
          part(new BoxGeometry(1.4, 0.65, 0.8), 0xc8d4de, { pos: [2.7, 0.32, 0.6] }),
          part(new SphereGeometry(0.24, 8, 6), 0xf4eee0, { pos: [2.7, 0.8, 0.6] })
        );
        break;
      case 'dojo':
        // Martial arts wooden training dummies + red wall scroll!
        out.push(
          part(new CylinderGeometry(0.2, 0.24, 1.5, 10), 0xb8804a, { pos: [-2.8, 0.75, -0.5] }),
          part(new BoxGeometry(0.9, 0.14, 0.14), 0x8a5b34, { pos: [-2.8, 1.15, -0.5] }),
          part(new CylinderGeometry(0.2, 0.24, 1.5, 10), 0xb8804a, { pos: [2.8, 0.75, -0.5] }),
          part(new BoxGeometry(1.4, 1.8, 0.08), 0xa63232, { pos: [0, 1.75, -3.24] })
        );
        break;
      case 'cemiterio':
        // Bubbling purple witch cauldron + gravestones!
        out.push(
          part(new SphereGeometry(0.62, 12, 8), 0x2a2434, { pos: [-2.5, 0.48, -1.6] }),
          part(new CylinderGeometry(0.5, 0.5, 0.14, 12), 0xb86bff, { pos: [-2.5, 0.85, -1.6] }),
          part(new BoxGeometry(0.58, 1.05, 0.18), 0x7b808c, { pos: [2.8, 0.52, -2.1] }),
          part(new BoxGeometry(0.52, 0.92, 0.18), 0x6c727e, { pos: [2.1, 0.46, -2.5] })
        );
        break;
      case 'garagem':
        // Parked 3D showcase car inside the dealership!
        out.push(
          part(new BoxGeometry(1.8, 0.45, 0.95), 0xe64a38, { pos: [-2.5, 0.38, 0.2] }),
          part(new BoxGeometry(1.0, 0.38, 0.86), 0x8ed8ff, { pos: [-2.5, 0.74, 0.2] }),
          part(new CylinderGeometry(0.22, 0.22, 1.05, 10), 0x26262e, {
            pos: [-3.0, 0.22, 0.2],
            rot: [Math.PI / 2, 0, 0],
          }),
          part(new CylinderGeometry(0.22, 0.22, 1.05, 10), 0x26262e, {
            pos: [-2.0, 0.22, 0.2],
            rot: [Math.PI / 2, 0, 0],
          })
        );
        break;
      case 'moradia':
        // Cozy bed + indoor planters + 4 colorful selective recycling bins!
        out.push(
          part(new BoxGeometry(1.6, 0.45, 2.0), 0xd85a6a, { pos: [-2.9, 0.24, -1.8] }),
          part(new BoxGeometry(1.4, 0.22, 0.45), 0xfff8ec, { pos: [-2.9, 0.52, -2.5] }),
          // 4 Colored Recycling Bins (Papel, Plástico, Vidro, Orgânico)
          part(new BoxGeometry(0.38, 0.55, 0.38), 0x3b82f6, { pos: [2.2, 0.28, -2.5] }),
          part(new BoxGeometry(0.38, 0.55, 0.38), 0xef4444, { pos: [2.65, 0.28, -2.5] }),
          part(new BoxGeometry(0.38, 0.55, 0.38), 0x22c55e, { pos: [3.1, 0.28, -2.5] }),
          part(new BoxGeometry(0.38, 0.55, 0.38), 0x92400e, { pos: [3.55, 0.28, -2.5] }),
          // Home organic seed garden box!
          part(new BoxGeometry(1.5, 0.32, 0.9), 0x6b4423, { pos: [2.8, 0.16, 0.7] }),
          part(new SphereGeometry(0.24, 8, 6), 0x4ca848, { pos: [2.5, 0.42, 0.7] }),
          part(new SphereGeometry(0.24, 8, 6), 0x68c456, { pos: [3.1, 0.42, 0.7] })
        );
        break;
      case 'comida':
        // Bespoke Bakery & Seed Emporium (Padeiro Bento): brick oven, fruit crates, bread loaves & seed sacks!
        out.push(
          // Warm stone bakery oven with glowing fire hearth
          part(new BoxGeometry(1.5, 1.85, 1.0), 0xa87c64, { pos: [-2.9, 0.92, -2.6] }),
          part(new BoxGeometry(0.75, 0.55, 0.14), 0xff8c38, { pos: [-2.9, 0.55, -2.08] }),
          // Wooden crates brimming with apples, oranges & greens
          part(new BoxGeometry(1.1, 0.55, 0.8), 0x8a5b34, { pos: [2.9, 0.28, -2.3] }),
          part(new SphereGeometry(0.16, 8, 6), 0xe64848, { pos: [2.65, 0.62, -2.3] }),
          part(new SphereGeometry(0.16, 8, 6), 0xf5a623, { pos: [2.95, 0.64, -2.2] }),
          part(new SphereGeometry(0.16, 8, 6), 0x5cb85c, { pos: [3.2, 0.62, -2.4] }),
          // Burlap organic seed sacks near the side wall
          part(new SphereGeometry(0.32, 10, 8), 0xc9a978, {
            pos: [3.0, 0.3, -0.6],
            scale: [1, 1.25, 0.9],
          }),
          part(new SphereGeometry(0.28, 10, 8), 0xb89664, {
            pos: [2.5, 0.26, -0.3],
            scale: [1, 1.2, 0.9],
          }),
          // Fresh golden bread loaves right on the wooden counter!
          part(new SphereGeometry(0.18, 10, 8), 0xe8a848, {
            pos: [-0.75, 0.98, -0.75],
            scale: [1.5, 0.75, 0.9],
          }),
          part(new SphereGeometry(0.16, 10, 8), 0xf0ba5a, {
            pos: [0.75, 0.98, -0.75],
            scale: [1.3, 0.75, 0.9],
          })
        );
        break;
      case 'reparo':
        // Bespoke Repair Workshop (Mestre Jonas): workbench, anvil, tool rack & salvaged parts!
        out.push(
          part(new BoxGeometry(1.9, 0.78, 0.8), 0x7c5234, { pos: [-2.7, 0.39, -2.5] }),
          part(new BoxGeometry(0.65, 0.45, 0.45), 0x4b5563, { pos: [-2.7, 1.0, -2.5] }),
          part(new BoxGeometry(1.4, 1.6, 0.2), 0x8a5b34, { pos: [2.8, 0.85, -3.1] }),
          part(new BoxGeometry(0.45, 0.45, 0.45), 0xf4a438, { pos: [2.7, 0.24, -0.8] }),
          part(new CylinderGeometry(0.24, 0.24, 0.5, 10), 0x6b7280, { pos: [3.2, 0.25, -0.4] })
        );
        break;
      case 'apostas':
        // Mini pet-battle betting arena + glowing arcade cabinets!
        out.push(
          part(new CylinderGeometry(1.05, 1.15, 0.22, 16), 0xd43b68, { pos: [-2.6, 0.12, 0.2] }),
          part(new BoxGeometry(0.75, 1.65, 0.65), 0x3b58c8, { pos: [2.9, 0.82, -2.2] }),
          part(new BoxGeometry(0.75, 1.65, 0.65), 0xe68a2e, { pos: [2.9, 0.82, -1.2] })
        );
        break;
      default:
        // Bookshelves / Display racks / Hospital beds / Civic podium
        out.push(
          part(new BoxGeometry(1.4, 1.8, 0.55), 0x7c5234, { pos: [-2.9, 0.9, -2.8] }),
          part(new BoxGeometry(1.4, 1.8, 0.55), 0x7c5234, { pos: [2.9, 0.9, -2.8] }),
          part(new OctahedronGeometry(0.28), accent, { pos: [-2.9, 2.05, -2.8] }),
          part(new OctahedronGeometry(0.28), accent, { pos: [2.9, 2.05, -2.8] })
        );
        break;
    }
    return out;
  }

  /** Moves the protagonist smoothly inside the 3D interior room with collision bounds. */
  moveInput(dx: number, dz: number, dt: number): void {
    const len = Math.hypot(dx, dz);
    this.moving = len > 0.01;
    if (!this.moving) return;
    const speed = 3.6;
    const nx = Math.max(-3.6, Math.min(3.6, this.playerPos.x + (dx / len) * speed * dt));
    const nz = Math.max(-0.2, Math.min(2.9, this.playerPos.z + (dz / len) * speed * dt));
    this.playerPos.set(nx, 0, nz);
    this.playerYaw = Math.atan2(dx, dz);
    this.player.position.copy(this.playerPos);
    this.player.rotation.y = this.playerYaw;
  }

  resize(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  update(dt: number, elapsed: number): void {
    this.hero.update(dt, elapsed, this.moving);
    if (this.npcPet) animateCreature(this.npcPet, elapsed);
    if (this.followerPet) {
      this._followerTarget.set(
        this.playerPos.x - Math.sin(this.playerYaw) * 0.9,
        0,
        this.playerPos.z - Math.cos(this.playerYaw) * 0.9
      );
      this.followerPet.position.lerp(this._followerTarget, Math.min(1, dt * 6));
      animateCreature(this.followerPet, elapsed + 1.4);
    }
  }
}
