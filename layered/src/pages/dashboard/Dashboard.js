import React, { useEffect, useState } from 'react';
import { selectEmail, selectUserID, selectUsername } from '../../redux/slice/authSlice';
import { useSelector } from 'react-redux';
import MyProjects from './myProjects/MyProjects';
import MyCollections from './myCollections/MyCollections';
import { useNavigate } from 'react-router-dom';
import { fetchNotes } from '../../firebase/config';

const Dashboard = () => {
  const userID = useSelector(selectUserID);
  const userName = useSelector(selectUsername);
  const email = useSelector(selectEmail);
  const navigate = useNavigate();

  const [userProjects, setUserProjects] = useState(null);

  const createNewProject = (e) => {
    e.preventDefault();
    navigate("/createNewProject");
  };

  useEffect(() => {
    fetchNotes(userID, (notes) => {
      setUserProjects(notes);
      console.log("in use effect");
      console.log(notes);
    });
  }, [userID]);

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
        {userProjects && (
          <div>
            {Object.keys(userProjects).map((projectId) => (
              <div key={projectId}>{userProjects[projectId].title}</div>
            ))}
          </div>
        )}
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