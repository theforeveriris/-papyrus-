import * as THREE from 'three'

/* ============================================================
   GLSL 公共噪声库 —— Perlin gradient noise + quintic fade
   + Worley cellular noise + domain warping
   参考：
   - Ken Perlin "Improving Noise" (2002) quintic fade 6t⁵-15t⁴+10t³
   - Steven Worley "A Cellular Texture Basis Function" (1996)
   - Inigo Quilez domain warping
   ============================================================ */
const glslNoiseLib = /* glsl */ `
// ---- 哈希函数 ----
vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// ---- Perlin gradient noise（五次衰减曲线） ----
vec2 gradHash(vec2 p) {
  float n = dot(p, vec2(127.1, 311.7));
  n = fract(sin(n) * 43758.5453);
  return normalize(vec2(
    fract(n * 127.1) * 2.0 - 1.0,
    fract(n * 311.7) * 2.0 - 1.0
  ));
}

float perlin(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  // 五次衰减曲线 6t⁵ - 15t⁴ + 10t³（C2 连续）
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

  float a = dot(gradHash(i + vec2(0,0)), f - vec2(0,0));
  float b = dot(gradHash(i + vec2(1,0)), f - vec2(1,0));
  float c = dot(gradHash(i + vec2(0,1)), f - vec2(0,1));
  float d = dot(gradHash(i + vec2(1,1)), f - vec2(1,1));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) * 0.5 + 0.5;
}

// ---- fBm（分形布朗运动） ----
float fbm(vec2 p, int octaves, float lacunarity, float gain) {
  float value = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    value += amp * perlin(p * freq);
    freq *= lacunarity;
    amp *= gain;
  }
  return value;
}

// ---- 湍流 ----
float turbulence(vec2 p, int octaves, float lacunarity, float gain) {
  float value = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    value += amp * abs(perlin(p * freq) * 2.0 - 1.0);
    freq *= lacunarity;
    amp *= gain;
  }
  return value;
}

// ---- Worley / cellular noise（F1, F2） ----
vec2 worley(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float F1 = 1e9, F2 = 1e9;
  for (int dy = -1; dy <= 1; dy++) {
    for (int dx = -1; dx <= 1; dx++) {
      vec2 nb = i + vec2(float(dx), float(dy));
      vec2 jitter = hash22(nb) * 0.9;
      vec2 r = vec2(float(dx), float(dy)) + jitter - f;
      float d = dot(r, r);
      if (d < F1) { F2 = F1; F1 = d; }
      else if (d < F2) { F2 = d; }
    }
  }
  return sqrt(vec2(F1, F2));
}

// ---- Domain warping（Inigo Quilez） ----
vec2 domainWarp(vec2 p, float strength, int octaves) {
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0), octaves, 2.0, 0.5),
    fbm(p + vec2(5.2, 1.3), octaves, 2.0, 0.5)
  );
  return p + strength * q;
}

vec2 domainWarp2(vec2 p, float strength) {
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0), 4, 2.0, 0.5),
    fbm(p + vec2(5.2, 1.3), 4, 2.0, 0.5)
  );
  vec2 r = vec2(
    fbm(p + strength * q + vec2(1.7, 9.2), 4, 2.0, 0.5),
    fbm(p + strength * q + vec2(8.3, 2.8), 4, 2.0, 0.5)
  );
  return p + strength * r;
}
`

/* ============================================================
   木纹 shader —— 同心年轮 + Perlin 域扭曲 + 木纤维 + 节疤
   ============================================================ */
const glslWood = /* glsl */ `
vec3 proceduralWood(vec2 uv, vec3 lightColor, vec3 darkColor,
  float ringDensity, float ringContrast, float grainStrength,
  float warpStrength, float fiberStrength, float fiberDensity,
  float knotStrength) {
  // 域扭曲让年轮自然弯曲
  vec2 warped = domainWarp2(uv * ringDensity * 0.5, warpStrength);

  // 年轮
  float dist = length(warped);
  float ringFrac = fract(dist);
  float ringEdge = pow(1.0 - min(1.0, ringFrac * 3.0), 2.0);
  float ringDark = ringEdge * ringContrast;

  // 木纤维（各向异性细线）
  float fiber = perlin(vec2(uv.x * fiberDensity, uv.y * fiberDensity * 0.3)) * fiberStrength;

  // 节疤（Worley F1 模拟暗斑）
  vec2 w = worley(uv * 3.0 + 0.5);
  float knot = smoothstep(0.15, 0.05, w.x) * knotStrength;

  // 湍流细噪声
  float fine = turbulence(uv * 8.0, 4, 2.0, 0.5) * 0.1;

  float t = clamp(1.0 - ringDark - fiber * 0.3 - fine * 0.2 - knot, 0.0, 1.0);
  return mix(darkColor, lightColor, t);
}
`

/* ============================================================
   大理石 shader —— 湍流矿脉 + Worley 晶粒
   ============================================================ */
