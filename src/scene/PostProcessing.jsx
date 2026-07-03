import { EffectComposer, SSAO, Bloom } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

export default function PostProcessing({
  ssaoEnabled = true,
  ssaoIntensity = 1.2,
  ssaoRadius = 0.15,
  ssaoSamples = 21,
  bloomEnabled = true,
  bloomIntensity = 0.3,
  bloomLuminanceThreshold = 0.8,
  bloomLuminanceSmoothing = 0.9,
  bloomMipmapBlur = true,
}) {
  return (
    <EffectComposer multisampling={0} disableNormalPass={!ssaoEnabled}>
      {ssaoEnabled && (
        <SSAO
          blendFunction={BlendFunction.MULTIPLY}
          intensity={ssaoIntensity}
          radius={ssaoRadius}
          samples={ssaoSamples}
          luminanceInfluence={0.5}
          color="black"
          worldDistanceThreshold={10}
          worldDistanceFalloff={5}
          worldProximityThreshold={1}
          worldProximityFalloff={0.5}
        />
      )}
      {bloomEnabled && (
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={bloomLuminanceThreshold}
          luminanceSmoothing={bloomLuminanceSmoothing}
          mipmapBlur={bloomMipmapBlur}
          radius={0.5}
        />
      )}
    </EffectComposer>
  )
}
