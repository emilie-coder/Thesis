import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import headerCSS from './Header.module.css';
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import Loader from "../../components/loader/Loader";
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { useDispatch } from "react-redux";


const Header = () => {

  
    const[isLoading, setIsLoading] = useState(false);
    const[displayName, setDisplayName] = useState('');
    const navigate = useNavigate();
    

    //


    //  monitor currently signed in user
    useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {  
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        console.log(user.displayName);
        setDisplayName(user.displayName);
      } else {
        // User is signed out
        console.log("logged out");
        setDisplayName('');
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
          <p>
            Hi, {displayName}
          </p>
          "
        </ul>
      </nav>
    </div>
  )
}

export default Header