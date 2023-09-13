/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import headerCSS from './Header.module.css';
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import Loader from "../../components/loader/Loader";
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { useDispatch } from "react-redux";
import { SET_ACTIVE_USER, REMOVE_ACTIVE_USER } from '../../redux/slice/authSlice';
import ShowOnLogin, { ShowOnLogOut } from './hiddenLink/hiddenLink';

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
          const u1 = user.email.substring(0, user.email.indexOf("@"));
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
        setDisplayName("");
        dispatch(REMOVE_ACTIVE_USER());
      }
    }, [dispatch, displayName]);


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
      <nav className={headerCSS.nav}>


          <div className={headerCSS.leftLogo}>
            <Link to='/'> ECHO </Link>
          </div>

{/* 
          <div className={headerCSS.middleLinks} >
            <Link to='/Research'> Research </Link>
            <Link to='/Browse'> Browse </Link>
            <Link to='/Contact'> Contact </Link>
          </div> */}

          

          <div className={headerCSS.userStates}>
            <ShowOnLogOut>
              <Link to='/Login'> Login </Link>
              <Link to='/Register'> Register </Link>
            </ShowOnLogOut>


            <ShowOnLogin>
              <Link to='/' onClick={logoutUser}> Log Out </Link>
              <Link to ='/myDashboard'>
                My Dashboard
              </Link>
            </ShowOnLogin>
          </div>
      </nav>
    </div>
  )
}

export default Header