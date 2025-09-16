import React, { useState, useEffect } from 'react';

const PaymentSummary = () => {
  const [payments, setPayments] = useState([
    { id: 1, supplier: 'ABC Tea Company', amount: 1507.50, date: '2025-09-11', status: 'completed', method: 'bank_transfer' },
    { id: 2, supplier: 'Green Valley Tea', amount: 2300.00, date: '2025-09-10', status: 'pending', method: 'cash' },
    { id: 3, supplier: 'Mountain Peak Tea', amount: 1800.75, date: '2025-09-09', status: 'completed', method: 'check' },
    { id: 4, supplier: 'Golden Leaf Suppliers', amount: 2100.25, date: '2025-09-08', status: 'completed', method: 'bank_transfer' }
  ]);

  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const filteredPayments = payments.filter(payment => {
    if (filter !== 'all' && payment.status !== filter) return false;
    if (dateRange.start && payment.date < dateRange.start) return false;
    if (dateRange.end && payment.date > dateRange.end) return false;
    return true;
  });

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const completedAmount = filteredPayments.filter(p => p.status === 'completed').reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = filteredPayments.filter(p => p.status === 'pending').reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment Summary</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-1">Total Payments</h3>
              <p className="text-2xl font-bold text-blue-700">${totalAmount.toFixed(2)}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-900 mb-1">Completed</h3>
              <p className="text-2xl font-bold text-green-700">${completedAmount.toFixed(2)}</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-900 mb-1">Pending</h3>
              <p className="text-2xl font-bold text-yellow-700">${pendingAmount.toFixed(2)}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-900 mb-1">Count</h3>
              <p className="text-2xl font-bold text-purple-700">{filteredPayments.length}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="all">All Payments</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.supplier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="capitalize">{payment.method.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        payment.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No payments found for the selected criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;




