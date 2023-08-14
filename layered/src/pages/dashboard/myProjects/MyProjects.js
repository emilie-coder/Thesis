import React, { useEffect, useState } from 'react';
import * as db from '../../../firebase/config';
import { selectUserID } from '../../../redux/slice/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { SET_USER_PROJECTS, selectUserProjectList } from '../../../redux/slice/projectsSlice';

const MyProjects = () => {
  const userID = useSelector(selectUserID);
  const dispatch = useDispatch();
  const userProjectsFound = useSelector(selectUserProjectList);

  const fetchUserProjects = async (e) => {
    try {
      const projects = await db.fetchUserProjects(userID);


      // Handle the redux state here
      dispatch(
        SET_USER_PROJECTS({
          userProjectsExist: true, 
          userProjectList: projects,
        })
      );

    } catch (error) {
      console.error("Error pulling user projects", error);
    }
  };


  useEffect(() => {
    fetchUserProjects();
  }, []); // Watch for changes in userID

  return (
    <div>
      <h2>These are my projects</h2>
      {userProjectsFound && Object.keys(userProjectsFound).map(projectID => (
        <div key={projectID}>
          Project ID: {projectID}
          {/* Render other project data from userProjectList[projectID] */}
        </div>
      ))}
    <button>refresh</button>
    </div>
  );
}

export default MyProjects;
