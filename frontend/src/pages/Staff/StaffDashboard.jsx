import React, { useState, useEffect } from 'react';
import NavigationBar from '../../components/navigationBar.jsx';
import Footer from '../../components/footer.jsx';
import { Link } from 'react-router-dom';
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
  FaClipboardList,
  FaIndustry
} from 'react-icons/fa';
import { MdDashboard, MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import { LineChart, BarChart, PieChart, AreaChart, Line, Bar, Pie, Area, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';

export default function StaffDashboard() {
  // Dashboard state
  const [suppliers, setSuppliers] = useState(0);
  const [inventory, setInventory] = useState(0);
  const [lowStock, setLowStock] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', message: 'Low stock alert: Green Tea Leaves below 5000kg', time: '2 mins ago' },
    { id: 2, type: 'info', message: 'New supplier application received', time: '15 mins ago' },
    { id: 3, type: 'success', message: 'Inventory update completed successfully', time: '1 hour ago' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');

  // Staff-specific dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalSuppliers: suppliers,
    rawTeaInventory: inventory,
    lowStockItems: lowStock,
    productionTarget: 85.6,
    weeklyGrowth: 12.5,
    monthlyRevenue: 125000,
    activeOrders: 28,
    staffProductivity: 92.3
  });

  // Enhanced chart data for staff metrics
  const stockData = [
    { name: 'Jan', stock: 45000, target: 50000, consumed: 38000 },
    { name: 'Feb', stock: 52000, target: 50000, consumed: 42000 },
    { name: 'Mar', stock: 48000, target: 50000, consumed: 39000 },
    { name: 'Apr', stock: 51000, target: 50000, consumed: 44000 },
    { name: 'May', stock: inventory || 47250, target: 50000, consumed: 41000 },
  ];

  const supplierDistribution = [
    { name: 'Highland Tea Co.', value: 35, color: '#10B981' },
    { name: 'Valley Estates', value: 28, color: '#3B82F6' },
    { name: 'Mountain Springs', value: 22, color: '#F59E0B' },
    { name: 'Sunrise Gardens', value: 15, color: '#EF4444' }
  ];

  const productivityTrends = [
    { day: 'Mon', efficiency: 88, output: 1200, quality: 95 },
    { day: 'Tue', efficiency: 92, output: 1350, quality: 94 },
    { day: 'Wed', efficiency: 85, output: 1180, quality: 96 },
    { day: 'Thu', efficiency: 90, output: 1280, quality: 93 },
    { day: 'Fri', efficiency: 94, output: 1420, quality: 97 },
    { day: 'Sat', efficiency: 78, output: 980, quality: 91 },
    { day: 'Sun', efficiency: 65, output: 750, quality: 89 },
  ];

  const recentActivities = [
    { id: 1, action: 'Inventory batch IN-2024-045 processed', user: 'Staff Member', time: '10 mins ago', type: 'inventory' },
    { id: 2, action: 'New supplier Highland Tea Co. added', user: 'Staff Member', time: '25 mins ago', type: 'supplier' },
    { id: 3, action: 'Quality check completed for Batch QC-001', user: 'Staff Member', time: '1 hour ago', type: 'quality' },
    { id: 4, action: 'Monthly inventory report generated', user: 'Staff Member', time: '2 hours ago', type: 'report' }
  ];

  // Fetch Dashboard summary
  useEffect(() => {
    axios.get("/api/dashboard/summary")
      .then(res => {
        const newSuppliers = res.data.totalSuppliers;
        const newInventory = res.data.totalInventory;
        const newLowStock = res.data.lowStock;
        
        setSuppliers(newSuppliers);
        setInventory(newInventory);
        setLowStock(newLowStock);
        
        setDashboardData(prev => ({
          ...prev,
          totalSuppliers: newSuppliers,
          rawTeaInventory: newInventory,
          lowStockItems: newLowStock
        }));
      })
      .catch(err => console.log(err));
  }, []);

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

  const QuickActionButton = ({ icon: Icon, label, color, onClick, to }) => {
    const buttonContent = (
      <button 
        onClick={onClick}
        className={`${color} text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center space-x-3 font-medium w-full`}
      >
        <Icon className="text-lg" />
        <span>{label}</span>
      </button>
    );

    return to ? <Link to={to}>{buttonContent}</Link> : buttonContent;
  };

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
        case 'inventory': return 'bg-blue-100 text-blue-600';
        case 'supplier': return 'bg-green-100 text-green-600';
        case 'quality': return 'bg-purple-100 text-purple-600';
        case 'report': return 'bg-orange-100 text-orange-600';
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
        {/* Enhanced Modern Staff Sidebar */}
        <div className="w-80 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-2xl border-r border-gray-700">
          <div className="p-6">
            {/* Staff Profile Section */}
            <div className="flex items-center space-x-4 mb-8 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <FaUserCircle className="text-white text-2xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">Staff Portal</h3>
                <p className="text-gray-400 text-sm">Inventory Management</p>
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
                Operations
              </h4>
              
              <Link 
                to="/staff-dashboard" 
                className="flex items-center space-x-3 p-3 rounded-lg bg-gray-700 text-white shadow-md"
              >
                <MdDashboard className="text-xl" />
                <span className="font-medium">Dashboard</span>
              </Link>
              
              <Link 
                to="/suppliers" 
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <FaUsers className="text-xl" />
                <span>Supplier Management</span>
              </Link>
              
              <Link 
                to="/inventories" 
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <FaBoxOpen className="text-xl" />
                <span>Inventory Management</span>
              </Link>
              
              <Link 
                to="/staff/profile" 
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <FaClipboardList className="text-xl" />
                <span>Profile</span>
              </Link>
              
              <Link 
                to="/staff/profile/setting" 
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
                  to="/suppliers/new" 
                  className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:from-green-700 hover:to-emerald-800 transition-all duration-200 shadow-lg"
                >
                  <FaPlus className="text-lg" />
                  <span className="font-medium">Add Supplier</span>
                </Link>
                
                <Link 
                  to="/inventories/new" 
                  className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
                >
                  <FaPlus className="text-lg" />
                  <span className="font-medium">Add Inventory</span>
                </Link>
                
                <Link 
                  to="/reports" 
                  className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg"
                >
                  <FaFileAlt className="text-lg" />
                  <span className="font-medium">Generate Report</span>
                </Link>
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
                      <p className="text-green-100 text-sm">Total Suppliers</p>
                      <p className="text-white text-2xl font-bold">{dashboardData.totalSuppliers}</p>
                    </div>
                    <FaUsers className="text-green-200 text-2xl" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Raw Inventory</p>
                      <p className="text-white text-2xl font-bold">{(dashboardData.rawTeaInventory / 1000).toFixed(1)}K kg</p>
                    </div>
                    <FaBoxOpen className="text-blue-200 text-2xl" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Low Stock Items</p>
                      <p className="text-white text-2xl font-bold">{dashboardData.lowStockItems}</p>
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
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Staff Dashboard</h1>
              <p className="text-gray-600">Inventory and supplier management overview</p>
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

          {/* Staff Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard
              title="Total Suppliers"
              value={dashboardData.totalSuppliers}
              icon={FaUsers}
              color="bg-gradient-to-br from-green-500 to-green-600"
              trend="up"
              trendValue="12"
              subtitle="Active suppliers"
            />
            <DashboardCard
              title="Raw Inventory"
              value={`${(dashboardData.rawTeaInventory / 1000).toFixed(1)}K kg`}
              icon={FaBoxOpen}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              trend="down"
              trendValue="3"
              subtitle="Stock level normal"
            />
            <DashboardCard
              title="Low Stock Items"
              value={dashboardData.lowStockItems}
              icon={FaExclamationTriangle}
              color="bg-gradient-to-br from-orange-500 to-orange-600"
              trend="down"
              trendValue="25"
              subtitle="Need attention"
            />
            <DashboardCard
              title="Productivity"
              value={`${dashboardData.staffProductivity}%`}
              icon={FaChartBar}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              trend="up"
              trendValue="8"
              subtitle="Efficiency rate"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard title="Stock Levels & Consumption">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="stock" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="consumed" stackId="2" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Supplier Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={supplierDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({name, value}) => `${name}: ${value}%`}
                  >
                    {supplierDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Staff Productivity Trends - Full Width */}
          <ChartCard title="Weekly Productivity Trends" fullWidth>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={productivityTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="efficiency" fill="#3B82F6" name="Efficiency %" />
                <Bar dataKey="output" fill="#10B981" name="Output (kg)" />
                <Bar dataKey="quality" fill="#F59E0B" name="Quality Score" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Recent Activities */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Recent Activities</h3>
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
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
