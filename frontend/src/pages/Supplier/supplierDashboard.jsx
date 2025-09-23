// src/pages/SupplierDashboard.jsx
import React, { useEffect, useState } from 'react';
import NavigationBar from '../../components/navigationBar';
import Footer from '../../components/footer';
import { Link, useLocation } from 'react-router-dom';
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
  FaUser
} from 'react-icons/fa';
import { MdDashboard, MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import { LineChart, BarChart, PieChart, AreaChart, Line, Bar, Pie, Area, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import toast, { Toaster } from "react-hot-toast";

export default function SupplierDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', message: 'Payment pending for October delivery', time: '2 mins ago' },
    { id: 2, type: 'info', message: 'New tea quality requirements updated', time: '15 mins ago' },
    { id: 3, type: 'success', message: 'Monthly delivery completed successfully', time: '1 hour ago' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  
  // Supplier-specific dashboard data
  const [dashboardData, setDashboardData] = useState({
    monthlyLeaves: 1250,
    totalPayments: 75000,
    pendingPayments: 5000,
    deliveryRate: 95.8,
    qualityScore: 92,
    weeklyGrowth: 8.5,
    monthlyRevenue: 75000,
    activeContracts: 3
  });

  // Enhanced chart data for supplier metrics
  const leavesData = [
    { name: 'Jan', leaves: 1200, quality: 90, payment: 50000 },
    { name: 'Feb', leaves: 1100, quality: 88, payment: 45000 },
    { name: 'Mar', leaves: 1300, quality: 92, payment: 55000 },
    { name: 'Apr', leaves: 1400, quality: 94, payment: 60000 },
    { name: 'May', leaves: 1700, quality: 96, payment: 75000 },
  ];

  const teaTypeData = [
    { name: 'Green Tea', value: 40, color: '#10B981' },
    { name: 'Black Tea', value: 35, color: '#3B82F6' },
    { name: 'Oolong Tea', value: 15, color: '#F59E0B' },
    { name: 'White Tea', value: 10, color: '#EF4444' }
  ];

  const paymentTrends = [
    { month: 'Jan', amount: 50000, status: 'paid' },
    { month: 'Feb', amount: 45000, status: 'paid' },
    { month: 'Mar', amount: 55000, status: 'paid' },
    { month: 'Apr', amount: 60000, status: 'paid' },
    { month: 'May', amount: 75000, status: 'pending' },
  ];

  const recentActivities = [
    { id: 1, action: 'Delivered 500kg Premium Green Tea', user: 'System', time: '2 hours ago', type: 'delivery' },
    { id: 2, action: 'Quality inspection passed', user: 'QC Team', time: '1 day ago', type: 'quality' },
    { id: 3, action: 'Payment received for April delivery', user: 'Finance', time: '2 days ago', type: 'payment' },
    { id: 4, action: 'Contract renewal submitted', user: 'You', time: '3 days ago', type: 'contract' }
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
        case 'delivery': return 'bg-blue-100 text-blue-600';
        case 'quality': return 'bg-green-100 text-green-600';
        case 'payment': return 'bg-purple-100 text-purple-600';
        case 'contract': return 'bg-orange-100 text-orange-600';
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

  useEffect(() => {
    if (location.state?.toastMessage) {
      toast.success(location.state.toastMessage);
      // Clear the state to prevent duplicate toasts on re-render
      location.state.toastMessage = null;
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Toaster position="top-right" />
      
      <div className="flex">
        {/* Enhanced Modern Sidebar */}
        <div className="w-80 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-2xl border-r border-gray-700">
          <div className="p-6">
            {/* User Profile Section */}
            <div className="flex items-center space-x-4 mb-8 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <FaUserCircle className="text-white text-2xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">Supplier Portal</h3>
                <p className="text-gray-400 text-sm">Tea Leaf Supplier</p>
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
              <Link 
                to="/" 
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <FaHome className="text-xl" />
                <span>Home</span>
              </Link>
              
              <Link 
                to="/SupplierDashboard" 
                className="flex items-center space-x-3 p-3 rounded-lg bg-gray-700 text-white shadow-md"
              >
                <MdDashboard className="text-xl" />
                <span className="font-medium">Dashboard</span>
              </Link>
              
              <Link 
                to="/supplier/supply-records" 
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <FaFileAlt className="text-xl" />
                <span>Supply Records</span>
              </Link>
              
              <Link 
                to="/suppliers/paymentSummary" 
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <FaMoneyBillWave className="text-xl" />
                <span>Payment Records</span>
              </Link>
              
              <Link 
                to="/suppliers/editProfile" 
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <FaUser className="text-xl" />
                <span>Edit Profile</span>
              </Link>
              
              <Link 
                to="/supplier/settings" 
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <FaCog className="text-xl" />
                <span>Settings</span>
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h4 className="text-gray-300 font-medium text-sm uppercase tracking-wider border-b border-gray-700 pb-2 mb-4">
                Quick Actions
              </h4>
              
              <div className="space-y-3">
                <Link 
                  to="/supplier/create-supply-recode" 
                  className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:from-green-700 hover:to-emerald-800 transition-all duration-200 shadow-lg"
                >
                  <FaPlus className="text-lg" />
                  <span className="font-medium">New Supply Record</span>
                </Link>
                
                <button className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg">
                  <FaSearch className="text-lg" />
                  <span className="font-medium">Search Records</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Section - Moved to Bottom */}
            <div className="mt-8 space-y-4">
              <h4 className="text-gray-300 font-medium text-sm uppercase tracking-wider border-b border-gray-700 pb-2">
                Quick Stats
              </h4>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-4 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Monthly Delivery</p>
                      <p className="text-white text-2xl font-bold">{dashboardData.monthlyLeaves} kg</p>
                    </div>
                    <FaLeaf className="text-green-200 text-2xl" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Quality Score</p>
                      <p className="text-white text-2xl font-bold">{dashboardData.qualityScore}%</p>
                    </div>
                    <FaChartBar className="text-blue-200 text-2xl" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Monthly Revenue</p>
                      <p className="text-white text-xl font-bold">Rs. {dashboardData.monthlyRevenue.toLocaleString()}</p>
                    </div>
                    <FaMoneyBillWave className="text-purple-200 text-2xl" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Delivery Rate</p>
                      <p className="text-white text-2xl font-bold">{dashboardData.deliveryRate}%</p>
                    </div>
                    <FaTruck className="text-orange-200 text-2xl" />
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
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Supplier Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's your business overview</p>
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
                <option value="1y">Last year</option>
              </select>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-3 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200"
                >
                  <FaBell className="text-gray-600" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full ${
                              notif.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                              notif.type === 'info' ? 'bg-blue-100 text-blue-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              <FaBell className="text-sm" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-800">{notif.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard 
              title="Monthly Leaves Delivered" 
              value={`${dashboardData.monthlyLeaves} kg`}
              icon={FaLeaf}
              color="bg-gradient-to-br from-green-500 to-emerald-600"
              trend="up"
              trendValue="8.5"
              subtitle="vs last month"
            />
            <DashboardCard 
              title="Total Payments" 
              value={`Rs. ${dashboardData.totalPayments.toLocaleString()}`}
              icon={FaMoneyBillWave}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              trend="up"
              trendValue="12.3"
              subtitle="this month"
            />
            <DashboardCard 
              title="Quality Score" 
              value={`${dashboardData.qualityScore}%`}
              icon={FaChartBar}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              trend="up"
              trendValue="2.1"
              subtitle="quality rating"
            />
            <DashboardCard 
              title="Delivery Rate" 
              value={`${dashboardData.deliveryRate}%`}
              icon={FaTruck}
              color="bg-gradient-to-br from-orange-500 to-orange-600"
              trend="up"
              trendValue="1.5"
              subtitle="on-time delivery"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Leaves Delivery Trend */}
            <ChartCard title="Monthly Leaves Delivery Trend">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={leavesData}>
                  <defs>
                    <linearGradient id="leavesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="leaves" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    fill="url(#leavesGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Tea Type Distribution */}
            <ChartCard title="Tea Type Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={teaTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {teaTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Payment Trends Chart */}
          <div className="mb-8">
            <ChartCard title="Payment Trends" fullWidth>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={paymentTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Recent Activities</h3>
              <Link 
                to="/supplier/supplier-recode" 
                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center space-x-1"
              >
                <span>View All</span>
                <FaEye />
              </Link>
            </div>
            <div className="space-y-2">
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Global Footer */}
      <Footer />
    </div>
  );
}


