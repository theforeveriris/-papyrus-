import { seededRandom } from '../utils/math.js'

let papers = []
let selectedIndex = -1
const listeners = new Set()

function notify() {
  listeners.forEach((fn) => fn({ papers, selectedIndex }))
}

function createInitialPapers(count, depth, seed = 42) {
  const arr = []
  for (let i = 0; i < count; i++) {
    const r1 = seededRandom(seed * 100 + i * 7)
    const r2 = seededRandom(seed * 100 + i * 11 + 1)
    const r3 = seededRandom(seed * 100 + i * 13 + 2)
    const offsetX = (i - (count - 1) / 2) * 0.15 + (r1 - 0.5) * 0.2
    const offsetZ = (i - (count - 1) / 2) * 0.1 + (r2 - 0.5) * 0.15
    const rotY = (r3 - 0.5) * 0.15
    arr.push({
      id: i,
      position: [offsetX, i * depth * 1.1, offsetZ],
      rotation: [0, rotY, 0],
      zIndex: i,
    })
  }
  return arr
}

export const paperStateStore = {
  subscribe(fn) {
    listeners.add(fn)
    fn({ papers, selectedIndex })
    return () => listeners.delete(fn)
  },
  get() {
    return { papers, selectedIndex }
  },
  init(count, depth, seed = 42) {
    papers = createInitialPapers(count, depth, seed)
    selectedIndex = -1
    notify()
  },
  setCount(count, depth, seed = 42) {
    if (papers.length === count) return
    if (papers.length < count) {
      const existing = papers.length
      const baseZ = Math.max(...papers.map((q) => q.zIndex), -1)
      const newOnes = createInitialPapers(count, depth, seed).slice(existing)
      newOnes.forEach((p, idx) => {
        p.id = existing + idx
        p.zIndex = baseZ + 1 + idx
      })
      papers = [...papers, ...newOnes]
    } else {
      papers = papers.slice(0, count)
      if (selectedIndex >= count) selectedIndex = -1
    }
    notify()
  },
  select(index) {
    selectedIndex = index
    notify()
  },
  deselect() {
    selectedIndex = -1
    notify()
  },
  bringToFront(index) {
    if (index < 0 || index >= papers.length) return
    const maxZ = Math.max(...papers.map((p) => p.zIndex))
    if (papers[index].zIndex === maxZ) return
    papers = papers.map((p, i) => (i === index ? { ...p, zIndex: maxZ + 1 } : p))
    notify()
  },
  sendToBack(index) {
    if (index < 0 || index >= papers.length) return
    const minZ = Math.min(...papers.map((p) => p.zIndex))
    if (papers[index].zIndex === minZ) return
    papers = papers.map((p, i) => (i === index ? { ...p, zIndex: minZ - 1 } : p))
    notify()
  },
  moveLayer(index, direction) {
    if (index < 0 || index >= papers.length) return
    const sorted = [...papers].map((p, i) => ({ i, z: p.zIndex })).sort((a, b) => a.z - b.z)
    const currentRank = sorted.findIndex((s) => s.i === index)
    const targetRank = direction > 0 ? currentRank + 1 : currentRank - 1
    if (targetRank < 0 || targetRank >= sorted.length) return
    const target = sorted[targetRank]
    const currentZ = papers[index].zIndex
    const targetZ = papers[target.i].zIndex
    papers = papers.map((p, i) => {
      if (i === index) return { ...p, zIndex: targetZ }
      if (i === target.i) return { ...p, zIndex: currentZ }
      return p
    })
    notify()
  },
  resetAll(count, depth, seed = 42) {
    papers = createInitialPapers(count, depth, seed)
    selectedIndex = -1
    notify()
  },
}
