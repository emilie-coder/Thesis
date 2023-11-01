import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  SET_ACTIVE_PROJECT,
  SET_PROJECT_TITLE,
  selectProjectID,
  selectProjectTitle,
} from '../../redux/slice/projectSlice';
import { fetchProject, storage, updateObjectTexture } from '../../firebase/config';
import { selectUserID } from '../../redux/slice/authSlice';
import { v4 } from 'uuid';
import {
  ref,
  uploadBytes,
  listAll,
  getDownloadURL,
} from 'firebase/storage';

import templateCSS from './Template.module.css';
import { updateProjectTitle, updateProject, createTemplate } from '../../firebase/config';
import { useLocation } from 'react-router-dom';
import { selectObjectID, selectObjectChosen, selectObjectMaterial, SET_OBJECT_MATERIAL, SET_OBJECT_IMAGE, UNSET_OBJECT_IMAGE } from '../../redux/slice/objectImageSlice';
import NewCanvas from '../../threejs/threeCanvas';
import { REMOVE_EDITOR_STATE, SET_EDITOR_STATE, selectNonIndexState, selectNonIndexStateBool } from '../../redux/slice/editorSlice';

import { ChromePicker } from "react-color";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronUp, faCircle, faCircleHalfStroke, faClone, faEye, faEyeSlash, faMaximize, faMinus, faMultiply, faO, faPause, faPenToSquare, faPlay, faPlus, faRedo, faRotate, faSave, faShare, faSquare, faTrash, faUndo, faUpDownLeftRight, faVolumeHigh, faVolumeMute } from '@fortawesome/free-solid-svg-icons'


