/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import headerCSS from './Header.module.css';
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import Loader from "../../components/loader/Loader";
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { useDispatch } from "react-redux";
import { SET_ACTIVE_USER } from '../../redux/slice/authSlice';


const Header = () => {

  
    const[isLoading, setIsLoading] = useState(false);
    const[displayName, setDisplayName] = useState('');
    const navigate = useNavigate();
    

    // redux
    const dispatch = useDispatch();
    


    //  monitor currently signed in user
    useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {  
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;

        if (user.displayName == null ) {
          const u1 = user.email.substring(0, '@');
          const uName = u1.charAt(0).toUpperCase() + u1.slice(1);
          setDisplayName(uName);
        } else {
          setDisplayName(user.displayName);
        }

        dispatch(SET_ACTIVE_USER({
          email: user.email,
          userName: user.displayName ? user.displayName : displayName,
          userID: uid,
        }));

      } else {
        setDisplayName('"');
      }
    });


    })      

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
          <a href='#'>
            Hi, {displayName}
          </a>
        </ul>
      </nav>
    </div>
  )
}

export default Header