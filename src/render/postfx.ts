import {
  type Camera,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget,
  type WebGLRenderer,
} from 'three';

/**
 * Lightweight single-pass watercolor color grade + fast 4-tap sunlit bloom + vignette.
 * Uses standard 8-bit render target (no 64-bit HalfFloat / 4x MSAA bottleneck) for high FPS!
 */

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const fragmentShader = /* glsl */ `
uniform sampler2D tScene;
uniform vec2 texel;
varying vec2 vUv;

float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

void main() {
  vec3 base = texture2D(tScene, vUv).rgb;

  // Fast 4-tap diagonal sunlit bloom (half the texture fetches of 8-tap!).
  vec2 off = texel * 3.2;
  vec3 s0 = texture2D(tScene, vUv + vec2( off.x,  off.y)).rgb;
  vec3 s1 = texture2D(tScene, vUv + vec2(-off.x,  off.y)).rgb;
  vec3 s2 = texture2D(tScene, vUv + vec2( off.x, -off.y)).rgb;
  vec3 s3 = texture2D(tScene, vUv + vec2(-off.x, -off.y)).rgb;
  vec3 glow =
    s0 * max(luma(s0) - 0.68, 0.0) +
    s1 * max(luma(s1) - 0.68, 0.0) +
    s2 * max(luma(s2) - 0.68, 0.0) +
    s3 * max(luma(s3) - 0.68, 0.0);
  vec3 col = base + glow * 0.28;

  // Airy anime color grading: warm sunlit highlights, soft sky-tinted shadows, clean vibrancy.
  float lum = luma(col);
  col = mix(col, col * vec3(1.04, 1.01, 0.94), smoothstep(0.35, 0.95, lum));
  col += vec3(0.006, 0.010, 0.022) * (1.0 - smoothstep(0.0, 0.55, lum));
  col = mix(vec3(lum), col, 1.04);

  // Very gentle atmospheric vignette to frame the view cleanly.
  vec2 d = vUv - 0.5;
  col *= 1.0 - 0.20 * smoothstep(0.35, 0.85, dot(d, d) * 1.5);

  gl_FragColor = vec4(max(col, 0.0), 1.0);
  #include <colorspace_fragment>
}`;

export class PostFx {
  private target = new WebGLRenderTarget(1, 1, { samples: 0, depthBuffer: true });
  private quadGeo = new PlaneGeometry(2, 2);
  private material = new ShaderMaterial({
    uniforms: { tScene: { value: this.target.texture }, texel: { value: new Vector2() } },
    vertexShader,
    fragmentShader,
    depthTest: false,
    depthWrite: false,
  });
  private scene = new Scene();
  private camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  constructor() {
    const quad = new Mesh(this.quadGeo, this.material);
    quad.frustumCulled = false;
    this.scene.add(quad);
  }

  setSize(width: number, height: number): void {
    this.target.setSize(width, height);
    const k = height / 240;
    (this.material.uniforms.texel.value as Vector2).set(k / width, k / height);
  }

  dispose(): void {
    this.target.dispose();
    this.quadGeo.dispose();
    this.material.dispose();
  }

  /** Renders `scene` into the offscreen target, then the effect pass to the canvas. */
  render(renderer: WebGLRenderer, scene: Scene, camera: Camera): void {
    renderer.setRenderTarget(this.target);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(this.scene, this.camera);
  }
}
