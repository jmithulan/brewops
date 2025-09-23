import React from 'react';
import { Outlet } from 'react-router-dom';
import NavigationBar from './navigationBar';
import { useAuth } from '../contexts/authcontext';

const Layout = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Only show NavigationBar if user is authenticated */}
      {isAuthenticated() && <NavigationBar />}
      
      {/* Main content */}
      <main className="flex-grow">
        <Outlet />
      </main>
      
      {/* Footer could be added here */}
    </div>
  );
};

export default Layout;