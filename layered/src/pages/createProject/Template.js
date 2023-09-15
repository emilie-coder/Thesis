import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  SET_ACTIVE_PROJECT,
  SET_PROJECT_TITLE,
  selectProjectID,
  selectProjectTitle,
} from '../../redux/slice/projectSlice';
import TemplateScene from '../../threejs/threeJSScene';
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


import { selectObjectID, selectObjectChosen, selectObjectMaterial, SET_OBJECT_MATERIAL } from '../../redux/slice/objectImageSlice';



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
        console.error('Error fetching project:', error);
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


  const uploadUpdateImage = () => {

    const saved = saveProject();

      if (imageUpload == null) return;

      const imageRef = ref(
        storage,
        userID + '/project_' + projID + `/images/${imageUpload.name + v4()}`
      );
  
      uploadBytes(imageRef, imageUpload).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
  
  
        // update in firebase
        updateObjectTexture(userID, projID, selectedObjectID, url);
  
          setImageList((prev) => [...prev, url]);
          dispatch(SET_OBJECT_MATERIAL(
            {objectMaterial: url}))
        });
  
        // projectScene[selectedObjectID].material = selectObjectMaterial;
      });
    }

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

  const instantiateTabs = (sceneObjs) => {
    if (sceneObjs && sceneObjs.objects) {
      return sceneObjs.objects.map((item, index) => {

        const isSelected = index === selectedObjectID; // Check if the item is selected
  
        // Determine the CSS class based on whether the item is selected
        const tabClassName = isSelected ? templateCSS.selectedTab : templateCSS.unselectedTab;
  
        // Generate the key for the <div> element
        const tabKey = `tabID_${index}`;
  
        return (
          <div key={tabKey} className={`${tabClassName}`}>
            {index}_{item.objectTypeName}
          </div>
        );
      });
    }
  
    return null; // Return null if sceneObjs.objects is not available
  };
  
  const handleGeometryPosX = (e) => {
    console.log("-----");

  }

  const geometryPositions = (projectScene) => {
    if (projectScene){
      if(projectScene.objects){
        return(
          <>
          <input placeholder="x value" value={projectScene.objects[selectedObjectID].position.x} onChange={handleGeometryPosX}/>
          <input placeholder="y value" value={projectScene.objects[selectedObjectID].position.y} onChange={handleGeometryPosX}/>
          <input placeholder="z value" value={projectScene.objects[selectedObjectID].position.z} onChange={handleGeometryPosX}/>
          </>
        )
      }
    }

    return(
      null
    );

  }


  const geometryScales = (projectScene) => {
    if (projectScene){
      if(projectScene.objects){
        return(
          <>
          <input placeholder="x value" value={projectScene.objects[selectedObjectID].scale.x} onChange={handleGeometryPosX}/>
          <input placeholder="y value" value={projectScene.objects[selectedObjectID].scale.y} onChange={handleGeometryPosX}/>
          <input placeholder="z value" value={projectScene.objects[selectedObjectID].scale.z} onChange={handleGeometryPosX}/>
          </>
        )
      }
    }

    return(
      null
    );

  }


  const geometryRotations = (projectScene) => {
    if (projectScene){
      if(projectScene.objects){
        return(
          <>
          <input placeholder="x value" value={projectScene.objects[selectedObjectID].rotation.x} />
          <input placeholder="y value" value={projectScene.objects[selectedObjectID].rotation.y} />
          <input placeholder="z value" value={projectScene.objects[selectedObjectID].rotation.z} />
          </>
        )
      }
    }

    return(
      null
    );

  }

  const saveProject = async () => { // Add "async" here
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
        console.log("the new projectscene")
        console.log(projectScene)
      }
    }
  };
  

  const addCylinder = () => {
    console.log('here----');
    // Ensure that projectScene and projectScene.objects exist
    if (!projectScene || !projectScene.objects) {
      console.error("projectScene or projectScene.objects is not defined.");
      return;
    }
  
    // Find the maximum ID among existing objects
    let maxId = 0;
    for (const obj of projectScene.objects) {
      if (obj.objectID > maxId) {
        maxId = obj.objectID;
      }
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
    };
  
    // Append the new cylinder object to projectScene.objects
    projectScene.objects.push(newCylinder);
  
    // Now you have added a new cylinder object to your projectScene
    console.log("New cylinder added:", newCylinder);
  };
  

  const addPlane = () => {
    // Ensure that projectScene and projectScene.objects exist
    if (!projectScene || !projectScene.objects) {
      console.error("projectScene or projectScene.objects is not defined.");
      return;
    }
  
    // Find the maximum ID among existing objects
    let maxId = 0;
    for (const obj of projectScene.objects) {
      if (obj.objectID > maxId) {
        maxId = obj.objectID;
      }
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
    };
  
    // Append the new cylinder object to projectScene.objects
    projectScene.objects.push(newPlane);
  
    // Now you have added a new cylinder object to your projectScene
    console.log("New plane added:", newPlane);
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
                <button> move </button>
                <button> scale </button>
                <button> rotate </button>
              </div>
            </div>

            <TemplateScene scene={projectScene} className={templateCSS.canvasHolder} updateObject={updateObjectArc} />
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
                        <input placeholder="x" />
                        <input placeholder="y" />
                      </div>
                    </div>
                    </div>


                  <div className={templateCSS.imgEditor}>
                    {selectedObjectChosen && <img src={selectedObjectMaterial} alt='objectImg' className={templateCSS.displayedObjectImage} />}
                    <div className={templateCSS.fileUpload}>
                      <input className={templateCSS.fileUploadButton} type="file" onChange={((event) => {setImageUpload(event.target.files[0])})}/>
                      <button className={templateCSS.changeImgButton} onClick={uploadUpdateImage}>change image</button>
                    </div>
                  </div>


                </div>


              </div>


            </div>
                      
          <div className={templateCSS.imgList}>

            <div className={templateCSS.fileUpload2}>
              <input className={templateCSS.fileUploadButton} type="file" onChange={((event) => {setImageUpload(event.target.files[0])})}/>
              <button className={templateCSS.changeImgButton} onClick={uploadImage}>upload image</button>
            </div>

            <div className={templateCSS.userImages}>
              {imageList.map((url) => {
                return <img className={templateCSS.uploadedImgs} src={url} alt="userUploadedImage" key={url}/>
              })}

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