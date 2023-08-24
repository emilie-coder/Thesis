import React from 'react'
import { useSelector } from 'react-redux';
import { selectProjectAuthor, selectProjectID, selectProjectTemplate, selectProjectTemplateInteger, selectProjectTitle } from '../../redux/slice/projectSlice';
// import ThreeScene from "../../threejs/three-scene";
import TemplateScene from "../../threejs/templateScene";
import { storage } from '../../firebase/config';
import { useState, useEffect } from 'react';
import { selectUserID } from '../../redux/slice/authSlice'
import { v4 } from "uuid";
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
import templateCSS from './Template.module.css';
import UserImageFile from './imageComponents/UserImageFile';

const Template = () => {


  const projAuthor = useSelector(selectProjectAuthor);
  const projID = useSelector(selectProjectID);
  const proTemplate = useSelector(selectProjectTemplate);
  const proTemplateInteger = useSelector(selectProjectTemplateInteger);
  const projTitle = useSelector(selectProjectTitle);
  const [imageUpload, setImageUplad] = useState(null);
  const [imageList, setImageList] = useState([]);
  const userID = useSelector(selectUserID);


  const uploadImage = () => {
    if(imageUpload == null) return;

    const imageRef = ref(storage, userID + '/project_' + projID + `/images/${imageUpload.name + v4()}`);
    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setImageList((prev) => [...prev, url]);
      })
    })

  };

  useEffect(() => {
    const imageListRef = ref(storage, userID + '/project_null/images/');
    listAll(imageListRef)
      .then((response) => {
        response.items.forEach((item) => {
          getDownloadURL(item)
            .then((url) => {
              setImageList((prev) => [...prev, url]);
            })
            .catch((error) => {
              console.error("Error getting download URL:", error);
            });
        });
      })
      .catch((error) => {
        console.error("Error listing images:", error);
      });
  }, []);

  return (
      <div className={templateCSS.templatePage}>




{/* 
          <div className={templateCSS.fileUploadContainer}>


            <div className={templateCSS.fileUpload}>
              <input type="file" onChange={((event) => {setImageUplad(event.target.files[0])})}/>
              <button onClick={uploadImage}>upload image</button>
            </div>

            <div className={templateCSS.userImages}>


              {imageList.map((url) => {
                return <UserImageFile key={url} imageURL={url} />
              })}
            </div>
          </div> */}


          <div className = {templateCSS.test}>
              <TemplateScene scene={proTemplateInteger}/>
          </div>
          
      </div>
    )
}

export default Template