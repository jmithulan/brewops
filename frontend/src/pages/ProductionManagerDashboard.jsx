import React, { useEffect, useState } from 'react';
import NavigationBar from '../components/navigationBar';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import ReportsNavigationItem from '../components/ReportsNavigationItem';
import dashboardService from '../services/dashboardService';
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
  FaMoneyBill,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { MdDashboard, MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import { LineChart, BarChart, PieChart, AreaChart, Line, Bar, Pie, Area, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const ModernProductionDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', message: 'Low stock alert: Green Tea Leaves below 5000kg', time: '2 mins ago' },
    { id: 2, type: 'info', message: 'New supplier application received', time: '15 mins ago' },
    { id: 3, type: 'success', message: 'Production batch #PT-2024-001 completed', time: '1 hour ago' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dashboard data from API
  const [dashboardData, setDashboardData] = useState({
    totalSuppliers: 0,
    rawTeaInventory: 0,
    lowStockItems: 0,
    productionTarget: 0,
    todayProduction: 0,
    weeklyGrowth: 0,
    monthlyRevenue: 0,
    activeOrders: 0,
    monthlyLeaves: 0,
    qualityScore: 0,
    deliveryRate: 0
  });

  // Chart data from API
  const [chartData, setChartData] = useState({
    stockData: [],
    supplierData: [],
    productionTrends: []
  });

  const [recentActivities, setRecentActivities] = useState([]);

  const DashboardCard = ({ title, value, icon: Icon, color, trend, trendValue, subtitle }) => (
    <div className={`${color} rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20 backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 md:p-3 bg-white/20 rounded-lg">
            <Icon className="text-xl md:text-2xl text-white" />
          </div>
          <div>
            <h3 className="text-white/80 text-xs md:text-sm font-medium">{title}</h3>
            <p className="text-2xl md:text-3xl font-bold text-white">{value}</p>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 ${trend === 'up' ? 'text-green-200' : 'text-red-200'}`}>
            {trend === 'up' ? <MdTrendingUp /> : <MdTrendingDown />}
            <span className="text-sm font-medium">{trendValue}%</span>
          </div>
        )}
      </div>
      {subtitle && <p className="text-white/70 text-xs md:text-sm">{subtitle}</p>}
    </div>
  );

  const navigate = useNavigate();
  
  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data from backend API
      const [dashboardResponse, chartResponse, activitiesResponse] = await Promise.all([
        dashboardService.getDashboardData(),
        dashboardService.getChartData(),
        dashboardService.getRecentActivities()
      ]);

      setDashboardData(dashboardResponse);
      setChartData(chartResponse);
      setRecentActivities(activitiesResponse);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      
      // Set fallback data in case of error
      setDashboardData({
        totalSuppliers: 0,
        rawTeaInventory: 0,
        lowStockItems: 0,
        productionTarget: 0,
        todayProduction: 0,
        weeklyGrowth: 0,
        monthlyRevenue: 0,
        activeOrders: 0,
        monthlyLeaves: 0,
        qualityScore: 0,
        deliveryRate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when time range changes
  useEffect(() => {
    fetchDashboardData();
  }, [selectedTimeRange]);
  
  // Close sidebar when clicking on navigation links on mobile
  const handleNavClick = () => {
    if (window.innerWidth < 1024) { // lg breakpoint
      setIsSidebarOpen(false);
    }
  };

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const QuickActionButton = ({ icon: Icon, label, color, onClick }) => (
    <button 
      onClick={onClick}
      className={`${color} text-white px-4 md:px-6 py-2 md:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center space-x-2 md:space-x-3 font-medium text-sm md:text-base`}
    >
      <Icon className="text-sm md:text-lg" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  const ChartCard = ({ title, children, fullWidth = false }) => (
    <div className={`bg-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-all duration-300 ${fullWidth ? 'col-span-full' : ''}`}>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center space-x-2">
          <button className="p-1 md:p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaExpand className="text-gray-400 text-sm" />
          </button>
          <button className="p-1 md:p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaCog className="text-gray-400 text-sm" />
          </button>
        </div>
      </div>
      {children}
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const getIconColor = (type) => {
      switch(type) {
        case 'production': return 'bg-blue-100 text-blue-600';
        case 'inventory': return 'bg-green-100 text-green-600';
        case 'quality': return 'bg-purple-100 text-purple-600';
        case 'supplier': return 'bg-orange-100 text-orange-600';
        default: return 'bg-gray-100 text-gray-600';
      }
    };

    return (
      <div className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 hover:bg-gray-50 rounded-lg transition-colors">
        <div className={`p-1.5 md:p-2 rounded-full ${getIconColor(activity.type)}`}>
          <FaEye className="text-xs md:text-sm" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-800 text-sm md:text-base truncate">{activity.action}</p>
          <p className="text-xs md:text-sm text-gray-500">by {activity.user} • {activity.time}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="flex relative">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg shadow-lg"
        >
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-opacity-50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Enhanced Modern Sidebar */}
        <div className={`
          w-80 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-2xl border-r border-gray-700
          fixed lg:relative h-full lg:h-auto z-40 transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 md:p-6">
            {/* User Profile Section */}
            <div className="flex items-center space-x-3 md:space-x-4 mb-6 md:mb-8 p-3 md:p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <FaUserCircle className="text-white text-lg md:text-2xl" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-semibold text-sm md:text-base truncate">Supplier Portal</h3>
                <p className="text-gray-400 text-xs md:text-sm">Tea Leaf Supplier</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1 md:space-y-2">
              <Link 
                to="/" 
                onClick={handleNavClick}
                className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <FaHome className="text-lg md:text-xl" />
                <span className="text-sm md:text-base">Home</span>
              </Link>
              
              <Link 
                to="/SupplierDashboard" 
                onClick={handleNavClick}
                className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg bg-gray-700 text-white shadow-md"
              >
                <MdDashboard className="text-lg md:text-xl" />
                <span className="font-medium text-sm md:text-base">Dashboard</span>
              </Link>
              
              <Link 
                to="/SupplierHome" 
                onClick={handleNavClick}
                className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <FaUsers className="text-lg md:text-xl" />
                <span className="text-sm md:text-base">Supplier Management</span>
              </Link>
              
              <Link 
                to="/inventory" 
                onClick={handleNavClick}
                className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <FaWarehouse className="text-lg md:text-xl" />
                <span className="text-sm md:text-base">Inventory Management</span>
              </Link>

              <Link 
                to="/suppliers/payments" 
                onClick={handleNavClick}
                className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <FaMoneyBill className="text-lg md:text-xl" />
                <span className="text-sm md:text-base">Supplier Payments</span>
              </Link>
              
              <Link 
                to="/staff/editProfile" 
                onClick={handleNavClick}
                className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <FaUserCircle className="text-lg md:text-xl" />
                <span className="text-sm md:text-base">Edit Profile</span>
              </Link>
              
              <Link 
                to="/Production" 
                onClick={handleNavClick}
                className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <FaChartBar className="text-lg md:text-xl" />
                <span className="text-sm md:text-base">Production</span>
              </Link>

             <Link 
                to="/Raw-leaves" 
                onClick={handleNavClick}
                className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <FaLeaf className="text-lg md:text-xl" />
                <span className="text-sm md:text-base">Raw Leaves</span>
              </Link>

              <div onClick={handleNavClick}>
                <ReportsNavigationItem />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 md:mt-8">
              <h4 className="text-gray-300 font-medium text-xs md:text-sm uppercase tracking-wider border-b border-gray-700 pb-2 mb-3 md:mb-4">
                Quick Actions
              </h4>
              
              <div className="space-y-2 md:space-y-3">
                <Link 
                  to="/supplier/create-supply-recode" 
                  onClick={handleNavClick}
                  className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:from-green-700 hover:to-emerald-800 transition-all duration-200 shadow-lg"
                >
                  <FaPlus className="text-sm md:text-lg" />
                  <span className="font-medium text-sm md:text-base">New Supply Record</span>
                </Link>
                
                <button className="w-full flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg">
                  <FaSearch className="text-sm md:text-lg" />
                  <span className="font-medium text-sm md:text-base">Search Records</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Section - Moved to Bottom */}
            <div className="mt-6 md:mt-8 space-y-3 md:space-y-4">
              <h4 className="text-gray-300 font-medium text-xs md:text-sm uppercase tracking-wider border-b border-gray-700 pb-2">
                Quick Stats
              </h4>
              
              <div className="grid grid-cols-1 gap-3 md:gap-4">
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-3 md:p-4 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-xs md:text-sm">Monthly Delivery</p>
                      <p className="text-white text-lg md:text-2xl font-bold">
                        {loading ? "..." : `${dashboardData.monthlyLeaves} kg`}
                      </p>
                    </div>
                    <FaLeaf className="text-green-200 text-lg md:text-2xl" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 md:p-4 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs md:text-sm">Quality Score</p>
                      <p className="text-white text-lg md:text-2xl font-bold">
                        {loading ? "..." : `${dashboardData.qualityScore}%`}
                      </p>
                    </div>
                    <FaChartBar className="text-blue-200 text-lg md:text-2xl" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-3 md:p-4 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-xs md:text-sm">Monthly Revenue</p>
                      <p className="text-white text-base md:text-xl font-bold">
                        {loading ? "..." : `Rs. ${dashboardData.monthlyRevenue.toLocaleString()}`}
                      </p>
                    </div>
                    <FaMoneyBillWave className="text-purple-200 text-lg md:text-2xl" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-3 md:p-4 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-xs md:text-sm">Delivery Rate</p>
                      <p className="text-white text-lg md:text-2xl font-bold">
                        {loading ? "..." : `${dashboardData.deliveryRate}%`}
                      </p>
                    </div>
                    <FaTruck className="text-orange-200 text-lg md:text-2xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-0 pt-16 lg:pt-4">
          {/* Header with Time Range Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 mt-4 lg:mt-0">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Production Overview</h2>
              <p className="text-gray-600 mt-1 text-sm md:text-base">Monitor and manage your tea production operations</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 md:px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-red-500 mr-2" />
                <div>
                  <p className="text-red-800 font-medium">Dashboard Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                  <button 
                    onClick={fetchDashboardData}
                    className="mt-2 text-red-700 hover:text-red-800 font-medium text-sm underline"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <DashboardCard
              title="Total Suppliers"
              value={loading ? "..." : dashboardData.totalSuppliers}
              icon={FaUsers}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              trend="up"
              trendValue="8"
              subtitle="2 new this month"
            />
            <DashboardCard
              title="Raw Inventory"
              value={loading ? "..." : `${(dashboardData.rawTeaInventory / 1000).toFixed(1)}K kg`}
              icon={FaBoxOpen}
              color="bg-gradient-to-br from-green-500 to-green-600"
              trend="down"
              trendValue="3"
              subtitle="Stock level normal"
            />
            <DashboardCard
              title="Production Target"
              value={loading ? "..." : `${dashboardData.productionTarget}%`}
              icon={MdTrendingUp}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              trend="up"
              trendValue="12"
              subtitle="Above target"
            />
            <DashboardCard
              title="Active Orders"
              value={loading ? "..." : dashboardData.activeOrders}
              icon={FaTruck}
              color="bg-gradient-to-br from-orange-500 to-orange-600"
              trend="up"
              trendValue="15"
              subtitle="On schedule"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 md:gap-4 mb-6 md:mb-8">
            <QuickActionButton
              icon={FaPlus}
              label="Add Supplier"
              color="bg-gradient-to-r from-green-500 to-green-600"
              onClick={() => console.log('Add supplier')}
            />
            <QuickActionButton
              icon={FaBoxOpen}
              label="Update Inventory"
              color="bg-gradient-to-r from-blue-500 to-blue-600"
              onClick={() => console.log('Update inventory')}
            />
            <QuickActionButton
              icon={FaFileAlt}
              label="Generate Report"
              color="bg-gradient-to-r from-purple-500 to-purple-600"
              onClick={() => navigate('/reports')}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            <ChartCard title="Stock Levels & Production">
              {loading ? (
                <div className="flex items-center justify-center h-[250px]">
                  <div className="text-gray-500">Loading chart data...</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData.stockData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="stock" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="production" stackId="2" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Supplier Distribution">
              {loading ? (
                <div className="flex items-center justify-center h-[250px]">
                  <div className="text-gray-500">Loading chart data...</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={chartData.supplierData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({name, value}) => `${name}: ${value}%`}
                      fontSize={10}
                    >
                      {chartData.supplierData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* Production Trends - Full Width */}
          <ChartCard title="Real-time Production Trends" fullWidth>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-gray-500">Loading production trends...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.productionTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="black" stroke="#374151" strokeWidth={2} dot={{r: 3}} />
                  <Line type="monotone" dataKey="green" stroke="#10B981" strokeWidth={2} dot={{r: 3}} />
                  <Line type="monotone" dataKey="white" stroke="#F59E0B" strokeWidth={2} dot={{r: 3}} />
                  <Line type="monotone" dataKey="oolong" stroke="#8B5CF6" strokeWidth={2} dot={{r: 3}} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Recent Activities */}
          <div className="mt-6 md:mt-8 bg-white rounded-xl shadow-lg p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-800">Recent Activities</h3>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base">View All</button>
            </div>
            <div className="space-y-1">
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </main>
      </div>
      {/* Keep existing Footer */}
      <Footer />
    </div>
  );
};

export default ModernProductionDashboard;