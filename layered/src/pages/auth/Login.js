import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import app from '../../firebase/config';
import Loader from "../../components/loader/Loader";
import { useNavigate } from 'react-router-dom';


const Login = () => {

    const auth = getAuth(app);
    const[email, SetEmail] = useState("");
    const[password, SetPassword] = useState("");
    const[isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const loginUser = (e) => {
        e.preventDefault();
        console.log(email, password);

        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // eslint-disable-next-line no-unused-vars
            const user = userCredential.user;
            toast.success("Logged in :D")
            setIsLoading(false);
            navigate("/");
        })
        .catch((error) => {
            // const errorCode = error.code;
            const errorMessage = error.message;
            toast.error(errorMessage);
            setIsLoading(false);
        });

    }

    // Login with Google

    const provider = new GoogleAuthProvider();

    const signInWithGoogle = (e) => {
        e.preventDefault();

        signInWithPopup(auth, provider)
        .then((result) => {

            // eslint-disable-next-line no-unused-vars
            const user = result.user;
            toast.success("Logged in :D")
            setIsLoading(false);
            navigate("/");


        }).catch((error) => {

            const errorMessage = error.message;
            toast.error(errorMessage);
            setIsLoading(false);

        });

    }

    return (
        <div className='login'>
            {isLoading && <Loader/>}
            User Login
            <form onSubmit={loginUser}>
                <input type='text' placeholder='Email' required value={email} onChange={(e) => SetEmail(e.target.value)}/>
                <input type='text' placeholder='Password' required value={password} onChange={(e) => SetPassword(e.target.value)}/>
                <button type='submit'> Login </button>
            </form>
            <div>
                Forgot password?
                <Link to="/reset"> Reset Password </Link>
            </div>
            <div>
                --- or ---
            </div>
            <button onClick={signInWithGoogle}> Login with Google </button>
            <div>
                Dont have an account?
                <Link to="/register"> Register </Link>
            </div>
        </div>
  )
}

export default Login