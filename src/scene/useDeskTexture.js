import { useMemo, useEffect } from 'react'
import * as THREE from 'three'

/* ---------- 噪声基础函数 ---------- */
function hash(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}

function smoothNoise(x, y) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const a = hash(ix, iy)
  const b = hash(ix + 1, iy)
  const c = hash(ix, iy + 1)
  const d = hash(ix + 1, iy + 1)
  const u = fx * fx * (3 - 2 * fx)
  const v = fy * fy * (3 - 2 * fy)
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v
}

function fbm(x, y, octaves = 4) {
  let value = 0
  let amp = 0.5
  let freq = 1
  for (let i = 0; i < octaves; i++) {
    value += amp * smoothNoise(x * freq, y * freq)
    amp *= 0.5
    freq *= 2
  }
  return value
}

function turbulence(x, y, octaves = 4) {
  let value = 0
  let amp = 0.5
  let freq = 1
  for (let i = 0; i < octaves; i++) {
    value += amp * Math.abs(smoothNoise(x * freq, y * freq) * 2 - 1)
    amp *= 0.5
    freq *= 2
  }
  return value
}

/* ---------- 木纹预设（参考 Three.js WoodNodeMaterial 参数思路） ---------- */
const woodPresets = {
  oak: {
    light: [196, 158, 110],
    dark: [120, 88, 52],
    ringDensity: 9,
    ringContrast: 0.5,
    grainStrength: 0.3,
    warpScale: 0.4,
  },
  walnut: {
    light: [128, 78, 46],
    dark: [56, 32, 18],
    ringDensity: 12,
    ringContrast: 0.65,
    grainStrength: 0.4,
    warpScale: 0.5,
  },
  cherry: {
    light: [176, 96, 62],
    dark: [96, 46, 26],
    ringDensity: 11,
    ringContrast: 0.45,
    grainStrength: 0.25,
    warpScale: 0.35,
  },
  mahogany: {
    light: [132, 58, 34],
    dark: [54, 22, 12],
    ringDensity: 14,
    ringContrast: 0.55,
    grainStrength: 0.5,
    warpScale: 0.45,
  },
}

