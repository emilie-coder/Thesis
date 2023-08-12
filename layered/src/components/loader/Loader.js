import React from 'react';
import ReactDOM from 'react-dom';
import loaderImage from "../../assets/load.gif";

const Loader = () => {
  return ReactDOM.createPortal (
    <div>
        Loader
        <img src={loaderImage} alt="loading..."/>
    </div>,
    document.getElementById("loader")
  )
}

export default Loader