import { Suspense, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Plane, TransformControls, useCursor } from '@react-three/drei';
import create from 'zustand';
import DuckScene from './3dScenes/DuckScene';
import SimpleFlower from './3dScenes/Test_flower';
import Man from './3dScenes/Man';
import Woman from './3dScenes/Woman';
import { TextureLoader } from 'three'; // Import TextureLoader from Three.js

import { SET_OBJECT_IMAGE } from '../redux/slice/objectImageSlice';

// Import THREE from Three.js
import * as THREE from 'three';
import { useDispatch, useSelector } from 'react-redux';
import Mountains from './3dScenes/MyMountains';
import Walls from './3dScenes/Walls';

import { updateObjectPosition } from '../firebase/config';
import { selectUserID } from '../redux/slice/authSlice';
import { selectProjectID } from '../redux/slice/projectSlice';
import { useControls } from 'leva'

import templateCSS from './TemplateScene.module.css';
import { useGLTF } from '@react-three/drei'

const useStore = create((set) => ({
  targetID: 'none',
  setTargetID: (targetID) => set({ targetID }),
  targetName: 'currently editing',
  setTargetName: (targetName) => set({ targetName }),
  target: null,
  setTarget: (target) => set({ target }),
}));

function Box(props) {
  // console.log("here i am");
  // console.log(props);
  const dispatch = useDispatch();

  const setTarget = useStore((state) => state.setTarget);
  const setTargetName = useStore((state) => state.setTargetName);
  const setTargetID = useStore((state) => state.setTargetID);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const userID = useSelector(selectUserID); 
  const projID = useSelector(selectProjectID); 


  const { nodes, materials } = useGLTF('/3dAssets/walls.glb')

  if (props.itemName && props.itemName === 'plane') {
    const planeGeometry = new THREE.PlaneGeometry(); // Create a plane geometry
    return (
      <mesh
        {...props}
        geometry={planeGeometry} // Set the geometry
        onClick={(e) => {
          console.log(e);
          updateObjectPosition(userID, projID, props.itemID, e.object.position, e.object.scale, e.object.rotation);
          setTarget(e.object);
          setTargetName(props.itemName);
          setTargetID(props.itemID);

          const objectInfo = {
            objectName: props.itemName,
            objectID: props.itemID,
            objectMaterial: props.materialString,
          };

          // Dispatch the project information to Redux
          dispatch(SET_OBJECT_IMAGE(objectInfo));
        }}

        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshNormalMaterial />
        {/* <planeGeometry /> */}
      </mesh>
    );
  } else if (props.itemName && props.itemName === 'cylinder') {
    return (
      
      <mesh
        {...props}
        geometry={nodes.mesh_0.geometry}
        onClick={(e) => {
          console.log(e);
          updateObjectPosition(userID, projID, props.itemID, e.object.position, e.object.scale, e.object.rotation);

          setTarget(e.object);
          setTargetName(props.itemName);
          setTargetID(props.itemID);

          const objectInfo = {
            objectName: props.itemName,
            objectID: props.itemID,
            objectMaterial: props.materialString,
          };

          // Dispatch the project information to Redux
          dispatch(SET_OBJECT_IMAGE(objectInfo));
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
         <meshNormalMaterial />
      </mesh>
    );
  }
}

export default function TemplateScene(props) {
  const { target, setTarget } = useStore();
  const { targetName, setTargetName } = useStore();
  const { targetID, setTargetID} = useStore();
  const sceneObjs = props.scene;

  // const { mode } = useControls({ mode: { value: 'translate', options: ['translate', 'rotate', 'scale'] } })

  const instantiateObjects = () => {
    if (sceneObjs && sceneObjs.objects) {
      return sceneObjs.objects.map((item, index) => {
        // console.log(item);

        // Load the texture from the item.material URL
        const textureLoader = new TextureLoader();
        const texture = textureLoader.load(item.material);

        // Create a material with the loaded texture
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true, // Enable transparency
          side: THREE.DoubleSide, // Render both sides of the mesh
        });

        return (
          <Box
            key={index}
            position={[item.position.x, item.position.y, item.position.z]}
            rotation={[item.rotation.x, item.rotation.y, item.rotation.z]}
            scale={[item.scale.x, item.scale.y, item.scale.z]}
            material={material} // Apply the material with the texture
            materialString={item.material}
            itemName={item.objectTypeName}
            itemID={index}
            objectType={item.objectType}
          />
        );
      });
    }

    return null; // Return null if sceneObjs.objects is not available
  };

  return (
    <div className={templateCSS.canvasHolder}>
      {/* targetName */}
      <div className={templateCSS.tempargs}>
        {targetName && (
          <>
            {targetName} - target ID: {targetID}
          </>
        )}
      </div>

      <Canvas dpr={[1, 2]} onPointerMissed={() => setTarget(null)}>
        <Suspense fallback={null}>
          <gridHelper args={[400, 200, '#151515', '#020202']} position={[0, -4, 0]} />
          <ambientLight intensity={1.0} />
          <pointLight position={[10, 10, 10]} intensity={1} castShadow={true} />

          {instantiateObjects()}

          <Man scale={0.01} position={[3,-2,0]}/>
          {/* {target && <TransformControls object={target} mode={mode} />} */}
          <OrbitControls makeDefault />
        </Suspense>
      </Canvas>
    </div>
  );
}
