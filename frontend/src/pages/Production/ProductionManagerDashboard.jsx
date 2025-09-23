import React, { useEffect, useState } from 'react';
import Footer from '../../components/footer.jsx';
import { Link, useNavigate } from 'react-router-dom';
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
  FaMoneyBill
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
  
  // Mock data with more realistic values
  const [dashboardData, setDashboardData] = useState({
    totalSuppliers: 12,
    rawTeaInventory: 47250,
    lowStockItems: 3,
    productionTarget: 85.6,
    todayProduction: 2340,
    weeklyGrowth: 12.5,
    monthlyRevenue: 125000,
    activeOrders: 28
  });

  // Enhanced chart data
  const stockData = [
    { name: 'Jan', stock: 45000, target: 50000, production: 38000 },
    { name: 'Feb', stock: 52000, target: 50000, production: 42000 },
    { name: 'Mar', stock: 48000, target: 50000, production: 39000 },
    { name: 'Apr', stock: 51000, target: 50000, production: 44000 },
    { name: 'May', stock: 47250, target: 50000, production: 41000 },
  ];

  const supplierData = [
    { name: 'Highland Tea Co.', value: 35, color: '#10B981' },
    { name: 'Valley Estates', value: 28, color: '#3B82F6' },
    { name: 'Mountain Springs', value: 22, color: '#F59E0B' },
    { name: 'Sunrise Gardens', value: 15, color: '#EF4444' }
  ];

  const productionTrends = [
    { time: '00:00', black: 120, green: 85, white: 45, oolong: 30 },
    { time: '04:00', black: 150, green: 92, white: 52, oolong: 38 },
    { time: '08:00', black: 180, green: 110, white: 68, oolong: 45 },
    { time: '12:00', black: 220, green: 135, white: 82, oolong: 55 },
    { time: '16:00', black: 200, green: 128, white: 75, oolong: 50 },
    { time: '20:00', black: 170, green: 105, white: 60, oolong: 42 },
  ];

  const recentActivities = [
    { id: 1, action: 'Batch PT-2024-045 started', user: 'John Smith', time: '10 mins ago', type: 'production' },
    { id: 2, action: 'Inventory updated: +2500kg Green Tea', user: 'Sarah Wilson', time: '25 mins ago', type: 'inventory' },
    { id: 3, action: 'Quality check completed', user: 'Mike Chen', time: '1 hour ago', type: 'quality' },
    { id: 4, action: 'New supplier onboarded', user: 'Emma Davis', time: '2 hours ago', type: 'supplier' }
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

  const navigate = useNavigate();
  
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
        case 'production': return 'bg-blue-100 text-blue-600';
        case 'inventory': return 'bg-green-100 text-green-600';
        case 'quality': return 'bg-purple-100 text-purple-600';
        case 'supplier': return 'bg-orange-100 text-orange-600';
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
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Enhanced Modern Sidebar */}
        <div className="w-80 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-2xl border-r border-gray-700">
          <div className="p-6">
            {/* User Profile Section */}
            <div className="flex items-center space-x-4 mb-8 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <FaUserCircle className="text-white text-2xl" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Supplier Portal</h3>
                <p className="text-gray-400 text-sm">Tea Leaf Supplier</p>
              </div>

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
                to="/SupplierHome" 
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <FaUsers className="text-xl" />
                <span>Supplier Management</span>
              </Link>
              
              <Link 
                to="/inventories" 
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <FaWarehouse className="text-xl" />
                <span>Inventory Management</span>
              </Link>

              <Link 
                to="/suppliers/payments" 
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <FaMoneyBill className="text-xl" />
                <span>Supplier Payments</span>
              </Link>
              
              <Link 
                to="/staff/editProfile" 
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <FaUserCircle className="text-xl" />
                <span>Edit Profile</span>
              </Link>
              
              <Link 
                to="/Production" 
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <FaChartBar className="text-xl" />
                <span>Production</span>
              </Link>

             <Link 
                to="/Raw-leaves" 
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <FaLeaf className="text-xl" />
                <span>Raw Leaves</span>
              </Link>

              <ReportsNavigationItem />
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

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Header with Time Range Selector */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Production Overview</h2>
              <p className="text-gray-600 mt-1">Monitor and manage your tea production operations</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard
              title="Total Suppliers"
              value={dashboardData.totalSuppliers}
              icon={FaUsers}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              trend="up"
              trendValue="8"
              subtitle="2 new this month"
            />
            <DashboardCard
              title="Raw Inventory"
              value={`${(dashboardData.rawTeaInventory / 1000).toFixed(1)}K kg`}
              icon={FaBoxOpen}
              color="bg-gradient-to-br from-green-500 to-green-600"
              trend="down"
              trendValue="3"
              subtitle="Stock level normal"
            />
            <DashboardCard
              title="Production Target"
              value={`${dashboardData.productionTarget}%`}
              icon={MdTrendingUp}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              trend="up"
              trendValue="12"
              subtitle="Above target"
            />
            <DashboardCard
              title="Active Orders"
              value={dashboardData.activeOrders}
              icon={FaTruck}
              color="bg-gradient-to-br from-orange-500 to-orange-600"
              trend="up"
              trendValue="15"
              subtitle="On schedule"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4 mb-8">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard title="Stock Levels & Production">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="stock" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="production" stackId="2" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Supplier Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={supplierData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({name, value}) => `${name}: ${value}%`}
                  >
                    {supplierData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Production Trends - Full Width */}
          <ChartCard title="Real-time Production Trends" fullWidth>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={productionTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="black" stroke="#374151" strokeWidth={3} dot={{r: 4}} />
                <Line type="monotone" dataKey="green" stroke="#10B981" strokeWidth={3} dot={{r: 4}} />
                <Line type="monotone" dataKey="white" stroke="#F59E0B" strokeWidth={3} dot={{r: 4}} />
                <Line type="monotone" dataKey="oolong" stroke="#8B5CF6" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
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
        </main>
      </div>
      {/* Keep existing Footer */}
      <Footer />
    </div>
  );
};

export default ModernProductionDashboard;