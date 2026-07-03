export function lerp(a, b, t) {
  return a + (b - a) * t
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function randomRange(min, max) {
  return Math.random() * (max - min) + min
}

export function seededRandom(seed) {
  const x = Math.sin(seed * 9999.1) * 10000
  return x - Math.floor(x)
}
