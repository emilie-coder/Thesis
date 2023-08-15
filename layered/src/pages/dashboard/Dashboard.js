import React from 'react';
import { selectEmail, selectUserID, selectUsername } from '../../redux/slice/authSlice';
import { useSelector } from 'react-redux';
import MyProjects from './myProjects/MyProjects';
import MyCollections from './myCollections/MyCollections';
import { useNavigate } from 'react-router-dom';
import { useProjectSelector } from '../../customHooks/useProjectSelector';


const Dashboard = () => {
  const userID = useSelector(selectUserID);
  const userName = useSelector(selectUsername);
  const email = useSelector(selectEmail);
  const navigate = useNavigate();

  const userProjects = useProjectSelector(); // Use the custom hook

  const createNewProject = (e) => {
    e.preventDefault();
    navigate("/createNewProject");
  };

  return (
    <div>
      Dashboard
      <div>
        Personal information:
        <div>
          username: {userName}
        </div>
        <div>
          userID: {userID}
        </div>
        <div>
          email: {email}
        </div>
      </div>

      <div>
        My Projects list:
        <MyProjects projects={userProjects} />
        <button onClick={createNewProject}> Create New Project </button>
      </div>
      <div>
        My Collections:
        <MyCollections />
        <button> Create New Collection </button>
      </div>
    </div>
  );
};

export default Dashboard;
