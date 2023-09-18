import { Suspense, useState, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Plane, TransformControls, useCursor } from '@react-three/drei';
import create from 'zustand';
import Man from './3dScenes/Man';
import { TextureLoader } from 'three'; // Import TextureLoader from Three.js
import * as THREE from 'three';
import { useDispatch } from 'react-redux';
import { SET_OBJECT_IMAGE } from '../redux/slice/objectImageSlice';
import templateCSS from './ThreeJSScene.module.css';
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
  const dispatch = useDispatch();

  const setTarget = useStore((state) => state.setTarget);
  const setTargetName = useStore((state) => state.setTargetName);
  const setTargetID = useStore((state) => state.setTargetID);
  const [hovered, setHovered] = useState(false);
  const updateThreeObject = props.updateThreeObject;
  useCursor(hovered);

  const { nodes } = useGLTF('/3dAssets/new_cylinder.glb')

  const handleObjectClick = (e) => {
    props.updateThreeObject(props.itemID, {
      position: e.object.position,
      scale: e.object.scale,
      rotation: e.object.rotation,
    });

    console.log("this is the target object: ");
    console.log(e.object);


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
  };

  if (props.itemName && props.itemName === 'plane') {
    const planeGeometry = new THREE.PlaneGeometry(); // Create a plane geometry
    return (
      <mesh
        {...props}
        geometry={planeGeometry} // Set the geometry
        onClick={handleObjectClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshNormalMaterial />
      </mesh>
    );
  } else if (props.itemName && props.itemName === 'cylinder') {
    return (
      <mesh
        {...props}
        geometry={nodes.mesh_0.geometry}
        onClick={handleObjectClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshNormalMaterial />
      </mesh>
    );
  }
}

export default function ThreeJSScene(props) {
  const { target, setTarget } = useStore();
  const { targetName, setTargetName } = useStore();
  const { targetID, setTargetID } = useStore();
  const sceneObjs = props.scene;


  useEffect(() => {
    // Render new objects here when the component first loads
    // For example, you can create and render new cylinders and planes here
    // Use the same logic as in your "addCylinder" and "addPlane" functions
    // This ensures that new objects are visible from the start
  }, []);

  const instantiateObjects = () => {
    const objectsToRender = [];

    if (sceneObjs && sceneObjs.objects) {
      sceneObjs.objects.forEach((item, index) => {
        // Load the texture from the item.material URL
        const textureLoader = new TextureLoader();
        const texture = textureLoader.load(item.material);

        // Create a material with the loaded texture
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true, // Enable transparency
          // side: THREE.DoubleSide, // Render both sides of the mesh
        });

        material.alphaTest = 0.8;

        objectsToRender.push(
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
            updateThreeObject={updateThreeObject}
          />
        );
      });
    }

    return objectsToRender.length > 0 ? objectsToRender : null;
  };

  const updateThreeObject = (objectID, newObjectData) => {
    props.updateObject(objectID, newObjectData);
  };

  return (
    <div className={templateCSS.canvasHolder}>
    <Canvas
        colorManagement
        shadowMap // highlight-line
        camera={{ position: [-3, 2, 5], fov: 90 }}
        linear
        flat
        >
        <Suspense fallback={null}>
          <gridHelper args={[400, 200, '#151515', '#020202']} position={[0, -4, 0]} />
          <directionalLight
            intensity={5.0}
            castShadow // highlight-line
            shadow-mapSize-height={512}
            shadow-mapSize-width={512}
          />
          <pointLight position={[10, 10, 10]} intensity={1} castShadow={true} />

          {instantiateObjects()}

          <Man scale={0.01} position={[3, 1.3, 0]} />
          {target && <TransformControls object={target} mode={props.editMode} />}
          <OrbitControls makeDefault />
          {/* <Plane
            receiveShadow // highlight-line
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -1, 0]}
            args={[1000, 1000]}
            >
            <meshStandardMaterial attach="material" color="grey" />
            </Plane> */}
        </Suspense>
      </Canvas>
    </div>
  );
}
