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


const View = () => {
    const dispatch = useDispatch();
    const [playPause, setPlayPause] = useState(false);
    const userID = useSelector(selectUserID);
    const [projectScene, setProjectScene] = useState(null);
  
    // i keep losing data when refreshing so...
    // Get the current location using useLocation
    const location = useLocation();
    const pathSegments = location.pathname.split('/');
    const projectIDURL = pathSegments[pathSegments.length - 1]; // Get the last part of the URL
  

    const [toggleSides, setToggleSides] = useState(false);

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
   

  return (
    <div>
        
        this is the View
        <ViewStereo scene={projectScene} toggleSides={toggleSides} playPause={playPause}/>
        <ViewStereo scene={projectScene} toggleSides={toggleSides} playPause={playPause}/>
    </div>
  )
}

export default View