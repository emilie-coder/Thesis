import React from 'react'
import { Link } from 'react-router-dom'

const Reset = () => {
  return (
    <div>
      Reset Password
      <form>
        <input type='text' placeholder='Email' required/>
      </form>
      <button> Reset Password </button>
      <div>
      <Link to="/register"> Register </Link>
      <Link to="/login"> Login </Link>
      </div>
    </div>
  )
}

export default Reset