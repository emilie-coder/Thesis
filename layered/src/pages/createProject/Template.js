import React from 'react'
import { useSelector } from 'react-redux';
import { selectProjectAuthor, selectProjectID, selectProjectTemplate, selectProjectTitle } from '../../redux/slice/projectSlice';
import ThreeScene from "../../threejs/three-scene";
import { storage } from '../../firebase/config';
import { useState } from 'react';
import { selectUserID } from '../../redux/slice/authSlice'
import { v4 } from "uuid";
import { ref, uploadBytes } from 'firebase/storage';

const Template = () => {


  const projAuthor = useSelector(selectProjectAuthor);
  const projID = useSelector(selectProjectID);
  const proTemplate = useSelector(selectProjectTemplate);
  const projTitle = useSelector(selectProjectTitle);

  const userID = useSelector(selectUserID);

  const uploadImage = () => {
    if(imageUpload == null) return;

    const imageRef = ref(storage, userID + '/project_' + projID + `/images/${imageUpload.name + v4()}`);
    uploadBytes(imageRef, imageUpload).then(() => {
      alert("image upload");
    })

  };



  const [imageUpload, setImageUplad] = useState(null);




    return (
        <div>
            CreateProjectPage - TEMPLATE
            <div>
                current project info:
                <div>
                    title: {projTitle}
                </div>
                <div>
                    projiD: {projID}
                </div>
                <div>
                    proTemplate: {proTemplate}
                </div>
                <div>
                    Project Author: {projAuthor}
                </div>
            </div>

            <div>
              <input type="file" onChange={((event) => {setImageUplad(event.target.files[0])})}/>
              <button onClick={uploadImage}>upload image</button>
              {/* <ThreeScene/> */}
            </div>
        </div>
    )
}

export default Template