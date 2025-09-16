import React, { useState, useEffect } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'Admin User', email: 'admin@teafactory.com', role: 'admin', status: 'active' },
    { id: 2, name: 'John Manager', email: 'john@teafactory.com', role: 'production_manager', status: 'active' },
    { id: 3, name: 'Jane Staff', email: 'jane@teafactory.com', role: 'staff', status: 'active' },
    { id: 4, name: 'Supplier One', email: 'supplier@example.com', role: 'supplier', status: 'inactive' }
  ]);

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'staff',
    password: ''
  });

  const handleAddUser = (e) => {
    e.preventDefault();
    const user = {
      id: users.length + 1,
      ...newUser,
      status: 'active'
    };
    setUsers([...users, user]);
    setNewUser({ name: '', email: '', role: 'staff', password: '' });
    setShowAddUser(false);
  };

  const toggleUserStatus = (id) => {
    setUsers(users.map(user => 
      user.id === id 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <button
              onClick={() => setShowAddUser(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add New User
            </button>
          </div>

          {showAddUser && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Add New User</h3>
              <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="border border-gray-300 rounded-md px-3 py-2"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="border border-gray-300 rounded-md px-3 py-2"
                  required
                />
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="staff">Staff</option>
                  <option value="production_manager">Production Manager</option>
                  <option value="admin">Admin</option>
                  <option value="supplier">Supplier</option>
                </select>
                <input
                  type="password"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="border border-gray-300 rounded-md px-3 py-2"
                  required
                />
                <div className="md:col-span-2 flex gap-2">
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                    Add User
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddUser(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="capitalize">{user.role.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`mr-2 ${
                          user.status === 'active' 
                            ? 'text-red-600 hover:text-red-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;




