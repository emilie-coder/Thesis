import React from 'react';
import userImageCSS from './UserImage.module.css';

const UserImageFile = ({ imageURL }) => {
  return (
      <img src={imageURL} alt="userUploadedImage" />
  );
};

export default UserImageFile;
