import React, { useEffect, useState } from 'react';
import { selectEmail, selectUserID, selectUsername } from '../../redux/slice/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import MyProjects from './myProjects/MyProjects';
import MyCollections from './myCollections/MyCollections';
import { useNavigate } from 'react-router-dom';
import { db, fetchUserProjects, fetchProject } from '../../firebase/config';
import styles from './Dashboard.module.css';
import { SET_ACTIVE_PROJECT } from '../../redux/slice/projectSlice';

const Dashboard = () => {
  const userID = useSelector(selectUserID);
  const userName = useSelector(selectUsername);
  const email = useSelector(selectEmail);
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const [userProjects, setUserProjects] = useState(null);

  const createNewProject = (e) => {
    e.preventDefault();
    navigate("/createNewProject");
  };

  const loadUserProject = (projectID) => async (e) => {
    e.preventDefault();
  
    try {
      // Fetch the project data using your fetchProject function
      const projectData = await fetchProject(userID, projectID);
  
      // Create an object to hold the project information
      const projectInfo = {
        projectID: projectID,
        projectTitle: projectData.title,
        projectTemplate: projectData.template,
        projectTemplateInteger: projectData.templateID,
        projectTimeCreated: projectData.timeCreated,
        projectTimeLastSaved: projectData.timeLastSaved,
        projectAuthor: projectData.author,
      };
  
      // Dispatch the project information to Redux
      dispatch(SET_ACTIVE_PROJECT(projectInfo));
  
      // Navigate to the project template page
      navigate(`/createNewProjectTemplate/${projectID}`);
    } catch (error) {
      console.error('Error fetching project:', error);
      // Handle any errors here
    }
  };
  

  useEffect(() => {
    fetchUserProjects(userID, (notes) => {
      setUserProjects(notes);
    });
  }, [userID]);

  return (
    <div className={styles.dashboard}>
      <div className={styles.personalInfo}>
        <h2>Personal Information:</h2>
        <div>
          <span className={styles.infoLabel}>Username:</span> {userName}
        </div>
        <div>
          <span className={styles.infoLabel}>UserID:</span> {userID}
        </div>
        <div>
          <span className={styles.infoLabel}>Email:</span> {email}
        </div>
      </div>

      <div className={styles.projectsSection}>
        <h2>My Projects List:</h2>
        <MyProjects projects={userProjects} />
        {userProjects && (
          <div className={styles.projectList}>
            {Object.keys(userProjects).map((projectId) => (
              <div
                key={projectId}
                className={styles.projectItem}
                onClick={loadUserProject(projectId)} // Pass projectId as an argument to the function
              >
                {userProjects[projectId].title}
              </div>
            ))}
          </div>
        )}
        <button className={styles.createButton} onClick={createNewProject}>
          Create New Project
        </button>
      </div>

      <div className={styles.collectionsSection}>
        <h2>My Collections:</h2>
        <MyCollections />
        <button className={styles.createButton}>Create New Collection</button>
      </div>
    </div>
  );
};

export default Dashboard;
