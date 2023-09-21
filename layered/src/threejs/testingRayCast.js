import { Suspense, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, TransformControls, ContactShadows, useGLTF, useCursor } from '@react-three/drei'
import { proxy, useSnapshot } from 'valtio'
import * as THREE from 'three';

// Reactive state model, using Valtio ...
const modes = ['translate', 'rotate', 'scale']
const state = proxy({ current: null, mode: 0 })

function Model({ name, ...props }) {
  // Ties this component to the state model
  const snap = useSnapshot(state)
  const { nodes } = useGLTF('/3dAssets/new_cylinder.glb')
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  const newMaterial = new THREE.MeshBasicMaterial({
    color: snap.current === name ? 'grey' : 'white',
    transparent: true, // Enable transparency
    // side: THREE.DoubleSide, // Render both sides of the mesh
  });

  return (
    <mesh
      // Click sets the mesh as the new target
      onClick={(e) => (e.stopPropagation(), (state.current = name)) }
      onPointerMissed={(e) => e.type === 'click' && (state.current = null)}
      onPointerOver={(e) => (e.stopPropagation(), setHovered(true))}
      onPointerOut={(e) => setHovered(false)}
      name={name}
      geometry={nodes.mesh_0.geometry}
      material={newMaterial}
      {...props}
      dispose={null}
    />
  )
}

function Controls() {
  // Get notified on changes to state
  const snap = useSnapshot(state)
  const scene = useThree((state) => state.scene)
  return (
    <>
      {snap.current && <TransformControls object={scene.getObjectByName(snap.current)} mode={modes[snap.mode]} />}
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
    </>
  )
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, -10, 80], fov: 50 }} dpr={[1, 2]}>
      <pointLight position={[100, 100, 100]} intensity={0.8} />
      <hemisphereLight color="#ffffff" groundColor="#b9b9b9" position={[-7, 25, 13]} intensity={0.85} />
      <Suspense fallback={null}>
        <group position={[0, 10, 0]}>
          <Model name="Curly" position={[1, -11, -20]} rotation={[2, 0, -0]} />
          <Model name="DNA" position={[20, 0, -17]} rotation={[1, 1, -2]} />
          <Model name="Headphones" position={[20, 2, 4]} rotation={[1, 0, -1]} />
          <Model name="Notebook" position={[-21, -15, -13]} rotation={[2, 0, 1]} />
          <ContactShadows rotation-x={Math.PI / 2} position={[0, -35, 0]} opacity={0.25} width={200} height={200} blur={1} far={50} />
        </group>
      </Suspense>
      <Controls />
    </Canvas>
  )
}