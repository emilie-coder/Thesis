import { ReactDOM } from 'react-dom';
import loaderImage from "../../assets/loader.gif";

const Loader = () => {
  return ReactDOM.createPortal (
    <div>
        Loader
        <img scr={loaderImage} alt="loading..."/>
    </div>,
    document.getElementById("loader")
  )
}

export default Loader