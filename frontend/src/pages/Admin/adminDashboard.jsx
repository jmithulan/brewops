import React, { useEffect, useState } from 'react';
import NavigationBar from '../../components/navigationBar.jsx';
import Footer from '../../components/footer.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authcontext.jsx';
import ReportsNavigationItem from '../../components/ReportsNavigationItem.jsx';
import { 
  FaBell, 
  FaUsers, 
  FaBoxOpen, 
  FaExclamationTriangle, 
  FaPlus, 
  FaFileAlt, 
  FaHome, 
  FaWarehouse, 
  FaTruck,
  FaSearch,
  FaFilter,
  FaChevronDown,
  FaCog,
  FaExpand,
  FaEye,
  FaChartBar,
  FaMoneyBillWave,
  FaLeaf,
  FaUserCircle,
  FaUser,
  FaShieldAlt,
  FaUserShield,
  FaKey,
  FaDatabase,
  FaClipboardList,
  FaIndustry
} from 'react-icons/fa';
import { MdDashboard, MdTrendingUp, MdTrendingDown, MdSecurity, MdAdminPanelSettings } from 'react-icons/md';
import { LineChart, BarChart, PieChart, AreaChart, Line, Bar, Pie, Area, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', message: 'Unauthorized access attempt detected', time: '2 mins ago' },
    { id: 2, type: 'info', message: 'New user role assignment pending approval', time: '15 mins ago' },
    { id: 3, type: 'success', message: 'System backup completed successfully', time: '1 hour ago' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Quick Action Handlers
  const handleSecurityScan = async () => {
    setIsLoading(true);
    try {
      // Simulate security scan
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update notifications with scan results
      setNotifications(prev => [
        { 
          id: Date.now(), 
          type: 'success', 
          message: 'Security scan completed - No threats detected', 
          time: 'Just now' 
        },
        ...prev
      ]);
      
      // Show success message
      alert('Security scan completed successfully! No threats detected.');
    } catch (error) {
      console.error('Security scan failed:', error);
      alert('Security scan failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupSystem = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch('http://localhost:4323/api/backup/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update notifications
        setNotifications(prev => [
          { 
            id: Date.now(), 
            type: 'success', 
            message: `System backup created: ${data.backup.filename}`, 
            time: 'Just now' 
          },
          ...prev
        ]);
        
        alert('System backup created successfully!');
      } else {
        throw new Error('Failed to create backup');
      }
    } catch (error) {
      console.error('Backup failed:', error);
      alert('Backup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Admin dashboard data with role-based metrics
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 45,
    activeUsers: 38,
    totalRoles: 5,
    systemHealth: 98.5,
    securityAlerts: 3,
    dataBackups: 7,
    systemUptime: 99.8,
    pendingApprovals: 12
  });

  // Role distribution data
  const roleData = [
    { name: 'Admin', value: 8, color: '#EF4444' },
    { name: 'Production Manager', value: 12, color: '#3B82F6' },
    { name: 'Supplier', value: 18, color: '#10B981' },
    { name: 'Quality Control', value: 7, color: '#F59E0B' }
  ];

  // System performance data
  const performanceData = [
    { time: '00:00', cpu: 45, memory: 62, disk: 35 },
    { time: '04:00', cpu: 52, memory: 68, disk: 38 },
    { time: '08:00', cpu: 78, memory: 85, disk: 45 },
    { time: '12:00', cpu: 85, memory: 90, disk: 52 },
    { time: '16:00', cpu: 72, memory: 78, disk: 48 },
    { time: '20:00', cpu: 58, memory: 65, disk: 42 },
  ];

  // User activity trends
  const activityTrends = [
    { day: 'Mon', logins: 28, actions: 145, errors: 2 },
    { day: 'Tue', logins: 32, actions: 162, errors: 1 },
    { day: 'Wed', logins: 35, actions: 178, errors: 3 },
    { day: 'Thu', logins: 30, actions: 155, errors: 1 },
    { day: 'Fri', logins: 38, actions: 195, errors: 0 },
    { day: 'Sat', logins: 15, actions: 85, errors: 1 },
    { day: 'Sun', logins: 12, actions: 65, errors: 0 },
  ];

  // Recent admin activities
  const recentActivities = [
    { id: 1, action: 'User role updated: John Doe to Production Manager', user: 'Admin', time: '10 mins ago', type: 'role' },
    { id: 2, action: 'New supplier account approved', user: 'Admin', time: '25 mins ago', type: 'approval' },
    { id: 3, action: 'System security scan completed', user: 'System', time: '1 hour ago', type: 'security' },
    { id: 4, action: 'Database backup created', user: 'System', time: '2 hours ago', type: 'backup' }
  ];

  const DashboardCard = ({ title, value, icon: Icon, color, trend, trendValue, subtitle }) => (
    <div className={`${color} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20 backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/20 rounded-lg">
            <Icon className="text-2xl text-white" />
          </div>
          <div>
            <h3 className="text-white/80 text-sm font-medium">{title}</h3>
            <p className="text-3xl font-bold text-white">{value}</p>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 ${trend === 'up' ? 'text-green-200' : 'text-red-200'}`}>
            {trend === 'up' ? <MdTrendingUp /> : <MdTrendingDown />}
            <span className="text-sm font-medium">{trendValue}%</span>
          </div>
        )}
      </div>
      {subtitle && <p className="text-white/70 text-sm">{subtitle}</p>}
    </div>
  );

  const QuickActionButton = ({ icon: Icon, label, color, onClick }) => (
    <button 
      onClick={onClick}
      className={`${color} text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center space-x-3 font-medium`}
    >
      <Icon className="text-lg" />
      <span>{label}</span>
    </button>
  );

  const ChartCard = ({ title, children, fullWidth = false }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 ${fullWidth ? 'col-span-full' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaExpand className="text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaCog className="text-gray-400" />
          </button>
        </div>
      </div>
      {children}
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const getIconColor = (type) => {
      switch(type) {
        case 'role': return 'bg-blue-100 text-blue-600';
        case 'approval': return 'bg-green-100 text-green-600';
        case 'security': return 'bg-red-100 text-red-600';
        case 'backup': return 'bg-purple-100 text-purple-600';
        default: return 'bg-gray-100 text-gray-600';
      }
    };

    return (
      <div className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
        <div className={`p-2 rounded-full ${getIconColor(activity.type)}`}>
          <FaEye className="text-sm" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-800">{activity.action}</p>
          <p className="text-sm text-gray-500">by {activity.user} • {activity.time}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="flex">
        {/* Enhanced Modern Admin Sidebar */}
        <div className="w-80 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-2xl border-r border-gray-700">
          <div className="p-6">
            {/* Admin Profile Section */}
            <div className="flex items-center space-x-4 mb-8 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <FaUserShield className="text-white text-2xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">{user?.name || 'Admin Portal'}</h3>
                <p className="text-gray-400 text-sm">System Administrator</p>
                <p className="text-gray-500 text-xs">{user?.email}</p>
              </div>
              <Link 
                to="/profile"
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="View Profile"
              >
                <FaUser className="text-lg" />
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="space-y-2">
              <h4 className="text-gray-300 font-medium text-sm uppercase tracking-wider border-b border-gray-700 pb-2 mb-4">
                Administration
              </h4>
              
              <Link 
                to="/admin" 
                className="flex items-center space-x-3 p-3 rounded-lg bg-gray-700 text-white shadow-md"
              >
                <MdDashboard className="text-xl" />
                <span className="font-medium">Dashboard</span>
              </Link>
              
              <Link 
                to="/userManagement" 
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <FaUsers className="text-xl" />
                <span>User Management</span>
              </Link>
              
              <Link 
                to="/rolePermissions" 
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <FaShieldAlt className="text-xl" />
                <span>Role & Permissions</span>
              </Link>
              
              <Link 
                to="/systemSecurity" 
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <MdSecurity className="text-xl" />
                <span>System Security</span>
              </Link>
              
              <Link 
                to="/backupRecovery" 
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <FaDatabase className="text-xl" />
                <span>Backup and Recovery</span>
              </Link>

              <ReportsNavigationItem />
          
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h4 className="text-gray-300 font-medium text-sm uppercase tracking-wider border-b border-gray-700 pb-2 mb-4">
                Quick Actions
              </h4>
              
              <div className="space-y-3">
                <button 
                  onClick={() => setShowCreateUserModal(true)}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
                >
                  <FaPlus className="text-lg" />
                  <span className="font-medium">Create User</span>
                </button>
                
                <button 
                  onClick={handleSecurityScan}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg"
                >
                  <FaShieldAlt className="text-lg" />
                  <span className="font-medium">Security Scan</span>
                </button>
                
                <button 
                  onClick={handleBackupSystem}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg"
                >
                  <FaDatabase className="text-lg" />
                  <span className="font-medium">Backup System</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Section - Moved to Bottom */}
            <div className="mt-8 space-y-4">
              <h4 className="text-gray-300 font-medium text-sm uppercase tracking-wider border-b border-gray-700 pb-2">
                System Stats
              </h4>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Users</p>
                      <p className="text-white text-2xl font-bold">{dashboardData.totalUsers}</p>
                    </div>
                    <FaUsers className="text-blue-200 text-2xl" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">System Health</p>
                      <p className="text-white text-2xl font-bold">{dashboardData.systemHealth}%</p>
                    </div>
                    <FaShieldAlt className="text-green-200 text-2xl" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Security Alerts</p>
                      <p className="text-white text-2xl font-bold">{dashboardData.securityAlerts}</p>
                    </div>
                    <FaExclamationTriangle className="text-orange-200 text-2xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          {/* Top Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">System administration and role-based access control</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <select 
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>

          {/* Admin Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard
              title="Total Users"
              value={dashboardData.totalUsers}
              icon={FaUsers}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              trend="up"
              trendValue="12"
              subtitle={`${dashboardData.activeUsers} active users`}
            />
            <DashboardCard
              title="System Health"
              value={`${dashboardData.systemHealth}%`}
              icon={FaShieldAlt}
              color="bg-gradient-to-br from-green-500 to-green-600"
              trend="up"
              trendValue="2"
              subtitle="All systems operational"
            />
            <DashboardCard
              title="Security Alerts"
              value={dashboardData.securityAlerts}
              icon={FaExclamationTriangle}
              color="bg-gradient-to-br from-orange-500 to-orange-600"
              trend="down"
              trendValue="25"
              subtitle="3 pending review"
            />
            <DashboardCard
              title="Pending Approvals"
              value={dashboardData.pendingApprovals}
              icon={FaClipboardList}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              trend="up"
              trendValue="8"
              subtitle="Require attention"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4 mb-8">
            <QuickActionButton
              icon={FaUsers}
              label="Manage Users"
              color="bg-gradient-to-r from-blue-500 to-blue-600"
              onClick={() => navigate('/userManagement')}
            />
            <QuickActionButton
              icon={FaShieldAlt}
              label="Role Permissions"
              color="bg-gradient-to-r from-green-500 to-green-600"
              onClick={() => navigate('/rolePermissions')}
            />
            <QuickActionButton
              icon={MdSecurity}
              label="Security Settings"
              color="bg-gradient-to-r from-red-500 to-red-600"
              onClick={() => navigate('/systemSecurity')}
            />
            <QuickActionButton
              icon={FaFileAlt}
              label="System Reports"
              color="bg-gradient-to-r from-purple-500 to-purple-600"
              onClick={() => navigate('/reports')}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard title="User Role Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({name, value}) => `${name}: ${value}`}
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="System Performance">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="cpu" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="memory" stackId="2" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="disk" stackId="3" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* User Activity Trends - Full Width */}
          <ChartCard title="User Activity Trends" fullWidth>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={activityTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="logins" fill="#3B82F6" name="User Logins" />
                <Bar dataKey="actions" fill="#10B981" name="User Actions" />
                <Bar dataKey="errors" fill="#EF4444" name="Error Reports" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Recent Admin Activities */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Recent Admin Activities</h3>
              <button className="text-blue-600 hover:text-blue-700 font-medium">View All</button>
            </div>
            <div className="space-y-1">
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New User</h3>
                <button
                  onClick={() => setShowCreateUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="text-center">
                <p className="text-gray-600 mb-4">Quick user creation will redirect you to the User Management page.</p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowCreateUserModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateUserModal(false);
                      navigate('/userManagement');
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Go to User Management
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AdminDashboard;
