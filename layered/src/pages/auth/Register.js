import React, { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {

    const[email, SetEmail] = useState("");
    const[password, SetPassword] = useState("");
    const[cPassword, SetCPassword] = useState("");
    const fail = () => toast("Passwords do not match");
    const success = () => toast("Successfully registered");
    
    const registerUser = (e) => {
        e.preventDefault();

        console.log(email, password, cPassword);

        if(password !== cPassword){
            fail();
        } else {
            success();
        }

        SetEmail('');
        SetPassword('');
        SetCPassword('');
    }

    return (
        <div>
            Register
            <form onSubmit={registerUser}>
                <input type='text' placeholder='Email' required value={email} onChange={(e) => SetEmail(e.target.value)}/>
                <input type='text' placeholder='Password' required value={password} onChange={(e) => SetPassword(e.target.value)}/>
                <input type='text' placeholder='Confirm Password' required value={cPassword} onChange={(e) => SetCPassword(e.target.value)}/>
                <button type="submit" > submit </button>
            </form>
            <ToastContainer/>
        </div>
    )
}

export default Register;