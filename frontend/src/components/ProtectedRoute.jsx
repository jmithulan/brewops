import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/authcontext';
import Spinner from './Spinner';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying authentication...</h2>
        <p className="text-gray-600">Please wait while we verify your credentials</p>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Use Outlet to render child routes
  return children || <Outlet />;
};

export default ProtectedRoute;


