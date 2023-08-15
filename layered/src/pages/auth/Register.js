/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {getAuth, createUserWithEmailAndPassword} from "firebase/auth";
import Loader from "../../components/loader/Loader"
import { useNavigate } from 'react-router-dom';
import * as db from '../../firebase/config';


const Register = () => {

    const[email, SetEmail] = useState("");
    const[password, SetPassword] = useState("");
    const[cPassword, SetCPassword] = useState("");
    const[isLoading, setIsLoading] = useState(false);

    const success = () => toast("Successfully registered");
    
    const navigate = useNavigate();

    const registerUser = (e) => {
        e.preventDefault();

        console.log(email, password, cPassword);

        if(password !== cPassword){
            toast.error("Passwords do not match :( ")
        }

        setIsLoading(true);
        const auth = getAuth();
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            console.log(user);
            setIsLoading(false);
            success();
            db.createUser((user.uid));
            navigate("/");
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            toast.error(errorMessage);
            setIsLoading(false);
            console.log("failed");
            console.log(errorMessage);
        });
        }

    return (
        <div>
            {isLoading && <Loader/>}
            Register
            <form onSubmit={registerUser}>
                <input type='text' placeholder='Email' required value={email} onChange={(e) => SetEmail(e.target.value)}/>
                <input type='text' placeholder='Password' required value={password} onChange={(e) => SetPassword(e.target.value)}/>
                <input type='text' placeholder='Confirm Password' required value={cPassword} onChange={(e) => SetCPassword(e.target.value)}/>
                <button type="submit" > submit </button>
            </form>
        </div>
    )
}

export default Register;