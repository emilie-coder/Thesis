import React from 'react'

const Register = () => {
  return (
    <div>
        Register

        <form>
            <input type='text' placeholder='Username' required/>
            <input type='text' placeholder='Email' required/>
            <input type='text' placeholder='Password' required/>
            <input type='text' placeholder='Confirm Password' required/>
        </form>
    </div>
  )
}

export default Register