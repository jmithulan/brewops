import React, { useState, useEffect } from 'react';

const Transaction = () => {
  const [transactions, setTransactions] = useState([
    { 
      id: 1, 
      type: 'delivery', 
      supplier: 'ABC Tea Company', 
      amount: 1507.50, 
      date: '2025-09-11', 
      status: 'completed',
      description: 'Premium Grade Tea Leaves - 100.5kg'
    },
    { 
      id: 2, 
      type: 'payment', 
      supplier: 'Green Valley Tea', 
      amount: 2300.00, 
      date: '2025-09-10', 
      status: 'pending',
      description: 'Payment for First Grade Tea Leaves'
    },
    { 
      id: 3, 
      type: 'delivery', 
      supplier: 'Mountain Peak Tea', 
      amount: 1800.75, 
      date: '2025-09-09', 
      status: 'completed',
      description: 'Second Grade Tea Leaves - 120.3kg'
    },
    { 
      id: 4, 
      type: 'payment', 
      supplier: 'Golden Leaf Suppliers', 
      amount: 2100.25, 
      date: '2025-09-08', 
      status: 'completed',
      description: 'Payment for Third Grade Tea Leaves'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.type === filter;
    const matchesSearch = transaction.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalAmount = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const deliveryCount = filteredTransactions.filter(t => t.type === 'delivery').length;
  const paymentCount = filteredTransactions.filter(t => t.type === 'payment').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Transaction History</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-1">Total Amount</h3>
              <p className="text-2xl font-bold text-blue-700">${totalAmount.toFixed(2)}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-900 mb-1">Deliveries</h3>
              <p className="text-2xl font-bold text-green-700">{deliveryCount}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-900 mb-1">Payments</h3>
              <p className="text-2xl font-bold text-purple-700">{paymentCount}</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-900 mb-1">Total Transactions</h3>
              <p className="text-2xl font-bold text-yellow-700">{filteredTransactions.length}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="all">All Transactions</option>
                  <option value="delivery">Deliveries</option>
                  <option value="payment">Payments</option>
                </select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search by supplier or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mr-3 ${
                        transaction.type === 'delivery' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {transaction.type.toUpperCase()}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {transaction.supplier}
                    </h3>
                    
                    <p className="text-gray-600 mb-2">{transaction.description}</p>
                    
                    <p className="text-sm text-gray-500">Date: {transaction.date}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      ${transaction.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found for the selected criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transaction;




