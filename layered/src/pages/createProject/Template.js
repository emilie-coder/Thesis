import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  SET_ACTIVE_PROJECT,
  SET_PROJECT_TITLE,
  selectProjectAuthor,
  selectProjectID,
  selectProjectTemplate,
  selectProjectTemplateInteger,
  selectProjectTitle,
} from '../../redux/slice/projectSlice';
import TemplateScene from '../../threejs/templateScene';
import { db, fetchProject, storage } from '../../firebase/config';
import { selectUserID, selectUsername } from '../../redux/slice/authSlice';
import { v4 } from 'uuid';
import {
  ref,
  uploadBytes,
  listAll,
  getDownloadURL,
  update,
} from 'firebase/storage';
import templateCSS from './Template.module.css';
import UserImageFile from './imageComponents/UserImageFile';
import ImageEditor from '../../components/editing/ImageEditor';


import { updateProjectTitle } from '../../firebase/config';
import { useLocation } from 'react-router-dom';

const Template = () => {
  const dispatch = useDispatch();
  const projAuthor = useSelector(selectProjectAuthor);
  const projID = useSelector(selectProjectID);
  const proTemplate = useSelector(selectProjectTemplate);
  const proTemplateInteger = useSelector(selectProjectTemplateInteger);
  const projTitle = useSelector(selectProjectTitle);
  const [imageUpload, setImageUpload] = useState(null);
  const [imageList, setImageList] = useState([]);
  const userID = useSelector(selectUserID);
  const [activeTab, setActiveTab] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false); // State to track if the title is being edited
  const [editedTitle, setEditedTitle] = useState(projTitle); // State to hold the edited title
  const userName = useSelector(selectUsername);



  // i keep losing data when refreshing so...
  // Get the current location using useLocation
  const location = useLocation();
  const pathSegments = location.pathname.split('/');
  const projectIDURL = pathSegments[pathSegments.length - 1]; // Get the last part of the URL

  
  // console.log('project ID url');
  // console.log(projectIDURL);       // this works


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
        // ... update other relevant states here
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };
  
    fetchProjectData();
  }, [dispatch, projectIDURL, userID]);
  



  const handleClick = (tab) => {
    setActiveTab(tab);
  };

  const stemGroupName = 'flower_stem';
  const pollenGroupName = 'flower_pollen';
  const petalsGroupName = 'petals';

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
    const imageListRef = ref(storage, userID + '/project_null/images/');
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
  }, []);

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


  return (
    <div className={templateCSS.templatePage}>
      <div className={templateCSS.leftEditor}>
        {projID}
        <div className={templateCSS.leftEditorTitle}>
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
          <h5 className={templateCSS.projectSubTitle}> {[proTemplate]} </h5>
        </div>
        <div className={templateCSS.actualEditor}>
          <TemplateScene scene={proTemplateInteger} />
        </div>
        </div>

        <div className={templateCSS.rightEditor}>
          <div className={templateCSS.rightEditorTitle} >
            <h4>Image Editor</h4>
          </div>

          <div className={templateCSS.rightEditorSub}>
            <div className={templateCSS.rightImageEditorTitle}>
              select image
            </div>

            <div className={templateCSS.rightImageEditor}>
              

            <div className={templateCSS.choicesContainer}>
              {proTemplateInteger === 0 &&
              <div className='templateCSS.choices'>
                  <button onClick={() => handleClick('folder1')} id={stemGroupName}>box</button>
              </div>
              }

              {proTemplateInteger === 1 &&
              <div className='templateCSS.choices'>
                  <button onClick={() => handleClick('folder1')} id={stemGroupName}>Beak </button>
                  <button onClick={() => handleClick('folder2')} id={pollenGroupName}>Duck Skin</button>
                  <button onClick={() => handleClick('folder3')} id={petalsGroupName}>Pond</button>
                </div>
              }

              {proTemplateInteger === 2 &&
              <div className ='templateCSS.choices'>
                  <button onClick={() => handleClick('folder1')} id={stemGroupName}>Stem Group</button>
                  <button onClick={() => handleClick('folder2')} id={pollenGroupName}>Pollen Group</button>
                  <button onClick={() => handleClick('folder3')} id={petalsGroupName}>Petals Group</button>
                  </div>
              }
            </div>
            <div className={templateCSS.choicedInfo}>
            <div className="folder-container">
              {activeTab === 'folder1' && <ImageEditor />}
              {activeTab === 'folder2' && <ImageEditor />}
              {activeTab === 'folder3' && <ImageEditor />}
            </div>
            </div>
            </div>
                      
          <div className={templateCSS.fileUploadContainer}>


            <div className={templateCSS.fileUpload}>
              <input type="file" onChange={((event) => {setImageUpload(event.target.files[0])})}/>
              <button onClick={uploadImage}>upload image</button>
            </div>

            <div className={templateCSS.userImages}>


              {imageList.map((url) => {
                return <UserImageFile key={url} imageURL={url} />
              })}
            </div>
          </div>

          </div>


    </div>

      </div>
    )
}

export default Template