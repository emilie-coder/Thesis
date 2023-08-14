import React from 'react'
import { selectEmail, selectUserID, selectUsername } from '../../redux/slice/authSlice'
// import style from './Dashboard.module.scss'
import { useSelector } from 'react-redux';
import MyProjects from './myProjects/MyProjects';
import MyCollections from './myCollections/MyCollections';
import { useNavigate } from 'react-router-dom';



const Dashboard = () => {
  const userID = useSelector(selectUserID);
  const userName = useSelector(selectUsername);
  const email = useSelector(selectEmail);
  const navigate = useNavigate();


  const createNewProject = (e) => {
    e.preventDefault();
    navigate("/createNewProject");
  }


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
        <MyProjects/>
        <button onClick={createNewProject}> Create New Project </button>
      </div>
      <div>
        My Collections:
        <MyCollections/>
        <button> Create New Collection </button>
      </div>
    </div>
  )
}

export default Dashboard