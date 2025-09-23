import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authcontext';
import AdminDashboard from '../pages/Admin/adminDashboard';
import ProductionManagerDashboard from '../pages/Production/ProductionManagerDashboard';
import StaffDashboard from '../pages/Staff/StaffDashboard';
import SupplierDashboard from '../pages/Supplier/supplierDashboard';
import toast from 'react-hot-toast';

/**
 * Component that directs users to the appropriate dashboard based on their role
 * Special handling for manager role which gets admin dashboard access
 */
const RoleBasedDashboard = () => {
  const { user, hasRole, hasPermission, authError } = useAuth();

  // Show welcome toast on initial dashboard load
  useEffect(() => {
    if (user) {
      const welcomeMessage = `Welcome, ${user.name}! You're logged in as ${user.role === 'manager' ? 'Manager with Admin Access' : user.role}`;
      toast.success(welcomeMessage, {
        duration: 4000,
        position: "top-center",
      });
    }

    if (authError) {
      toast.error(authError, {
        duration: 4000,
        position: "top-center",
      });
    }
  }, [user, authError]);

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Determine which dashboard to display based on role
  // Note: hasRole('admin') will return true for both 'admin' and 'manager' roles
  // due to our enhanced role handling in the auth context
  if (hasRole('admin')) {
    return (
      <div className="dashboard-container">
        {user.role === 'manager' && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 mb-4 rounded">
            <p className="font-bold">Manager with Admin Access</p>
            <p>You have administrator privileges based on your manager role.</p>
          </div>
        )}
        <AdminDashboard />
      </div>
    );
  } else if (hasRole('production_manager')) {
    return <ProductionManagerDashboard />;
  } else if (hasRole('staff')) {
    return <StaffDashboard />;
  } else if (hasRole('supplier')) {
    return <SupplierDashboard />;
  }

  // If role doesn't match any dashboard, redirect to home
  toast.error("Your role doesn't have access to any dashboard. Please contact an administrator.");
  return <Navigate to="/" replace />;
};

export default RoleBasedDashboard;
