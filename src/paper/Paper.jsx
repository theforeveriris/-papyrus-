import { useMemo, forwardRef } from 'react'
import * as THREE from 'three'
import { usePaperTexture } from './usePaperTexture.js'

const Paper = forwardRef(function Paper(
  {
    seed = 1,
    textureResolution = 2048,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    castShadow = true,
    receiveShadow = true,
    color = '#f8f7f4',
    roughness = 0.75,
    metalness = 0.0,
    sheen = 0.15,
    sheenColor = '#ffffff',
    sheenRoughness = 0.6,
    transmission = 0.08,
    thickness = 0.004,
    ior = 1.3,
    bumpScale = 0.002,
    width = 1.0,
    height = 1.414,
    depth = 0.004,
    pdfTexture = null,
    ...props
  },
  ref
) {
  const geometry = usePaperGeometry({ width, height, depth, pdfTexture })
  const { map, bumpMap } = usePaperTexture({ seed, resolution: textureResolution })

  const finalMap = pdfTexture || map

  return (
    <mesh
      ref={ref}
      geometry={geometry}
      position={position}
      rotation={rotation}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      {...props}
    >
      <meshPhysicalMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        sheen={sheen}
        sheenColor={sheenColor}
        sheenRoughness={sheenRoughness}
        transmission={transmission}
        thickness={thickness}
        ior={ior}
        side={THREE.DoubleSide}
        map={finalMap}
        bumpMap={bumpMap}
        bumpScale={bumpScale}
        envMapIntensity={0.3}
        clearcoat={0}
      />
    </mesh>
  )
})

function usePaperGeometry({
  width = 1.0,
  height = 1.414,
  depth = 0.004,
  pdfTexture = null,
} = {}) {
  return useMemo(() => {
    const shape = new THREE.Shape()
    const w = width / 2
    const h = height / 2
    shape.moveTo(-w, -h)
    shape.lineTo(w, -h)
    shape.lineTo(w, h)
    shape.lineTo(-w, h)
    shape.lineTo(-w, -h)

    const bevelThickness = Math.min(depth * 0.4, 0.0015)
    const bevelSize = Math.min(depth * 0.3, 0.001)

    const extrudeSettings = {
      depth,
      bevelEnabled: true,
      bevelThickness,
      bevelSize,
      bevelSegments: 2,
      curveSegments: 1,
      steps: 1,
    }

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    geo.center()

    const posAttr = geo.attributes.position
    const uvs = new Float32Array(posAttr.count * 2)

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i)
      const y = posAttr.getY(i)
      const z = posAttr.getZ(i)

      const topZ = depth / 2 + bevelThickness
      const bottomZ = -(depth / 2 + bevelThickness)

      if (pdfTexture && Math.abs(z - topZ) < 0.001) {
        uvs[i * 2] = (x + w) / width
        uvs[i * 2 + 1] = (y + h) / height
      } else if (Math.abs(z - topZ) < 0.001 || Math.abs(z - bottomZ) < 0.001) {
        uvs[i * 2] = (x + w) / width
        uvs[i * 2 + 1] = (y + h) / height
      } else {
        uvs[i * 2] = 0.5
        uvs[i * 2 + 1] = 0.5
      }
    }

    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    geo.computeVertexNormals()
    geo.rotateX(-Math.PI / 2)

    return geo
  }, [width, height, depth, pdfTexture])
}

export default Paper
