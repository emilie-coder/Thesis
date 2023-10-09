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

import { ChromePicker, SketchPicker } from "react-color";


const Editor = () => {

  const dispatch = useDispatch();
  const projID = useSelector(selectProjectID);
  const projTitle = useSelector(selectProjectTitle);


  const selectedObjectID = useSelector(selectObjectID);
  const selectedObjectChosen = useSelector(selectObjectChosen);
  const selectedObjectMaterial = useSelector(selectObjectMaterial);

  const [imageUpload, setImageUpload] = useState(null);
  const [imageList, setImageList] = useState([]);


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
  const [toggleSides, setToggleSides] = useState(true);
  const [copiedObject, setCopiedObject] = useState({});

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);


  const [sketchPickerColor, setSketchPickerColor] = useState({
    r: "241",
    g: "112",
    b: "19",
    a: "1",
  });




  const [skyBoxes, setSkyBoxes ] = useState(["/imgs/belfast_sunset_puresky_4k.hdr" ,
                                              "/imgs/industrial_sunset_puresky_4k.hdr", 
                                              "/imgs/kloofendal_48d_partly_cloudy_puresky_4k.hdr",
                                               "/imgs/rathaus_4k.hdr",
                                                "/imgs/syferfontein_0d_clear_puresky_4k.hdr" ])
  

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
      scale: { x: 1, y: 1, z: 1 }, // Set the initial scale
      tiling: { x: 1, y: 1}, // Set the initial scale
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
      scale: { x: 1, y: 1, z: 1 }, // Set the initial scale
      tiling: { x: 1, y: 1}, // Set the initial scale
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
    } else if(event.keyCode === 46 || event.keyCode === 8){
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
        setImageList((prev) => [...prev, url]);
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
    
        // if (projectScene && projectScene.objects) {
        //   // Extract image URLs from projectScene objects and add them to the imageList
        //   const urls = projectScene.objects.map((obj) => obj.material);
        //   setImageList((prev) => [...prev, ...urls]);
        // }
    
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
  let tabClassName3 = templateCSS.unselectedTab;

  if( nonIndexState && selectedNonIndexState === 'SkyBox'){
    tabClassName1 = templateCSS.selectedTab;
  }else if (nonIndexState && selectedNonIndexState === 'Audio') {
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
    if (sceneObjs && sceneObjs.objects) {
      return sceneObjs.objects.map((item, index) => {

        if(item.materialType === 'video'){
          return (
            <div>
              <video
              crossOrigin="anonymous"
              id={item.material}
              playsInline
              muted
              loop
              autoPlay
              width="100"
              src={item.material}
              ></video>
            </div>
          );

        }

      });
    }
  
    return null;

  }




  const instantiateTextureOptionTabs = () => {
    let tabClassName1 = templateCSS.unselectedTab;
    let tabClassName2 = templateCSS.unselectedTab;
    let tabClassName3 = templateCSS.unselectedTab;

    if( projectScene.objects[selectedObjectID].materialType === 'image'){
      tabClassName1 = templateCSS.selectedTab;
    } else if( projectScene.objects[selectedObjectID].materialType === 'video'){
      tabClassName2 = templateCSS.selectedTab;
    } else if( projectScene.objects[selectedObjectID].materialType === 'solid'){
      tabClassName3 = templateCSS.selectedTab;
    }
  

    return( 
      <>
           <div className={`${tabClassName1}`}  onClick={() => setTextureType('image')}>
            image
          </div>
          <div className={`${tabClassName2}`}  onClick={() => setTextureType('video')}>
            video
          </div>
          <div className={`${tabClassName3}`}  onClick={() => setTextureType('solid')}>
            solid
          </div>
      </>

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
  // console.log("HERE I AM")
  // console.log(projectScene);
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
  
    if (skyBoxes !== null && skyBoxes.length !== 0) {
      for (let i = 0; i < skyBoxes.length; i++) {
        loopData.push(
          <button key={i} onClick={() => setSkyBox(i)}>
            {skyBoxes[i]}
          </button>
        );
      }
    }
  
    return <ul>{loopData}</ul>;
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
          <div className={templateCSS.imageTextureOption}>
            <div className="VideoRenderer">
              <video
                crossOrigin="anonymous"
                // id="videoReference"
                playsInline
                muted
                loop
                autoPlay
                width="100"
                src={projectScene.objects[selectedObjectID].material}
                ></video>

            </div>
          
          </div>
        )
      } else if(projectScene.objects[selectedObjectID].materialType==="solid"){
        return(
          <div>
            <ChromePicker
              onChange={(color) => {
                setSketchPickerColor(color.rgb);
              }}
              color={sketchPickerColor}
            />
          </div>
        )
    }
  }}


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



  const RightEditor = () => {
    const renderEditor = useSelector(selectObjectChosen);

    if(renderEditor && projectScene) {

      return (
        <>
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
              Rotation
            </div>
            <div className={templateCSS.partInput}>
              {geometryRotations(projectScene)}
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
        </>
      )
    } else{
      return(     
        <div className={templateCSS.geometry}>
          <>
          {instantiateSkyButtons()}
          </>
          <>
            Audio
          </>
        </div>

      )
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
  

  return (
    <div className={templateCSS.templatePage}>

      
      <div className={templateCSS.leftEditor}>
        <div className={templateCSS.leftEditorTop}>
          <h2 className={templateCSS.projectTitle} onClick={handleTitleEdit}>
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
          </h2>
          <div className={templateCSS.actualEditor}>
            <div className={templateCSS.leftButtons}>
              <div className={templateCSS.leftEditorShapes}>
                <button onClick={addCylinder}> Cylinder </button>
                <button onClick={addPlane}> Plane </button>
              </div>
              <div className={templateCSS.modeButtons}>
              <button onClick={changeEditMode('translate')}> Translate </button>
              <button onClick={changeEditMode('scale')}> Scale </button>
              <button onClick={changeEditMode('rotate')}> Rotate </button>
              <button onClick={duplicateObject}>duplicate</button>
              <button onClick={deleteObject}>Delete</button>
              <button onClick={undo} disabled={undoStack.length === 0}>Undo</button>
              <button onClick={redo} disabled={redoStack.length === 0}>Redo</button>
              <button onClick={toggleSidesButton}>toggleSides</button>
            </div>

            </div>

            <NewCanvas scene={projectScene} className={templateCSS.canvasHolder} updateObject={updateObjectArc} editMode={editMode} toggleSides={toggleSides}/>
          </div>
        </div>
        <div className={templateCSS.leftEditorBottomt}>
          <div>
          Animation Options
          </div>
          <div>
          <button> none </button>
          <button> rotate </button>
          <button> soft hover </button>
          <button> hard jitter</button>

          </div>
        </div>
      </div>


      <div>
        video buffering...
        {instantiateVideoBuffers(projectScene)}
      </div>

    <div className={templateCSS.rightEditor}>

          <div className={templateCSS.rightEditorTop}>

            <div className={templateCSS.rightImageEditor}>
                            
              <div className={templateCSS.choicedInfo}>
                <div className={templateCSS.tabs}>
                {instantiateTabs(projectScene)}
                {instantiateBroadStateTabs()}
                </div>

                <RightEditor />


              </div>


            </div>
                      
          <div className={templateCSS.imgList}>
          <button onClick={() => insertFromList(lastSelectedImage)}> CHANGE IMAGE </button>

            <div className={templateCSS.fileUpload2}>
              <input className={templateCSS.fileUploadButton} type="file" onChange={((event) => {setImageUpload(event.target.files[0])})}/>
              <button className={templateCSS.changeImgButton} onClick={uploadImage}>upload image</button>
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

          </div>

          </div>

          <div className={templateCSS.saveActions} >
            <>
              <button onClick={saveProject} > save </button>
              <button onClick={makeTemplate}> make template </button>
              <button > share </button>
            </>
            <>
              project last saved:

              {projectScene && projectScene.lastSaved ? (
                <span>{formatTimestamp(projectScene.lastSaved)}</span>
              ) : (
                <span>No timestamp available</span>
              )}
            </>


          </div>


    </div>

      </div>
    )
}

export default Editor