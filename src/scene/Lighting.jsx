import { Environment } from '@react-three/drei'
import { lightingPresets } from '../controls/LightingPresets.js'

const envPresets = {
  daylight: 'apartment',
  warm: 'sunset',
  cool: 'city',
  sunset: 'sunset',
}

export default function Lighting({
  preset = 'daylight',
  shadows = true,
  envIntensity = 0.4,
  keyIntensity = null,
  fillIntensity = null,
  rimIntensity = null,
  ambientIntensity = null,
  hemiIntensity = null,
}) {
  const p = lightingPresets[preset] || lightingPresets.daylight

  return (
    <>
      <Environment preset={envPresets[preset] || 'apartment'} environmentIntensity={envIntensity} />

      <ambientLight
        color={p.ambient.color}
        intensity={ambientIntensity ?? p.ambient.intensity}
      />
      <hemisphereLight
        args={[
          p.hemisphere.sky,
          p.hemisphere.ground,
          hemiIntensity ?? p.hemisphere.intensity,
        ]}
      />
      <directionalLight
        position={p.keyLight.position}
        color={p.keyLight.color}
        intensity={keyIntensity ?? p.keyLight.intensity}
        castShadow={shadows}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-camera-near={0.1}
        shadow-camera-far={20}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />
      <directionalLight
        position={p.fillLight.position}
        color={p.fillLight.color}
        intensity={fillIntensity ?? p.fillLight.intensity}
      />
      <spotLight
        position={p.rimLight.position}
        color={p.rimLight.color}
        intensity={rimIntensity ?? p.rimLight.intensity}
        angle={p.rimLight.angle}
        penumbra={p.rimLight.penumbra}
        castShadow={false}
      />
    </>
  )
}
