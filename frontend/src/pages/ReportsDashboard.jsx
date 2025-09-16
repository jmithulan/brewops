import React, { useState, useEffect } from 'react';
import { Layout, PageHeader, Button } from '../components/shared';
import { commonApi } from '../utils/api';
import { FaDownload, FaCalendar, FaChartBar, FaUsers, FaBox, FaMoneyBillWave } from 'react-icons/fa';
import { LineChart, BarChart, PieChart, Line, Bar, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const ReportsDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [reportData, setReportData] = useState({
    supplierStats: {},
    inventoryStats: {},
    paymentStats: {},
    recentActivities: []
  });
  const [dailyReport, setDailyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);

  // Fetch dashboard report data
  const fetchDashboardReport = async () => {
    setLoading(true);
    try {
      const result = await commonApi.reports.getDashboard({ period: selectedPeriod });
      if (result.success) {
        setReportData(result.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard report:', error);
    }
    setLoading(false);
  };

  // Fetch daily report
  const fetchDailyReport = async (date = new Date().toISOString().split('T')[0]) => {
    setLoading(true);
    try {
      const result = await commonApi.reports.getDailySupplierReport(date);
      if (result.success) {
        setDailyReport(result.data);
      }
    } catch (error) {
      console.error('Error fetching daily report:', error);
    }
    setLoading(false);
  };

  // Fetch monthly report
  const fetchMonthlyReport = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    setLoading(true);
    try {
      const result = await commonApi.reports.getMonthlySupplierReport(year, month);
      if (result.success) {
        setMonthlyReport(result.data);
      }
    } catch (error) {
      console.error('Error fetching monthly report:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardReport();
  }, [selectedPeriod]);

  useEffect(() => {
    fetchDailyReport();
    fetchMonthlyReport();
  }, []);

  // Generate PDF report
  const generatePDFReport = async (reportType) => {
    try {
      // This would integrate with a PDF generation service
      console.log(`Generating ${reportType} PDF report...`);
      // Implementation would go here
    } catch (error) {
      console.error('Error generating PDF report:', error);
    }
  };

  // Chart data for supplier performance
  const supplierPerformanceData = [
    { name: 'Week 1', deliveries: 45, amount: 125000 },
    { name: 'Week 2', deliveries: 52, amount: 142000 },
    { name: 'Week 3', deliveries: 48, amount: 138000 },
    { name: 'Week 4', deliveries: 61, amount: 165000 },
  ];

  // Chart data for inventory trends
  const inventoryTrendData = [
    { name: 'Jan', stock: 45000, processed: 38000 },
    { name: 'Feb', stock: 42000, processed: 41000 },
    { name: 'Mar', stock: 48000, processed: 39000 },
    { name: 'Apr', stock: 46000, processed: 42000 },
    { name: 'May', stock: 52000, processed: 45000 },
  ];

  // Payment status data
  const paymentStatusData = [
    { name: 'Paid', value: 85, color: '#10B981' },
    { name: 'Pending', value: 12, color: '#F59E0B' },
    { name: 'Overdue', value: 3, color: '#EF4444' },
  ];

  return (
    <Layout>
      <PageHeader
        title="Reports Dashboard"
        subtitle="Comprehensive analytics and reporting for tea factory operations"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Reports' }
        ]}
        actions={
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => generatePDFReport('daily')}>
              <FaDownload className="mr-2" />
              Daily Report
            </Button>
            <Button variant="outline" onClick={() => generatePDFReport('monthly')}>
              <FaDownload className="mr-2" />
              Monthly Report
            </Button>
          </div>
        }
      />

      {/* Period Selector */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Report Period</h3>
          <div className="flex space-x-2">
            {['7d', '30d', '90d'].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'primary' : 'outline'}
                size="small"
                onClick={() => setSelectedPeriod(period)}
              >
                {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaUsers className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reportData.supplierStats.active_suppliers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaBox className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reportData.supplierStats.total_deliveries || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FaMoneyBillWave className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-semibold text-gray-900">
                Rs. {(reportData.supplierStats.total_amount || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FaChartBar className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Rate/kg</p>
              <p className="text-2xl font-semibold text-gray-900">
                Rs. {(reportData.supplierStats.avg_rate || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Supplier Performance Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Supplier Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={supplierPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="deliveries" fill="#3B82F6" name="Deliveries" />
              <Line yAxisId="right" type="monotone" dataKey="amount" stroke="#10B981" name="Amount (Rs.)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Status Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {paymentStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Inventory Trends */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={inventoryTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="stock" fill="#3B82F6" name="Stock (kg)" />
            <Bar dataKey="processed" fill="#10B981" name="Processed (kg)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Report Summary */}
      {dailyReport && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Report Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dailyReport.deliveryStats?.total_deliveries || 0}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Quantity</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(dailyReport.deliveryStats?.total_quantity || 0).toLocaleString()} kg
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-semibold text-gray-900">
                Rs. {(dailyReport.deliveryStats?.total_amount || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
        <div className="space-y-4">
          {reportData.recentActivities?.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <div className={`p-2 rounded-full ${
                  activity.type === 'delivery' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {activity.type === 'delivery' ? <FaBox className="h-4 w-4" /> : <FaUsers className="h-4 w-4" />}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-sm text-gray-500">{activity.date}</p>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900">
                Rs. {(activity.amount || 0).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ReportsDashboard;