/* ---------- 同心年轮木纹（参考真实树木横切面） ---------- */
function generateWoodTexture(ctx, res, presetName, tint) {
  const p = woodPresets[presetName] || woodPresets.oak
  const light = p.light.map((v, i) => v * (tint ? tint[i] : 1))
  const dark = p.dark.map((v, i) => v * (tint ? tint[i] : 1))

  const cx = res * (0.5 + (smoothNoise(13.7, 5.2) - 0.5) * 0.3)
  const cy = res * (0.5 + (smoothNoise(7.3, 21.1) - 0.5) * 0.3)

  const img = ctx.createImageData(res, res)
  const data = img.data

  for (let y = 0; y < res; y++) {
    for (let x = 0; x < res; x++) {
      const dx = x - cx
      const dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)

      const angle = Math.atan2(dy, dx)
      const warp = fbm(Math.cos(angle) * 2, dist * 0.02, 3) * p.warpScale
      const ringDist = (dist / res) * p.ringDensity * 20 + warp * 15
      const ringFrac = ringDist - Math.floor(ringDist)
      const ringEdge = Math.pow(1 - Math.min(1, ringFrac * 3), 2)
      const ringDark = ringEdge * p.ringContrast

      const grain = fbm(angle * 1.5 + 3, dist * 0.06, 3) * p.grainStrength
      const fineNoise = turbulence(x * 0.05, y * 0.05, 4) * 0.15

      const t = Math.min(1, Math.max(0, 1 - ringDark - grain * 0.3 - fineNoise * 0.2))

      const r = light[0] * t + dark[0] * (1 - t)
      const g = light[1] * t + dark[1] * (1 - t)
      const b = light[2] * t + dark[2] * (1 - t)

      const idx = (y * res + x) * 4
      data[idx] = Math.max(0, Math.min(255, r))
      data[idx + 1] = Math.max(0, Math.min(255, g))
      data[idx + 2] = Math.max(0, Math.min(255, b))
      data[idx + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)

  // 节疤眼：沿年轮方向的小椭圆暗斑
  const knotCount = 2 + Math.floor(smoothNoise(42, 17) * 2)
  for (let k = 0; k < knotCount; k++) {
    const ka = smoothNoise(k * 9.3, k * 3.1) * Math.PI * 2
    const kr = (0.2 + smoothNoise(k * 2.1, k * 7.7) * 0.25) * res
    const kx = cx + Math.cos(ka) * kr
    const ky = cy + Math.sin(ka) * kr
    const krx = 6 + smoothNoise(k * 5, k) * 6
    const kry = krx * 0.7

    for (let ring = 0; ring < 5; ring++) {
      const rr = (ring + 1) * 1.8
      ctx.globalAlpha = 0.18 - ring * 0.03
      ctx.strokeStyle = `rgb(${dark[0]},${dark[1]},${dark[2]})`
      ctx.lineWidth = 0.6
      ctx.beginPath()
      ctx.ellipse(kx, ky, krx + rr, kry + rr, ka, 0, Math.PI * 2)
      ctx.stroke()
    }
    const grad = ctx.createRadialGradient(kx, ky, 0, kx, ky, krx)
    grad.addColorStop(0, `rgba(${dark[0] * 0.4},${dark[1] * 0.4},${dark[2] * 0.4},0.7)`)
    grad.addColorStop(1, `rgba(${dark[0]},${dark[1]},${dark[2]},0)`)
    ctx.globalAlpha = 1
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.ellipse(kx, ky, krx, kry, ka, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // 暗角
  const vignette = ctx.createRadialGradient(
    res / 2, res / 2, res * 0.35,
    res / 2, res / 2, res * 0.72
  )
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0,0,0,0.32)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, res, res)
}

/* ---------- 大理石（湍流矿脉） ---------- */
function generateMarbleTexture(ctx, res, tint) {
  const base = tint || [220, 215, 205]
  const vein = [70, 65, 60]
  const img = ctx.createImageData(res, res)
  const data = img.data

  for (let y = 0; y < res; y++) {
    for (let x = 0; x < res; x++) {
      const u = x / res
      const v = y / res
      const t = turbulence(u * 4, v * 4, 6)
      const veinVal = Math.pow(Math.abs(Math.sin((u * 8 + t * 3) * Math.PI)), 0.3)
      const mask = Math.pow(1 - veinVal, 4)

      const fine = fbm(u * 30, v * 30, 2) * 0.08

      const r = base[0] * (1 - mask * 0.8) + vein[0] * mask * 0.8 - fine * 30
      const g = base[1] * (1 - mask * 0.8) + vein[1] * mask * 0.8 - fine * 30
      const b = base[2] * (1 - mask * 0.8) + vein[2] * mask * 0.8 - fine * 30

      const idx = (y * res + x) * 4
      data[idx] = Math.max(0, Math.min(255, r))
      data[idx + 1] = Math.max(0, Math.min(255, g))
      data[idx + 2] = Math.max(0, Math.min(255, b))
      data[idx + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)

  const vignette = ctx.createRadialGradient(
    res / 2, res / 2, res * 0.3,
    res / 2, res / 2, res * 0.7
  )
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0,0,0,0.35)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, res, res)
}

/* ---------- 皮革（细颗粒+皱纹） ---------- */
function generateLeatherTexture(ctx, res, tint) {
  const base = tint || [58, 42, 32]
  const img = ctx.createImageData(res, res)
  const data = img.data

  for (let y = 0; y < res; y++) {
    for (let x = 0; x < res; x++) {
      const u = x / res
      const v = y / res
      const grain = turbulence(u * 40, v * 40, 5) * 0.4
      const wrinkles = fbm(u * 6, v * 6, 3) * 0.3
      const pores = smoothNoise(x * 0.8, y * 0.8) > 0.85 ? 0.25 : 0

      const dark = grain * 0.5 + wrinkles * 0.3 + pores * 0.4
      const r = base[0] * (1 - dark)
      const g = base[1] * (1 - dark)
      const b = base[2] * (1 - dark)

      const idx = (y * res + x) * 4
      data[idx] = Math.max(0, Math.min(255, r))
      data[idx + 1] = Math.max(0, Math.min(255, g))
      data[idx + 2] = Math.max(0, Math.min(255, b))
      data[idx + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)

  const vignette = ctx.createRadialGradient(
    res / 2, res / 2, res * 0.3,
    res / 2, res / 2, res * 0.7
  )
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0,0,0,0.4)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, res, res)
}

/* ---------- 混凝土（粗糙+裂纹） ---------- */
function generateConcreteTexture(ctx, res, tint) {
  const base = tint || [180, 178, 172]
  const img = ctx.createImageData(res, res)
  const data = img.data

  for (let y = 0; y < res; y++) {
    for (let x = 0; x < res; x++) {
      const u = x / res
      const v = y / res
      const n = fbm(u * 8, v * 8, 5) * 0.3
      const fine = turbulence(u * 50, v * 50, 3) * 0.15
      const dark = n + fine * 0.3

      const r = base[0] * (1 - dark)
      const g = base[1] * (1 - dark)
      const b = base[2] * (1 - dark)

      const idx = (y * res + x) * 4
      data[idx] = Math.max(0, Math.min(255, r))
      data[idx + 1] = Math.max(0, Math.min(255, g))
      data[idx + 2] = Math.max(0, Math.min(255, b))
      data[idx + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)

  // 裂纹
  for (let i = 0; i < 4; i++) {
    let px = Math.random() * res
    let py = Math.random() * res
    ctx.globalAlpha = 0.15
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 0.6
    ctx.beginPath()
    ctx.moveTo(px, py)
    for (let s = 0; s < 20; s++) {
      px += (Math.random() - 0.5) * 30
      py += (Math.random() - 0.5) * 30
      ctx.lineTo(px, py)
    }
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  const vignette = ctx.createRadialGradient(
    res / 2, res / 2, res * 0.3,
    res / 2, res / 2, res * 0.7
  )
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0,0,0,0.3)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, res, res)
}

/* ---------- 金属拉丝（各向异性方向划痕） ---------- */
function generateBrushedMetalTexture(ctx, res, tint) {
  const base = tint || [165, 168, 170]
  const img = ctx.createImageData(res, res)
  const data = img.data

  for (let y = 0; y < res; y++) {
    for (let x = 0; x < res; x++) {
      const u = x / res
      const v = y / res
      const brush = turbulence(u * 2, v * 80, 4) * 0.35
      const fine = turbulence(u * 5, v * 200, 3) * 0.15
      const variation = fbm(u * 4, v * 4, 2) * 0.1

      const shade = 1 - brush * 0.5 - fine * 0.3 + variation * 0.3
      const r = base[0] * shade
      const g = base[1] * shade
      const b = base[2] * shade

      const idx = (y * res + x) * 4
      data[idx] = Math.max(0, Math.min(255, r))
      data[idx + 1] = Math.max(0, Math.min(255, g))
      data[idx + 2] = Math.max(0, Math.min(255, b))
      data[idx + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
}

/* ---------- 深色哑光（提升噪点对比度，避免看起来像纯色） ---------- */
function generateDarkMatteTexture(ctx, res, tint) {
  const base = tint || [62, 58, 54]
  const img = ctx.createImageData(res, res)
  const data = img.data

  for (let y = 0; y < res; y++) {
    for (let x = 0; x < res; x++) {
      const u = x / res
      const v = y / res
      const n = fbm(u * 10, v * 10, 4) * 0.45
      const fine = turbulence(u * 35, v * 35, 3) * 0.3
      const blotch = smoothNoise(x * 0.15, y * 0.15) > 0.6 ? 0.2 : 0
      const dark = Math.min(0.7, n + fine * 0.3 + blotch)

      const r = base[0] * (1 - dark)
      const g = base[1] * (1 - dark)
      const b = base[2] * (1 - dark)

      const idx = (y * res + x) * 4
      data[idx] = Math.max(0, Math.min(255, r))
      data[idx + 1] = Math.max(0, Math.min(255, g))
      data[idx + 2] = Math.max(0, Math.min(255, b))
      data[idx + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)

  const vignette = ctx.createRadialGradient(
    res / 2, res / 2, res * 0.25,
    res / 2, res / 2, res * 0.7
  )
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0,0,0,0.5)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, res, res)
}

/* ---------- 从颜色贴图生成 normalMap（Sobel法线） ---------- */
function generateNormalMap(sourceCanvas, res, strength = 1.5) {
  const srcCtx = sourceCanvas.getContext('2d')
  const src = srcCtx.getImageData(0, 0, res, res).data
  const out = document.createElement('canvas')
  out.width = res
  out.height = res
  const ctx = out.getContext('2d')
  const img = ctx.createImageData(res, res)
  const dst = img.data

  const gray = new Float32Array(res * res)
  for (let i = 0; i < res * res; i++) {
    gray[i] = (src[i * 4] + src[i * 4 + 1] + src[i * 4 + 2]) / 3 / 255
  }

  for (let y = 0; y < res; y++) {
    for (let x = 0; x < res; x++) {
      const xm = x > 0 ? x - 1 : res - 1
      const xp = x < res - 1 ? x + 1 : 0
      const ym = y > 0 ? y - 1 : res - 1
      const yp = y < res - 1 ? y + 1 : 0
      const gx = gray[y * res + xm] - gray[y * res + xp]
      const gy = gray[ym * res + x] - gray[yp * res + x]

      const nx = -gx * strength
      const ny = -gy * strength
      const nz = 1
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz)

      const idx = (y * res + x) * 4
      dst[idx] = (nx / len * 0.5 + 0.5) * 255
      dst[idx + 1] = (ny / len * 0.5 + 0.5) * 255
      dst[idx + 2] = (nz / len * 0.5 + 0.5) * 255
      dst[idx + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return out
}

/* ---------- 生成 roughnessMap（颜色越暗越粗糙） ---------- */
function generateRoughnessMap(sourceCanvas, res, baseRoughness = 0.55, variation = 0.25) {
  const srcCtx = sourceCanvas.getContext('2d')
  const src = srcCtx.getImageData(0, 0, res, res).data
  const out = document.createElement('canvas')
  out.width = res
  out.height = res
  const ctx = out.getContext('2d')
  const img = ctx.createImageData(res, res)
  const dst = img.data

  for (let i = 0; i < res * res; i++) {
    const lum = (src[i * 4] + src[i * 4 + 1] + src[i * 4 + 2]) / 3 / 255
    const rough = Math.max(0, Math.min(1, baseRoughness + (1 - lum) * variation))
    const v = rough * 255
    dst[i * 4] = v
    dst[i * 4 + 1] = v
    dst[i * 4 + 2] = v
    dst[i * 4 + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  return out
}

const deskMaterialParams = {
  oak: { roughness: 0.55, metalness: 0.05, normalStrength: 1.5 },
  walnut: { roughness: 0.5, metalness: 0.05, normalStrength: 1.4 },
  cherry: { roughness: 0.52, metalness: 0.05, normalStrength: 1.3 },
  mahogany: { roughness: 0.48, metalness: 0.08, normalStrength: 1.6 },
  marble: { roughness: 0.25, metalness: 0.02, normalStrength: 0.8 },
  leather: { roughness: 0.85, metalness: 0.0, normalStrength: 1.2 },
  concrete: { roughness: 0.9, metalness: 0.0, normalStrength: 1.4 },
  metal: { roughness: 0.35, metalness: 0.9, normalStrength: 0.6 },
  dark: { roughness: 0.7, metalness: 0.05, normalStrength: 1.0 },
}

export function useDeskTexture({ type = 'oak', color = '#3a2820', resolution = 1024 } = {}) {
  const textures = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = resolution
    canvas.height = resolution
    const ctx = canvas.getContext('2d')

    const params = deskMaterialParams[type] || deskMaterialParams.oak

    if (type === 'oak') generateWoodTexture(ctx, resolution, 'oak', null)
    else if (type === 'walnut') generateWoodTexture(ctx, resolution, 'walnut', null)
    else if (type === 'cherry') generateWoodTexture(ctx, resolution, 'cherry', null)
    else if (type === 'mahogany') generateWoodTexture(ctx, resolution, 'mahogany', null)
    else if (type === 'marble') generateMarbleTexture(ctx, resolution, null)
    else if (type === 'leather') generateLeatherTexture(ctx, resolution, null)
    else if (type === 'concrete') generateConcreteTexture(ctx, resolution, null)
    else if (type === 'metal') generateBrushedMetalTexture(ctx, resolution, null)
    else generateDarkMatteTexture(ctx, resolution, null)

    const map = new THREE.CanvasTexture(canvas)
    map.colorSpace = THREE.SRGBColorSpace
    map.wrapS = map.wrapT = THREE.RepeatWrapping
    map.repeat.set(2, 2)
    map.anisotropy = 8

    const normalCanvas = generateNormalMap(canvas, resolution, params.normalStrength)
    const normalMap = new THREE.CanvasTexture(normalCanvas)
    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping
    normalMap.repeat.set(2, 2)
    normalMap.anisotropy = 8

    const roughCanvas = generateRoughnessMap(
      canvas,
      resolution,
      params.roughness,
      params.roughness * 0.4
    )
    const roughnessMap = new THREE.CanvasTexture(roughCanvas)
    roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping
    roughnessMap.repeat.set(2, 2)
    roughnessMap.anisotropy = 4

    const result = {
      map,
      normalMap,
      roughnessMap,
      roughness: params.roughness,
      metalness: params.metalness,
      normalScale: params.normalStrength,
    }

    // 切换材质时释放旧贴图，避免 GPU 显存泄漏与残留绑定
    result.dispose = () => {
      map.dispose()
      normalMap.dispose()
      roughnessMap.dispose()
    }

    return result
  }, [type, color, resolution])

  // 组件卸载或贴图重建时释放旧贴图
  useEffect(() => {
    return () => {
      if (textures.dispose) textures.dispose()
    }
  }, [textures])

  return textures
}
