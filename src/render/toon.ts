import {
  BackSide,
  BufferGeometry,
  DataTexture,
  InstancedMesh,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  RedFormat,
  type Material,
  type MeshToonMaterialParameters,
} from 'three';

/**
 * Watercolor look: a soft light ramp, cool lilac shadows, pigment blotches and paper grain,
 * plus a thin plum outline. All cheap: the ramp is a 4-pixel texture, the paint is a few noise
 * lookups in world space, and the outline reuses the same geometry inflated along the normals.
 */

let ramp: DataTexture | null = null;

/** Soft BotW-inspired cel ramp: airy shadow, rich midtone, warm lit band. */
export function toonRamp(): DataTexture {
  if (ramp) return ramp;
  ramp = new DataTexture(new Uint8Array([138, 178, 238, 255]), 4, 1, RedFormat);
  ramp.minFilter = LinearFilter;
  ramp.magFilter = LinearFilter;
  ramp.generateMipmaps = false;
  ramp.needsUpdate = true;
  return ramp;
}

const WC_NOISE = /* glsl */ `
varying vec3 vWcPos;
varying vec3 vWcNorm;
varying vec3 vWcViewDir;
float wcHash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float wcNoise(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(wcHash(i), wcHash(i + vec3(1, 0, 0)), f.x), mix(wcHash(i + vec3(0, 1, 0)), wcHash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(wcHash(i + vec3(0, 0, 1)), wcHash(i + vec3(1, 0, 1)), f.x), mix(wcHash(i + vec3(0, 1, 1)), wcHash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
float wcFbm(vec3 p) { return 0.55 * wcNoise(p) + 0.3 * wcNoise(p * 2.1) + 0.15 * wcNoise(p * 4.3); }
`;

/**
 * Turns a toon material into hand-drawn anime watercolor (Valkyria / Ni no Kuni / BotW style):
 * - Crisp sunlit cel-shading with airy cool shadows and warm golden highlights
 * - Subtle hand-drawn diagonal pen-hatching in shadow bands
 * - Fresnel rim highlight along sunlit silhouettes
 * - Soft watercolor pigment blotches and fine cold-press paper grain
 */
export function watercolor<T extends MeshToonMaterial>(mat: T): T {
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader =
      'varying vec3 vWcPos;\nvarying vec3 vWcNorm;\nvarying vec3 vWcViewDir;\n' +
      shader.vertexShader.replace(
        '#include <project_vertex>',
        `#include <project_vertex>
        vec4 wcP = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          wcP = instanceMatrix * wcP;
        #endif
        vec4 wcWorld = modelMatrix * wcP;
        vWcPos = wcWorld.xyz;
        vWcNorm = normalize(normalMatrix * objectNormal);
        vWcViewDir = normalize(-mvPosition.xyz);`
      );
    shader.fragmentShader =
      WC_NOISE +
      shader.fragmentShader.replace(
        '#include <opaque_fragment>',
        `{
          float wcLum = dot(outgoingLight, vec3(0.299, 0.587, 0.114));
          float wcBlot = wcFbm(vWcPos * 1.45);
          float wcGrain = wcNoise(vWcPos * 36.0);
          // Airy cool-violet shadow tint vs warm sunlit golden highlight
          vec3 wcCool = outgoingLight * vec3(0.83, 0.85, 0.98) + vec3(0.015, 0.018, 0.038);
          vec3 wcWarm = outgoingLight * vec3(1.07, 1.04, 0.96) + vec3(0.018, 0.014, 0.004);
          float wcLit = smoothstep(0.16, 0.54, wcLum + (wcBlot - 0.5) * 0.12);
          outgoingLight = mix(wcCool, wcWarm, wcLit);

          // Subtle hand-drawn diagonal pen-hatching inside shaded bands (sketchbook feel!)
          float hatchCoord = (gl_FragCoord.x + gl_FragCoord.y) * 0.45;
          float hatchLine = smoothstep(0.35, 0.85, sin(hatchCoord * 1.35 + wcBlot * 3.0) * 0.5 + 0.5);
          float shadowMask = (1.0 - wcLit) * smoothstep(0.04, 0.35, wcLum);
          outgoingLight *= 1.0 - shadowMask * (1.0 - hatchLine) * 0.09;

          // Hand-painted sunlit Fresnel rim glow along grazing edges
          float ndv = clamp(dot(normalize(vWcNorm), normalize(vWcViewDir)), 0.0, 1.0);
          float rim = pow(1.0 - ndv, 3.0) * smoothstep(-0.15, 0.75, normalize(vWcNorm).y);
          outgoingLight += vec3(1.0, 0.96, 0.82) * rim * 0.2 * (0.4 + 0.6 * wcLit);

          // Watercolor wash pigment modulation + cold-press paper grain
          outgoingLight *= 0.955 + 0.075 * wcBlot + 0.03 * wcGrain;
        }
        #include <opaque_fragment>`
      );
  };
  mat.customProgramCacheKey = () => 'watercolor-handdrawn-v3';
  return mat;
}

export const toon = (params: MeshToonMaterialParameters = { vertexColors: true }) =>
  watercolor(new MeshToonMaterial({ gradientMap: toonRamp(), ...params }));

/** Soft warm plum-brown ink, like a fine anime brush line around the shapes. */
export const INK = 0x45334a;

const outlineCache = new Map<number, MeshBasicMaterial>();

/**
 * Back-face hull pushed out along `outlineDir` (set per part in models.ts) in the vertex shader,
 * so no extra geometry is stored.
 */
export function outlineMaterial(thickness = 0.03): MeshBasicMaterial {
  const cached = outlineCache.get(thickness);
  if (cached) return cached;
  const mat = new MeshBasicMaterial({ color: INK, side: BackSide });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.outlineThickness = { value: thickness };
    shader.vertexShader = shader.vertexShader
      .replace(
        'void main() {',
        'uniform float outlineThickness;\nattribute vec3 outlineDir;\nvoid main() {'
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float inkWobble = 0.86 + 0.28 * sin(position.x * 19.0 + position.y * 23.0 + position.z * 17.0);
        transformed += outlineDir * (outlineThickness * inkWobble);`
      );
  };
  // Different thicknesses must not share one compiled program.
  mat.customProgramCacheKey = () => `outline-hand-${thickness}`;
  outlineCache.set(thickness, mat);
  return mat;
}

/** Adds an ink outline as a child, so it follows every animation of the mesh. */
export function addOutline<T extends Mesh>(mesh: T, thickness = 0.03): T {
  let outline: Mesh;
  if (mesh instanceof InstancedMesh) {
    const inst = new InstancedMesh(mesh.geometry, outlineMaterial(thickness), mesh.count);
    inst.instanceMatrix = mesh.instanceMatrix;
    inst.boundingSphere = mesh.boundingSphere;
    outline = inst;
  } else {
    outline = new Mesh(mesh.geometry as BufferGeometry, outlineMaterial(thickness));
  }
  outline.name = 'outline';
  outline.renderOrder = -1;
  mesh.add(outline);
  return mesh;
}

export const isOutline = (m: Material | Material[]) =>
  !Array.isArray(m) && [...outlineCache.values()].includes(m as MeshBasicMaterial);
