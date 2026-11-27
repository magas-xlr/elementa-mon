import { Camera, Scene, Vector2, WebGLRenderer } from 'three';
import type { Resolution } from '../game/state/save';

/** Internal render heights. 240p is the N64 look; the canvas is upscaled with nearest filtering. */
export const RESOLUTION_HEIGHT: Record<Resolution, number> = { baixa: 240, media: 360, alta: 480 };

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
  private internalHeight = 240;
  private fpsFrames = 0;
  private fpsTime = 0;
  fps = 0;
  /** Extra hook run every frame (input polling etc). */
  onFrame: ((dt: number) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: 'high-performance',
      stencil: false,
    });
    this.renderer.setPixelRatio(1);
    window.addEventListener('resize', () => this.resize());
    this.resize();
    requestAnimationFrame((t) => this.loop(t));
  }

  configure(resolution: Resolution, fpsCap: 30 | 60): void {
    this.internalHeight = RESOLUTION_HEIGHT[resolution];
    this.frameTime = 1000 / fpsCap;
    this.resize();
  }

  setView(view: View | null): void {
    this.view = view;
    this.resize();
  }

  get aspect(): number {
    return Math.max(0.5, window.innerWidth / Math.max(1, window.innerHeight));
  }

  private resize(): void {
    const h = this.internalHeight;
    const w = Math.round(h * this.aspect);
    // `false`: keep CSS size at 100%, only the drawing buffer is low resolution.
    this.renderer.setSize(w, h, false);
    this.view?.resize?.(this.aspect);
  }

  private loop(now: number): void {
    requestAnimationFrame((t) => this.loop(t));
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
    this.renderer.render(this.view.scene, this.view.camera);
  }

  stats() {
    const info = this.renderer.info.render;
    const size = this.renderer.getDrawingBufferSize(new Vector2());
    return {
      fps: this.fps,
      triangles: info.triangles,
      calls: info.calls,
      width: size.x,
      height: size.y,
    };
  }
}
