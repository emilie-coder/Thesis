import { Suspense, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, TransformControls, ContactShadows, useGLTF, useCursor } from '@react-three/drei'
import { proxy, useSnapshot } from 'valtio'
import * as THREE from 'three';

// Reactive state model, using Valtio ...
const modes = ['translate', 'rotate', 'scale']
const state = proxy({ current: null, mode: 0 })

function Model({ name, ...props }) {
  console.log(`i am here ` + props.objectType);
  const snap = useSnapshot(state);
  const { nodes } = useGLTF('/3dAssets/new_cylinder.glb');
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const materialColor = snap.current === name ? 'grey' : (hovered ? 'red' : 'blue');

  // Load the texture from the item.material URL
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(props.materialString);

  const newMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    color: materialColor,
    transparent: true,
    // side: THREE.DoubleSide, // Render both sides of the mesh
  });

  newMaterial.alphaTest = 0.8;

  let myGeometry = nodes.mesh_0.geometry;
  if (props.objectType === 'plane'){
    myGeometry =  new THREE.PlaneGeometry();
  }

  return (
    <mesh
      onClick={(e) => {
        e.stopPropagation();
        state.current = name;
      }}
      onPointerMissed={(e) => e.type === 'click' && (state.current = null)}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => setHovered(false)}
      name={name}
      geometry={myGeometry}
      material={newMaterial}
      {...props}
      dispose={null}
      className={hovered ? 'hovered' : ''}
    />
  );
}


function Controls() {
  // Get notified on changes to state
  const snap = useSnapshot(state)
  const scene = useThree((state) => state.scene)
  return (
    <>
      {snap.current && <TransformControls object={scene.getObjectByName(snap.current)} mode={modes[snap.mode]} />}
    </>
  )
}

export default function App(props) {

  const sceneObjs = props.scene;

  const instantiateObjects = () => {
    const objectsToRender = [];

    if (sceneObjs && sceneObjs.objects) {
      sceneObjs.objects.forEach((item, index) => {


        objectsToRender.push(
          <Model
            name={index}
            key={index}
            position={[item.position.x, item.position.y, item.position.z]}
            rotation={[item.rotation.x, item.rotation.y, item.rotation.z]}
            scale={[item.scale.x, item.scale.y, item.scale.z]}
            materialString={item.material}
            itemName={item.objectTypeName}
            itemID={index}
            objectType={item.objectType}
            // updateThreeObject={updateThreeObject}
          />
        );
      });
    }

    return objectsToRender.length > 0 ? objectsToRender : null;
  };


  return (
    <Canvas camera={{ position: [0, -10, 80], fov: 50 }} dpr={[1, 2]}>
      <pointLight position={[100, 100, 100]} intensity={0.8} />
      <hemisphereLight color="#ffffff" groundColor="#b9b9b9" position={[-7, 25, 13]} intensity={0.85} />
      <Suspense fallback={null}>

       {instantiateObjects()}
      </Suspense>
      <OrbitControls makeDefault />
      <Controls />
    </Canvas>
  )
}
