import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import { selectUserID, selectUsername } from '../../redux/slice/authSlice'
import { useDispatch, useSelector } from 'react-redux';
import * as db from '../../firebase/config';
import { SET_ACTIVE_PROJECT } from '../../redux/slice/projectSlice';


const CreateProject = () => {

    const userID = useSelector(selectUserID);
    const userName = useSelector(selectUsername);
    
    const[title, SetTitle] = useState("");


    const navigate = useNavigate();
    const dispatch = useDispatch();

    const createDBProject = async (e) => {
        e.preventDefault();
      
        try {
          const tempID = await db.createUserProject(userID, userName, title);
      
          // Handle the redux state here
          dispatch(
            SET_ACTIVE_PROJECT({
              projectID: tempID, 
              projectTitle: title,
              projectTemplate: null,
              projectTimeCreated: null,
              projectTimeLastSaved: null,
              projectAuthor: userName,
            })
          );
      
          navigate(`/createNewProject/${tempID}`); 
        } catch (error) {
          console.error("Error creating project:", error);
        }
      };
      

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