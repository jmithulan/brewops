import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authcontext';

const RoleBasedRoute = ({ 
  children, 
  allowedRoles = [], 
  fallbackPath = '/dashboard' 
}) => {
  const { user } = useAuth();

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user role is not in allowed roles, redirect to fallback
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // If user has permission, render the component
  return children;
};

export default RoleBasedRoute;