const Editor = () => {

  const dispatch = useDispatch();
  const projID = useSelector(selectProjectID);
  const projTitle = useSelector(selectProjectTitle);


  const selectedObjectID = useSelector(selectObjectID);
  const selectedObjectChosen = useSelector(selectObjectChosen);
  const selectedObjectMaterial = useSelector(selectObjectMaterial);

  const [imageUpload, setImageUpload] = useState(null);
  const [coverImageUpload, setCoverImageUpload] = useState(null);

  const [imageList, setImageList] = useState([]);


  const [videoUpload, setVideoUpload] = useState(null);
  const [videoList, setVideoList] = useState([]);


  const [stockImageList, setStockImageList] = useState([]);
  const [stockVideoList, setStockVideoList] = useState([]);


  const [stockAssetMode, setStockAssetMode] = useState(false);

  const userID = useSelector(selectUserID);

  const [isEditingTitle, setIsEditingTitle] = useState(false); // State to track if the title is being edited
  const [editedTitle, setEditedTitle] = useState(projTitle); // State to hold the edited title
  const [projectScene, setProjectScene] = useState(null);

  // i keep losing data when refreshing so...
  // Get the current location using useLocation
  const location = useLocation();
  const pathSegments = location.pathname.split('/');
  const projectIDURL = pathSegments[pathSegments.length - 1]; // Get the last part of the URL
  const [editMode, setEditMode] = useState('translate');


  const [lastSelectedImage, setLastSelectedImage] = useState(null);
  const [lastSelectedVideo, setLastSelectedVideo] = useState(null);

  const [toggleSides, setToggleSides] = useState(true);
  const [copiedObject, setCopiedObject] = useState({});

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);


  const [playAudio, setPlayAudio] = useState(false);
  const [playPause, setPlayPause] = useState(false);


  const toggleAudio = () => {
    setPlayAudio(!playAudio);
  }

  const togglePlayPause = () => {
    setPlayPause(!playPause);
  }


  const [skyBoxes, setSkyBoxes ] = useState([
    "/webpngs/alps_field.webp",
    "/webpngs/autumn_forest_04.webp",
    "/webpngs/belfast_sunset.webp",
    "/webpngs/belfast_sunset_puresky.webp",
    "/webpngs/cape_hill.webp",
    "/webpngs/clarens_midday.webp",
    "/webpngs/dancing_hall.webp",
    "/webpngs/dikhololo_night.webp",
    "/webpngs/drackenstein_quarry_puresky.webp",
    "/webpngs/evening_meadow.webp",
    "/webpngs/evening_road_01_puresky.png.webp",
    "/webpngs/forest_grove.webp",
    "/webpngs/fouriesburg_mountain_cloudy.webp",
    "/webpngs/fouriesburg_mountain_lookout_2.webp",
    "/webpngs/fouriesburg_mountain_midday.webp",
    "/webpngs/gamrig.webp",
    "/webpngs/hilly_terrain_01.webp",
    "/webpngs/hilly_terrain_01_puresky.webp",
    "/webpngs/industrial_sunset_02_puresky.webp",
    "/webpngs/industrial_sunset_puresky.webp",
    "/webpngs/kiara_1_dawn.webp",
    "/webpngs/kloofendal_43d_clear_puresky.webp",
    "/webpngs/kloofendal_48d_partly_cloudy_puresky.webp",
    "/webpngs/kloofendal_overcast_puresky.webp",
    "/webpngs/kloppenheim_04.webp",
    "/webpngs/kloppenheim_06_puresky.webp",
    "/webpngs/lilienstein.webp",
    "/webpngs/meadow.webp",
    "/webpngs/montorfano.webp",
    "/webpngs/moonless_golf.webp",
    "/webpngs/mud_road_puresky.webp",
    "/webpngs/preller_drive.webp",
    "/webpngs/promenade_de_vidy.webp",
    "/webpngs/rainforest_trail.webp",
    "/webpngs/sandsloot.webp",
    "/webpngs/satara_night.webp",
    "/webpngs/scythian_tombs_2.webp",
    "/webpngs/shudu_lake.webp",
    "/webpngs/snowy_park_01.webp",
    "/webpngs/spaichingen_hill.webp",
    "/webpngs/spruit_sunrise.webp",
    "/webpngs/studio_small_08.webp",
    "/webpngs/syferfontein_0d_clear_puresky.webp",
    "/webpngs/table_mountain_2_puresky.webp",
    "/webpngs/unfinished_office.webp",
    "/webpngs/wasteland_clouds_puresky.webp"

  ])
  

  const updateProjectScene = (updatedScene) => {
    setUndoStack((prevUndoStack) => [...prevUndoStack, projectScene]);
    setProjectScene(updatedScene);
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length > 0) {
      const prevScene = undoStack[undoStack.length - 1];
      setProjectScene(JSON.parse(JSON.stringify(prevScene)));  // Set the new projectScene
      setUndoStack((prevUndoStack) => prevUndoStack.slice(0, -1));
      setRedoStack((prevRedoStack) => [...prevRedoStack, prevScene]); // Store the current state in redo stack
    }
  };
  
  const redo = () => {
    if (redoStack.length > 0) {
      const nextScene = redoStack[redoStack.length - 1];
      setProjectScene(nextScene);
  
      setUndoStack((prevUndoStack) => [...prevUndoStack, projectScene]);
      setRedoStack((prevRedoStack) => prevRedoStack.slice(0, -1));
    }
  };
  


  const handleImageClick = (url) => {
    setLastSelectedImage(url);
  };

  const handleVideoClick = (url) => {
    setLastSelectedVideo(url);
  }

  const copyObject = () => {
    if(selectObjectChosen && selectObjectID){
      if(projectScene){
        const temp = projectScene.objects[selectedObjectID];
        setCopiedObject(temp);
      }
    }

  }

  const addCylinder = () => {
    // console.log('here----');
    // Ensure that projectScene and projectScene.objects exist
    if (!projectScene || !projectScene.objects) {
      console.error("projectScene or projectScene.objects is not defined.");
      return;
    }
  
    // Create a new cylinder object with an ID one greater than the maximum
    const newCylinder = {
      // objectID: maxId + 1, // Assign the next available ID
      objectTypeName: "cylinder", // You can customize this
      objectType: "1", // You can customize this
      material: "https://firebasestorage.googleapis.com/v0/b/layered-5fb29.appspot.com/o/sqaure.png?alt=media&token=dd1d81ad-6eb2-4048-a518-576ce1a8766a", // Customize with your material
      position: { x: 0, y: 0, z: 0 }, // Set the initial position
      rotation: { x: 0, y: 0, z: 0 }, // Set the initial rotation
      rotationSpeed: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }, // Set the initial scale
      tiling: { x: 1, y: 1}, // Set the initial scale
      materialType: "solid",
      solidColor: {
        r: 255,
        g: 255,
        b: 255,
      },
      blendMode: 1,
    };
  
    // Append the new cylinder object to projectScene.objects
    let maxId = projectScene.objects.push(newCylinder) - 1;
    // console.log(maxId);

  
    // Now you have added a new cylinder object to your projectScene
    // console.log("New plane added:", newPlane);

      const objectInfo = {
        objectName: projectScene.objects[maxId].objectTypeName,
        objectID: maxId,
        objectMaterial: projectScene.objects[maxId].material,
      };
  
      // Dispatch the project information to Redux
      dispatch(SET_OBJECT_IMAGE(objectInfo));

      setUndoStack((prevUndoStack) => [...prevUndoStack, projectScene]);
      setRedoStack([]);
  };
  
  const addObject = () => {
    if (copiedObject && copiedObject !== null) {
      if (projectScene && projectScene.objects) {
        const duplicatedObject = JSON.parse(JSON.stringify(copiedObject)); // Create a deep copy of the selected object
        duplicatedObject.objectID = projectScene.objects.length; // Assign a new ID for the duplicated object
        duplicatedObject.position.x += 0.1;
        duplicatedObject.position.y += 0.1;
        duplicatedObject.position.z += 0.1;

        projectScene.objects.push(duplicatedObject); // Push the duplicated object into the objects array
        setProjectScene((prevScene) => ({
          ...prevScene,
          objects: [...prevScene.objects], // Ensure state change by creating a new array reference
        }));
  
        // Dispatch an action to update the Redux state
        dispatch(
          SET_OBJECT_IMAGE({
            objectName: duplicatedObject.objectTypeName,
            objectID: duplicatedObject.objectID,
            objectMaterial: duplicatedObject.material,
          })
        );
      }
    }
  };



  const addPlane = () => {
    // Ensure that projectScene and projectScene.objects exist
    if (!projectScene || !projectScene.objects) {
      console.error("projectScene or projectScene.objects is not defined.");
      return;
    }

  
    // Create a new cylinder object with an ID one greater than the maximum
    const newPlane = {
      // objectID: maxId + 1, // Assign the next available ID
      objectTypeName: "plane", // You can customize this
      objectType: "0", // You can customize this
      material: "https://firebasestorage.googleapis.com/v0/b/layered-5fb29.appspot.com/o/sqaure.png?alt=media&token=dd1d81ad-6eb2-4048-a518-576ce1a8766a", // Customize with your material
      position: { x: 0, y: 0, z: 0 }, // Set the initial position
      rotation: { x: 0, y: 0, z: 0 }, // Set the initial rotation
      rotationSpeed: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }, // Set the initial scale
      tiling: { x: 1, y: 1}, // Set the initial scale
      materialType: "solid",
      solidColor: {
        r: 255,
        g: 255,
        b: 255,
      },
      blendMode: 1,
    };
  
    // Append the new cylinder object to projectScene.objects
    let maxId = projectScene.objects.push(newPlane) - 1;
    // console.log(maxId);

  
    // Now you have added a new cylinder object to your projectScene
    // console.log("New plane added:", newPlane);

      const objectInfo = {
        objectName: projectScene.objects[maxId].objectTypeName,
        objectID: maxId,
        objectMaterial: projectScene.objects[maxId].material,
      };
  
      // Dispatch the project information to Redux
      dispatch(SET_OBJECT_IMAGE(objectInfo));

      setUndoStack((prevUndoStack) => [...prevUndoStack, projectScene]);
      setRedoStack([]);

  };
  
  const handleKeyPress = useCallback((event) => {
    // console.log(`Key pressed: ${event.key}`);

    if(event.key === 'w') {
      setEditMode('translate');
    } else if(event.key ==='r') {
      setEditMode('scale');
    } else if(event.key ==='e') {
      setEditMode('rotate');
    } else if(event.metaKey && event.key === 'x'){
      deleteObject();
    }  else if (event.metaKey && event.key === 'p') {
      event.preventDefault(); // Prevent the default save behavior
      if (projectScene && projectScene.objects) {
        addPlane();
      }
    //----------- save project -------------------
    } else if (event.metaKey && event.key === 'o') {
      event.preventDefault(); // Prevent the default save behavior
      if (projectScene && projectScene.objects) {
        addCylinder();
      }
    }
     else if (event.metaKey && event.key === 's') {
      event.preventDefault(); // Prevent the default save behavior
      saveProject();

    //----------- copy selected item -------------------
    } else if (event.metaKey && event.key === 'c') {
      event.preventDefault(); // Prevent the default save behavior
      copyObject();
      // console.log(copiedObject);
    } 
    //----------- paste selected item -------------------
    else if (event.metaKey && event.key === 'v') {
      event.preventDefault(); // Prevent the default save behavior
      addObject();

    //----------- duplicate selected item -------------------
    } else if (event.metaKey && event.key === 'd') {
      event.preventDefault(); // Prevent the default save behavior
      duplicateObject();

    }
    else if (event.metaKey && event.shiftKey && event.key === 'z') {
      event.preventDefault();
      redo();
    }
    else if (event.metaKey && event.key === 'z') {
      event.preventDefault(); // Prevent the default save behavior
      undo();

    }


  }, [projectScene, addPlane]);

  useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    // attach the event listener
  }, [copiedObject]);




  // Fetch and update project data when the component mounts
  useEffect(() => {
    // Fetch and update project data when the component mounts
    const fetchProjectData = async () => {
      try {
        // Fetch the project data using your fetchProject function
        const projectData = await fetchProject(userID, projectIDURL);
        
        // Create an object to hold the project information
        const projectInfo = {
          projectID: projectIDURL,
          projectTitle: projectData.title,
          projectTemplate: projectData.projectTemplate,
          projectTemplateInteger: projectData.templateID,
          projectTimeCreated: projectData.timeCreated,
          projectTimeLastSaved: projectData.timeLastSaved,
          projectAuthor: projectData.author,
        };
  
        // Dispatch the project information to Redux
        dispatch(SET_ACTIVE_PROJECT(projectInfo));
  
        // Update the editedTitle state
        setEditedTitle(projectData.title);
        setProjectScene(projectData.projectScene);
        // ... update other relevant states here
      } catch (error) {
        // console.error('Error fetching project:', error);
      }
    };
  
    fetchProjectData();
  }, [dispatch, projectIDURL, userID]);
   


  const uploadImage = () => {
    if (imageUpload == null) return;

    const imageRef = ref(
      storage,
      userID + '/project_' + projID + `/images/${imageUpload.name + v4()}`
    );

    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setCoverImageUpload(url);
      });
    });
  };


  const uploadCoverImage = () => {
    if (coverImageUpload == null) return;

    const coverImageRef = ref(
      storage,
      userID + '/project_' + projID + `/coverImage/${coverImageUpload.name + v4()}`
    );

    uploadBytes(coverImageRef, coverImageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setProjectScene((prevScene) => ({
          ...prevScene,
          templateCover: url,
        }));

      });
    });
  };


  const uploadVideo = () => {
    if (videoUpload == null) return;

    const videoRef = ref(
      storage,
      userID + '/project_' + projID + `/videos/${videoUpload.name + v4()}`
    );

    uploadBytes(videoRef, videoUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setVideoList((prev) => [...prev, url]);
      });
    });
  };



    useEffect(() => {
      if (!userID || !projID) {
        // console.warn('userID or projID is not available.');
        return;
      }
    
      const imageListRef = ref(storage, userID + '/project_' + projID + '/images');
    
      listAll(imageListRef)
        .then((response) => {
          response.items.forEach((item) => {
            getDownloadURL(item)
              .then((url) => {
                setImageList((prev) => [...prev, url]);
              })
              .catch((error) => {
                console.error('Error getting download URL:', error);
              });
          });
        })
        .catch((error) => {
          console.error('Error listing images:', error);
        });
    




        const videoListRef = ref(storage, userID + '/project_' + projID + '/videos');
    
        listAll(videoListRef)
          .then((response) => {
            response.items.forEach((item) => {
              getDownloadURL(item)
                .then((url) => {
                  setVideoList((prev) => [...prev, url]);
                })
                .catch((error) => {
                  console.error('Error getting download URL:', error);
                });
            });
          })
          .catch((error) => {
            console.error('Error listing images:', error);
          });




          // const [stockImageList, setStockImageList] = useState([]);
          // const [stockVideoList, setStockVideoList] = useState([]);


          const stockImageListRef = ref(storage, 'stock/images');
    
          listAll(stockImageListRef)
            .then((response) => {
              response.items.forEach((item) => {
                getDownloadURL(item)
                  .then((url) => {
                    setStockImageList((prev) => [...prev, url]);
                  })
                  .catch((error) => {
                    console.error('Error getting download URL:', error);
                  });
              });
            })
            .catch((error) => {
              console.error('Error listing images:', error);
            });
        
    
    
    
    
            const stockVideoListRef = ref(storage, 'stock/videos');
        
            listAll(stockVideoListRef)
              .then((response) => {
                response.items.forEach((item) => {
                  getDownloadURL(item)
                    .then((url) => {
                      setStockVideoList((prev) => [...prev, url]);
                    })
                    .catch((error) => {
                      console.error('Error getting download URL:', error);
                    });
                });
              })
              .catch((error) => {
                console.error('Error listing images:', error);
              });
    }, [userID, projID]);  


  // Function to handle title editing
  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  // Function to handle title change
  const handleTitleChange = (e) => {
    setEditedTitle(e.target.value);
  };

  // Function to handle title update
  const handleTitleUpdate = () => {
    setIsEditingTitle(false);
  
    // Check if editedTitle is empty, and if it is, fallback to projTitle
    const titleToDispatch = editedTitle;
  
    // Dispatch the action to update the title
    dispatch(SET_PROJECT_TITLE({ projectTitle: titleToDispatch }));

    // update firebase
    updateProjectTitle(userID, editedTitle, projID);
  };
  
    const updateTarget = (index) => {
      // console.log('Clicked index:', index);
  
      const objectInfo = {
        objectName: projectScene.objects[index].objectTypeName,
        objectID: index,
        objectMaterial: projectScene.objects[index].material,
      };
  
      // Dispatch the project information to Redux
      dispatch(SET_OBJECT_IMAGE(objectInfo));
      dispatch(REMOVE_EDITOR_STATE())


  };


    
  const removeTarget = (stateName) => {
    // console.log('Clicked skybox');

    const nonIndexState = {
      state: stateName,
    };

    // Dispatch the project information to Redux
    dispatch(SET_EDITOR_STATE(nonIndexState));
    dispatch(UNSET_OBJECT_IMAGE());


};

