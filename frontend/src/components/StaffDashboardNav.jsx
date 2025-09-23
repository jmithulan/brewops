import React, { useState } from 'react'
import { FaSearch, FaEnvelope, FaBell, FaUser, FaUserCircle } from 'react-icons/fa'


export default function StaffDashboardNav() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="bg-green-600 shadow-md px-4 py-3 flex flex-col md:flex-row items-center justify-between">
      
      {/* Brand */}
      <div className="text-white text-2xl md:text-3xl font-bold mb-2 md:mb-0">
        BrewOps
       </div>

    

      {/* Icons + Profile */}
      <div className="flex items-center space-x-4 md:space-x-6 relative">

        {/* Message Icon */}
        <button className="relative text-white hover:text-yellow-400 transition-colors duration-300">
          <FaEnvelope size={20} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full animate-pulse">
            3
          </span>
        </button>

        {/* Notification Icon */}
        <button className="relative text-white hover:text-blue-400 transition-colors duration-300">
          <FaBell size={20} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full animate-pulse">
            5
          </span>
        </button>

        {/* Profile Image with Dropdown */}
        <div className="relative">
          <FaUserCircle className="text-white text-2xl cursor-pointer hover:text-green-300" onClick={() => setDropdownOpen(!dropdownOpen)} />

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white text-gray-800 rounded shadow-lg z-50 ring-1 ring-gray-200">
              <a href="/staff/profile" className="block px-4 py-2 hover:bg-gray-100 transition-colors">My Profile</a>
              <a href="/staff/profile/setting" className="block px-4 py-2 hover:bg-gray-100 transition-colors">Settings</a>
              <a href="/login" className="block px-4 py-2 hover:bg-gray-100 transition-colors">Logout</a>
            </div>
          )}
        </div>

      </div>
    </nav>
  )
}