const glslMarble = /* glsl */ `
vec3 proceduralMarble(vec2 uv, vec3 baseColor, vec3 veinColor, float veinScale, float turbulenceScale) {
  vec2 warped = domainWarp(uv * veinScale, 0.8, 5);
  float t = turbulence(warped, 6, 2.0, 0.5);
  float veinVal = pow(abs(sin((uv.x * veinScale + t * 3.0) * 3.14159)), 0.3);
  float mask = pow(1.0 - veinVal, 4.0);

  // Worley 晶粒
  vec2 w = worley(uv * 15.0);
  float grain = smoothstep(0.2, 0.1, w.x) * 0.08;

  float fine = fbm(uv * 30.0, 2, 2.0, 0.5) * 0.06;
  return baseColor * (1.0 - mask * 0.8) + veinColor * mask * 0.8 - fine * 20.0 + grain * veinColor;
}
`

/* ============================================================
   皮革 shader —— Worley 颗粒 + fBm 皱纹
   ============================================================ */
const glslLeather = /* glsl */ `
vec3 proceduralLeather(vec2 uv, vec3 baseColor, float grainScale, float wrinkleScale) {
  vec2 w = worley(uv * grainScale);
  float grain = 1.0 - smoothstep(0.0, 0.25, w.x);
  float wrinkles = fbm(uv * wrinkleScale, 4, 2.0, 0.5) * 0.35;
  float pores = smoothstep(0.85, 0.9, perlin(uv * grainScale * 2.0)) * 0.2;
  float dark = grain * 0.3 + wrinkles + pores;
  return baseColor * (1.0 - clamp(dark, 0.0, 0.7));
}
`

/* ============================================================
   混凝土 shader —— Worley 裂缝 + fBm 粗糙
   ============================================================ */
const glslConcrete = /* glsl */ `
vec3 proceduralConcrete(vec2 uv, vec3 baseColor, float crackScale, float roughScale) {
  vec2 w = worley(uv * crackScale);
  float cracks = smoothstep(0.05, 0.02, w.y - w.x) * 0.4;
  float rough = fbm(uv * roughScale, 5, 2.0, 0.5) * 0.25;
  float fine = turbulence(uv * roughScale * 5.0, 3, 2.0, 0.5) * 0.1;
  float dark = rough + fine * 0.3 + cracks;
  return baseColor * (1.0 - clamp(dark, 0.0, 0.6));
}
`

/* ============================================================
   金属拉丝 shader —— 各向异性方向划痕
   ============================================================ */
const glslBrushedMetal = /* glsl */ `
vec3 proceduralBrushedMetal(vec2 uv, vec3 baseColor, float brushDensity) {
  float brush = turbulence(vec2(uv.x * 2.0, uv.y * brushDensity), 4, 2.0, 0.5) * 0.35;
  float fine = turbulence(vec2(uv.x * 5.0, uv.y * brushDensity * 2.5), 3, 2.0, 0.5) * 0.15;
  float variation = fbm(uv * 4.0, 2, 2.0, 0.5) * 0.1;
  float shade = 1.0 - brush * 0.5 - fine * 0.3 + variation * 0.3;
  return baseColor * clamp(shade, 0.0, 1.5);
}
`

/* ============================================================
   深色哑光 shader
   ============================================================ */
const glslDarkMatte = /* glsl */ `
vec3 proceduralDarkMatte(vec2 uv, vec3 baseColor) {
  vec2 warped = domainWarp(uv * 3.0, 0.6, 4);
  float n = fbm(warped * 4.0, 5, 2.0, 0.55) * 0.45;
  float fine = turbulence(uv * 20.0, 3, 2.0, 0.5) * 0.25;
  vec2 w = worley(uv * 8.0);
  float blotch = smoothstep(0.2, 0.1, w.x) * 0.15;
  float dark = clamp(n + fine * 0.3 + blotch, 0.0, 0.7);
  return baseColor * (1.0 - dark);
}
`

/* ============================================================
   材质参数预设
   ============================================================ */
