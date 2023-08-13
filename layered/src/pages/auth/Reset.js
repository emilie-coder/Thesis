import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import Loader from '../../components/loader/Loader';


// for me to use later - great documentation for how to manage user states

// https://firebase.google.com/docs/auth/web/manage-users
const Reset = () => {

  const[email, SetEmail] = useState("");
  const[isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();


  const auth = getAuth();

  const resetPassword = (e) => {
    e.preventDefault();
    console.log("resetting password");


    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {
        toast.success("check email for reset link");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        toast.error(errorMessage);
      });


  }


  return (
    <div>
      Reset Password
      {isLoading && <Loader/>}
      <form onSubmit={resetPassword}>
      <input type='text' placeholder='Email' required value={email} onChange={(e) => SetEmail(e.target.value)}/>
        <button type='submit'> Reset Password </button>
      </form>
      <div>
      <Link to="/register"> Register </Link>
      <Link to="/login"> Login </Link>
      </div>
    </div>
  )
}

export default Reset