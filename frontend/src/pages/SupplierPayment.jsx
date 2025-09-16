import React, { useState, useEffect } from 'react';
import NavigationBar from '../components/navigationBar';
import axios from 'axios';
import Footer from '../components/Footer';
import { Users, DollarSign, Calendar, Download, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { 
  FaHome, 
  FaUsers, 
  FaWarehouse, 
  FaChartBar, 
  FaLeaf, 
  FaUserCircle, 
  FaPlus, 
  FaSearch, 
  FaMoneyBillWave, 
  FaTruck 
} from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { Link } from 'react-router-dom';

const TeaFactoryPayment = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [deliveryRecords, setDeliveryRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSpotCashModal, setShowSpotCashModal] = useState(false);
  const [selectedSupplierForPayment, setSelectedSupplierForPayment] = useState(null);
  const [selectedSupplierForSpotCash, setSelectedSupplierForSpotCash] = useState(null);
  const [spotCashAmount, setSpotCashAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Dashboard data for quick stats
  const dashboardData = {
    monthlyLeaves: 2450,
    qualityScore: 94,
    monthlyRevenue: 185000,
    deliveryRate: 96
  };

  // Fetch data from local backend (fallbacks to sample data if requests fail)
  const fetchSuppliers = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/api/suppliers/active', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.data && res.data.success) {
      const transformed = res.data.data.map(s => ({
        id: s.id,
        supplierId: s.supplier_id,
        name: s.name,
        phone: s.contact_number,
        bankAccount: s.bank_account_number,
        bankName: s.bank_name,
        rate: s.rate || 150,
        monthlyQuantity: 0
      }));
      setSuppliers(transformed);
    }
  };

  const fetchPayments = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/api/payments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.data && res.data.success) {
      const adaptedPayments = res.data.data.map(p => ({
        id: p.id,
        supplierId: p.supplier_id,
        month: p.payment_month,
        amount: p.amount,
        date: p.payment_date,
        status: p.status,
        type: p.payment_type === 'spot_cash' ? 'spot-cash' : p.payment_type,
        paymentMethod: p.payment_method
      }));
      setPayments(adaptedPayments);
    }
  };

  const fetchPaymentStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/payments/statistics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        // optionally set local dashboardData if you want dynamic values
        // currently dashboardData is static in this file; keep it simple
        console.log('Payment statistics:', res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load payment statistics', err.message || err);
    }
  };

  const fetchDeliveryRecords = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const res = await axios.get('http://localhost:5000/api/deliveries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        const deliveryData = res.data.data || [];
        setDeliveryRecords(deliveryData);
      }
    } catch (err) {
      console.warn('Failed to load delivery records', err.message || err);
      setDeliveryRecords([]);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchPayments();
    fetchPaymentStatistics();
    fetchDeliveryRecords();
  }, []);

  const [supplierForm, setSupplierForm] = useState({
    name: '', phone: '', bankAccount: '', bankName: '', rate: '', monthlyQuantity: ''
  });

  const addSupplier = () => {
    if (supplierForm.name && supplierForm.phone && supplierForm.bankAccount && supplierForm.rate) {
      (async () => {
        try {
          const token = localStorage.getItem('token');
          const payload = {
            name: supplierForm.name,
            contact_number: supplierForm.phone,
            bank_account_number: supplierForm.bankAccount,
            bank_name: supplierForm.bankName,
            rate: parseFloat(supplierForm.rate)
          };
          const res = await axios.post('http://localhost:5000/api/suppliers', payload, { headers: { Authorization: `Bearer ${token}` } });
          if (res.data && res.data.success) {
            await fetchSuppliers();
          } else {
            throw new Error(res.data?.message || 'Failed to save supplier');
          }
        } catch (err) {
          console.warn('Failed to save supplier to backend', err.message || err);
        } finally {
          setSupplierForm({ name: '', phone: '', bankAccount: '', bankName: '', rate: '', monthlyQuantity: '' });
          setShowAddSupplier(false);
        }
      })();
    }
  };

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Unknown';
  };

  const getSupplierQuantity = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.monthlyQuantity || 0 : 0;
  };

  const getMonthlyReport = () => {
    // Since deliveries are removed, return empty report
    return [];
  };

  const getPaymentStatus = (supplierId, month) => {
    const payment = payments.find(p => p.supplierId === supplierId && p.month === month);
    return payment ? payment.status : 'pending';
  };

  // Get delivery records for a specific supplier and month
  const getMonthlyDeliveryRecords = (supplierId, month) => {
    const monthDate = new Date(month + '-01');
    return deliveryRecords.filter(delivery => {
      const deliveryDate = new Date(delivery.delivery_date);
      return delivery.supplier_id === supplierId && 
             delivery.payment_method === 'monthly' &&
             deliveryDate.getFullYear() === monthDate.getFullYear() &&
             deliveryDate.getMonth() === monthDate.getMonth();
    });
  };

  // Get spot payment delivery records for a specific supplier
  const getSpotPaymentDeliveries = (supplierId, month = null) => {
    let filtered = deliveryRecords.filter(delivery => 
      delivery.supplier_id === supplierId && 
      delivery.payment_method === 'spot'
    );
    
    if (month) {
      const monthDate = new Date(month + '-01');
      filtered = filtered.filter(delivery => {
        const deliveryDate = new Date(delivery.delivery_date);
        return deliveryDate.getFullYear() === monthDate.getFullYear() &&
               deliveryDate.getMonth() === monthDate.getMonth();
      });
    }
    
    return filtered;
  };

  // Calculate total monthly amount for a supplier
  const getMonthlyTotal = (supplierId, month) => {
    const monthlyDeliveries = getMonthlyDeliveryRecords(supplierId, month);
    return monthlyDeliveries.reduce((sum, delivery) => sum + (parseFloat(delivery.total_amount) || 0), 0);
  };

  // Check if supplier has any deliveries in the month
  const hasDeliveriesInMonth = (supplierId, month) => {
    const monthlyDeliveries = getMonthlyDeliveryRecords(supplierId, month);
    const spotDeliveries = getSpotPaymentDeliveries(supplierId, month);
    return (monthlyDeliveries.length + spotDeliveries.length) > 0;
  };

  const processPayment = (supplierId, amount) => {
    (async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        const payload = {
          supplier_id: supplierId,
          month: selectedMonth,
          amount: parseFloat(amount),
          payment_method: 'Bank Transfer',
          payment_status: 'paid'
        };
        
        let res;
        try {
          res = await axios.post('http://localhost:5000/api/payments/monthly', payload, { 
            headers: { Authorization: `Bearer ${token}` } 
          });
        } catch (err) {
          // Fallback to updating delivery records directly
          console.warn('Monthly payment endpoint failed, trying delivery update', err);
          
          // Update all monthly delivery records for this supplier and month
          const monthlyDeliveries = getMonthlyDeliveryRecords(supplierId, selectedMonth);
          const updatePromises = monthlyDeliveries
            .filter(d => d.payment_status !== 'paid')
            .map(delivery => 
              axios.put(`http://localhost:5000/api/deliveries/${delivery.id}`, {
                ...delivery,
                payment_status: 'paid',
                payment_date: new Date().toISOString().split('T')[0]
              }, { headers: { Authorization: `Bearer ${token}` } })
            );
          
          if (updatePromises.length > 0) {
            await Promise.all(updatePromises);
            res = { data: { success: true, message: 'Monthly deliveries updated successfully' } };
          } else {
            throw new Error('No deliveries found to update');
          }
        }
        
        if (res && res.data && res.data.success) {
          await fetchPayments();
          await fetchDeliveryRecords();
          alert('Monthly payment processed successfully!');
        } else {
          throw new Error(res?.data?.message || 'Payment failed');
        }
      } catch (err) {
        console.error('Monthly payment failed:', err);
        alert(`Payment failed: ${err.message || 'Unknown error'}`);
      } finally {
        setShowPaymentModal(false);
        setSelectedSupplierForPayment(null);
      }
    })();
  };

  const openPaymentModal = (supplier, amount) => {
    setSelectedSupplierForPayment({ ...supplier, amount });
    setShowPaymentModal(true);
  };

  const openSpotCashModal = (supplier) => {
    setSelectedSupplierForSpotCash(supplier);
    setSpotCashAmount('');
    setShowSpotCashModal(true);
  };

  const processSpotCashPayment = () => {
    if (selectedSupplierForSpotCash && spotCashAmount && parseFloat(spotCashAmount) > 0 && paymentMethod) {
      (async () => {
        try {
          const token = localStorage.getItem('jwtToken');
          
          // If we have a pre-filled amount, this is likely from a delivery record
          // We should update the delivery payment status rather than creating a new payment
          const payload = {
            supplier_id: selectedSupplierForSpotCash.id,
            amount: parseFloat(spotCashAmount),
            payment_method: paymentMethod,
            payment_type: 'spot_cash',
            payment_status: 'paid'
          };
          
          // Try to update delivery payment status if this is a delivery-specific payment
          let res;
          try {
            res = await axios.post('http://localhost:5000/api/payments/spot-cash', payload, { 
              headers: { Authorization: `Bearer ${token}` } 
            });
          } catch (err) {
            // Fallback to updating delivery records directly
            console.warn('Spot cash payment endpoint failed, trying delivery update', err);
            
            // Find delivery records for this supplier with this amount to update
            const matchingDeliveries = deliveryRecords.filter(d => 
              d.supplier_id === selectedSupplierForSpotCash.id && 
              Math.abs(parseFloat(d.total_amount) - parseFloat(spotCashAmount)) < 0.01 &&
              d.payment_method === 'spot' &&
              d.payment_status !== 'paid'
            );
            
            if (matchingDeliveries.length > 0) {
              // Update the first matching delivery
              const delivery = matchingDeliveries[0];
              res = await axios.put(`http://localhost:5000/api/deliveries/${delivery.id}`, {
                ...delivery,
                payment_status: 'paid',
                payment_date: new Date().toISOString().split('T')[0]
              }, { headers: { Authorization: `Bearer ${token}` } });
            } else {
              throw new Error('No matching delivery found to update');
            }
          }
          
          if (res && res.data && res.data.success) {
            // Refresh all data
            await fetchPayments();
            await fetchPaymentStatistics();
            await fetchDeliveryRecords();
            alert('Spot payment processed successfully!');
          } else {
            throw new Error(res?.data?.message || 'Spot payment failed');
          }
        } catch (err) {
          console.error('Spot payment processing failed:', err);
          alert(`Payment failed: ${err.message || 'Unknown error'}`);
        } finally {
          setShowSpotCashModal(false);
          setSelectedSupplierForSpotCash(null);
          setSpotCashAmount('');
          setPaymentMethod('');
        }
      })();
    }
  };

  const getTodaysSpotCashPayments = () => {
    const today = new Date().toISOString().slice(0, 10);
    return deliveryRecords.filter(delivery => 
      delivery.payment_method === 'spot' && 
      delivery.delivery_date && 
      delivery.delivery_date.slice(0, 10) === today
    );
  };

  const getTodaysSpotCashTotal = () => {
    return getTodaysSpotCashPayments().reduce((sum, delivery) => sum + (parseFloat(delivery.total_amount) || 0), 0);
  };

  const exportMonthlyReport = () => {
    const report = getMonthlyReport();
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Supplier Name,Phone,Bank Account,Bank Name,Payment Status\n" +
      report.map(r => {
        const paymentStatus = getPaymentStatus(r.supplier.id, selectedMonth);
        return `${r.supplier.name},${r.supplier.phone},${r.supplier.bankAccount},${r.supplier.bankName || ''},${paymentStatus}`;
      }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tea_payments_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalSuppliers = suppliers.length;
  const monthlyTotal = getMonthlyReport().reduce((sum, r) => sum + r.totalAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global NavigationBar */}
      <NavigationBar />
      
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
                <h3 className="text-white font-semibold">Payment Portal</h3>
                <p className="text-gray-400 text-sm">Tea Factory Payment</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'dashboard' 
                    ? 'bg-gray-700 text-white shadow-md' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Calendar className="text-xl" />
                <span className="font-medium">Dashboard</span>
              </button>
              
              <button
                onClick={() => setActiveTab('suppliers')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'suppliers' 
                    ? 'bg-gray-700 text-white shadow-md' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Users className="text-xl" />
                <span className="font-medium">Spot Payments</span>
              </button>
              
              <button
                onClick={() => setActiveTab('payments')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'payments' 
                    ? 'bg-gray-700 text-white shadow-md' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <DollarSign className="text-xl" />
                <span className="font-medium">Monthly Payments</span>
              </button>

              <button
                onClick={() => setActiveTab('deliveries')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'deliveries' 
                    ? 'bg-gray-700 text-white shadow-md' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <FaTruck className="text-xl" />
                <span className="font-medium">All Deliveries</span>
              </button>
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
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                      <p className="text-2xl font-bold text-gray-900">{totalSuppliers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Download className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Monthly Total</p>
                    <p className="text-2xl font-bold text-gray-900">LKR {monthlyTotal.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Today's Spot Cash</p>
                    <p className="text-2xl font-bold text-gray-900">LKR {getTodaysSpotCashTotal().toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Rate/kg</p>
                    <p className="text-2xl font-bold text-gray-900">LKR {suppliers.length > 0 ? (suppliers.reduce((sum, s) => sum + s.rate, 0) / suppliers.length).toFixed(0) : '0'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Spot Cash Payments */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Today's Spot Payment Deliveries</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity (kg)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (LKR)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getTodaysSpotCashPayments().map(delivery => {
                      return (
                        <tr key={delivery.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            DEL-{delivery.id.toString().padStart(4, '0')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="font-medium">{delivery.supplier_name || 'Unknown'}</div>
                            <div className="text-gray-500">{delivery.supplier_code || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(parseFloat(delivery.quantity) || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            Rs. {(parseFloat(delivery.total_amount) || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                              delivery.payment_status === 'paid' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {delivery.payment_status === 'paid' ? <CheckCircle size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
                              {delivery.payment_status || 'pending'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {getTodaysSpotCashPayments().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No spot payment deliveries made today
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Suppliers Tab */}
        {/* Spot Payments Tab */}
        {activeTab === 'suppliers' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Spot Payment Deliveries</h2>
              <div className="flex items-center space-x-4">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Summary Cards for Spot Payments */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <FaMoneyBillWave className="text-3xl text-blue-500 mr-4" />
                  <div>
                    <p className="text-gray-600">Spot Deliveries</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {deliveryRecords.filter(delivery => {
                        const deliveryDate = new Date(delivery.delivery_date);
                        const monthDate = new Date(selectedMonth + '-01');
                        return delivery.payment_method === 'spot' &&
                               deliveryDate.getFullYear() === monthDate.getFullYear() &&
                               deliveryDate.getMonth() === monthDate.getMonth();
                      }).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <FaTruck className="text-3xl text-green-500 mr-4" />
                  <div>
                    <p className="text-gray-600">Total Quantity</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {deliveryRecords.filter(delivery => {
                        const deliveryDate = new Date(delivery.delivery_date);
                        const monthDate = new Date(selectedMonth + '-01');
                        return delivery.payment_method === 'spot' &&
                               deliveryDate.getFullYear() === monthDate.getFullYear() &&
                               deliveryDate.getMonth() === monthDate.getMonth();
                      }).reduce((sum, delivery) => sum + (parseFloat(delivery.quantity) || 0), 0).toFixed(2)} kg
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <DollarSign className="text-3xl text-orange-500 mr-4" />
                  <div>
                    <p className="text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-gray-800">
                      Rs. {deliveryRecords.filter(delivery => {
                        const deliveryDate = new Date(delivery.delivery_date);
                        const monthDate = new Date(selectedMonth + '-01');
                        return delivery.payment_method === 'spot' &&
                               deliveryDate.getFullYear() === monthDate.getFullYear() &&
                               deliveryDate.getMonth() === monthDate.getMonth();
                      }).reduce((sum, delivery) => sum + (parseFloat(delivery.total_amount) || 0), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Spot Payment Deliveries Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Spot Payment Delivery Records - {new Date(selectedMonth + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity (kg)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate/kg</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deliveryRecords
                      .filter(delivery => {
                        const deliveryDate = new Date(delivery.delivery_date);
                        const monthDate = new Date(selectedMonth + '-01');
                        return delivery.payment_method === 'spot' &&
                               deliveryDate.getFullYear() === monthDate.getFullYear() &&
                               deliveryDate.getMonth() === monthDate.getMonth();
                      })
                      .sort((a, b) => new Date(b.delivery_date) - new Date(a.delivery_date))
                      .map(delivery => {
                        const supplier = suppliers.find(s => s.id === delivery.supplier_id);
                        return (
                          <tr key={delivery.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                              DEL-{delivery.id.toString().padStart(4, '0')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{delivery.supplier_name || supplier?.name || 'Unknown'}</div>
                              <div className="text-sm text-gray-500">{delivery.supplier_code || supplier?.supplierId || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(delivery.delivery_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {(parseFloat(delivery.quantity) || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              Rs. {(parseFloat(delivery.rate_per_kg) || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              Rs. {(parseFloat(delivery.total_amount) || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                                delivery.payment_status === 'paid' 
                                  ? 'bg-green-100 text-green-800'
                                  : delivery.payment_status === 'overdue'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {delivery.payment_status === 'paid' ? <CheckCircle size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
                                {delivery.payment_status || 'pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {delivery.payment_status !== 'paid' ? (
                                <button 
                                  onClick={() => {
                                    // Find the supplier for this delivery
                                    const supplier = suppliers.find(s => s.id === delivery.supplier_id);
                                    const deliverySupplier = supplier ? {
                                      id: supplier.id,
                                      name: supplier.name || delivery.supplier_name,
                                      supplierId: supplier.supplierId || delivery.supplier_code,
                                      phone: supplier.phone || 'N/A',
                                      rate: supplier.rate || 150,
                                      bankAccount: supplier.bankAccount || 'N/A',
                                      bankName: supplier.bankName || 'N/A'
                                    } : {
                                      id: delivery.supplier_id,
                                      name: delivery.supplier_name || 'Unknown',
                                      supplierId: delivery.supplier_code || 'N/A',
                                      phone: 'N/A',
                                      rate: parseFloat(delivery.rate_per_kg) || 150,
                                      bankAccount: 'N/A',
                                      bankName: 'N/A'
                                    };
                                    
                                    // Set the delivery-specific amount for spot payment
                                    setSelectedSupplierForSpotCash(deliverySupplier);
                                    setSpotCashAmount(delivery.total_amount);
                                    setShowSpotCashModal(true);
                                  }}
                                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs flex items-center space-x-1 hover:bg-blue-700"
                                >
                                  <CreditCard size={12} />
                                  <span>Pay Now</span>
                                </button>
                              ) : (
                                <span className="text-green-600 text-xs font-medium">Paid</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              
              {deliveryRecords.filter(delivery => {
                const deliveryDate = new Date(delivery.delivery_date);
                const monthDate = new Date(selectedMonth + '-01');
                return delivery.payment_method === 'spot' &&
                       deliveryDate.getFullYear() === monthDate.getFullYear() &&
                       deliveryDate.getMonth() === monthDate.getMonth();
              }).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No spot payment deliveries found for {new Date(selectedMonth + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedSupplierForPayment && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-lg font-medium mb-4">Process Payment</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Payment Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Supplier:</span>
                    <span className="font-medium">{selectedSupplierForPayment.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Month:</span>
                    <span className="font-medium">{selectedMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium text-green-600">LKR {selectedSupplierForPayment.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Bank Transfer Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Holder:</span>
                    <span className="font-medium">{selectedSupplierForPayment.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Number:</span>
                    <span className="font-medium">{selectedSupplierForPayment.bankAccount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank:</span>
                    <span className="font-medium">{selectedSupplierForPayment.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{selectedSupplierForPayment.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => processPayment(selectedSupplierForPayment.id, selectedSupplierForPayment.amount)}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                >
                  <CheckCircle size={16} />
                  <span>Confirm Payment</span>
                </button>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedSupplierForPayment(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Spot Cash Payment Modal */}
        {showSpotCashModal && selectedSupplierForSpotCash && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-lg font-medium mb-4">Spot Cash Payment</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Enter Payment Details</h4>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Supplier:</span>
                    <span className="font-medium">{selectedSupplierForSpotCash.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{selectedSupplierForSpotCash.phone}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rate:</span>
                    <span className="font-medium">LKR {selectedSupplierForSpotCash.rate}/kg</span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (LKR)
                    </label>
                    <input
                      type="number"
                      value={spotCashAmount}
                      onChange={(e) => setSpotCashAmount(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter amount"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select Payment Method</option>
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Check">Check</option>
                    </select>
                  </div>

                  {spotCashAmount && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Calculated Quantity:</span>
                        <span className="font-medium">{(parseFloat(spotCashAmount) / selectedSupplierForSpotCash.rate).toFixed(2)} kg</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={processSpotCashPayment}
                  disabled={!spotCashAmount || parseFloat(spotCashAmount) <= 0 || !paymentMethod}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <span>Process Payment</span>
                </button>
                <button
                  onClick={() => {
                    setShowSpotCashModal(false);
                    setSelectedSupplierForSpotCash(null);
                    setSpotCashAmount('');
                    setPaymentMethod('');
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Payments Tab */}
        {activeTab === 'payments' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Monthly Payments</h2>
              <div className="flex items-center space-x-4">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={exportMonthlyReport}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
                >
                  <Download size={20} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Deliveries</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spot Deliveries</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {suppliers.filter(supplier => hasDeliveriesInMonth(supplier.id, selectedMonth)).map(supplier => {
                    const monthlyDeliveries = getMonthlyDeliveryRecords(supplier.id, selectedMonth);
                    const spotDeliveries = getSpotPaymentDeliveries(supplier.id, selectedMonth);
                    const monthlyTotal = getMonthlyTotal(supplier.id, selectedMonth);
                    const paymentStatus = getPaymentStatus(supplier.id, selectedMonth);
                    
                    return (
                      <tr key={supplier.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                          <div className="text-sm text-gray-500">{supplier.supplierId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{monthlyDeliveries.length} deliveries</div>
                          <div className="text-sm text-gray-500">
                            {monthlyDeliveries.reduce((sum, d) => sum + parseFloat(d.quantity || 0), 0).toFixed(2)} kg
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{spotDeliveries.length} deliveries</div>
                          <div className="text-sm text-gray-500">
                            {spotDeliveries.reduce((sum, d) => sum + parseFloat(d.quantity || 0), 0).toFixed(2)} kg
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">
                            Rs. {monthlyTotal.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                            paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {paymentStatus === 'paid' ? (
                              <>
                                <CheckCircle size={12} className="mr-1" />
                                Paid
                              </>
                            ) : (
                              <>
                                <XCircle size={12} className="mr-1" />
                                Pending
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {paymentStatus !== 'paid' && monthlyTotal > 0 && (
                            <button 
                              onClick={() => openPaymentModal(supplier, monthlyTotal)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs flex items-center space-x-1 hover:bg-green-700"
                            >
                              <CreditCard size={12} />
                              <span>Pay Now</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {suppliers.filter(supplier => hasDeliveriesInMonth(supplier.id, selectedMonth)).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No deliveries found for {new Date(selectedMonth + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                </div>
              )}
            </div>

            {/* Detailed Delivery Records */}
            {suppliers.filter(supplier => hasDeliveriesInMonth(supplier.id, selectedMonth)).length > 0 && (
              <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Detailed Delivery Records - {new Date(selectedMonth + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {deliveryRecords.filter(delivery => {
                        const deliveryDate = new Date(delivery.delivery_date);
                        const monthDate = new Date(selectedMonth + '-01');
                        return deliveryDate.getFullYear() === monthDate.getFullYear() &&
                               deliveryDate.getMonth() === monthDate.getMonth();
                      }).map(delivery => {
                        const supplier = suppliers.find(s => s.id === delivery.supplier_id);
                        return (
                          <tr key={delivery.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                              DEL-{delivery.id.toString().padStart(4, '0')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{delivery.supplier_name || supplier?.name || 'Unknown'}</div>
                              <div className="text-sm text-gray-500">{delivery.supplier_code || supplier?.supplierId || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(delivery.delivery_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {(parseFloat(delivery.quantity) || 0).toFixed(2)} kg
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              Rs. {(parseFloat(delivery.total_amount) || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                delivery.payment_method === 'spot' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {delivery.payment_method === 'spot' ? 'Spot' : 'Monthly'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                                delivery.payment_status === 'paid' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {delivery.payment_status === 'paid' ? <CheckCircle size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
                                {delivery.payment_status || 'pending'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* All Deliveries Tab */}
        {activeTab === 'deliveries' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">All Delivery Records</h2>
              <div className="flex items-center space-x-4">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg"
                />
                <select 
                  className="p-2 border border-gray-300 rounded-lg"
                  onChange={(e) => {/* Filter by payment method */}}
                >
                  <option value="">All Payment Methods</option>
                  <option value="spot">Spot Payments</option>
                  <option value="monthly">Monthly Payments</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity (kg)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate/kg</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deliveryRecords
                      .filter(delivery => {
                        const deliveryDate = new Date(delivery.delivery_date);
                        const monthDate = new Date(selectedMonth + '-01');
                        return deliveryDate.getFullYear() === monthDate.getFullYear() &&
                               deliveryDate.getMonth() === monthDate.getMonth();
                      })
                      .sort((a, b) => new Date(b.delivery_date) - new Date(a.delivery_date))
                      .map(delivery => {
                        const supplier = suppliers.find(s => s.id === delivery.supplier_id);
                        return (
                          <tr key={delivery.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                              DEL-{delivery.id.toString().padStart(4, '0')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{delivery.supplier_name || supplier?.name || 'Unknown'}</div>
                              <div className="text-sm text-gray-500">{delivery.supplier_code || supplier?.supplierId || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(delivery.delivery_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {(parseFloat(delivery.quantity) || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              Rs. {(parseFloat(delivery.rate_per_kg) || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              Rs. {(parseFloat(delivery.total_amount) || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                delivery.payment_method === 'spot' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {delivery.payment_method === 'spot' ? 'Spot Payment' : 'Monthly Payment'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                                delivery.payment_status === 'paid' 
                                  ? 'bg-green-100 text-green-800'
                                  : delivery.payment_status === 'overdue'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {delivery.payment_status === 'paid' ? <CheckCircle size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
                                {delivery.payment_status || 'pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {delivery.payment_status !== 'paid' ? (
                                <button 
                                  onClick={() => {
                                    // Find the supplier for this delivery
                                    const supplier = suppliers.find(s => s.id === delivery.supplier_id);
                                    const deliverySupplier = supplier ? {
                                      id: supplier.id,
                                      name: supplier.name || delivery.supplier_name,
                                      supplierId: supplier.supplierId || delivery.supplier_code,
                                      phone: supplier.phone || 'N/A',
                                      rate: supplier.rate || parseFloat(delivery.rate_per_kg) || 150,
                                      bankAccount: supplier.bankAccount || 'N/A',
                                      bankName: supplier.bankName || 'N/A',
                                      amount: parseFloat(delivery.total_amount)
                                    } : {
                                      id: delivery.supplier_id,
                                      name: delivery.supplier_name || 'Unknown',
                                      supplierId: delivery.supplier_code || 'N/A',
                                      phone: 'N/A',
                                      rate: parseFloat(delivery.rate_per_kg) || 150,
                                      bankAccount: 'N/A',
                                      bankName: 'N/A',
                                      amount: parseFloat(delivery.total_amount)
                                    };
                                    
                                    // Set the delivery-specific amount for payment
                                    if (delivery.payment_method === 'spot') {
                                      setSelectedSupplierForSpotCash(deliverySupplier);
                                      setSpotCashAmount(delivery.total_amount);
                                      setShowSpotCashModal(true);
                                    } else {
                                      setSelectedSupplierForPayment(deliverySupplier);
                                      setShowPaymentModal(true);
                                    }
                                  }}
                                  className={`${
                                    delivery.payment_method === 'spot' 
                                      ? 'bg-blue-600 hover:bg-blue-700' 
                                      : 'bg-green-600 hover:bg-green-700'
                                  } text-white px-3 py-1 rounded text-xs flex items-center space-x-1`}
                                >
                                  <CreditCard size={12} />
                                  <span>Pay Now</span>
                                </button>
                              ) : (
                                <span className="text-green-600 text-xs font-medium">Paid</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              
              {deliveryRecords.filter(delivery => {
                const deliveryDate = new Date(delivery.delivery_date);
                const monthDate = new Date(selectedMonth + '-01');
                return deliveryDate.getFullYear() === monthDate.getFullYear() &&
                       deliveryDate.getMonth() === monthDate.getMonth();
              }).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No delivery records found for {new Date(selectedMonth + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                </div>
              )}
            </div>

            {/* Summary Cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <FaTruck className="text-3xl text-blue-500 mr-4" />
                  <div>
                    <p className="text-gray-600">Total Deliveries</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {deliveryRecords.filter(delivery => {
                        const deliveryDate = new Date(delivery.delivery_date);
                        const monthDate = new Date(selectedMonth + '-01');
                        return deliveryDate.getFullYear() === monthDate.getFullYear() &&
                               deliveryDate.getMonth() === monthDate.getMonth();
                      }).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <FaMoneyBillWave className="text-3xl text-green-500 mr-4" />
                  <div>
                    <p className="text-gray-600">Spot Payments</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {deliveryRecords.filter(delivery => {
                        const deliveryDate = new Date(delivery.delivery_date);
                        const monthDate = new Date(selectedMonth + '-01');
                        return delivery.payment_method === 'spot' &&
                               deliveryDate.getFullYear() === monthDate.getFullYear() &&
                               deliveryDate.getMonth() === monthDate.getMonth();
                      }).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <Calendar className="text-3xl text-purple-500 mr-4" />
                  <div>
                    <p className="text-gray-600">Monthly Payments</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {deliveryRecords.filter(delivery => {
                        const deliveryDate = new Date(delivery.delivery_date);
                        const monthDate = new Date(selectedMonth + '-01');
                        return delivery.payment_method === 'monthly' &&
                               deliveryDate.getFullYear() === monthDate.getFullYear() &&
                               deliveryDate.getMonth() === monthDate.getMonth();
                      }).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <DollarSign className="text-3xl text-orange-500 mr-4" />
                  <div>
                    <p className="text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-gray-800">
                      Rs. {deliveryRecords.filter(delivery => {
                        const deliveryDate = new Date(delivery.delivery_date);
                        const monthDate = new Date(selectedMonth + '-01');
                        return deliveryDate.getFullYear() === monthDate.getFullYear() &&
                               deliveryDate.getMonth() === monthDate.getMonth();
                      }).reduce((sum, delivery) => sum + (parseFloat(delivery.total_amount) || 0), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>
      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default TeaFactoryPayment;
