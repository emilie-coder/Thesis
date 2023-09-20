import { Suspense, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls, ContactShadows, useGLTF, useCursor, PivotControls } from '@react-three/drei';
import { proxy, useSnapshot } from 'valtio';
import * as THREE from 'three';
import { Outline } from '@react-three/postprocessing'
import Man from './3dScenes/Man';
import { useDispatch } from 'react-redux';
import { SET_OBJECT_IMAGE } from '../redux/slice/objectImageSlice';

const state = proxy({ current: null, mode: 0 });
const textureCache = {}; // Texture cache to store loaded textures

function Model({ name, ...props }) {
  const dispatch = useDispatch();


  const snap = useSnapshot(state);
  const { nodes } = useGLTF('/3dAssets/new_cylinder.glb');
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const materialColor = snap.current === name ? '#ADD8E6' : (hovered ? 'grey' : 'white');

  const loadTexture = (textureUrl) => {
    if (textureCache[textureUrl]) {
      return textureCache[textureUrl];
    } else {
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(textureUrl);
      textureCache[textureUrl] = texture;
      return texture;
    }
  };

  const texture = loadTexture(props.materialString);

  const newMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    color: materialColor,
    transparent: true,
  });

  newMaterial.alphaTest = 0.8;

  let myGeometry = nodes.mesh_0.geometry;
  if (props.objectType === 'plane') {
    myGeometry = new THREE.PlaneGeometry();
  }

  const handleDrag = (event) => {
    console.log('Drag event:', event);
  };

  return (
    // <PivotControls onDragEnd ={console.log('ahh')} visible={state.current === name}>
    <mesh
      onClick={(e) => {
        e.stopPropagation();
        state.current = name;
        props.updateThreeObject(props.itemID, {
          position: e.object.position,
          scale: e.object.scale,
          rotation: e.object.rotation,
        });
        const objectInfo = {
          objectName: props.itemName,
          objectID: props.itemID,
          objectMaterial: props.materialString,
        };
    
        // Dispatch the project information to Redux
        dispatch(SET_OBJECT_IMAGE(objectInfo));
      }}
      onPointerMissed={(e) => e.type === 'click' && (state.current = null)}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => setHovered(false)}
      onDrag={handleDrag} // Add onDrag event listener
      name={name}
      geometry={myGeometry}
      material={newMaterial}
      {...props}
      dispose={null}
      className={hovered ? 'hovered' : ''}
      
    />
    // </PivotControls>
  );
}

function Controls(props) {
  const snap = useSnapshot(state);
  const scene = useThree((state) => state.scene);

  return (
    <>
      {snap.current && <TransformControls object={scene.getObjectByName(snap.current)} mode={props.editMode} onDrag={console.log('on drag')}/>}
    </>
  );
}

export default function ThreeCanvas(props) {
  const sceneObjs = props.scene;

  const updateThreeObject = (objectID, newObjectData) => {
    console.log(" in three canvas props ");
    console.log(objectID, newObjectData);
    props.updateObject(objectID, newObjectData);
  };

  const instantiateObjects = () => {
    const objectsToRender = [];

    if (sceneObjs && sceneObjs.objects) {
      sceneObjs.objects.forEach((item, index) => {
        objectsToRender.push(
          <Model
            name={`name_${index}`}
            key={index}
            position={[item.position.x, item.position.y, item.position.z]}
            rotation={[item.rotation.x, item.rotation.y, item.rotation.z]}
            scale={[item.scale.x, item.scale.y, item.scale.z]}
            materialString={item.material}
            itemName={item.objectTypeName}
            itemID={index}
            objectType={item.objectTypeName}
            updateThreeObject={updateThreeObject}
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

      <Controls editMode={props.editMode}/>
    </Canvas>
  );
}
