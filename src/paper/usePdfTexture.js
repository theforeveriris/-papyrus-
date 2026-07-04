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

function pageToTexture(page) {
  const scale = 4
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  return page.render({ canvasContext: ctx, viewport }).promise.then(() => {
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 16
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.generateMipmaps = true
    texture.needsUpdate = true
    return texture
  })
}

export function usePdfTexture() {
  const [pdfTextures, setPdfTextures] = useState([])
  const [pageCount, setPageCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    return pdfStore.subscribe(({ pdfTextures: texs, pageCount: pc }) => {
      setPdfTextures(texs)
      setPageCount(pc)
    })
  }, [])

  const loadPdf = useCallback(async (file) => {
    if (!file) return
    setLoading(true)
    pdfStore.clear()
    try {
      const lib = await loadPdfjs()
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await lib.getDocument({ data: arrayBuffer }).promise

      const textures = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const tex = await pageToTexture(page)
        textures.push(tex)
      }

      pdfStore.set(textures, file.name)
    } catch (err) {
      console.error('PDF加载失败:', err)
      pdfStore.clear()
    } finally {
      setLoading(false)
    }
  }, [])

  const clearPdf = useCallback(() => {
    pdfStore.clear()
  }, [])

  return { pdfTextures, pageCount, loading, loadPdf, clearPdf }
}