const BroadStateTab = () => {
  const nonIndexState = useSelector(selectNonIndexStateBool);
  const selectedNonIndexState = useSelector(selectNonIndexState)

  let tabClassName1 = templateCSS.unselectedTab;
  let tabClassName2 = templateCSS.unselectedTab;
  let tabClassName3 = templateCSS.unselectedTab;

  if( nonIndexState && selectedNonIndexState === 'SkyBox'){
    tabClassName1 = templateCSS.selectedTab;
  }
  else if (nonIndexState && selectedNonIndexState === 'Main') {
    tabClassName2 = templateCSS.selectedTab;
  }
  else if (nonIndexState && selectedNonIndexState === 'Audio') {
    tabClassName3 = templateCSS.selectedTab;
  }


  return (
    <>
        <div className={`${tabClassName1}`} onClick={() => removeTarget('SkyBox')}>
          Sky
        </div>
        <div className={`${tabClassName3}`} onClick={() => removeTarget('Audio')}>
          Audio
        </div>
        <div className={`${tabClassName2}`} onClick={() => removeTarget('Main')}>
          Main
        </div>
    </>
  );
};

const instantiateBroadStateTabs = () => {

  return (
    <BroadStateTab />
  )
}


  const instantiateTabs = (sceneObjs) => {
  
  
    if (sceneObjs && sceneObjs.objects) {
      return sceneObjs.objects.map((item, index) => {
        const isSelected = index === selectedObjectID;
  
        const tabClassName = isSelected ? templateCSS.selectedTab : templateCSS.unselectedTab;
        const tabKey = `tabID_${index}`;
  
        return (
          <div
            key={tabKey}
            className={`${tabClassName}`}
            onClick={() => updateTarget(index)}  // Call updateTarget on click
          >
            {index}_{item.objectTypeName}
          </div>
        );
      });
    }
  
    return null;
  };


  const instantiateVideoBuffers = (sceneObjs) => {
    const uniqueMaterials = new Set();
  
    if (sceneObjs && sceneObjs.objects) {
      return sceneObjs.objects.map((item, index) => {
        if (item.materialType === 'video' && !uniqueMaterials.has(item.material)) {
          uniqueMaterials.add(item.material);
  
          return (
            <div key={index}>
              <video
                crossOrigin="anonymous"
                id={item.material}
                playsInline
                muted
                loop
                autoPlay
                width="100"
                src={item.material}
              />
            </div>
          );
        }
  
        return null;
      });
    }
  
    return null;
  };
  




  const instantiateTextureOptionTabs = () => {
    let tabClassName1 = templateCSS.unselectedTextureTab;
    let tabClassName2 = templateCSS.unselectedTextureTab;
    let tabClassName3 = templateCSS.unselectedTextureTab;

    if( projectScene.objects[selectedObjectID].materialType === 'image'){
      tabClassName1 = templateCSS.selectedTextureTab;
    } else if( projectScene.objects[selectedObjectID].materialType === 'video'){
      tabClassName2 = templateCSS.selectedTextureTab;
    } else if( projectScene.objects[selectedObjectID].materialType === 'solid'){
      tabClassName3 = templateCSS.selectedTextureTab;
    }
  

    return( 
      <div className = {templateCSS.textureTypeOptions}>
           <div className={`${tabClassName1}`}  onClick={() => setTextureType('image')}>
            image
          </div>
          <div className={`${tabClassName2}`}  onClick={() => setTextureType('video')}>
            video
          </div>
          <div className={`${tabClassName3}`}  onClick={() => setTextureType('solid')}>
            solid
          </div>
      </div>

    )
  }


  const handleGeometryPosX = (e) => {
    if (projectScene && projectScene.objects) {
      const updatedObjects = projectScene.objects.map((obj, index) => {
        if (index === selectedObjectID) {
          return {
            ...obj,
            position: {
              ...obj.position,
              x: parseFloat(e.target.value)  // Parse the value to a float
            }
          };
        }
        return obj;
      });
  
      // Update the undo and redo stacks
      setUndoStack((prevUndoStack) => [...prevUndoStack, projectScene]);
      setRedoStack([]);
  
      // Update the projectScene with the updated position
      setProjectScene((prevScene) => ({
        ...prevScene,
        objects: updatedObjects,
      }));
    }
  };

  const handleGeometryPosY = (e) => {
    if (projectScene && projectScene.objects) {
      const updatedObjects = projectScene.objects.map((obj, index) => {
        if (index === selectedObjectID) {
          return {
            ...obj,
            position: {
              ...obj.position,
              y: parseFloat(e.target.value)  // Parse the value to a float
            }
          };
        }
        return obj;
      });
  
      // Update the undo and redo stacks
      setUndoStack((prevUndoStack) => [...prevUndoStack, projectScene]);
      setRedoStack([]);
  
      // Update the projectScene with the updated position
      setProjectScene((prevScene) => ({
        ...prevScene,
        objects: updatedObjects,
      }));
    }
  };

  const handleGeometryPosZ = (e) => {
    if (projectScene && projectScene.objects) {
      const updatedObjects = projectScene.objects.map((obj, index) => {
        if (index === selectedObjectID) {
          return {
            ...obj,
            position: {
              ...obj.position,
              z: parseFloat(e.target.value)  // Parse the value to a float
            }
          };
        }
        return obj;
      });
  
      // Update the undo and redo stacks
      setUndoStack((prevUndoStack) => [...prevUndoStack, projectScene]);
      setRedoStack([]);
  
      // Update the projectScene with the updated position
      setProjectScene((prevScene) => ({
        ...prevScene,
        objects: updatedObjects,
      }));
    }
  };

