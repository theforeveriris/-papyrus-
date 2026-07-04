import * as THREE from 'three'

let pdfTextures = []
let pageCount = 0
let fileName = ''
const listeners = new Set()

function notify() {
  listeners.forEach((fn) => fn({ pdfTextures, pageCount, fileName }))
}

export const pdfStore = {
  subscribe(fn) {
    listeners.add(fn)
    fn({ pdfTextures, pageCount, fileName })
    return () => listeners.delete(fn)
  },
  get() {
    return { pdfTextures, pageCount, fileName }
  },
  set(textures, name) {
    if (pdfTextures.length > 0) {
      pdfTextures.forEach((t) => t.dispose())
    }
    pdfTextures = textures || []
    pageCount = textures ? textures.length : 0
    fileName = name || ''
    notify()
  },
  clear() {
    if (pdfTextures.length > 0) {
      pdfTextures.forEach((t) => t.dispose())
    }
    pdfTextures = []
    pageCount = 0
    fileName = ''
    notify()
  },
}
