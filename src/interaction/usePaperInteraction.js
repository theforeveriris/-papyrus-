import { useRef, useState, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { clamp } from '../utils/math.js'

export function usePaperInteraction({
  targetRef,
  deskY = 0,
  windIntensity = 0.008,
  windSpeed = 0.4,
  rotateSensitivity = 0.008,
  onInteractingChange = null,
}) {
  const { camera, raycaster } = useThree()
  const [isInteracting, setIsInteracting] = useState(false)

  const mode = useRef(null)
  const prevPointer = useRef({ x: 0, y: 0 })
  const velocity = useRef({ x: 0, z: 0, rot: 0 })
  const targetPos = useRef(new THREE.Vector3(0, 0, 0))
  const targetRotY = useRef(0)
  const currentPos = useRef(new THREE.Vector3(0, 0, 0))
  const currentRotY = useRef(0)
  const time = useRef(0)

  const deskPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -deskY))

  const setInteracting = useCallback((val) => {
    setIsInteracting((prev) => {
      if (prev !== val && onInteractingChange) onInteractingChange(val)
      return val
    })
  }, [onInteractingChange])

  const onPointerDown = useCallback((e) => {
    const isRight = (e.nativeEvent ? e.nativeEvent.button : e.button) === 2
    mode.current = isRight ? 'rotate' : 'pan'
    prevPointer.current = { x: e.clientX, y: e.clientY }
    velocity.current = { x: 0, z: 0, rot: 0 }
    setInteracting(true)
    e.stopPropagation()
  }, [setInteracting])

  const onPointerMove = useCallback((e) => {
    if (!mode.current) return
    const dx = e.clientX - prevPointer.current.x
    const dy = e.clientY - prevPointer.current.y

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

      targetPos.current.x = clamp(targetPos.current.x + deltaX, -2.5, 2.5)
      targetPos.current.z = clamp(targetPos.current.z + deltaZ, -2.5, 2.5)

      velocity.current.x = deltaX
      velocity.current.z = deltaZ
    } else if (mode.current === 'rotate') {
      const delta = dx * rotateSensitivity
      targetRotY.current += delta
      velocity.current.rot = delta
    }

    prevPointer.current = { x: e.clientX, y: e.clientY }
    e.stopPropagation()
  }, [camera, raycaster, rotateSensitivity])

  const onPointerUp = useCallback((e) => {
    mode.current = null
    setInteracting(false)
  }, [setInteracting])

  useFrame((_, delta) => {
    time.current += delta * windSpeed

    if (!mode.current) {
      targetPos.current.x += velocity.current.x
      targetPos.current.z += velocity.current.z
      targetPos.current.x = clamp(targetPos.current.x, -2.5, 2.5)
      targetPos.current.z = clamp(targetPos.current.z, -2.5, 2.5)
      velocity.current.x *= 0.9
      velocity.current.z *= 0.9
      velocity.current.rot *= 0.9
    }

    currentPos.current.x = THREE.MathUtils.lerp(currentPos.current.x, targetPos.current.x, 0.12)
    currentPos.current.z = THREE.MathUtils.lerp(currentPos.current.z, targetPos.current.z, 0.12)
    currentRotY.current = THREE.MathUtils.lerp(currentRotY.current, targetRotY.current, 0.12)

    const windX = Math.sin(time.current * 1.3) * windIntensity
      + Math.sin(time.current * 0.7) * windIntensity * 0.5
    const windZ = Math.cos(time.current * 1.1) * windIntensity * 0.7
    const windRotZ = Math.sin(time.current * 0.9) * windIntensity * 0.3

    if (targetRef?.current) {
      targetRef.current.position.x = currentPos.current.x
      targetRef.current.position.z = currentPos.current.z
      targetRef.current.position.y = deskY + 0.002
      targetRef.current.rotation.x = windX
      targetRef.current.rotation.y = currentRotY.current
      targetRef.current.rotation.z = windZ + windRotZ
    }
  })

  return { isInteracting, onPointerDown, onPointerMove, onPointerUp }
}
