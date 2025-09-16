import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authcontext';
import { FaUserCircle, FaSignOutAlt, FaCog, FaUserShield } from 'react-icons/fa';

const ProfileMenu = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Format role name for display
  const formatRoleName = (role) => {
    if (!role) return "User";
    return role.charAt(0).toUpperCase() + role.slice(1).replace("_", " ");
  };

  // Get user initials for avatar fallback
  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Format display role with special handling for managers with admin access
  const getDisplayRole = () => {
    if (user?.effectiveRole === 'admin' && user?.role === 'manager') {
      return 'Manager (Admin Access)';
    }
    return formatRoleName(user?.effectiveRole || user?.role);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white rounded-full py-1 pl-1 pr-3 focus:outline-none transition"
      >
        <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white">
          {user?.photoUrl ? (
            <img 
              src={user.photoUrl} 
              alt={user?.name || 'User'} 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="font-medium text-sm">{getUserInitials(user?.name)}</span>
          )}
        </div>
        <span className="text-sm hidden md:inline truncate max-w-[100px]">
          {user?.name || 'User'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white">
                {user?.photoUrl ? (
                  <img 
                    src={user.photoUrl} 
                    alt={user?.name || 'User'} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="font-medium">{getUserInitials(user?.name)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {getDisplayRole()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="py-1">
            <button
              onClick={() => { navigate('/profile'); setIsOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <FaUserCircle className="mr-3 text-gray-500" /> My Profile
            </button>
            
            {(user?.role === 'admin' || user?.effectiveRole === 'admin') && (
              <button
                onClick={() => { navigate('/userManagement'); setIsOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <FaUserShield className="mr-3 text-gray-500" /> User Management
              </button>
            )}
            
            <button
              onClick={() => { navigate('/profile'); setIsOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <FaCog className="mr-3 text-gray-500" /> Account Settings
            </button>
          </div>
          
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
            >
              <FaSignOutAlt className="mr-3" /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
