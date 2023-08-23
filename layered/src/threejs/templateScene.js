import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, TransformControls, useCursor } from '@react-three/drei'
// import { useControls } from 'leva'
import create from 'zustand'
import { Plane } from 'three'

const useStore = create((set) => ({ target: null, setTarget: (target) => set({ target }) }))

function Box(props) {
  const setTarget = useStore((state) => state.setTarget)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  return (
    <mesh {...props} onClick={(e) => setTarget(e.object)} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <boxGeometry />
      <meshNormalMaterial />
    </mesh>
  )
}

export default function TemplateScene() {
  const { target, setTarget } = useStore()
  // const { mode } = useControls({ mode: { value: 'translate', options: ['translate', 'rotate', 'scale'] } })
  return (
    <Canvas dpr={[1, 2]} onPointerMissed={() => setTarget(null)}>

        <gridHelper args={[1000, 200, '#151515', '#020202']} position={[0, -4, 0]} />
        <ambientLight intensity={0.01} />
        <hemisphereLight intensity={0.925} color="#8040df" groundColor="red" />
      <Box position={[2, 2, 0]} />
      <Box />
      {target && <TransformControls object={target} mode={ 'translate' } />}
      <OrbitControls makeDefault />
    </Canvas>
  )
}
