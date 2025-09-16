import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authcontext';
import { 
  FiMenu, FiX, FiHome, FiUser, FiMessageCircle, 
  FiPackage, FiFileText, FiSettings, FiLogOut 
} from 'react-icons/fi';
import NotificationCenter from './NotificationCenter';
import { useNotification } from '../contexts/notificationContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const menuItems = [
    { path: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { path: '/messages', icon: <FiMessageCircle />, label: 'Messages' },
    { path: '/profile', icon: <FiUser />, label: 'Profile' }
  ];
  
  // Add role-specific menu items
  if (user?.role === 'admin' || user?.role === 'manager') {
    menuItems.push(
      { path: '/inventory', icon: <FiPackage />, label: 'Inventory' },
      { path: '/reports', icon: <FiFileText />, label: 'Reports' },
      { path: '/settings', icon: <FiSettings />, label: 'Settings' }
    );
  } else if (user?.role === 'supplier') {
    menuItems.push(
      { path: '/suppliers/transactions', icon: <FiFileText />, label: 'Transactions' }
    );
  } else if (user?.role === 'staff') {
    menuItems.push(
      { path: '/inventories', icon: <FiPackage />, label: 'Inventory' }
    );
  }
  
  return (
    <nav className="bg-green-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <span className="font-bold text-xl">BrewOps</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(item.path)
                    ? 'bg-green-800 text-white'
                    : 'text-white hover:bg-green-600'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
          
          {/* Right side - notification and profile */}
          <div className="flex items-center">
            {/* Notification center */}
            <NotificationCenter isDropdown={true} />
            
            {/* User profile dropdown */}
            <div className="relative ml-4">
              <div className="flex items-center cursor-pointer">
                <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
                </div>
                <span className="ml-2 hidden md:block">{user?.name || 'User'}</span>
              </div>
            </div>
            
            {/* Logout button (desktop) */}
            <button
              onClick={handleLogout}
              className="ml-4 hidden md:flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600"
            >
              <FiLogOut className="mr-2" />
              Logout
            </button>
            
            {/* Mobile menu button */}
            <div className="md:hidden ml-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-green-600 focus:outline-none"
              >
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-green-700">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.path)
                    ? 'bg-green-800 text-white'
                    : 'text-white hover:bg-green-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            
            {/* Logout button (mobile) */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-green-600"
            >
              <FiLogOut className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;