const geometryPositions = (projectScene) => {

    if (projectScene){
      if(projectScene.objects && projectScene.objects.length !== 0){
        if(selectObjectChosen){
          return(
            <>
            <input placeholder="x value" type="number" value={projectScene.objects[selectedObjectID].position.x} onChange={handleGeometryPosX}/>
            <input placeholder="y value" type="number" value={projectScene.objects[selectedObjectID].position.y} onChange={handleGeometryPosY}/>
            <input placeholder="z value" type="number" value={projectScene.objects[selectedObjectID].position.z} onChange={handleGeometryPosZ}/>
            </>
          )
        }

      }
    }

    return(
      null
    );

  }


  const geometryRotationSpeed = (projectScene) => {

    if (projectScene){
      if(projectScene.objects && projectScene.objects.length !== 0){
        if(selectObjectChosen){
          return(
            <>
            <input placeholder="x value" type="number" value={projectScene.objects[selectedObjectID].rotationSpeed.x} onChange={handleRotationSpeedX}/>
            <input placeholder="y value" type="number" value={projectScene.objects[selectedObjectID].rotationSpeed.y} onChange={handleRotationSpeedY}/>
            <input placeholder="z value" type="number" value={projectScene.objects[selectedObjectID].rotationSpeed.z} onChange={handleRotationSpeedZ}/>
            </>
          )
        }

      }
    }

    return(
      null
    );

  }




const handleGeometryScaleX = (e) => {
  if (projectScene && projectScene.objects) {
    const updatedObjects = projectScene.objects.map((obj, index) => {
      if (index === selectedObjectID) {
        return {
          ...obj,
          scale: {
            ...obj.scale,
            x: parseFloat(e.target.value)  // Parse the value to a float
          }
        };
      }
      return obj;
    });

    // Update the undo and redo stacks
    setUndoStack((prevUndoStack) => [...prevUndoStack, projectScene]);
    setRedoStack([]);

    // Update the projectScene with the updated position
    setProjectScene((prevScene) => ({
      ...prevScene,
      objects: updatedObjects,
    }));
  }
};

const handleGeometryScaleY = (e) => {
  if (projectScene && projectScene.objects) {
    const updatedObjects = projectScene.objects.map((obj, index) => {
      if (index === selectedObjectID) {
        return {
          ...obj,
          scale: {
            ...obj.scale,
            y: parseFloat(e.target.value)  // Parse the value to a float
          }
        };
      }
      return obj;
    });

    // Update the undo and redo stacks
    setUndoStack((prevUndoStack) => [...prevUndoStack, projectScene]);
    setRedoStack([]);

    // Update the projectScene with the updated position
    setProjectScene((prevScene) => ({
      ...prevScene,
      objects: updatedObjects,
    }));
  }
};


const handleGeometryScaleZ = (e) => {
  if (projectScene && projectScene.objects) {
    const updatedObjects = projectScene.objects.map((obj, index) => {
      if (index === selectedObjectID) {
        return {
          ...obj,
          scale: {
            ...obj.scale,
            z: parseFloat(e.target.value)  // Parse the value to a float
          }
        };
      }
      return obj;
    });

    // Update the undo and redo stacks
    setUndoStack((prevUndoStack) => [...prevUndoStack, projectScene]);
    setRedoStack([]);

    // Update the projectScene with the updated position
    setProjectScene((prevScene) => ({
      ...prevScene,
      objects: updatedObjects,
    }));
  }
};

  
const geometryScales = (projectScene) => {
  if (projectScene){
    if(projectScene.objects && projectScene.objects.length !== 0){
      if(selectObjectChosen){
      return(
        <>
        <input placeholder="x value" type="number" value={projectScene.objects[selectedObjectID].scale.x} onChange={handleGeometryScaleX}/>
        <input placeholder="y value" type="number" value={projectScene.objects[selectedObjectID].scale.y} onChange={handleGeometryScaleY}/>
        <input placeholder="z value" type="number" value={projectScene.objects[selectedObjectID].scale.z} onChange={handleGeometryScaleZ}/>
        </>
      )
    }
  }
  }

  return(
    null
  );

}




const handleRotationSpeedX = (e) => {
  if (projectScene && projectScene.objects) {
    const updatedObjects = projectScene.objects.map((obj, index) => {
      if (index === selectedObjectID) {
        return {
          ...obj,
          rotationSpeed: {
            ...obj.rotationSpeed,
            x: parseFloat(e.target.value)  // Parse the value to a float
          }
        };
      }
      return obj;
    });

    // Update the undo and redo stacks
    setUndoStack((prevUndoStack) => [...prevUndoStack, projectScene]);
    setRedoStack([]);

    // Update the projectScene with the updated position
    setProjectScene((prevScene) => ({
      ...prevScene,
      objects: updatedObjects,
    }));
  }
};

const handleRotationSpeedY = (e) => {
  if (projectScene && projectScene.objects) {
    const updatedObjects = projectScene.objects.map((obj, index) => {
      if (index === selectedObjectID) {
        return {
          ...obj,
          rotationSpeed: {
            ...obj.rotationSpeed,
            y: parseFloat(e.target.value)  // Parse the value to a float
          }
        };
      }
      return obj;
    });

    // Update the undo and redo stacks
    setUndoStack((prevUndoStack) => [...prevUndoStack, projectScene]);
    setRedoStack([]);

    // Update the projectScene with the updated position
    setProjectScene((prevScene) => ({
      ...prevScene,
      objects: updatedObjects,
    }));
  }
};



const handleRotationSpeedZ = (e) => {
  if (projectScene && projectScene.objects) {
    const updatedObjects = projectScene.objects.map((obj, index) => {
      if (index === selectedObjectID) {
        return {
          ...obj,
          rotationSpeed: {
            ...obj.rotationSpeed,
            z: parseFloat(e.target.value)  // Parse the value to a float
          }
        };
      }
      return obj;
    });

    // Update the undo and redo stacks
    setUndoStack((prevUndoStack) => [...prevUndoStack, projectScene]);
    setRedoStack([]);

    // Update the projectScene with the updated position
    setProjectScene((prevScene) => ({
      ...prevScene,
      objects: updatedObjects,
    }));
  }
};



