import { useState, useEffect, useMemo } from 'react'
import Paper from './Paper.jsx'
import { paperStateStore } from '../controls/paperStateStore.js'

export default function PaperStack({
  count = 3,
  seed = 42,
  textureResolution = 2048,
  width = 1.0,
  height = 1.414,
  depth = 0.004,
  paperProps = {},
  pdfTextures = [],
  onPaperPointerDown = null,
  setPaperRef = null,
}) {
  const [papers, setPapers] = useState([])

  useEffect(() => {
    return paperStateStore.subscribe(({ papers: ps }) => setPapers([...ps]))
  }, [])

  const sortedIndices = useMemo(() => {
    const idxs = papers.map((p, i) => ({ i, z: p.zIndex }))
    idxs.sort((a, b) => a.z - b.z)
    return idxs.map((x) => x.i)
  }, [papers])

  return (
    <group>
      {sortedIndices.map((paperIndex) => {
        const p = papers[paperIndex]
        if (!p) return null
        const pdfTexture = pdfTextures[paperIndex] || null
        const hasPdf = paperIndex < pdfTextures.length

        return (
          <Paper
            key={paperIndex}
            paperIndex={paperIndex}
            seed={seed + paperIndex * 100}
            textureResolution={textureResolution}
            position={p.position}
            rotation={p.rotation}
            width={width}
            height={height}
            depth={depth}
            pdfTexture={hasPdf ? pdfTexture : null}
            hasPdfPage={hasPdf}
            onPointerDown={(e) => {
              if (onPaperPointerDown) onPaperPointerDown(paperIndex, e)
            }}
            setRef={(mesh) => {
              if (setPaperRef) setPaperRef(paperIndex, mesh)
            }}
            {...paperProps}
          />
        )
      })}
    </group>
  )
}
