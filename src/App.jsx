import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './scene/Scene.jsx'
import { usePdfTexture } from './paper/usePdfTexture.js'
import { usePdfControls } from './controls/pdfControls.js'
import './App.css'

export default function App() {
  const { pdfTexture, loadPdf } = usePdfTexture()
  usePdfControls(loadPdf)

  return (
    <div className="app">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [1.2, 2.5, 2.5], fov: 45 }}
        gl={{ antialias: true, toneMappingExposure: 1.0 }}
      >
        <color attach="background" args={['#1a1814']} />
        <Suspense fallback={null}>
          <Scene pdfTexture={pdfTexture} />
        </Suspense>
      </Canvas>
    </div>
  )
}
