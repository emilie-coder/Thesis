import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { selectUserID, selectUsername } from '../../redux/slice/authSlice'
import { useDispatch, useSelector } from 'react-redux';
import * as db from '../../firebase/config';
import { SET_ACTIVE_PROJECT } from '../../redux/slice/projectSlice';
import { SET_ACTIVE_TEMPLATE } from '../../redux/slice/templateSlice';

import cpCSS from './CreateProject.module.css';



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
          tempID = await db.createUserProject(userID, userName, "untitled", chosenTemplateInteger, chosenTemplate);
        } else {
          tempID = await db.createUserProject(userID, userName, title, chosenTemplateInteger, chosenTemplate);
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
      db.fetchTemplates(userID, (snapshot) => {
        const templates = [];
    
        // Iterate over the keys of the snapshot object
        Object.keys(snapshot).forEach((key) => {
          const templateData = snapshot[key];
    
          templates.push({
            key: key,
            templateTitle: templateData.templateTitle,
            templateCover: templateData.templateCover,
          });
        });
    
        setTemplates(templates);
      });
    }, [userID]);
    
    


    return (
        <div className={cpCSS.createProjectPage}>
            <div className={cpCSS.title} >CreateProject </div>

            <form onSubmit={createDBProject}>
                <input type='text' placeholder="Project title" value={title} onChange={(e) => SetTitle(e.target.value)} className={cpCSS.inputbox}/>
                <div className={cpCSS.chooseTemplate}>
                  Choose Template
                  {templates && (
                  <div>
                  {templates.map((templateValue) => (
                  <button
                    key={templateValue.key}
                    className={`${cpCSS.templateButton} ${
                      chosenTemplate === templateValue.templateTitle &&
                      chosenTemplateInteger === templateValue.key // Check both name and integer
                        ? cpCSS.selectedTemplateButton
                        : ''
                    }`}
                    onClick={(e) =>
                      chooseTemplate(e, templateValue.templateTitle, templateValue.key)
                    }
                  >
                    <img src={templateValue.templateCover} alt={'template cover'} className={cpCSS.templateImage} />
                    {templateValue.templateTitle}
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
