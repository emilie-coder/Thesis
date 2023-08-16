import React from 'react';
import userImageCSS from './UserImage.module.css';

const UserImageFile = ({ imageURL }) => {
  return (
    <div className={userImageCSS.imageHolder}>
      <img src={imageURL} alt="userUploadedImage" />
    </div>
  );
};

export default UserImageFile;
