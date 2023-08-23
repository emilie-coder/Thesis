import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, TransformControls, useCursor } from '@react-three/drei'
// import { useControls } from 'leva'
import create from 'zustand'
import DuckScene from './3dScenes/DuckScene'
import SimpleFlower from './3dScenes/Test_flower'



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
  const { target, setTarget } = useStore();

  return (
    <Canvas dpr={[1, 2]} onPointerMissed={() => setTarget(null)}>
      <Suspense fallback={null}>
        <gridHelper args={[400, 200, '#151515', '#020202']} position={[0, -4, 0]} />
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />

        <mesh>
          <DuckScene />
        </mesh>

        {target && <TransformControls object={target} mode="translate" />}
        <OrbitControls makeDefault />
      </Suspense>
    </Canvas>
  );
}
