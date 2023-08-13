import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import headerCSS from './Header.module.css';
import { getAuth, signOut } from "firebase/auth";
import Loader from "../../components/loader/Loader";
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';

const Header = () => {

  const[isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();


  const logoutUser = () =>{
    const auth = getAuth();
  signOut(auth).then(() => {
    toast.success("Logged out :D");
    setIsLoading(false);
    navigate("/");
  }).catch((error) => {
    toast.error(error)
    setIsLoading(false);
  });
  }


  return (
    <div className={headerCSS.header}>
      {isLoading && <Loader/>}
      <ToastContainer/>
      <nav>
        <ul className={headerCSS.ul}>
          <Link to='/'> Layered </Link>
          <Link to='/Research'> Research </Link>
          <Link to='/Browse'> Browse </Link>
          <Link to='/Contact'> Contact </Link>
          <Link to='/Login'> Login </Link>
          <Link to='/Register'> Register </Link>
          <Link to='/' onClick={logoutUser}> Log Out </Link>
        </ul>
      </nav>
    </div>
  )
}

export default Header