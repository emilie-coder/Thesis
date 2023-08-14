import React from 'react'
import { useSelector } from 'react-redux';
import { selectProjectAuthor, selectProjectID, selectProjectTemplate, selectProjectTitle } from '../../redux/slice/projectSlice';

const CreateProjectPage = () => {

    const projAuthor = useSelector(selectProjectAuthor);
    const projiD = useSelector(selectProjectID);
    const proTemplate = useSelector(selectProjectTemplate);
    const projTitle = useSelector(selectProjectTitle);


    return (
        <div>
            CreateProjectPage
            <div>
                current project info:
                <div>
                    project tilte: {projTitle}
                </div>
                <div>
                    project id: {projiD}
                </div>
                <div>
                    project template: {proTemplate}
                </div>
                <div>
                    Porject author: {projAuthor}
                </div>

            </div>
            
        </div>
    )
}

export default CreateProjectPage