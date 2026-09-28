import React from 'react'
import Topbar from './Topbar'
import Navmenu from './Navmenu'

const Navbar = () => {
  return (
    <div className='navbar-container'>
      <Topbar />
      <Navmenu />
    </div>
  )
}

export default Navbar