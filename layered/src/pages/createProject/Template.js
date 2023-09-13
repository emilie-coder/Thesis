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
    console.log("sda");

  }

  const geometryPositions = (projectScene) => {
    if (projectScene){
      if(projectScene.objects){
        return(
          <>
          <input placeholder="x value" value={projectScene.objects[selectedObjectID].position.x} onChange={handleGeometryPosX}/>
          <input placeholder="y value" value={projectScene.objects[selectedObjectID].position.y} />
          <input placeholder="z value" value={projectScene.objects[selectedObjectID].position.z} />
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
          <input placeholder="x value" value={projectScene.objects[selectedObjectID].scale.x} />
          <input placeholder="y value" value={projectScene.objects[selectedObjectID].scale.y} />
          <input placeholder="z value" value={projectScene.objects[selectedObjectID].scale.z} />
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

  const saveProject = () => {
    updateProject(userID, projID, projectScene);

  }

  const makeTemplate = () => {
    createTemplate(projectScene);
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
            <TemplateScene scene={projectScene} className={templateCSS.canvasHolder} />
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
                        Position
                      </div>
                      <div className={templateCSS.partInput}>
                        <input placeholder="x" />
                        <input placeholder="y" />
                        <input placeholder="z" />
                      </div>
                    </div>
                    <div className={templateCSS.partEditor}>
                      <div className={templateCSS.partTitle}>
                        Scale
                      </div>
                      <div className={templateCSS.partInput}>
                        <input placeholder="x" />
                        <input placeholder="y" />
                        <input placeholder="z" />
                      </div>
                    </div>
                    <div className={templateCSS.partEditor}>
                      <div className={templateCSS.partTitle}>
                        Rotation
                      </div>
                      <div className={templateCSS.partInput}>
                        <input placeholder="x" />
                        <input placeholder="y" />
                        <input placeholder="z" />
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