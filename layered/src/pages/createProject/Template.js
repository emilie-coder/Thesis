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
  

  const updateProjectScene = (updatedScene) => {
    setUndoStack((prevUndoStack) => [...prevUndoStack, projectScene]);
    setProjectScene(updatedScene);
    setRedoStack([]);
  };


  const undo = () => {
    if (undoStack.length > 0) {
      const prevScene = undoStack[undoStack.length - 1];
      setProjectScene(prevScene);
      setUndoStack((prevUndoStack) => prevUndoStack.slice(0, -1));
      setRedoStack((prevRedoStack) => [...prevRedoStack, projectScene]);
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
        console.log(projectScene.objects)
        console.log(selectedObjectID);
        console.log(projectScene.objects[selectedObjectID]);
        const temp = projectScene.objects[selectedObjectID];
        console.log("this is temp");
        console.log(temp);
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
    }  else if (event.key === 'p') {
      if (projectScene && projectScene.objects) {
        addPlane();
      }
    //----------- save project -------------------
    } else if (event.metaKey && event.key === 's') {
      event.preventDefault(); // Prevent the default save behavior
      console.log('saved');
      saveProject();

    //----------- copy selected item -------------------
    } else if (event.metaKey && event.key === 'c') {
      event.preventDefault(); // Prevent the default save behavior
      console.log('copied');
      copyObject();
      console.log(copiedObject);
    } 
    //----------- paste selected item -------------------
    else if (event.metaKey && event.key === 'v') {
      event.preventDefault(); // Prevent the default save behavior
      console.log('pasted');
      addObject();

    //----------- duplicate selected item -------------------
    } else if (event.metaKey && event.key === 'd') {
      event.preventDefault(); // Prevent the default save behavior
      console.log('duplicate');
    }  else if(event.key ==='c') {
      addCylinder();
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
        console.warn('userID or projID is not available.');
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


  };

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
      await updateProject(userID, projID, projectScene);
      console.log('Project successfully updated.');
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      return false;
    }
  }

  const makeTemplate = () => {
    createTemplate(projectScene);
  }

  const updateObjectArc = (objectID, newObjectData) => {

    // console.log(" in template props ");
    // console.log(objectID, newObjectData);
  
    if (projectScene && projectScene.objects) {

      if (objectID !== null) {

        // Create a copy of the object to update
        const updatedObject = { ...projectScene.objects[objectID] };

  
        updatedObject.position.x = newObjectData.position.x;
        updatedObject.position.y = newObjectData.position.y;
        updatedObject.position.z = newObjectData.position.z;


        updatedObject.scale.x = newObjectData.scale.x;
        updatedObject.scale.y = newObjectData.scale.y;
        updatedObject.scale.z = newObjectData.scale.z;

        updatedObject.rotation.x = newObjectData.rotation.x;
        updatedObject.rotation.y = newObjectData.rotation.y;
        updatedObject.rotation.z = newObjectData.rotation.z;


        // Create a copy of the projectScene and update the specific object
        const updatedProjectScene = { ...projectScene };
        updatedProjectScene.objects[objectID] = updatedObject;
  
        // Update the state with the modified projectScene
        setProjectScene(updatedProjectScene);
  
        // Now, the projectScene state has been updated with the modified object.
        // console.log("the new projectscene")
        // console.log(projectScene)
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
      }
    }
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
      }
    }
  };
  
  const toggleSidesButton = () => {
    setToggleSides(!toggleSides);
  }


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
          animation timeline
        </div>
      </div>




    <div className={templateCSS.rightEditor}>

          <div className={templateCSS.rightEditorTop}>

            <div className={templateCSS.rightImageEditor}>
                            
              <div className={templateCSS.choicedInfo}>
                <div className={templateCSS.tabs}>
                {instantiateTabs(projectScene)}
                </div>


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
                  {/* {console.log('Selected Object Material:', selectedObjectMaterial)} */}
                  {selectedObjectChosen && <img src={selectedObjectMaterial} alt='objectImg' className={templateCSS.displayedObjectImage} />}

                    {/* <div className={templateCSS.fileUpload}>
                      <input className={templateCSS.fileUploadButton} type="file" onChange={((event) => {setImageUpload(event.target.files[0])})}/>
                      <button className={templateCSS.changeImgButton} onClick={uploadUpdateImage}>change image</button>
                    </div> */}
                  </div>
                </div>
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
            <button onClick={saveProject} > save </button>
            <button onClick={makeTemplate}> make template </button>
          </div>


    </div>

      </div>
    )
}

export default Editor