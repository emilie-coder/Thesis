import React from 'react'
import { useSelector } from 'react-redux';
import { selectProjectAuthor, selectProjectID, selectProjectTemplate, selectProjectTitle } from '../../redux/slice/projectSlice';
import ThreeScene from "../../threejs/three-scene";
import { storage } from '../../firebase/config';
import { useState, useEffect } from 'react';
import { selectUserID } from '../../redux/slice/authSlice'
import { v4 } from "uuid";
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';

const Template = () => {


  const projAuthor = useSelector(selectProjectAuthor);
  const projID = useSelector(selectProjectID);
  const proTemplate = useSelector(selectProjectTemplate);
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
            <div>
              {imageList.map((url) => {
                return <img src={url} alt='userUploadedImage'/>
              })}
            </div>
            {/* <ThreeScene/> */}
          </div>
      </div>
    )
}

export default Template