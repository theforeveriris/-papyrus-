import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { createDeskMaterial, deskShaderPresets } from './deskShaderMaterials.js'

export default function Desk({ color = '#3a2820', type = 'oak' }) {
  const materialRef = useRef(null)

  const material = useMemo(() => {
    return createDeskMaterial(type)
  }, [type])

  const params = deskShaderPresets[type] || deskShaderPresets.oak

  return (
    <>
      {/* key={type} 确保切换材质时整体重建，shader 重新编译 */}
      <mesh key={type} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12, 64, 64]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* 边框 */}
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

      {/* 桌面小装饰 */}
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
