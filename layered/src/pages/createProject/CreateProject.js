import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import { selectEmail, selectUserID, selectUsername } from '../../redux/slice/authSlice'
import { useSelector } from 'react-redux';

const CreateProject = () => {

    const userID = useSelector(selectUserID);
    const userName = useSelector(selectUsername);
    const email = useSelector(selectEmail);
    const navigate = useNavigate();

    const[title, SetTitle] = useState("untitled");


    const createDBProject = (e) => {
        e.preventDefault();
        navigate("/createNewProject");

        // call firebase function here
      }

    return (
        <div>
            CreateProject

            <form onSubmit={createDBProject}>
                <input type='text' placeholder="Project title" value="untitled" onChange={(e) => SetTitle(e.target.value)}/>
            </form>



        </div>
    )
}

export default CreateProject