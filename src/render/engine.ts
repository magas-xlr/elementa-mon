import { BasicShadowMap, Camera, Scene, Vector2, WebGLRenderer } from 'three';
import type { Resolution } from '../game/state/save';
import { PostFx } from './postfx';

/**
 * Render scale relative to the screen's real pixels (the watercolor look wants smooth edges, so
 * the canvas is drawn close to native resolution and upscaled with smooth filtering).
 */
export const RESOLUTION_SCALE: Record<Resolution, number> = { baixa: 0.5, media: 0.72, alta: 0.92 };
/** Cap at 1.0× DPR: avoids 2.25×–4× pixel overdraw on high-DPI Windows laptops for smooth 60 FPS! */
const MAX_DPR = 1.0;

export interface View {
  scene: Scene;
  camera: Camera;
  update(dt: number, time: number): void;
  /** Called when the canvas aspect changes. */
  resize?(aspect: number): void;
}

export class Engine {
  readonly renderer: WebGLRenderer;
  readonly canvas: HTMLCanvasElement;
  private view: View | null = null;
  private last = 0;
  private acc = 0;
  private frameTime = 1000 / 60;
  private scale = 0.85;
  private fpsFrames = 0;
  private fpsTime = 0;
  private shadowTick = 0;
  private readonly _sizeBuf = new Vector2();
  fps = 0;
  /** HD-2D pass (bloom, grade, vignette); off = plain render. */
  private postFx: PostFx | null = null;
  /** Extra hook run every frame (input polling etc). */
  onFrame: ((dt: number) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
      preserveDrawingBuffer: false,
    });
    this.renderer.shadowMap.enabled = true;
    // BasicShadowMap is 1-tap vs 9-tap PCFSoft: huge GPU speedup with crisp toon shadows!
    this.renderer.shadowMap.type = BasicShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.needsUpdate = true;
    this.renderer.setPixelRatio(1);
    // Stats cover the whole frame (scene + effect pass), so reset by hand once per frame.
    this.renderer.info.autoReset = false;
    window.addEventListener('resize', () => this.resize());
    this.resize();
    requestAnimationFrame((t) => this.loop(t));
  }

  configure(resolution: Resolution, fpsCap: 30 | 60, postFx = true): void {
    this.scale = RESOLUTION_SCALE[resolution];
    this.frameTime = 1000 / fpsCap;
    const usePost = postFx && resolution !== 'baixa';
    if (usePost && !this.postFx) this.postFx = new PostFx();
    else if (!usePost && this.postFx) {
      this.postFx.dispose();
      this.postFx = null;
    }
    this.resize();
  }

  setView(view: View | null): void {
    this.view = view;
    this.renderer.shadowMap.needsUpdate = true;
    this.resize();
  }

  get aspect(): number {
    return Math.max(0.5, window.innerWidth / Math.max(1, window.innerHeight));
  }

  private resize(): void {
    const k = Math.min(window.devicePixelRatio || 1, MAX_DPR) * this.scale;
    const w = Math.max(1, Math.round(window.innerWidth * k));
    const h = Math.max(1, Math.round(window.innerHeight * k));
    // `false`: keep CSS size at 100%, only the drawing buffer follows the scale.
    this.renderer.setSize(w, h, false);
    this.postFx?.setSize(w, h);
    this.view?.resize?.(this.aspect);
  }

  private loop(now: number): void {
    requestAnimationFrame((t) => this.loop(t));
    // Zero CPU/GPU usage when the browser tab is hidden!
    if (document.hidden) {
      this.last = now;
      return;
    }
    const elapsed = now - this.last;
    // Frame cap: skip this RAF tick until enough time has passed (2 ms slack for vsync jitter).
    if (elapsed < this.frameTime - 2) return;
    this.last = now;
    const dt = Math.min(0.1, elapsed / 1000);
    this.acc += dt;
    this.fpsFrames += 1;
    this.fpsTime += elapsed;
    if (this.fpsTime >= 1000) {
      this.fps = Math.round((this.fpsFrames * 1000) / this.fpsTime);
      this.fpsFrames = 0;
      this.fpsTime = 0;
    }
    this.onFrame?.(dt);
    if (!this.view) return;
    this.view.update(dt, this.acc);
    // Throttle shadow-map rebuild to every 3rd frame (~20Hz shadow updates = 66% less shadow GPU work!)
    this.shadowTick = (this.shadowTick + 1) % 3;
    if (this.shadowTick === 0) this.renderer.shadowMap.needsUpdate = true;
    this.renderer.info.reset();
    if (this.postFx) this.postFx.render(this.renderer, this.view.scene, this.view.camera);
    else this.renderer.render(this.view.scene, this.view.camera);
  }

  stats() {
    const info = this.renderer.info.render;
    const size = this.renderer.getDrawingBufferSize(this._sizeBuf);
    return {
      fps: this.fps,
      triangles: info.triangles,
      calls: info.calls,
      width: size.x,
      height: size.y,
    };
  }
}