export const deskShaderPresets = {
  oak: {
    lightColor: [0.77, 0.62, 0.43],
    darkColor: [0.47, 0.35, 0.20],
    ringDensity: 9.0, ringContrast: 0.5, grainStrength: 0.3,
    warpStrength: 0.8, fiberStrength: 0.25, fiberDensity: 12.0,
    knotStrength: 0.3,
    roughness: 0.55, metalness: 0.05, normalStrength: 1.5,
    type: 'wood',
  },
  walnut: {
    lightColor: [0.50, 0.31, 0.18],
    darkColor: [0.22, 0.13, 0.07],
    ringDensity: 12.0, ringContrast: 0.65, grainStrength: 0.4,
    warpStrength: 0.9, fiberStrength: 0.3, fiberDensity: 15.0,
    knotStrength: 0.2,
    roughness: 0.5, metalness: 0.05, normalStrength: 1.4,
    type: 'wood',
  },
  cherry: {
    lightColor: [0.69, 0.38, 0.24],
    darkColor: [0.38, 0.18, 0.10],
    ringDensity: 11.0, ringContrast: 0.45, grainStrength: 0.25,
    warpStrength: 0.7, fiberStrength: 0.2, fiberDensity: 10.0,
    knotStrength: 0.25,
    roughness: 0.52, metalness: 0.05, normalStrength: 1.3,
    type: 'wood',
  },
  mahogany: {
    lightColor: [0.52, 0.23, 0.13],
    darkColor: [0.21, 0.09, 0.05],
    ringDensity: 14.0, ringContrast: 0.55, grainStrength: 0.5,
    warpStrength: 0.85, fiberStrength: 0.35, fiberDensity: 14.0,
    knotStrength: 0.15,
    roughness: 0.48, metalness: 0.08, normalStrength: 1.6,
    type: 'wood',
  },
  marble: {
    baseColor: [0.86, 0.84, 0.80],
    veinColor: [0.27, 0.25, 0.24],
    veinScale: 4.0, turbulenceScale: 6.0,
    roughness: 0.25, metalness: 0.02, normalStrength: 0.8,
    type: 'marble',
  },
  leather: {
    baseColor: [0.23, 0.16, 0.13],
    grainScale: 20.0, wrinkleScale: 6.0,
    roughness: 0.85, metalness: 0.0, normalStrength: 1.2,
    type: 'leather',
  },
  concrete: {
    baseColor: [0.71, 0.70, 0.67],
    crackScale: 8.0, roughScale: 8.0,
    roughness: 0.9, metalness: 0.0, normalStrength: 1.4,
    type: 'concrete',
  },
  metal: {
    baseColor: [0.65, 0.66, 0.67],
    brushDensity: 80.0,
    roughness: 0.35, metalness: 0.9, normalStrength: 0.6,
    type: 'metal',
  },
  dark: {
    baseColor: [0.24, 0.23, 0.21],
    roughness: 0.7, metalness: 0.05, normalStrength: 1.0,
    type: 'dark',
  },
}

/* ============================================================
   根据 type 生成完整的 fragment shader 片段
   返回 { colorExpr, roughnessExpr } —— 在 onBeforeCompile 中注入
   ============================================================ */
function getShaderForType(type) {
  const p = deskShaderPresets[type] || deskShaderPresets.oak
  const pt = p.type || type

  let colorExpr = ''

  if (pt === 'wood') {
    colorExpr = `proceduralWood(
      vUv * 2.0,
      vec3(${p.lightColor.join(',')}),
      vec3(${p.darkColor.join(',')}),
      ${p.ringDensity}, ${p.ringContrast}, ${p.grainStrength},
      ${p.warpStrength}, ${p.fiberStrength}, ${p.fiberDensity},
      ${p.knotStrength}
    )`
  } else if (pt === 'marble') {
    colorExpr = `proceduralMarble(
      vUv * 2.0,
      vec3(${p.baseColor.join(',')}),
      vec3(${p.veinColor.join(',')}),
      ${p.veinScale}, ${p.turbulenceScale}
    )`
  } else if (pt === 'leather') {
    colorExpr = `proceduralLeather(
      vUv * 2.0,
      vec3(${p.baseColor.join(',')}),
      ${p.grainScale}, ${p.wrinkleScale}
    )`
  } else if (pt === 'concrete') {
    colorExpr = `proceduralConcrete(
      vUv * 2.0,
      vec3(${p.baseColor.join(',')}),
      ${p.crackScale}, ${p.roughScale}
    )`
  } else if (pt === 'metal') {
    colorExpr = `proceduralBrushedMetal(
      vUv * 2.0,
      vec3(${p.baseColor.join(',')}),
      ${p.brushDensity}
    )`
  } else {
    colorExpr = `proceduralDarkMatte(
      vUv * 2.0,
      vec3(${p.baseColor.join(',')})
    )`
  }

  return colorExpr
}

/* ============================================================
   创建带程序化纹理的 MeshStandardMaterial
   通过 onBeforeCompile 注入，保留完整 PBR 光照/阴影/后处理
   ============================================================ */
export function createDeskMaterial(type = 'oak') {
  const p = deskShaderPresets[type] || deskShaderPresets.oak
  const colorExpr = getShaderForType(type)

  const material = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: p.roughness,
    metalness: p.metalness,
    envMapIntensity: 0.4,
  })

  material.onBeforeCompile = (shader) => {
    // 注入噪声库 + 各材质函数
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
      ${glslNoiseLib}
      ${glslWood}
      ${glslMarble}
      ${glslLeather}
      ${glslConcrete}
      ${glslBrushedMetal}
      ${glslDarkMatte}
      uniform float uTime;
      `
    )

    // 用程序化颜色替换贴图采样的 diffuseColor
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      `#include <map_fragment>
      // 用程序化纹理覆盖 diffuseColor
      diffuseColor.rgb = ${colorExpr};
      `
    )

    // 添加 uTime uniform（供未来动态效果用）
    shader.uniforms.uTime = { value: 0 }
  }

  // 标记以便在 type 变化时重建材质
  material._deskType = type

  return material
}
