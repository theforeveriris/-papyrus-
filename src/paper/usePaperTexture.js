import { useMemo } from 'react'
import * as THREE from 'three'
import { seededRandom } from '../utils/math.js'

export function usePaperTexture({ seed = 1, resolution = 2048 } = {}) {
  const { map, bumpMap } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = resolution
    canvas.height = resolution
    const ctx = canvas.getContext('2d')

    const baseColor = '#f8f7f4'
    ctx.fillStyle = baseColor
    ctx.fillRect(0, 0, resolution, resolution)

    const rand = (i) => seededRandom(seed * 1000 + i)

    const fiberCount = Math.floor(30000 * (resolution / 2048) * (resolution / 2048))
    for (let i = 0; i < fiberCount; i++) {
      const x = rand(i * 3) * resolution
      const y = rand(i * 3 + 1) * resolution
      const angle = rand(i * 3 + 2) * Math.PI
      const length = 4 + rand(i * 5) * 12
      const alpha = 0.03 + rand(i * 7) * 0.05
      const width = 0.3 + rand(i * 11) * 0.5

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.globalAlpha = alpha
      ctx.fillStyle = '#e8e6e0'
      ctx.fillRect(-length / 2, -width / 2, length, width)
      ctx.restore()
    }

    const grainCount = Math.floor(15000 * (resolution / 2048) * (resolution / 2048))
    for (let i = 0; i < grainCount; i++) {
      const x = rand(i * 13) * resolution
      const y = rand(i * 13 + 1) * resolution
      const size = 0.5 + rand(i * 17) * 1.5
      const alpha = 0.02 + rand(i * 19) * 0.04
      const gray = 220 + Math.floor(rand(i * 23) * 30)

      ctx.globalAlpha = alpha
      ctx.fillStyle = `rgb(${gray}, ${gray - 2}, ${gray - 5})`
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }

    const gradient = ctx.createRadialGradient(
      resolution / 2, resolution / 2, resolution * 0.2,
      resolution / 2, resolution / 2, resolution * 0.7
    )
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
    gradient.addColorStop(1, 'rgba(180, 180, 175, 0.08)')
    ctx.globalAlpha = 1
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, resolution, resolution)

    const edgeGradient = ctx.createRadialGradient(
      resolution / 2, resolution / 2, resolution * 0.45,
      resolution / 2, resolution / 2, resolution * 0.55
    )
    edgeGradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
    edgeGradient.addColorStop(1, 'rgba(0, 0, 0, 0.06)')
    ctx.globalAlpha = 1
    ctx.fillStyle = edgeGradient
    ctx.fillRect(0, 0, resolution, resolution)

    const mapTexture = new THREE.CanvasTexture(canvas)
    mapTexture.colorSpace = THREE.SRGBColorSpace
    mapTexture.wrapS = mapTexture.wrapT = THREE.ClampToEdgeWrapping
    mapTexture.anisotropy = 8

    const bumpCanvas = document.createElement('canvas')
    bumpCanvas.width = resolution
    bumpCanvas.height = resolution
    const bumpCtx = bumpCanvas.getContext('2d')
    bumpCtx.drawImage(canvas, 0, 0)
    const imageData = bumpCtx.getImageData(0, 0, resolution, resolution)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3
      const contrast = (gray - 128) * 1.5 + 128
      data[i] = data[i + 1] = data[i + 2] = contrast
    }
    bumpCtx.putImageData(imageData, 0, 0)

    const bumpTexture = new THREE.CanvasTexture(bumpCanvas)
    bumpTexture.wrapS = bumpTexture.wrapT = THREE.ClampToEdgeWrapping
    bumpTexture.anisotropy = 4

    return { map: mapTexture, bumpMap: bumpTexture }
  }, [seed, resolution])

  return { map, bumpMap }
}