const handleGeometryRotX = (e) => {
    if (projectScene && projectScene.objects) {
      const updatedObjects = projectScene.objects.map((obj, index) => {
        if (index === selectedObjectID) {
          return {
            ...obj,
            rotation: {
              ...obj.rotation,
              x: parseFloat(e.target.value)  // Parse the value to a float
            }
          };
        }
        return obj;
      });
  
      // Update the undo and redo stacks
      setUndoStack((prevUndoStack) => [...prevUndoStack, projectScene]);
      setRedoStack([]);
  
      // Update the projectScene with the updated position
      setProjectScene((prevScene) => ({
        ...prevScene,
        objects: updatedObjects,
      }));
    }
  };
  

  const handleGeometryRotY = (e) => {
    if (projectScene && projectScene.objects) {
      const updatedObjects = projectScene.objects.map((obj, index) => {
        if (index === selectedObjectID) {
          return {
            ...obj,
            rotation: {
              ...obj.rotation,
              y: parseFloat(e.target.value)  // Parse the value to a float
            }
          };
        }
        return obj;
      });
  
      // Update the undo and redo stacks
      setUndoStack((prevUndoStack) => [...prevUndoStack, projectScene]);
      setRedoStack([]);
  
      // Update the projectScene with the updated position
      setProjectScene((prevScene) => ({
        ...prevScene,
        objects: updatedObjects,
      }));
    }
  };

  const handleGeometryRotZ = (e) => {
    if (projectScene && projectScene.objects) {
      const updatedObjects = projectScene.objects.map((obj, index) => {
        if (index === selectedObjectID) {
          return {
            ...obj,
            rotation: {
              ...obj.rotation,
              z: parseFloat(e.target.value)  // Parse the value to a float
            }
          };
        }
        return obj;
      });
  
      // Update the undo and redo stacks
      setUndoStack((prevUndoStack) => [...prevUndoStack, projectScene]);
      setRedoStack([]);
  
      // Update the projectScene with the updated position
      setProjectScene((prevScene) => ({
        ...prevScene,
        objects: updatedObjects,
      }));
    }
  };
  

const handleTilingX = (e) => {
  if (projectScene && projectScene.objects) {
    const updatedObjects = projectScene.objects.map((obj, index) => {
      if (index === selectedObjectID) {
        return {
          ...obj,
          tiling: {
            ...obj.tiling,
            x: parseFloat(e.target.value)  // Parse the value to a float
          }
        };
      }
      return obj;
    });

    // Update the undo and redo stacks
    setUndoStack((prevUndoStack) => [...prevUndoStack, projectScene]);
    setRedoStack([]);

    // Update the projectScene with the updated position
    setProjectScene((prevScene) => ({
      ...prevScene,
      objects: updatedObjects,
    }));
  }
};


const handleTilingY = (e) => {
  if (projectScene && projectScene.objects) {
    const updatedObjects = projectScene.objects.map((obj, index) => {
      if (index === selectedObjectID) {
        return {
          ...obj,
          tiling: {
            ...obj.tiling,
            y: parseFloat(e.target.value)  // Parse the value to a float
          }
        };
      }
      return obj;
    });

    // Update the undo and redo stacks
    setUndoStack((prevUndoStack) => [...prevUndoStack, projectScene]);
    setRedoStack([]);

    // Update the projectScene with the updated position
    setProjectScene((prevScene) => ({
      ...prevScene,
      objects: updatedObjects,
    }));
  }
};
  
  

const geometryRotations = (projectScene) => {
  if (projectScene){
    if(projectScene.objects && projectScene.objects.length !== 0){
      if(selectObjectChosen){
      return(
        <>
        <input placeholder="x value" type="number" value={projectScene.objects[selectedObjectID].rotation.x} onChange={handleGeometryRotX} step="0.5"/>
        <input placeholder="y value" type="number" value={projectScene.objects[selectedObjectID].rotation.y} onChange={handleGeometryRotY} step="0.5"/>
        <input placeholder="z value" type="number" value={projectScene.objects[selectedObjectID].rotation.z} onChange={handleGeometryRotZ} step="0.5"/>
        </>
      )
    }
  }
  }

  
  return(
    null
  );

}

const geometryTiling = (projectScene) => {
  if (projectScene){
    if(projectScene.objects && projectScene.objects.length !== 0){
      if(selectObjectChosen){
      return(
        <>
          <input placeholder="x" value={projectScene.objects[selectedObjectID].tiling.x} onChange={handleTilingX} type="number"/>
          <input placeholder="y" value={projectScene.objects[selectedObjectID].tiling.y} onChange={handleTilingY} type="number"/>
        </>
      )
    }
  }
  }
  
  return(
    null
  );

}

const saveProject = async () => { 
  try {
    const lastTimeSaved = await updateProject(userID, projID, projectScene);

    setProjectScene((prevScene) => ({
      ...prevScene,
      lastSaved: lastTimeSaved, // Assume lastTimeSaved is in the Firebase Server Timestamp format
    }));

    // console.log('Project successfully updated.');
    return true;
  } catch (error) {
    console.error('Error updating project:', error);
    return false;
  }
}

  const makeTemplate = () => {
    createTemplate(projectScene);
  }



const isPositionEqual = (pos1, pos2) => {
  return pos1.x === pos2.x && pos1.y === pos2.y && pos1.z === pos2.z;
};

const isScaleEqual = (pos1, pos2) => {
  return pos1.x === pos2.x && pos1.y === pos2.y && pos1.z === pos2.z;
};

const isRotationEqual = (pos1, pos2) => {
  return pos1.x === pos2._x && pos1.y === pos2._y && pos1.z === pos2._z;
};

