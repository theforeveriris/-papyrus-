import { useRef, useState } from 'react'
import { OrbitControls } from '@react-three/drei'
import PaperStack from '../paper/PaperStack.jsx'
import Lighting from './Lighting.jsx'
import Desk from './Desk.jsx'
import PostProcessing from './PostProcessing.jsx'
import { usePaperInteraction } from '../interaction/usePaperInteraction.js'
import { usePdfTexture } from '../paper/usePdfTexture.js'
import {
  usePaperControls,
  useLightingControls,
  usePostProcessingControls,
  useAnimationControls,
  useSceneControls,
} from '../controls/useControls.js'

export default function Scene({ pdfTexture }) {
  const groupRef = useRef()
  const [orbitEnabled, setOrbitEnabled] = useState(true)

  const paperCtrl = usePaperControls()
  const lightCtrl = useLightingControls()
  const ppCtrl = usePostProcessingControls()
  const animCtrl = useAnimationControls()
  const sceneCtrl = useSceneControls()

  const { onPointerDown, onPointerMove, onPointerUp } = usePaperInteraction({
    targetRef: groupRef,
    deskY: 0,
    windIntensity: animCtrl.windEnabled ? animCtrl.windIntensity : 0,
    windSpeed: animCtrl.windSpeed,
    onInteractingChange: (val) => setOrbitEnabled(!val),
  })

  const paperProps = {
    color: paperCtrl.color,
    roughness: paperCtrl.roughness,
    metalness: paperCtrl.metalness,
    sheen: paperCtrl.sheen,
    sheenRoughness: paperCtrl.sheenRoughness,
    transmission: paperCtrl.transmission,
    thickness: paperCtrl.depth,
    bumpScale: paperCtrl.bumpScale,
  }

  return (
    <>
      <Lighting
        preset={lightCtrl.preset}
        shadows={lightCtrl.shadows}
        envIntensity={lightCtrl.envIntensity}
        keyIntensity={lightCtrl.keyIntensity}
        fillIntensity={lightCtrl.fillIntensity}
        rimIntensity={lightCtrl.rimIntensity}
        ambientIntensity={lightCtrl.ambientIntensity}
        hemiIntensity={lightCtrl.hemiIntensity}
      />
      <Desk color={sceneCtrl.deskColor} type={sceneCtrl.deskType} />

      <group
        ref={groupRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerOut={onPointerUp}
      >
        <PaperStack
          count={sceneCtrl.paperCount}
          textureResolution={2048}
          width={paperCtrl.width}
          height={paperCtrl.height}
          depth={paperCtrl.depth}
          paperProps={paperProps}
          pdfTexture={pdfTexture}
        />
      </group>

      <OrbitControls
        enabled={orbitEnabled}
        makeDefault
        target={[0, 0, 0]}
        minDistance={1.2}
        maxDistance={6}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minPolarAngle={0.1}
        enableDamping
        dampingFactor={0.08}
      />

      <PostProcessing
        ssaoEnabled={ppCtrl.ssaoEnabled}
        ssaoIntensity={ppCtrl.ssaoIntensity}
        ssaoRadius={ppCtrl.ssaoRadius}
        ssaoSamples={ppCtrl.ssaoSamples}
        bloomEnabled={ppCtrl.bloomEnabled}
        bloomIntensity={ppCtrl.bloomIntensity}
        bloomLuminanceThreshold={ppCtrl.bloomThreshold}
        bloomLuminanceSmoothing={ppCtrl.bloomSmoothing}
      />
    </>
  )
}
