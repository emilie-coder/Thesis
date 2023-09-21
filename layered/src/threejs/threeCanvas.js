import { Suspense, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls, ContactShadows, useGLTF, useCursor, PivotControls } from '@react-three/drei';
import { proxy, useSnapshot } from 'valtio';
import * as THREE from 'three';
import { Outline } from '@react-three/postprocessing'
import Man from './3dScenes/Man';
import { useDispatch, useSelector } from 'react-redux';
import { SET_OBJECT_IMAGE, selectObjectID, UNSET_OBJECT_IMAGE, selectObjectChosen } from '../redux/slice/objectImageSlice';




const textureCache = {}; // Texture cache to store loaded textures

function Model({ name, ...props }) {
  const selectedID = useSelector(selectObjectID);
  const dispatch = useDispatch();

  const { nodes } = useGLTF('/3dAssets/new_cylinder.glb');
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const materialColor = selectedID === name ? '#ADD8E6' : (hovered ? 'grey' : 'white');

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
    side: THREE.DoubleSide
  });

  newMaterial.alphaTest = 0.8;

  let myGeometry = nodes.mesh_0.geometry;
  if (props.objectType === 'plane') {
    myGeometry = new THREE.PlaneGeometry();
  }


  return (
    <mesh
      onClick={(e) => {
        e.stopPropagation();

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
      onPointerMissed={(e) => e.type === 'click' && (dispatch(UNSET_OBJECT_IMAGE()))}
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
      onMouseUp={(e) => 
        
        props.updateThreeObject(props.itemID, {
        position: e.object.position,
        scale: e.object.scale,
        rotation: e.object.rotation,
      })}
      
    />
  );
}

function Controls(props) {
  const selectedID = useSelector(selectObjectID);
  const ifSelected = useSelector(selectObjectChosen);
  const scene = useThree((state) => state.scene);

  const handleDrag = (event) => {

    // update the object here too
    const objectToUpdate = scene.getObjectByName(`${selectedID}`);

    const newPostion = {x: objectToUpdate.position.x, y: objectToUpdate.position.y, z: objectToUpdate.position.z};
    const newScale = {x: objectToUpdate.scale.x, y: objectToUpdate.scale.y, z: objectToUpdate.scale.z};
    const newRotation = {x:objectToUpdate.rotation._x, y: objectToUpdate.rotation._y, z:objectToUpdate.rotation._z};

    props.updateThreeObject(selectedID, {
      position: newPostion,
      scale: newScale,
      rotation: newRotation,
    });

  };

  return (
    <>
      {ifSelected && <TransformControls object={scene.getObjectByName(`${selectedID}`)} mode={props.editMode} onMouseUp={handleDrag}/>}
    </>
  );
}

export default function ThreeCanvas(props) {
  const sceneObjs = props.scene;


  const updateThreeObject = (objectID, newObjectData) => {

    props.updateObject(objectID, newObjectData);
  };

  const instantiateObjects = () => {
    const objectsToRender = [];

    if (sceneObjs && sceneObjs.objects) {
      sceneObjs.objects.forEach((item, index) => {
        objectsToRender.push(
          <Model
            name={`${index}`}
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
    <Canvas
        colorManagement
        shadowMap // highlight-line
        camera={{ position: [-3, 2, 5], fov: 90 }}
        linear
        flat
        >
      <pointLight position={[100, 100, 100]} intensity={0.8} />
      <hemisphereLight color="#ffffff" groundColor="#b9b9b9" position={[-7, 25, 13]} intensity={0.85} />
      <Suspense fallback={null}>
        {instantiateObjects()}
      </Suspense>
      <OrbitControls makeDefault />

      <Controls editMode={props.editMode} updateThreeObject={updateThreeObject}/>
    </Canvas>
  );
}