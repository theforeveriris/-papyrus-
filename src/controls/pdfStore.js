import * as THREE from 'three'

let pdfTexture = null
let fileName = ''
const listeners = new Set()

function notify() {
  listeners.forEach((fn) => fn({ pdfTexture, fileName }))
}

export const pdfStore = {
  subscribe(fn) {
    listeners.add(fn)
    fn({ pdfTexture, fileName })
    return () => listeners.delete(fn)
  },
  get() {
    return { pdfTexture, fileName }
  },
  set(texture, name) {
    pdfTexture = texture
    fileName = name
    notify()
  },
  clear() {
    if (pdfTexture) {
      pdfTexture.dispose()
    }
    pdfTexture = null
    fileName = ''
    notify()
  },
}
