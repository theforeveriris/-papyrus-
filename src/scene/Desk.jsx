import { useDeskTexture } from './useDeskTexture.js'

export default function Desk({ color = '#3a2820', type = 'oak' }) {
  const { map, normalMap, roughnessMap, roughness, metalness, normalScale } = useDeskTexture({
    type,
    color,
  })

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12, 64, 64]} />
        <meshStandardMaterial
          color={color}
          roughness={roughness}
          metalness={metalness}
          map={map}
          normalMap={normalMap}
          normalScale={[normalScale, normalScale]}
          roughnessMap={roughnessMap}
          envMapIntensity={0.4}
        />
      </mesh>

      <mesh position={[0, -0.05, 6]} receiveShadow>
        <boxGeometry args={[12, 0.1, 0.02]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.05, -6]} receiveShadow>
        <boxGeometry args={[12, 0.1, 0.02]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[6, -0.05, 0]} receiveShadow>
        <boxGeometry args={[0.02, 0.1, 12]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[-6, -0.05, 0]} receiveShadow>
        <boxGeometry args={[0.02, 0.1, 12]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>

      <mesh position={[1.8, 0.001, -1.2]} rotation={[-Math.PI / 2, 0, 0.3]} receiveShadow castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.4, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[1.95, 0.002, -1.0]} rotation={[-Math.PI / 2, 0, 0.3]} receiveShadow castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.4, 8]} />
        <meshStandardMaterial color="#c0a060" roughness={0.3} metalness={0.8} />
      </mesh>
    </>
  )
}
