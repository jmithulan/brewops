import React, { useState } from 'react';

const RolePermissions = () => {
  const [roles] = useState([
    { id: 1, name: 'Admin', permissions: ['All Access'] },
    { id: 2, name: 'Production Manager', permissions: ['Inventory Management', 'Production Scheduling', 'Reports'] },
    { id: 3, name: 'Staff', permissions: ['Data Entry', 'View Reports'] },
    { id: 4, name: 'Supplier', permissions: ['View Own Data', 'Update Profile'] }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Role Permissions Management</h1>
          
          <div className="space-y-6">
            {roles.map((role) => (
              <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{role.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((permission, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolePermissions;




