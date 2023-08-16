import React from 'react'
import { useSelector } from 'react-redux';
import { selectProjectAuthor, selectProjectID, selectProjectTemplate, selectProjectTitle } from '../../redux/slice/projectSlice';
import ThreeScene from "../../threejs/three-scene";


const Template = () => {


  const projAuthor = useSelector(selectProjectAuthor);
    const projiD = useSelector(selectProjectID);
    const proTemplate = useSelector(selectProjectTemplate);
    const projTitle = useSelector(selectProjectTitle);

    return (
        <div>
            CreateProjectPage - TEMPLATE
            <div>
                current project info:
                <div>
                    title: {projTitle}
                </div>
                <div>
                    projiD: {projiD}
                </div>
                <div>
                    proTemplate: {proTemplate}
                </div>
                <div>
                    Project Author: {projAuthor}
                </div>
            </div>

            <div>
              <ThreeScene/>
            </div>
        </div>
    )
}

export default Template