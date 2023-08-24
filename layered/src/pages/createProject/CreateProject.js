import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { selectUserID, selectUsername } from '../../redux/slice/authSlice'
import { useDispatch, useSelector } from 'react-redux';
import * as db from '../../firebase/config';
import { SET_ACTIVE_PROJECT } from '../../redux/slice/projectSlice';
import { SET_ACTIVE_TEMPLATE } from '../../redux/slice/templateSlice';


const CreateProject = () => {

    const userID = useSelector(selectUserID);
    const userName = useSelector(selectUsername);
    
    const [title, SetTitle] = useState("");

    const [templates, setTemplates] = useState(null);

    const [chosenTemplate, setChosenTemplate] = useState(null);
    const [chosenTemplateInteger, setChosenTemplateInt] = useState(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const createDBProject = async (e) => {
        e.preventDefault();
      
        try {
          let tempID;
          
          if (title === null || title === "") {
            tempID = await db.createUserProject(userID, userName, "untitled", chosenTemplateInteger);
          } else {
            tempID = await db.createUserProject(userID, userName, title, chosenTemplateInteger);
          }
      
          // Handle the redux state here
          dispatch(
            SET_ACTIVE_PROJECT({
              projectID: tempID, 
              projectTitle: title,
              projectTemplate: chosenTemplate,
              projectTemplateInteger: chosenTemplateInteger,
              projectTimeCreated: null,
              projectTimeLastSaved: null,
              projectAuthor: userName,
            })
          );
      

            navigate(`/createNewProjectTemplate/${tempID}`);
          
        } catch (error) {
          console.error("Error creating project:", error);
        }
    };

    const chooseTemplate = (e, name, tempInt) => {
      e.preventDefault();
      // console.log("template chosen");
      setChosenTemplate(name);
      setChosenTemplateInt(tempInt);
    
      dispatch(
        SET_ACTIVE_TEMPLATE({
          templateChosen: true,
          template: name,
          templateInteger: tempInt,
        })
      );
    }
    

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
                    {templates.map((templateValue, projectId) => (
                      <button key={projectId} onClick={(e) => chooseTemplate(e, templateValue, projectId)}>
                        {templateValue}
                        {projectId}
                      </button>
                    ))}
                  </div>
                )}
                </div>
                <button type='submit'> Create my piece </button>
            </form>
        </div>
    )
}

export default CreateProject;
