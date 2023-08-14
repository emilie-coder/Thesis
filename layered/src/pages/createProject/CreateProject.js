import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import { selectEmail, selectUserID, selectUsername } from '../../redux/slice/authSlice'
import { useSelector } from 'react-redux';
import * as db from '../../firebase/config';


const CreateProject = () => {

    const userID = useSelector(selectUserID);
    const userName = useSelector(selectUsername);
    const navigate = useNavigate();

    const[title, SetTitle] = useState("");


    const createDBProject = (e) => {
        e.preventDefault();
        navigate("/createNewProject");

        // call firebase function here
        db.createUserProject(userID, userName, title); 

        // once it creates the project - we want to grab that projects id

        
        // handle the redux state here

        // path="/createNewProject/:id"
      }

    return (
        <div>
            CreateProject

            <form onSubmit={createDBProject}>
                <input type='text' placeholder="Project title" value={title} onChange={(e) => SetTitle(e.target.value)}/>
                <button type='submit'> Create my piece </button>
            </form>



        </div>
    )
}

export default CreateProject