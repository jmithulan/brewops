import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUsers, FaBox, FaChartBar, FaDollarSign, FaSignOutAlt, FaBars, FaTimes, FaPager, FaEdit, FaLeaf, FaTruck } from 'react-icons/fa';

const Sidebar = ({ 
  userRole = 'staff', 
  userName = 'User', 
  userEmail = 'user@example.com',
  onLogout = () => {}
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Define menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      { label: 'Dashboard', icon: <FaHome />, to: getDashboardRoute() },
    ];

    switch (userRole) {
      case 'supplier':
        return [
          ...baseItems,
          { label: 'My Deliveries', icon: <FaTruck />, to: '/supplier/deliveries' },
          { label: 'Payment Summary', icon: <FaDollarSign />, to: '/supplier/payment-summary' },
          { label: 'Leaves Quality', icon: <FaLeaf />, to: '/supplier/leaves-quality' },
          { label: 'Edit Profile', icon: <FaEdit />, to: '/supplier/edit-profile' },
        ];
      
      case 'manager':
        return [
          ...baseItems,
          { label: 'Supplier Management', icon: <FaUsers />, to: '/suppliers' },
          { label: 'Production', icon: <FaChartBar />, to: '/production' },
          { label: 'Inventory', icon: <FaBox />, to: '/inventories' },
          { label: 'Reports', icon: <FaChartBar />, to: '/reports' },
          { label: 'User Management', icon: <FaUsers />, to: '/admin/users' },
        ];
      
      case 'staff':
      default:
        return [
          ...baseItems,
          { label: 'Supplier Management', icon: <FaUsers />, to: '/suppliers' },
          { label: 'Inventory', icon: <FaBox />, to: '/inventories' },
          { label: 'Raw Leaves', icon: <FaLeaf />, to: '/raw-leaves' },
          { label: 'Production', icon: <FaChartBar />, to: '/production' },
        ];
    }
  };

  const getDashboardRoute = () => {
    switch (userRole) {
      case 'supplier': return '/supplier';
      case 'manager': return '/manager';
      case 'staff': return '/staff';
      default: return '/staff';
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-lg shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 min-h-screen w-64 bg-gray-800 text-white
          transform transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:relative md:block md:min-h-screen
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">BrewOps</h2>
              <p className="text-sm text-gray-300 capitalize">{userRole}</p>
            </div>
          </div>
          
          {/* User Info */}
          <div className="bg-gray-700 rounded-lg p-3">
            <p className="font-medium text-sm">{userName}</p>
            <p className="text-xs text-gray-300">{userEmail}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-3 rounded-lg transition-colors duration-200 ${
                      isActive 
                        ? 'bg-green-600 text-white shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center px-3 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
          >
            <FaSignOutAlt className="mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
