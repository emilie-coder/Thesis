import React from 'react'
import { Link } from 'react-router-dom'
//import style from './Header.module.scss'

const Header = () => {
  return (
    <div>
      <Link to='/'> Layered </Link>
      <Link to='/Contact'> Contact </Link>
      <Link to='/SignIn'> SignIn </Link>
      <Link to='/Research'> Research </Link>
      <Link to='/Browse'> Browse </Link>
    </div>
  )
}

export default Header