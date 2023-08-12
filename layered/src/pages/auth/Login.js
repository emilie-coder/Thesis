import React from 'react'
import { Link } from 'react-router-dom'
const Login = () => {
  return (
    <div className='login'>
        User Login
        <form>
            <input type='text' placeholder='Email' required/>
            <input type='text' placeholder='Password' required/>
        </form>
        <button> Login </button>
        <div>
            Forgot password?
            <Link to="/reset"> Reset Password </Link>
        </div>
        <div>
            --- or ---
        </div>
        <button> Login with Google </button>
        <div>
            Dont have an account?
            <Link to="/register"> Register </Link>
        </div>
    </div>
  )
}

export default Login