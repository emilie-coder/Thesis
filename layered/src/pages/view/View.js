import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  SET_ACTIVE_PROJECT,
  SET_PROJECT_TITLE,
  selectProjectID,
  selectProjectTitle,
} from '../../redux/slice/projectSlice';
import { fetchProject } from '../../firebase/config';
import { selectUserID } from '../../redux/slice/authSlice';

import { useLocation } from 'react-router-dom';
import NewCanvas from '../../threejs/threeCanvas';
import ViewStereo from '../../threejs/ViewStereo';
import styles from './View.module.css';

const View = () => {
    const dispatch = useDispatch();
    const [playPause, setPlayPause] = useState(true);
    const userID = useSelector(selectUserID);
    const [projectScene, setProjectScene] = useState(null);
  
    // i keep losing data when refreshing so...
    // Get the current location using useLocation
    const location = useLocation();
    const pathSegments = location.pathname.split('/');
    const projectIDURL = pathSegments[pathSegments.length - 1]; // Get the last part of the URL
  

    const [toggleSides, setToggleSides] = useState(false);


    const [rightCamera, setRightCamera] = useState([-3, 5, 12])
    const [leftCamera, setLeftCamera] = useState([-2, 5, 12])

    const [rightCameraRot, setRightRotCamera] = useState([0, 0, 0])
    const [leftCameraRot, setLeftRotCamera] = useState([0, 0, 0])

     // Use this useEffect to update cameras based on external changes
  useEffect(() => {
    // Example: Listen for changes in an external variable and update cameras
    const externalChanges = { leftCamera: [-2, 5, 12], rightCamera: [-3, 5, 12] };

    // Check if the left camera has changed externally
    if (
      externalChanges.leftCamera &&
      JSON.stringify(externalChanges.leftCamera) !== JSON.stringify(leftCamera)
    ) {
      setLeftCamera(externalChanges.leftCamera);
      setRightCamera(externalChanges.leftCamera); // Apply the same to the right
    }

    // Check if the right camera has changed externally
    if (
      externalChanges.rightCamera &&
      JSON.stringify(externalChanges.rightCamera) !== JSON.stringify(rightCamera)
    ) {
      setRightCamera(externalChanges.rightCamera);
      setLeftCamera(externalChanges.rightCamera); // Apply the same to the left
    }
  }, [leftCamera, rightCamera]);


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
        setProjectScene(projectData.projectScene);

        // ... update other relevant states here
      } catch (error) {
        // console.error('Error fetching project:', error);
      }
    };
  
    fetchProjectData();
  }, [dispatch, projectIDURL, userID]);


  const updateCameras = (updatedInformation) => {
    const [eyeType, cameraPosition, cameraRotation] = updatedInformation;

    if (eyeType === 'left') {
      setLeftCamera(cameraPosition);
      setLeftRotCamera(cameraRotation);

      // Apply the same translation and rotation to the right eye
      setRightCamera(cameraPosition);
      setRightRotCamera(cameraRotation);
    } else if (eyeType === 'right') {
      setRightCamera(cameraPosition);
      setRightRotCamera(cameraRotation);

      // Apply the same translation and rotation to the left eye
      setLeftCamera(cameraPosition);
      setLeftRotCamera(cameraRotation);
    }
  };
   

  return (
    <div className={styles.viewPage}>
        <ViewStereo scene={projectScene} toggleSides={toggleSides} playPause={playPause} camera={leftCamera} cameraRot={leftCamera} updateCameras={updateCameras} eye="left"/>
        <ViewStereo scene={projectScene} toggleSides={toggleSides} playPause={playPause} camera={leftCamera} cameraRot={leftCamera} updateCameras={updateCameras} eye="left"/>
    </div>
  )
}

export default View