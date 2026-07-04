import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { clamp } from '../utils/math.js'
import { paperStateStore } from '../controls/paperStateStore.js'

export function usePaperInteraction({
  count = 3,
  deskY = 0,
  depth = 0.004,
  windIntensity = 0.008,
  windSpeed = 0.4,
  rotateSensitivity = 0.008,
  onInteractingChange = null,
}) {
  const { camera, raycaster } = useThree()
  const [isInteracting, setIsInteracting] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const mode = useRef(null)
  const prevPointer = useRef({ x: 0, y: 0 })
  const velocity = useRef({ x: 0, z: 0, rot: 0 })
  const targetPos = useRef({ x: 0, z: 0 })
  const targetRotY = useRef(0)
  const currentPos = useRef({ x: 0, z: 0 })
  const currentRotY = useRef(0)
  const time = useRef(0)
  const activeIndex = useRef(-1)
  const interactRef = useRef({ value: false })

  const paperRefs = useRef([])
  const windPhase = useRef([])

  const deskPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -deskY))

  const setInteracting = useCallback((val) => {
    interactRef.current.value = val
    setIsInteracting((prev) => {
      if (prev !== val && onInteractingChange) onInteractingChange(val)
      return val
    })
  }, [onInteractingChange])

  const setRef = useCallback((index, mesh) => {
    paperRefs.current[index] = mesh
  }, [])

  const onPaperPointerDown = useCallback((index, e) => {
    const mesh = paperRefs.current[index]
    if (!mesh) return

    const isRight = (e.nativeEvent ? e.nativeEvent.button : e.button) === 2
    mode.current = isRight ? 'rotate' : 'pan'
    activeIndex.current = index
    prevPointer.current = { x: e.clientX, y: e.clientY }
    velocity.current = { x: 0, z: 0, rot: 0 }

    paperStateStore.select(index)
    paperStateStore.bringToFront(index)
    setSelectedIndex(index)

    targetPos.current = { x: mesh.position.x, z: mesh.position.z }
    targetRotY.current = mesh.rotation.y
    currentPos.current = { x: mesh.position.x, z: mesh.position.z }
    currentRotY.current = mesh.rotation.y

    setInteracting(true)
    e.stopPropagation()
  }, [setInteracting])

  const onPointerMove = useCallback((e) => {
    if (!mode.current || activeIndex.current < 0) return
    const dx = e.clientX - prevPointer.current.x

    if (mode.current === 'pan') {
      const ndc = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      )
      const intersect = new THREE.Vector3()
      raycaster.setFromCamera(ndc, camera)
      raycaster.ray.intersectPlane(deskPlane.current, intersect)

      const prevNdc = new THREE.Vector2(
        (prevPointer.current.x / window.innerWidth) * 2 - 1,
        -(prevPointer.current.y / window.innerHeight) * 2 + 1
      )
      const prevIntersect = new THREE.Vector3()
      raycaster.setFromCamera(prevNdc, camera)
      raycaster.ray.intersectPlane(deskPlane.current, prevIntersect)

      const deltaX = intersect.x - prevIntersect.x
      const deltaZ = intersect.z - prevIntersect.z

      targetPos.current.x = clamp(targetPos.current.x + deltaX, -5, 5)
      targetPos.current.z = clamp(targetPos.current.z + deltaZ, -5, 5)

      velocity.current.x = deltaX
      velocity.current.z = deltaZ
    } else if (mode.current === 'rotate') {
      const delta = dx * rotateSensitivity
      targetRotY.current += delta
      velocity.current.rot = delta
    }

    prevPointer.current = { x: e.clientX, y: e.clientY }
  }, [camera, raycaster, rotateSensitivity])

  const onPointerUp = useCallback(() => {
    mode.current = null
    setInteracting(false)
  }, [setInteracting])

  useEffect(() => {
    const handleMove = (e) => onPointerMove(e)
    const handleUp = () => onPointerUp()
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointercancel', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointercancel', handleUp)
    }
  }, [onPointerMove, onPointerUp])

  useEffect(() => {
    paperStateStore.init(count, depth)
    windPhase.current = new Array(count).fill(0).map((_, i) => i * 0.7)
    const { papers } = paperStateStore.get()
    papers.forEach((p, i) => {
      if (paperRefs.current[i]) {
        paperRefs.current[i].position.set(p.position[0], p.position[1], p.position[2])
        paperRefs.current[i].rotation.set(p.rotation[0], p.rotation[1], p.rotation[2])
      }
    })
  }, [count, depth])

  useFrame((_, delta) => {
    time.current += delta * windSpeed

    if (!mode.current && activeIndex.current >= 0) {
      targetPos.current.x += velocity.current.x
      targetPos.current.z += velocity.current.z
      targetPos.current.x = clamp(targetPos.current.x, -5, 5)
      targetPos.current.z = clamp(targetPos.current.z, -5, 5)
      velocity.current.x *= 0.92
      velocity.current.z *= 0.92
      velocity.current.rot *= 0.92
    }

    if (activeIndex.current >= 0) {
      const mesh = paperRefs.current[activeIndex.current]
      if (mesh) {
        currentPos.current.x = THREE.MathUtils.lerp(currentPos.current.x, targetPos.current.x, 0.18)
        currentPos.current.z = THREE.MathUtils.lerp(currentPos.current.z, targetPos.current.z, 0.18)
        currentRotY.current = THREE.MathUtils.lerp(currentRotY.current, targetRotY.current, 0.18)

        mesh.position.x = currentPos.current.x
        mesh.position.z = currentPos.current.z
      }
    }

    for (let i = 0; i < paperRefs.current.length; i++) {
      const mesh = paperRefs.current[i]
      if (!mesh) continue
      const phase = windPhase.current[i] || 0
      const windX = Math.sin(time.current * 1.3 + phase) * windIntensity
        + Math.sin(time.current * 0.7 + phase * 1.2) * windIntensity * 0.5
      const windZ = Math.cos(time.current * 1.1 + phase * 0.8) * windIntensity * 0.7
      const windRotZ = Math.sin(time.current * 0.9 + phase * 1.5) * windIntensity * 0.3

      if (i === activeIndex.current) {
        mesh.rotation.x = windX
        mesh.rotation.z = windZ + windRotZ
        mesh.rotation.y = currentRotY.current
      } else {
        mesh.rotation.x = windX
        mesh.rotation.z = windZ + windRotZ
      }
    }
  })

  return { isInteracting, selectedIndex, onPaperPointerDown, setRef, paperRefs }
}
