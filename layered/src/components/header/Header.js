import React from 'react';
import { Link } from 'react-router-dom';
import headerCSS from './Header.module.css';

const Header = () => {
  return (
    <div className={headerCSS.header}>
      <nav>
        <ul className={headerCSS.ul}>
          <Link to='/'> Layered </Link>
          <Link to='/Research'> Research </Link>
          <Link to='/Browse'> Browse </Link>
          <Link to='/Contact'> Contact </Link>
          <Link to='/Login'> Login </Link>
          <Link to='/Register'> Register </Link>
          <Link to='/Reset'> Reset </Link>
        </ul>
      </nav>
    </div>
  )
}

export default Header