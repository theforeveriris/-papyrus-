export function isMobile() {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent || ''
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)
    || window.innerWidth < 768
}

export function getTextureResolution() {
  if (typeof window === 'undefined') return 1024
  const dpr = window.devicePixelRatio || 1
  const width = window.innerWidth
  if (isMobile()) {
    return width < 500 ? 512 : 1024
  }
  return dpr > 1.5 ? 2048 : 1024
}

export function getSSAOSamples() {
  if (typeof window === 'undefined') return 15
  return isMobile() ? 9 : 21
}
