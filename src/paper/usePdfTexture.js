import { useState, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { pdfStore } from '../controls/pdfStore.js'

let pdfjsLib = null

async function loadPdfjs() {
  if (pdfjsLib) return pdfjsLib
  const lib = await import('pdfjs-dist/build/pdf.js')
  lib.GlobalWorkerOptions.workerSrc = (await import('pdfjs-dist/build/pdf.worker.js?url')).default
  pdfjsLib = lib
  return pdfjsLib
}

export function usePdfTexture() {
  const [pdfTexture, setPdfTexture] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    return pdfStore.subscribe(({ pdfTexture: tex }) => {
      setPdfTexture(tex)
    })
  }, [])

  const loadPdf = useCallback(async (file) => {
    if (!file) return
    setLoading(true)
    pdfStore.set(null, file.name)
    try {
      const lib = await loadPdfjs()
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await lib.getDocument({ data: arrayBuffer }).promise
      const page = await pdf.getPage(1)

      const scale = 4
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      await page.render({ canvasContext: ctx, viewport }).promise

      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = 16
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.generateMipmaps = true
      texture.needsUpdate = true

      pdfStore.set(texture, file.name)
    } catch (err) {
      console.error('PDF加载失败:', err)
      pdfStore.set(null, '')
    } finally {
      setLoading(false)
    }
  }, [])

  const clearPdf = useCallback(() => {
    pdfStore.clear()
  }, [])

  return { pdfTexture, loading, loadPdf, clearPdf }
}
