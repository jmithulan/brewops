import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/authcontext';

const Layout = ({ 
  children, 
  showSidebar = true,
  sidebarProps = {},
  className = ''
}) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {showSidebar && (
        <Sidebar
          userRole={user?.role}
          userName={user?.name}
          userEmail={user?.email}
          onLogout={logout}
          {...sidebarProps}
        />
      )}
      
      <main className={`
        ${showSidebar ? 'md:ml-64' : ''}
        transition-all duration-300
        ${className}
      `}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
