import React from 'react'
import NavigationBar from '../navigationBar'
import { Link } from 'react-router-dom';
import profile from '../../assets/profile.png'

export default function SupplierNavigation() {
  return (
    <div className='supplier-navigation'>
        <div className="nav">
        <NavigationBar />
        <nav>
          <div className="container">
            <div className="subnav">
              <Link to="">Home</Link>
              <Link to="/SupplierHome">Suppliers</Link>
              <Link to="/SupplierRecodeTable">Supplier Record</Link>
              <Link to="">
                <img src={profile} alt="Profile" />
              </Link>
            </div>
          </div>
        </nav>
      </div>
      
    </div>
  )
}
