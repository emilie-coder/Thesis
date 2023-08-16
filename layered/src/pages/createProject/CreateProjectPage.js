import React from 'react'
import { useSelector } from 'react-redux';
import { selectProjectAuthor, selectProjectID, selectProjectTemplate, selectProjectTitle } from '../../redux/slice/projectSlice';

const CreateProjectPage = () => {

    const projAuthor = useSelector(selectProjectAuthor);
    const projiD = useSelector(selectProjectID);
    const proTemplate = useSelector(selectProjectTemplate);
    const projTitle = useSelector(selectProjectTitle);

    // Define a function that will be called onClick
    const handleTitleClick = (e) => {
        e.preventDefault();
        console.log("Clicked title");
    }

    return (
        <div>
            CreateProjectPage
            <div>
                current project info:
                <div onClick={handleTitleClick}>
                    title: {projTitle}
                </div>
                <div>
                    projiD: {projiD}
                </div>
                <div>
                    proTemplate: {proTemplate}
                </div>
                <div>
                    projTitle: {projAuthor}
                </div>
            </div>
        </div>
    )
}

export default CreateProjectPage;