const updateObjectArc = (objectID, newObjectData) => {

  if (projectScene && projectScene.objects && objectID && newObjectData) {
    // Create a deep copy of the projectScene and objects
    const updatedProjectScene = JSON.parse(JSON.stringify(projectScene));
    const updatedObjects = [...updatedProjectScene.objects];

      // Check if the object is actually updated
      const positionUpdated = !isPositionEqual(projectScene.objects[objectID].position, newObjectData.position);
      const scaleUpdated = !isScaleEqual(projectScene.objects[objectID].scale, newObjectData.scale);
      const rotationUpdated = !isRotationEqual(projectScene.objects[objectID].rotation, newObjectData.rotation);
      
      // Check if the object is actually updated
      const isObjectUpdated = (positionUpdated || scaleUpdated || rotationUpdated);


    if (objectID !== null && isObjectUpdated) {
      // Create a copy of the object to update
      const updatedObject = { ...updatedObjects[objectID] };

      // Update the copied object
      updatedObject.position.x = newObjectData.position.x;
      updatedObject.position.y = newObjectData.position.y;
      updatedObject.position.z = newObjectData.position.z;
      updatedObject.scale.x = newObjectData.scale.x;
      updatedObject.scale.y = newObjectData.scale.y;
      updatedObject.scale.z = newObjectData.scale.z;
      updatedObject.rotation.x = newObjectData.rotation.x;
      updatedObject.rotation.y = newObjectData.rotation.y;
      updatedObject.rotation.z = newObjectData.rotation.z;

      // Update the objects array with the modified object
      updatedObjects[objectID] = updatedObject;

      // Update the projectScene with the modified objects
      updatedProjectScene.objects = updatedObjects;

      // Update the state with the modified projectScene
      setProjectScene(updatedProjectScene);

      // Update undo stack
      setUndoStack((prevUndoStack) => [
        ...prevUndoStack,
        JSON.parse(JSON.stringify(projectScene)), // Deep copy of projectScene
      ]);

      // Clear redo stack
      setRedoStack([]);
    }
  }
};

  const insertFromList = (image) => {
    // console.log('wtf');
    if(projectScene){
      projectScene.objects[selectedObjectID].material = image;
      dispatch(SET_OBJECT_MATERIAL({
        objectMaterial: image,
      }));
    } else{
      // console.log("bithc")
    }
  }
  
  const changeEditMode = (mode) => {
    return () => {

      if (mode === 'translate') {
        // Handle translate logic
        setEditMode('translate');
        // console.log('Translate mode selected');
      } else if (mode === 'scale') {
        // Handle scale logic
        setEditMode('scale');
        // console.log('Scale mode selected');
      } else if (mode === 'rotate') {
        // Handle rotate logic
        setEditMode('rotate');
        // console.log('Rotate mode selected');
      }
    };
  };
  
  const duplicateObject = () => {
    if (selectedObjectChosen && selectedObjectID !== null) {
      if (projectScene && projectScene.objects) {
        const selectedObject = projectScene.objects[selectedObjectID];
        const duplicatedObject = JSON.parse(JSON.stringify(selectedObject)); // Create a deep copy of the selected object
        duplicatedObject.objectID = projectScene.objects.length; // Assign a new ID for the duplicated object
        duplicatedObject.position.x += 0.1;
        duplicatedObject.position.y += 0.1;
        duplicatedObject.position.z += 0.1;

        projectScene.objects.push(duplicatedObject); // Push the duplicated object into the objects array
        setProjectScene((prevScene) => ({
          ...prevScene,
          objects: [...prevScene.objects], // Ensure state change by creating a new array reference
        }));
  
        // Dispatch an action to update the Redux state
        dispatch(
          SET_OBJECT_IMAGE({
            objectName: duplicatedObject.objectTypeName,
            objectID: duplicatedObject.objectID,
            objectMaterial: duplicatedObject.material,
          })
        );

        setUndoStack((prevUndoStack) => [...prevUndoStack, projectScene]);
        setRedoStack([]);

      }
    }
  };


  const setSkyBox = (index) => {
  
    setProjectScene((prevScene) => ({
      ...prevScene,
      details: {
        ...prevScene.details,
        SkyBox: index,
      }
    }));
  };

  const instantiateSkyButtons = () => {
    let loopData = [];
    loopData.push(
      <button key={100} onClick={() => { setSkyBox(100)}} className={templateCSS.skyBoxButtonImgSpec}>
        None
      </button>
    );
  
    if (skyBoxes !== null && skyBoxes.length !== 0) {
      for (let i = 0; i < skyBoxes.length; i++) {
        loopData.push(
          <button key={i} onClick={() => { setSkyBox(i)}}  className={templateCSS.skyBoxButtonImg}>
            <img src={skyBoxes[i]} alt="skybox"  className={templateCSS.skyBoxButtonImgSub}/>
          </button>
        );
      }
    }
  
    return <ul className={templateCSS.skyBoxList}>{loopData}</ul>;
  };
  
  


  const deleteObject = () => {
    if (selectedObjectChosen && selectedObjectID !== null) {
      if (projectScene && projectScene.objects) {
        const updatedObjects = projectScene.objects.filter((obj, index) => index !== selectedObjectID);
        setProjectScene(prevScene => ({
          ...prevScene,
          objects: updatedObjects
        }));
  
        // Dispatch an action to update the Redux state
        dispatch(UNSET_OBJECT_IMAGE());

        setUndoStack((prevUndoStack) => [...prevUndoStack, projectScene]);
        setRedoStack([]);


      }
    }
  };
  
  const toggleSidesButton = () => {
    setToggleSides(!toggleSides);
  }


  const handleChromePickerChange = (newColor) => {

    if (projectScene && projectScene.objects && newColor) {
      const updatedObjects = projectScene.objects.map((obj, index) => {
        if (index === selectedObjectID) {
          return {
            ...obj,
            solidColor: {
              r: newColor.r,
              g: newColor.g,
              b: newColor.b,
              a: newColor.a
            }
          };
        }
        return obj;
      });
  
      // Update the undo and redo stacks
      setUndoStack((prevUndoStack) => [...prevUndoStack, projectScene]);
      setRedoStack([]);
  
      // Update the projectScene with the updated position
      setProjectScene((prevScene) => ({
        ...prevScene,
        objects: updatedObjects,
      }));
    }


  }

  const MyChromePicker = () => {


    if(selectedObjectChosen){
      if(projectScene.objects[selectedObjectID].solidColor !== null){
        return(
          <div className={templateCSS.chromePickerHolder}>
          <ChromePicker
            onChange={(color) => {
              handleChromePickerChange(color.rgb);
            }}
            color={projectScene.objects[selectedObjectID].solidColor}
            width={`70%`}
          />
        </div>
        )
      }
  }
  }


  const RenderTextureEditorDetails = () => {
    if(selectedObjectChosen){
      if(projectScene.objects[selectedObjectID].materialType === null || projectScene.objects[selectedObjectID].materialType==="image"){
        return(

          <div className={templateCSS.imageTextureOption}>
            <div className={templateCSS.xyzEditor}>
              <div className={templateCSS.partEditor}>
                <div className={templateCSS.partTitle}>
                  Tiling
                </div>
                <div className={templateCSS.partInput}>
                  {geometryTiling(projectScene)}
                  
                </div>
              </div>
            </div>


              <div className={templateCSS.imgEditor}>
              {selectedObjectChosen && <img src={selectedObjectMaterial} alt='objectImg' className={templateCSS.displayedObjectImage} />}
              </div>
            
          </div>
        )
      } else if(projectScene.objects[selectedObjectID].materialType==="video"){
        return(
          <div className={templateCSS.VideoRenderer}>

              <video
                crossOrigin="anonymous"
                // id="videoReference"
                playsInline
                muted
                loop
                autoPlay
                width="100"
                src={projectScene.objects[selectedObjectID].material}
                className={templateCSS.theVideoRenderer}
                ></video>

            </div>
          
        )
      } else if(projectScene.objects[selectedObjectID].materialType==="solid"){
        return(
          <div className= {templateCSS.colorPicker}>
            <MyChromePicker />

          </div>
        )
    }
  }}


  const setBlendMode = (mode) => {


    if (projectScene && projectScene.objects && mode) {
      const updatedObjects = projectScene.objects.map((obj, index) => {
        if (index === selectedObjectID) {
          return {
            ...obj,
            blendMode: mode,
          };
        }
        return obj;
      });
  
      // Update the undo and redo stacks
      setUndoStack((prevUndoStack) => [...prevUndoStack, projectScene]);
      setRedoStack([]);
  
      // Update the projectScene with the updated position
      setProjectScene((prevScene) => ({
        ...prevScene,
        objects: updatedObjects,
      }));
    }


  }


  const animationMode = (mode) => {
    console.log(mode);


    if (projectScene && projectScene.objects && mode) {
      const updatedObjects = projectScene.objects.map((obj, index) => {
        if (index === selectedObjectID) {
          return {
            ...obj,
            animation: 
            {type: mode,
              x: 10,
              y: 0,
              z: 0,
            },
        }
      }
        return obj;
      });
  
      // Update the undo and redo stacks
      setUndoStack((prevUndoStack) => [...prevUndoStack, projectScene]);
      setRedoStack([]);
  
      // Update the projectScene with the updated position
      setProjectScene((prevScene) => ({
        ...prevScene,
        objects: updatedObjects,
      }));
    }


  }




  const BlendOptions = () => {



    let tabClassName1 = templateCSS.unselectedBlendMode;
    let tabClassName2 = templateCSS.unselectedBlendMode;
    let tabClassName3 = templateCSS.unselectedBlendMode;
    let tabClassName4 = templateCSS.unselectedBlendMode;
  
    if( projectScene.objects[selectedObjectID].blendMode === 1){
      tabClassName1 = templateCSS.selectedBlendMode;
    } else if( projectScene.objects[selectedObjectID].blendMode === 2){
      tabClassName2 = templateCSS.selectedBlendMode;
    } else if( projectScene.objects[selectedObjectID].blendMode === 3){
      tabClassName3 = templateCSS.selectedBlendMode;
    } else if( projectScene.objects[selectedObjectID].blendMode === 4){
      tabClassName4 = templateCSS.selectedBlendMode;
    }

    


    return(
      <div className={templateCSS.blendingModes}>
        <FontAwesomeIcon icon={faO} onClick={() => setBlendMode(1)} className={`${tabClassName1}`} />
        <FontAwesomeIcon icon={faPlus} onClick={() => setBlendMode(2)} className={`${tabClassName2}`} />
        <FontAwesomeIcon icon={faMinus}  onClick={() => setBlendMode(3)} className={`${tabClassName3}`}/>
        <FontAwesomeIcon icon={faMultiply}  onClick={() => setBlendMode(4)} className={`${tabClassName4}`}/>
      </div>
    )
  }


  const StockPhotoOptions = () => {

    const display = useSelector(selectObjectChosen);
    let tabClassName1 = templateCSS.unselectedStockTab;
    let tabClassName2 = templateCSS.unselectedStockTab;

    if( stockAssetMode === false ){
      tabClassName1 = templateCSS.selectedStockTab;
    } else {
      tabClassName2 = templateCSS.selectedStockTab;
    }



    if(display === true){
      return (
        <div className={templateCSS.stockOptionsHolder}>
          <div className={templateCSS.stockOptions}>
            <div onClick={ () => setStockMode(false)} className={`${tabClassName1}`}>  in project </div>
            <div onClick={ () => setStockMode(true)} className={`${tabClassName2}`}>  stock </div>
          </div>
                
          <ImageSelecor projectScene={projectScene} />

        </div>
      )
      }
  }


  const setTextureType = (textureType) => {
    
    // Ensure objects and selectedObjectID are defined
    if (projectScene.objects && projectScene.objects[selectedObjectID] && textureType !== null) {
      setProjectScene(prevScene => ({
        ...prevScene,
        objects: prevScene.objects.map((object, index) => {
          if (index === selectedObjectID) {
            return {
              ...object,
              materialType: textureType,
            };
          }
          return object;
        }),
      }));
    }
  };

  const setStockMode = (value) => {
    setStockAssetMode(value);
  }



  const RightEditor = () => {
    const renderEditor = useSelector(selectObjectChosen);
    const renderNonIndexState = useSelector(selectNonIndexState);
    const renderNonIndexStateBool = useSelector(selectNonIndexStateBool)


    if(renderEditor && projectScene) {

      return (
        <div className={templateCSS.rightImageEditor}>
        <div className={templateCSS.geometry}>
        <h3 className={templateCSS.geometryTitle}>
          geometry editor
        </h3>
        <div className={templateCSS.xyzEditorWrapper}>
        <div className={templateCSS.xyzEditor}>
          <div className={templateCSS.partEditor}>
            <div className={templateCSS.partTitle}>
              Position
            </div>
            <div className={templateCSS.partInput}>
            
              {geometryPositions(projectScene)}

            </div>
          </div>
          <div className={templateCSS.partEditor}>
            <div className={templateCSS.partTitle}>
              Scale
            </div>
            <div className={templateCSS.partInput}>
              {geometryScales(projectScene)}
            </div>
          </div>
          <div className={templateCSS.partEditor}>
            <div className={templateCSS.partTitle}>
              <div>Rotations</div>
            </div>
            <div className={templateCSS.partInput}>
              {geometryRotations(projectScene)}
            </div>
          </div>
          <div className={templateCSS.partEditor}>
            <div className={templateCSS.partTitle}>
              <div>rotation speed</div>
            </div>
            <div className={templateCSS.partInput}>
              {geometryRotationSpeed(projectScene)}
            </div>
          </div>
        </div>
        </div>

      </div>

      <div className={templateCSS.texture}>
        <h3 className={templateCSS.textureTitle}>
          texture editor
        </h3>

        <div className={templateCSS.textureOptions}>
          <div className={templateCSS.textureOptionTabs}>

            {instantiateTextureOptionTabs()}
          </div>



          {RenderTextureEditorDetails()}


        </div>
      </div>
      
      <div className={templateCSS.blendMode}>
        <h3 className={templateCSS.textureTitle}>
          Blend Mode: 
        </h3>

        <div className={templateCSS.blendOptions}>
          <BlendOptions />
        </div>
      </div>
      
      </div>
      )
    } else if(renderNonIndexStateBool ) {

      if(renderNonIndexState === "SkyBox"){
        return(     
          <div className={templateCSS.skyBoxContainer}>
            {instantiateSkyButtons()}
          </div>
        )
      } else if(renderNonIndexState === "Audio"){
        return(     
          <div className={templateCSS.skyBoxContainer}>
            AUDIO
          </div>
        )
      } else if(renderNonIndexState === "Main"){
        return(     
          <div className={templateCSS.mainEditorSubRightContainer}>
            <div className={templateCSS.projectTitleMainEditor} >
              <h3 className={templateCSS.titleMainEditor_large} > Title: </h3>
              <h3 onClick={handleTitleEdit} className={templateCSS.titleMainEditor_small}>
                
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={handleTitleChange}
                    onBlur={handleTitleUpdate}
                    autoFocus
                  />
                ) : (
                  editedTitle
                )}
              </h3>
            </div>

            <div className={templateCSS.mainEditorCoverImageContainer} >
              <div className={templateCSS.coverImageMainDisplay}>  
                Cover Image: 

                {projectScene && projectScene.templateCover &&
                <img src={projectScene.templateCover}  alt={"cover"} className={templateCSS.coverImageDisplay} />}

              </div>

                <div className={templateCSS.fileUpload3}>
                  <input className={templateCSS.fileUploadButton} type="file" onChange={((event) => {setCoverImageUpload(event.target.files[0])})}/>
                    <button className={templateCSS.changeImgButton} onClick={uploadCoverImage}>upload </button>

                </div>


            </div>

          </div>
        )
      }
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit'
    });
  };


  const ImageSelecor = () => {


    if(selectedObjectChosen){


      if(stockAssetMode){
        if(projectScene.objects[selectedObjectID].materialType === "image"){


          return (
  
            <div className={templateCSS.imgList}>

                <div onClick={() => insertFromList(lastSelectedImage)} className={templateCSS.insertButtonSpec}>
                  <FontAwesomeIcon icon={faChevronUp} />
                  Insert Selected Image
                  <FontAwesomeIcon icon={faChevronUp} />
                </div>


                <div className={templateCSS.userImages}>
                  {stockImageList.map((url) => (
                    <button
                      key={url}
                      className={lastSelectedImage === url ? templateCSS.selectedImageButton : templateCSS.uploadedImageButton}
                      onClick={() => handleImageClick(url)}
                    >
                      <img src={url} alt="userUploadedImage" className={templateCSS.uploadedImg} />
                    </button>
                  ))}
                
               </div>
      
            </div>
  
  
          )
  
        } else if(projectScene.objects[selectedObjectID].materialType === "video"){
  
          return (
            <div className={templateCSS.imgList}>
                <div onClick={() => insertFromList(lastSelectedVideo)} className={templateCSS.insertButton}>
                  
                  <FontAwesomeIcon icon={faChevronUp} />
                  Insert Selected Video
                  <FontAwesomeIcon icon={faChevronUp} />
                </div>
              <div className={templateCSS.userImages}>
                {stockVideoList.map((url) => (
                  <button
                    key={url}
                    className={lastSelectedVideo === url ? templateCSS.selectedImageButton : templateCSS.uploadedImageButton}
                    onClick={() => handleVideoClick(url)}
                  >
                    <video src={url} alt="userUploadedImage" className={templateCSS.uploadedImg} />
                  </button>
                ))}
                
              </div>
      
            </div>
          )
  
        }

      } else {
        if(projectScene.objects[selectedObjectID].materialType === "image"){


          return (
  
            <div className={templateCSS.imgList}>
                <div onClick={() => insertFromList(lastSelectedImage)} className={templateCSS.insertButton}>
                  <FontAwesomeIcon icon={faChevronUp} />
                  Insert Selected Image
                  <FontAwesomeIcon icon={faChevronUp} />
                </div>
        
                <div className={templateCSS.userImages}>
                  {imageList.map((url) => (
                    <button
                      key={url}
                      className={lastSelectedImage === url ? templateCSS.selectedImageButton : templateCSS.uploadedImageButton}
                      onClick={() => handleImageClick(url)}
                    >
                      <img src={url} alt="userUploadedImage" className={templateCSS.uploadedImg} />
                    </button>
                  ))}
                
               </div>

               <div className={templateCSS.fileUpload2}>
                  <input className={templateCSS.fileUploadButton} type="file" onChange={((event) => {setImageUpload(event.target.files[0])})}/>
                  <button className={templateCSS.changeImgButton} onClick={uploadImage}>upload </button>
                </div>
      
            </div>
  
  
          )
  
        } else if(projectScene.objects[selectedObjectID].materialType === "video"){
  
          return (
            <div className={templateCSS.imgList}>
                <div onClick={() => insertFromList(lastSelectedVideo)} className={templateCSS.insertButton}>
                  <FontAwesomeIcon icon={faChevronUp} />
                  Insert Selected Video
                  <FontAwesomeIcon icon={faChevronUp} />
                </div>
      
              <div className={templateCSS.userImages}>
                {videoList.map((url) => (
                  <button
                    key={url}
                    className={lastSelectedVideo === url ? templateCSS.selectedImageButton : templateCSS.uploadedImageButton}
                    onClick={() => handleVideoClick(url)}
                  >
                    <video src={url} alt="userUploadedImage" className={templateCSS.uploadedImg} />
                  </button>
                ))}
                
              </div>
                    
              <div className={templateCSS.fileUpload2}>
                <input className={templateCSS.fileUploadButton} type="file" onChange={((event) => {setVideoUpload(event.target.files[0])})}/>
                <button className={templateCSS.changeImgButton} onClick={uploadVideo}>upload </button>
              </div>
      
            </div>
          )
  
        }
      }

    }

  }
  

  return (
    <div className={templateCSS.templatePage}>

      <div className={templateCSS.leftEditor}>

        <div className={templateCSS.actualEditor}>
            <div className={templateCSS.leftButtons}>
                <div className={templateCSS.leftEditorShapes}>
                  <FontAwesomeIcon onClick={addCylinder} icon={faCircle} className={templateCSS.editorButton}/>
                  <FontAwesomeIcon onClick={addPlane} icon={faSquare} className={templateCSS.editorButton}/>
                  <FontAwesomeIcon onClick={addPlane} icon={faCircleHalfStroke} className={templateCSS.editorButton}/>
                </div>
                <div className={templateCSS.modeButtons}>
                    <FontAwesomeIcon onClick={changeEditMode('translate')} icon={faUpDownLeftRight}  className={templateCSS.editorButton}/>
                    <FontAwesomeIcon onClick={changeEditMode('scale')} icon={faMaximize}  className={templateCSS.editorButton}/>
                    <FontAwesomeIcon onClick={changeEditMode('rotate')} icon={faRotate}  className={templateCSS.editorButton}/>
                </div>
                <div className={templateCSS.undoRedo}>
                    <FontAwesomeIcon onClick={undo} disabled={undoStack.length === 0} icon={faUndo}  className={templateCSS.editorButton}/>
                    <FontAwesomeIcon onClick={redo}  disabled={redoStack.length === 0} icon={faRedo}  className={templateCSS.editorButton}/>
              </div>
            </div>
            <div className={templateCSS.rightButtons}>
            <div className={templateCSS.rightRight}>
                <div className={templateCSS.deleteDuplicate}>
                  <FontAwesomeIcon onClick={duplicateObject} icon={faClone}  className={templateCSS.editorButton}/>
                  <FontAwesomeIcon onClick={deleteObject} icon={faTrash}  className={templateCSS.editorButton}/>
                </div>
                <div className={templateCSS.deleteDuplicate}>
                  {!playPause &&
                    <FontAwesomeIcon icon={faPlay} className={templateCSS.editorButton} onClick={(togglePlayPause)}/>
                  }
                  {playPause &&
                    <FontAwesomeIcon icon={faPause} className={templateCSS.editorButton} onClick={(togglePlayPause)}/>
                  }

                  {playAudio &&
                    <FontAwesomeIcon icon={faVolumeHigh} className={templateCSS.editorButton}  onClick={(toggleAudio)}/>
                  }
                  {!playAudio &&
                    <FontAwesomeIcon icon={faVolumeMute} className={templateCSS.editorButton}  onClick={(toggleAudio)}/>
                  }
                </div>
                  {toggleSides &&                 
                  <div  className={templateCSS.toggleSides}>
                    <FontAwesomeIcon icon={faEye} onClick={toggleSidesButton}  className={templateCSS.editorButton}/>
                  </div>
                  }
                  {!toggleSides &&                 
                    <div  className={templateCSS.toggleSides}>
                      <FontAwesomeIcon icon={faEyeSlash} onClick={toggleSidesButton}  className={templateCSS.editorButton}/>
                    </div>
                  }

              </div>
            </div>
              <NewCanvas scene={projectScene} className={templateCSS.canvasHolder} updateObject={updateObjectArc} editMode={editMode} toggleSides={toggleSides} playPause={playPause}/>
            </div>
        </div>


        <div className={templateCSS.videoBuffers}>
              video buffering...
              {instantiateVideoBuffers(projectScene)}
            </div>
      <div className={templateCSS.rightEditor}>
        <div className={templateCSS.upperRightDisplay}>

                <div className={templateCSS.tabs}>
                  {instantiateTabs(projectScene)}
                  {instantiateBroadStateTabs()}
                </div>

                      <RightEditor />


            <StockPhotoOptions />
            </div>

            <div className={templateCSS.saveActions} >
              <div className={templateCSS.saveActionButtons}>
                <div className={templateCSS.saveActionsOption}>
                 save <FontAwesomeIcon onClick={saveProject} icon={faSave} className={templateCSS.saveIcon}/>
                </div>
                <div className={templateCSS.saveActionsOption}>
                 share <FontAwesomeIcon icon={faShare} className={templateCSS.saveIcon}/>
                </div>

                <div className={templateCSS.saveActionsOption} onClick={makeTemplate}>
                  template
                  <FontAwesomeIcon icon={faPenToSquare}/>
                </div>
                
              </div>
              <div className={templateCSS.lastSavedWhen}>
                last saved - 

                {projectScene && projectScene.lastSaved ? (
                  <span>{ formatTimestamp(projectScene.lastSaved)}</span>
                ) : (
                  <span> No timestamp available</span>
                )}
              </div>


            </div>
            </div>

      </div>


    )
}

export default Editor