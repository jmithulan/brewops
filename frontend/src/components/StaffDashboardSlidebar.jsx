import React, { useState } from 'react';
import { FaHome, FaUsers, FaBox, FaChartBar, FaDollarSign, FaSignOutAlt, FaBars } from 'react-icons/fa';
import profile from '../assets/profile.png';
import { Link } from 'react-router-dom';

export default function StaffDashboardSlidebar() {
  const [isOpen, setIsOpen] = useState(false); // For mobile toggle

  return (
    <>
      {/* Mobile Navbar with Hamburger */}
      <div className="md:hidden flex items-center bg-gray-800 text-white p-3">
        <button onClick={() => setIsOpen(!isOpen)} className="mr-3">
          <FaBars size={24} />
        </button>
        <p className="font-semibold">Dashboard</p>
      </div>

      {/* Sidebar */}
      <div className={`fixed md:relative z-50 h-screen w-64 bg-gray-800 text-white flex flex-col justify-between transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 md:translate-x-0`}>
        <div>
          {/* Profile Image */}
          <div className="flex items-center p-4 border-b ">
            <img src={profile} alt="User" className="w-12 h-12 rounded-full mr-3 border"/>
            <div>
              <p className="font-semibold text-white">Staff Name</p>
              <p className="text-sm text-white">Staff Role</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col px-4 py-6 space-y-4 text-white">
            <Link to="/staff" className="flex items-center px-3 py-2 rounded hover:bg-green-600 transition-colors">
              <FaHome className="mr-3" /> Dashboard
            </Link>
            <Link to="/SupplierHome" className="flex items-center px-3 py-2 rounded hover:bg-green-600 transition-colors">
              <FaUsers className="mr-3" /> Supplier
            </Link>
            <Link to="/inventories" className="flex items-center px-3 py-2 rounded hover:bg-green-600 transition-colors">
              <FaBox className="mr-3" /> Inventory
            </Link>
            <Link to="#" className="flex items-center px-3 py-2 rounded hover:bg-green-600 transition-colors">
              <FaChartBar className="mr-3" /> Reports
            </Link>
            <Link to="#" className="flex items-center px-3 py-2 rounded hover:bg-green-600 transition-colors">
              <FaDollarSign className="mr-3" /> Payments
            </Link>
          </nav>
        </div>

        {/* Logout Button */}
        <div className="px-4 py-6 border-t border-green-600 text-white">
          <Link to="/login" className="flex items-center px-3 py-2 rounded hover:bg-red-600 transition-colors text-white">
            <FaSignOutAlt className="mr-3" /> Logout
          </Link>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black opacity-50 md:hidden z-40"></div>}
    </>
  );
}
