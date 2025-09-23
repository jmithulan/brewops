import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authcontext';

const RoleBasedProfile = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  switch (user.role) {
    case 'admin':
    case 'manager':
      return <Navigate to="/admin/profile" replace />;
    case 'staff':
      return <Navigate to="/staff/profile" replace />;
    case 'supplier':
      return <Navigate to="/supplier/profile" replace />;
    default:
      return <Navigate to="/staff/profile" replace />;
  }
};

export default RoleBasedProfile;
