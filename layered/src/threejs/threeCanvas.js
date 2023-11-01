import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
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
    const itemRef = useRef();

  const materialColor = selectedID === name ? '#ADD8E6' : (hovered ? 'grey' : 'white');

  const loadTexture = (textureUrl, tiling, textureType) => {
    const cacheKey = `${textureUrl}_${tiling[0]}_${tiling[1]}`;
    
    if (textureCache[cacheKey]) {
      return textureCache[cacheKey];
    } else {



      if(textureType === "image"){
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(textureUrl);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(tiling[0], tiling[1]);
        textureCache[cacheKey] = texture;
        return texture;

      } else if(textureType === "video"){

        let video = document.getElementById(textureUrl);

        if(video !== null){
          let videoTexture = new THREE.VideoTexture(video);
          videoTexture.minFilter = THREE.LinearFilter;
          videoTexture.magFilter = THREE.LinearFilter;
          // videoTexture.repeat.set(tiling[0], tiling[1]);
          return videoTexture;
        }
      }

    }
  };




  let thisBlendMode = THREE.NormalBlending;

  if(props.blendMode === 1){
    thisBlendMode = THREE.NormalBlending ;
  } else if(props.blendMode === 2){
    thisBlendMode = THREE.AdditiveBlending;
  } else if(props.blendMode === 3){
    thisBlendMode = THREE.SubtractiveBlending;
  } else if(props.blendMode === 4){
    thisBlendMode = THREE.MultiplyBlending 
  }


  let newMaterial;

  if(props.materialType !== 'solid'){
    const texture = loadTexture(props.materialString, props.tiling, props.materialType);
    if (!props.toggleSides) {
      newMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        color: materialColor,
        transparent: true,
        side: THREE.DoubleSide,
        blending: thisBlendMode,
      });
    } else {
      newMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        color: materialColor,
        transparent: true,
        blending: thisBlendMode,
      });
    }

  } else {
      // Scale RGB components to the range [0, 1]
      const r = props.colorValues.r / 256;
      const g = props.colorValues.g / 256;
      const b = props.colorValues.b / 256;
      const a = props.colorValues.a ;  // Alpha is already in the correct range [0, 1]

      const materialColor = new THREE.Color(r, g, b);



      if (!props.toggleSides) {
        newMaterial = new THREE.MeshBasicMaterial({
          color: materialColor,
          transparent: true,
          side: THREE.DoubleSide,
          opacity: a,
          blending: thisBlendMode,
        });
      } else {
        newMaterial = new THREE.MeshBasicMaterial({
          color: materialColor,
          transparent: true,
          opacity: a,
          blending: thisBlendMode,
        });
    }
    
  }

  newMaterial.alphaTest = .1;
  newMaterial.depthTest = 0.9;

  let myGeometry = nodes.mesh_0.geometry;
  if (props.objectType === 'plane') {
    myGeometry = new THREE.PlaneGeometry();
  }




   // if(props.animation !== null ){
    useFrame(({ clock }) => {

      if(props.playPause){
        if(props.rotationSpeed){

          const a = clock.getElapsedTime();
  
    
          itemRef.current.rotation.x = props.rotation[0] + a*props.rotationSpeed[0];
          itemRef.current.rotation.y = props.rotation[1] + a*props.rotationSpeed[1];
          itemRef.current.rotation.z = props.rotation[2] + a*props.rotationSpeed[2];

  
      //   }

      }

      }

    });
  



  return (
    <mesh
      ref={itemRef}
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
  const playPause = props.playPause;
  const [objectsToRender, setObjectsToRender] = useState([]);
  const [skyBoxes, setSkyBoxes ] = useState([
    "/hdriskies/alps_field_4k.hdr",
    "/hdriskies/autumn_forest_04_4k.hdr",
    "/hdriskies/belfast_sunset_4k.hdr",
    "/hdriskies/belfast_sunset_puresky_4k.hdr",
    "/hdriskies/cape_hill_4k.exr",
    "/hdriskies/clarens_midday_4k.hdr",
    "/hdriskies/dancing_hall_4k.hdr",
    "/hdriskies/dikhololo_night_4k.hdr",
    "/hdriskies/drackenstein_quarry_puresky_4k.hdr",
    "/hdriskies/evening_meadow_4k.hdr",
    "/hdriskies/evening_road_01_puresky_4k.hdr",
    "/hdriskies/forest_grove_4k.hdr",
    "/hdriskies/fouriesburg_mountain_cloudy_4k.hdr",
    "/hdriskies/fouriesburg_mountain_lookout_2_4k.hdr",
    "/hdriskies/fouriesburg_mountain_midday_4k.hdr",
    "/hdriskies/gamrig_4k.hdr",
    "/hdriskies/hilly_terrain_01_4k.hdr",
    "/hdriskies/hilly_terrain_01_puresky_4k.hdr",
    "/hdriskies/industrial_sunset_02_puresky_4k.hdr",
    "/hdriskies/industrial_sunset_puresky_4k.hdr",
    "/hdriskies/kiara_1_dawn_4k.hdr",
    "/hdriskies/kloofendal_43d_clear_puresky_4k.hdr",
    "/hdriskies/kloofendal_48d_partly_cloudy_puresky_4k.hdr",
    "/hdriskies/kloofendal_overcast_puresky_4k.hdr",
    "/hdriskies/kloppenheim_04_4k.hdr",
    "/hdriskies/kloppenheim_06_puresky_4k.hdr",
    "/hdriskies/lilienstein_4k.hdr",
    "/hdriskies/meadow_4k.hdr",
    "/hdriskies/montorfano_4k.hdr",
    "/hdriskies/moonless_golf_4k.hdr",
    "/hdriskies/mud_road_puresky_4k.hdr",
    "/hdriskies/preller_drive_4k.hdr",
    "/hdriskies/promenade_de_vidy_4k.hdr",
    "/hdriskies/rainforest_trail_4k.hdr",
    "/hdriskies/sandsloot_4k.hdr",
    "/hdriskies/satara_night_4k.hdr",
    "/hdriskies/scythian_tombs_2_4k.hdr",
    "/hdriskies/shudu_lake_4k.hdr",
    "/hdriskies/snowy_park_01_4k.hdr",
    "/hdriskies/spaichingen_hill_4k.hdr",
    "/hdriskies/spruit_sunrise_4k.hdr",
    "/hdriskies/studio_small_08_4k.hdr",
    "/hdriskies/syferfontein_0d_clear_puresky_4k.hdr",
    "/hdriskies/table_mountain_2_puresky_4k.hdr",
    "/hdriskies/unfinished_office_4k.hdr",
    "/hdriskies/wasteland_clouds_puresky_4k.hdr"
    
])




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
            rotation={[
              THREE.MathUtils.degToRad(item.rotation.x),
              THREE.MathUtils.degToRad(item.rotation.y),
              THREE.MathUtils.degToRad(item.rotation.z)
            ]}
            rotationSpeed={[
              THREE.MathUtils.degToRad(item.rotationSpeed.x),
              THREE.MathUtils.degToRad(item.rotationSpeed.y),
              THREE.MathUtils.degToRad(item.rotationSpeed.z)
            ]}
            // rotation={[item.rotation.x, item.rotation.y, item.rotation.z]}
            // rotationSpeed={[item.rotationSpeed.x, item.rotationSpeed.y, item.rotationSpeed.z]}
            scale={[item.scale.x, item.scale.y, item.scale.z]}
            materialString={item.material}
            itemName={item.objectTypeName}
            itemID={index}
            objectType={item.objectTypeName}
            updateThreeObject={updateThreeObject}
            tiling={[item.tiling.x, item.tiling.y]}
            toggleSides = {props.toggleSides}
            materialType = {item.materialType}
            colorValues = {item.solidColor}
            blendMode = {item.blendMode}
            animation = {item.animation}
            playPause = {playPause}
          />
        );
      });
    }

    return objectsToRender.length > 0 ? objectsToRender : null;
  };


  
  return (
    <>

      <Canvas
        camera={{ position: [-3, 2, 5], fov: 90 }}
        linear
        flat
        >
        {sceneObjs && skyBoxes[sceneObjs.details.SkyBox] && sceneObjs.details.SkyBox !== 100 && (
          <Environment files={skyBoxes[sceneObjs.details.SkyBox]} background blur={0.0} />
        )}
      <gridHelper args={[400, 200, '#f7f7f7', '#f7f7f7']} position={[0, -4, 0]} />
      <hemisphereLight color="#ffffff" groundColor="#b9b9b9" position={[-7, 25, 13]} intensity={0.85} />
      <Suspense fallback={null}>
        {instantiateObjects()}

      </Suspense>
      <OrbitControls makeDefault />
      <Man scale={0.01} position={[0,-1.7, 0]} />
      <Controls editMode={props.editMode} updateThreeObject={updateThreeObject}/>
    </Canvas>
    </>

  );
}
