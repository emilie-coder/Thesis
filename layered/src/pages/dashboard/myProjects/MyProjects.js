import React, { useEffect, useState } from 'react';
import * as db from '../../../firebase/config';
import { selectUserID } from '../../../redux/slice/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { SET_USER_PROJECTS, selectUserProjectList } from '../../../redux/slice/projectsSlice';
import { useNavigate } from 'react-router-dom';

const MyProjects = () => {
  const userID = useSelector(selectUserID);
  const dispatch = useDispatch();
  const userProjectsFound = useSelector(selectUserProjectList);
  const navigate = useNavigate();
  
  const fetchUserProjects = async () => {
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
  }, [userProjectsFound]); // Watch for changes in userID

  const movePage = (e) => {
    e.preventDefault();
    navigate("/viewProjects");
  }

  return (
    <div>
      <h2>These are my projects</h2>
      <button onClick={movePage}>View all of my projects</button>
      <pre>{JSON.stringify(userProjectsFound)}</pre>
    </div>
  );
}

export default MyProjects;
