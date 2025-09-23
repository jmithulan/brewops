import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaUserShield, FaCog, FaCheck, FaTimes, FaEdit, FaSave, FaPlus, FaArrowLeft } from 'react-icons/fa';

const RolePermissions = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([
    { 
      id: 1, 
      name: 'Admin', 
      permissions: ['All Access'],
      description: 'Full system access with all privileges',
      color: 'bg-red-100 text-red-800'
    },
    { 
      id: 2, 
      name: 'Production Manager', 
      permissions: ['Inventory Management', 'Production Scheduling', 'Reports', 'User Management'],
      description: 'Manage production operations and team members',
      color: 'bg-blue-100 text-blue-800'
    },
    { 
      id: 3, 
      name: 'Staff', 
      permissions: ['Data Entry', 'View Reports', 'Inventory View'],
      description: 'Basic operational access for daily tasks',
      color: 'bg-green-100 text-green-800'
    },
    { 
      id: 4, 
      name: 'Supplier', 
      permissions: ['View Own Data', 'Update Profile', 'Submit Deliveries'],
      description: 'External supplier access to their own data',
      color: 'bg-yellow-100 text-yellow-800'
    }
  ]);
  
  const [editingRole, setEditingRole] = useState(null);
  const [availablePermissions] = useState([
    'All Access',
    'User Management',
    'Inventory Management',
    'Production Scheduling',
    'Reports',
    'Data Entry',
    'View Reports',
    'Inventory View',
    'View Own Data',
    'Update Profile',
    'Submit Deliveries',
    'System Settings',
    'Backup Management',
    'Security Settings'
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: []
  });

  useEffect(() => {
    fetchRolePermissions();
  }, []);

  const fetchRolePermissions = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch('http://localhost:4323/api/admin/role-permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || roles);
      }
    } catch (error) {
      console.error('Error fetching role permissions:', error);
    }
  };

  const saveRolePermissions = async (roleId, updatedPermissions) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`http://localhost:4323/api/admin/role-permissions/${roleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permissions: updatedPermissions })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Role permissions updated successfully' });
        setEditingRole(null);
        fetchRolePermissions(); // Refresh the data
      } else {
        throw new Error('Failed to update role permissions');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update role permissions. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (roleId, permission) => {
    setRoles(prevRoles => 
      prevRoles.map(role => {
        if (role.id === roleId) {
          const hasPermission = role.permissions.includes(permission);
          if (hasPermission) {
            return {
              ...role,
              permissions: role.permissions.filter(p => p !== permission)
            };
          } else {
            return {
              ...role,
              permissions: [...role.permissions, permission]
            };
          }
        }
        return role;
      })
    );
  };

  const toggleNewRolePermission = (permission) => {
    setNewRole(prev => {
      const hasPermission = prev.permissions.includes(permission);
      if (hasPermission) {
        return {
          ...prev,
          permissions: prev.permissions.filter(p => p !== permission)
        };
      } else {
        return {
          ...prev,
          permissions: [...prev.permissions, permission]
        };
      }
    });
  };

  const handleAddNewRole = async () => {
    if (!newRole.name.trim()) {
      setMessage({ type: 'error', text: 'Role name is required' });
      return;
    }

    if (newRole.permissions.length === 0) {
      setMessage({ type: 'error', text: 'At least one permission is required' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch('http://localhost:4323/api/admin/role-permissions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRole)
      });

      if (response.ok) {
        const data = await response.json();
        const addedRole = {
          id: data.role.id,
          name: newRole.name,
          description: newRole.description,
          permissions: newRole.permissions,
          color: getRoleColor(newRole.name)
        };
        
        setRoles(prev => [...prev, addedRole]);
        setMessage({ type: 'success', text: 'New role created successfully' });
        setShowAddRoleModal(false);
        setNewRole({ name: '', description: '', permissions: [] });
      } else {
        throw new Error('Failed to create new role');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create new role. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (roleName) => {
    const colors = [
      'bg-red-100 text-red-800',
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-gray-100 text-gray-800'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin-dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FaArrowLeft className="text-lg" />
                <span>Back</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <FaShieldAlt />
                <span>Role Permissions Management</span>
              </h1>
            </div>
            <button 
              onClick={() => setShowAddRoleModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <FaPlus />
              <span>Add New Role</span>
            </button>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message.type === 'success' ? <FaCheck /> : <FaTimes />}
              <span>{message.text}</span>
            </div>
          )}
          
          <div className="space-y-6">
            {roles.map((role) => (
              <div key={role.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <FaUserShield />
                      <span>{role.name}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role.color}`}>
                        {role.permissions.length} permissions
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    {editingRole === role.id ? (
                      <>
                        <button
                          onClick={() => saveRolePermissions(role.id, role.permissions)}
                          disabled={loading}
                          className="text-green-600 hover:text-green-800 p-2"
                          title="Save Changes"
                        >
                          <FaSave />
                        </button>
                        <button
                          onClick={() => setEditingRole(null)}
                          className="text-gray-600 hover:text-gray-800 p-2"
                          title="Cancel"
                        >
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditingRole(role.id)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Edit Permissions"
                      >
                        <FaEdit />
                      </button>
                    )}
                  </div>
                </div>

                {editingRole === role.id ? (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Available Permissions:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {availablePermissions.map((permission) => {
                        const hasPermission = role.permissions.includes(permission);
                        return (
                          <label
                            key={permission}
                            className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                              hasPermission 
                                ? 'bg-blue-50 border-blue-200 text-blue-800' 
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={hasPermission}
                              onChange={() => togglePermission(role.id, permission)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium">{permission}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((permission, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center space-x-1"
                      >
                        <FaCheck className="text-xs" />
                        <span>{permission}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add New Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add New Role</h3>
                <button
                  onClick={() => {
                    setShowAddRoleModal(false);
                    setNewRole({ name: '', description: '', permissions: [] });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                  <input
                    type="text"
                    value={newRole.name}
                    onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter role name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newRole.description}
                    onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter role description"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                    {availablePermissions.map((permission) => {
                      const hasPermission = newRole.permissions.includes(permission);
                      return (
                        <label
                          key={permission}
                          className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                            hasPermission 
                              ? 'bg-blue-50 border-blue-200 text-blue-800' 
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={hasPermission}
                            onChange={() => toggleNewRolePermission(permission)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium">{permission}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAddRoleModal(false);
                      setNewRole({ name: '', description: '', permissions: [] });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNewRole}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Role'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolePermissions;







