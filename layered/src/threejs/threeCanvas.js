import { Suspense, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls, ContactShadows, useGLTF, useCursor, Environment, useVideoTexture } from '@react-three/drei';
import { proxy, useSnapshot } from 'valtio';
import * as THREE from 'three';
import { Outline } from '@react-three/postprocessing'
import Man from './3dScenes/Man';
import { useDispatch, useSelector } from 'react-redux';
import { SET_OBJECT_IMAGE, selectObjectID, UNSET_OBJECT_IMAGE, selectObjectChosen } from '../redux/slice/objectImageSlice';
import AnimatedCylinder from './3dScenes/Animated_cylinder';
import TestAnim from './3dScenes/Test_anim';
import { REMOVE_EDITOR_STATE } from '../redux/slice/editorSlice';




const textureCache = {}; // Texture cache to store loaded textures

function Model({ name, ...props }) {
  const selectedID = useSelector(selectObjectID);
  const dispatch = useDispatch();

  const { nodes } = useGLTF('/3dAssets/new_cylinder.glb');
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const materialColor = selectedID === name ? '#ADD8E6' : (hovered ? 'grey' : 'white');

  const loadTexture = (textureUrl, tiling) => {
    const cacheKey = `${textureUrl}_${tiling[0]}_${tiling[1]}`;
    
    if (textureCache[cacheKey]) {
      return textureCache[cacheKey];
    } else {
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(textureUrl);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(tiling[0], tiling[1]);
      textureCache[cacheKey] = texture;
      return texture;
    }
  };

  const texture = loadTexture(props.materialString, props.tiling);

  let newMaterial;

  if (props.toggleSides) {
    newMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      color: materialColor,
      transparent: true,
      side: THREE.DoubleSide,
    });
  } else {
    newMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      color: materialColor,
      transparent: true,
    });
  }

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
        dispatch(REMOVE_EDITOR_STATE())
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

  const toggleSides = props.toggleSides;


  const [objectsToRender, setObjectsToRender] = useState([]);


  const [skyBoxes, setSkyBoxes ] = useState(["/imgs/belfast_sunset_puresky_4k.hdr" ,
                                              "/imgs/industrial_sunset_puresky_4k.hdr", 
                                              "/imgs/kloofendal_48d_partly_cloudy_puresky_4k.hdr",
                                               "/imgs/rathaus_4k.hdr",
                                                "/imgs/syferfontein_0d_clear_puresky_4k.hdr" ])

  const updateThreeObject = (objectID, newObjectData) => {
    props.updateObject(objectID, newObjectData);
  };

  useEffect(() => {
    // Update the objects to be rendered whenever sceneObjs changes
    const newObjectsToRender = instantiateObjects();
    setObjectsToRender(newObjectsToRender);
  }, [props.scene]);

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
            tiling={[item.tiling.x, item.tiling.y]}
            toggleSides = {props.toggleSides}
          />
        );
      });
    }

    return objectsToRender.length > 0 ? objectsToRender : null;
  };

  return (
    <Canvas
        camera={{ position: [-3, 2, 5], fov: 90 }}
        linear
        flat
        >
        {sceneObjs && skyBoxes[sceneObjs.details.SkyBox] && (
          <Environment files={skyBoxes[sceneObjs.details.SkyBox]} background blur={0.0} />
        )}
      <gridHelper args={[400, 200, '#f7f7f7', '#f7f7f7']} position={[0, -4, 0]} />
      <hemisphereLight color="#ffffff" groundColor="#b9b9b9" position={[-7, 25, 13]} intensity={0.85} />
      <Suspense fallback={null}>
        {instantiateObjects()}
        
        {/* <TestAnim  /> */}
      </Suspense>
      <OrbitControls makeDefault />
      <Man scale={0.01} position={[0,-1.7, 0]} />
      <Controls editMode={props.editMode} updateThreeObject={updateThreeObject}/>
    </Canvas>
  );
}
