import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { selectUserID, selectUsername } from '../../redux/slice/authSlice'
import { useDispatch, useSelector } from 'react-redux';
import * as db from '../../firebase/config';
import { SET_ACTIVE_PROJECT } from '../../redux/slice/projectSlice';

const CreateProject = () => {

    const userID = useSelector(selectUserID);
    const userName = useSelector(selectUsername);
    
    const[title, SetTitle] = useState("");

    const [templates, setTemplates] = useState(null);

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

    useEffect(() => {
      db.fetchTemplates(userID, (notes) => {
        setTemplates(notes);
      });
    }, [userID]);
      

    return (
        <div>
            CreateProject

            <form onSubmit={createDBProject}>
                <input type='text' placeholder="Project title" value={title} onChange={(e) => SetTitle(e.target.value)}/>
                <div>
                  Choose Template
                  {templates && (
                  <div>
                    {Object.keys(templates).map((projectId) => (
                      <div key={projectId}>
                        {projectId}
                      </div>
                    ))}
                  </div>
                )}
                </div>
                <button type='submit'> Create my piece </button>
            </form>



        </div>
    )
}

export default CreateProject