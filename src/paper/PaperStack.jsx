import { forwardRef, useMemo } from 'react'
import Paper from './Paper.jsx'
import { seededRandom } from '../utils/math.js'

const PaperStack = forwardRef(function PaperStack(
  {
    count = 3,
    seed = 42,
    textureResolution = 2048,
    width = 1.0,
    height = 1.414,
    depth = 0.004,
    paperProps = {},
    pdfTexture = null,
    ...props
  },
  ref
) {
  const papers = useMemo(() => {
    const arr = []
    for (let i = 0; i < count; i++) {
      const r1 = seededRandom(seed * 100 + i * 7)
      const r2 = seededRandom(seed * 100 + i * 11 + 1)
      const r3 = seededRandom(seed * 100 + i * 13 + 2)
      const offsetX = (i - (count - 1) / 2) * 0.015 + (r1 - 0.5) * 0.015
      const offsetZ = (i - (count - 1) / 2) * 0.02 + (r2 - 0.5) * 0.015
      const rotY = (r3 - 0.5) * 0.06
      const y = i * depth * 1.1
      arr.push({
        seed: seed + i * 100,
        position: [offsetX, y, offsetZ],
        rotation: [0, rotY, 0],
      })
    }
    return arr
  }, [count, seed, depth])

  return (
    <group ref={ref} {...props}>
      {papers.map((p, i) => (
        <Paper
          key={i}
          seed={p.seed}
          textureResolution={textureResolution}
          position={p.position}
          rotation={p.rotation}
          width={width}
          height={height}
          depth={depth}
          pdfTexture={pdfTexture}
          {...paperProps}
        />
      ))}
    </group>
  )
})

export default PaperStack
