import React, { useState } from 'react'

const Register = () => {

    const[email, SetEmail] = useState("");
    const[password, SetPassword] = useState("");
    const[cPassword, SetCPassword] = useState("");

    const registerUser = (e) => {
        e.preventDefault();

        
        console.log(email, password, cPassword);

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
                <button type="submit"> submit </button>
            </form>
        </div>
    )
}

export default Register;