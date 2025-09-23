import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiUser, FiSearch, FiX, FiUserCheck } from 'react-icons/fi';
import { 
  FaUserTie, FaUserCog, FaUserFriends, FaIndustry 
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4323';

// Role-based icons and colors
const roleConfig = {
  admin: { icon: <FaUserTie size={16} />, color: 'bg-purple-100 text-purple-800' },
  manager: { icon: <FaUserCog size={16} />, color: 'bg-blue-100 text-blue-800' },
  staff: { icon: <FaUserFriends size={16} />, color: 'bg-green-100 text-green-800' },
  supplier: { icon: <FaIndustry size={16} />, color: 'bg-yellow-100 text-yellow-800' },
  default: { icon: <FiUserCheck size={16} />, color: 'bg-gray-100 text-gray-800' }
};

const UserSelector = ({ onClose, onSelectUser, currentUserId, token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          // Filter out current user but include all other users
          const filteredUsers = response.data.data.filter(user => 
            user.id !== currentUserId
          );
          
          // Sort users by role for better organization
          const sortedUsers = filteredUsers.sort((a, b) => {
            // Sort by role first
            if (a.role !== b.role) {
              const roleOrder = { admin: 1, manager: 2, staff: 3, supplier: 4 };
              return (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99);
            }
            // Then by name
            return a.name.localeCompare(b.name);
          });
          
          setUsers(sortedUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [token, currentUserId]);
  
  const handleUserSelect = (user) => {
    onSelectUser(user);
  };
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });
  
  // Get unique roles for the filter
  const roles = ['all', ...new Set(users.map(user => user.role))];
  
  // Count users by role
  const roleCount = roles.reduce((acc, role) => {
    if (role === 'all') {
      acc[role] = users.length;
    } else {
      acc[role] = users.filter(user => user.role === role).length;
    }
    return acc;
  }, {});
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-300 flex justify-between items-center">
          <h2 className="text-xl font-semibold">New Message</h2>
          <p className="text-sm text-gray-500">Select any user to chat with</p>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>
        
        <div className="p-3 border-b border-gray-300">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
          
          <div className="mt-3 flex flex-wrap gap-2">
            {roles.map(role => {
              // Get the appropriate role config for styling
              const roleInfo = role !== 'all' ? 
                roleConfig[role] || roleConfig.default : 
                { icon: <FiUser size={16} />, color: 'bg-blue-500 text-white' };
                
              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-3 py-1 text-sm rounded-full flex items-center ${
                    selectedRole === role 
                      ? 'bg-blue-500 text-white' 
                      : `${role !== 'all' ? roleInfo.color : 'bg-gray-200 text-gray-700'} hover:opacity-80`
                  }`}
                >
                  <span className="mr-1">
                    {role !== 'all' ? roleInfo.icon : <FiUser size={16} />}
                  </span>
                  {role === 'all' ? 'All Users' : role.charAt(0).toUpperCase() + role.slice(1)}
                  <span className="ml-1 px-1.5 py-0.5 bg-white bg-opacity-30 rounded-full text-xs">
                    {roleCount[role]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No users found
            </div>
          ) : (
            <>
              {/* Group users by role */}
              {selectedRole === 'all' && (
                <div className="sticky top-0 px-3 py-1 bg-gray-50 text-sm font-semibold text-gray-500 border-b border-gray-200">
                  All Users ({filteredUsers.length})
                </div>
              )}
              {filteredUsers.map((user) => {
                const roleInfo = roleConfig[user.role] || roleConfig.default;
                
                return (
                  <div
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className="p-3 border-b border-gray-200 flex items-center cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                        {user.profile_image ? (
                          <img 
                            src={user.profile_image} 
                            alt={user.name} 
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          user.name ? (
                            <span className="text-lg">{user.name.charAt(0).toUpperCase()}</span>
                          ) : (
                            <FiUser size={24} />
                          )
                        )}
                      </div>
                      
                      {/* Role indicator icon on avatar */}
                      <div className={`absolute bottom-0 right-0 h-6 w-6 rounded-full flex items-center justify-center ${roleInfo.color} border-2 border-white`}>
                        {roleInfo.icon}
                      </div>
                    </div>
                    
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{user.name}</h3>
                        
                        {/* Role badge */}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center ${roleInfo.color}`}>
                          <span className="mr-1">{roleInfo.icon}</span>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSelector;