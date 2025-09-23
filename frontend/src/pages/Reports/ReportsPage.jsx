import React, { useState } from 'react';
import ReportGenerator from '../../components/ReportGenerator.jsx';
import { useNavigate } from 'react-router-dom';

const ReportsPage = () => {
  const [activeReport, setActiveReport] = useState('dashboard');
  const navigate = useNavigate();
  
  const reportOptions = [
    { id: 'dashboard', name: 'Dashboard Report', icon: 'chart-bar' },
    { id: 'inventory', name: 'Inventory Report', icon: 'clipboard-list' },
    { id: 'supplier', name: 'Supplier Report', icon: 'users' },
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports Management</h1>
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-600 hover:text-green-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Report Types</h2>
            <div className="space-y-2">
              {reportOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setActiveReport(option.id)}
                  className={`w-full flex items-center p-3 rounded-md transition-colors ${
                    activeReport === option.id
                      ? 'bg-green-100 text-green-800'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {option.icon === 'chart-bar' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    )}
                    {option.icon === 'clipboard-list' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    )}
                    {option.icon === 'users' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    )}
                  </svg>
                  {option.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Help & Information</h2>
            <div className="text-gray-600 space-y-4 text-sm">
              <p>
                <strong>Dashboard Report:</strong> A comprehensive overview of key performance metrics across all areas of operations.
              </p>
              <p>
                <strong>Inventory Report:</strong> Detailed information about current inventory levels, low stock alerts, and inventory trends.
              </p>
              <p>
                <strong>Supplier Report:</strong> Analysis of supplier activities, deliveries, payments, and performance metrics.
              </p>
              <p className="pt-2 text-green-700">
                All reports are generated as PDF files and will automatically download when ready.
              </p>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <ReportGenerator type={activeReport} />
          
          {activeReport === 'dashboard' && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Dashboard Report Preview</h3>
              <p className="text-gray-600 mb-4">The Dashboard Report includes:</p>
              <ul className="list-disc pl-5 text-gray-600 space-y-2 mb-4">
                <li>Executive summary of factory operations</li>
                <li>Supplier statistics for the selected period</li>
                <li>Inventory levels and alerts</li>
                <li>Financial metrics including payments and pending amounts</li>
                <li>Recent activities and transactions</li>
                <li>Performance trends and key indicators</li>
              </ul>
              <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                <p className="text-sm text-gray-500">This report is ideal for management review and strategic decision-making.</p>
              </div>
            </div>
          )}
          
          {activeReport === 'inventory' && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Inventory Report Preview</h3>
              <p className="text-gray-600 mb-4">The Inventory Report includes:</p>
              <ul className="list-disc pl-5 text-gray-600 space-y-2 mb-4">
                <li>Current inventory levels and quantities</li>
                <li>Low stock alerts and critical inventory items</li>
                <li>Inventory trends over the selected period</li>
                <li>Daily inventory changes and movements</li>
                <li>Comparison with previous periods</li>
              </ul>
              <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                <p className="text-sm text-gray-500">This report helps inventory managers plan purchases and maintain optimal stock levels.</p>
              </div>
            </div>
          )}
          
          {activeReport === 'supplier' && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Supplier Report Preview</h3>
              <p className="text-gray-600 mb-4">The Supplier Report includes:</p>
              <ul className="list-disc pl-5 text-gray-600 space-y-2 mb-4">
                <li>Supplier activity summary and performance metrics</li>
                <li>Delivery volumes and frequency analysis</li>
                <li>Payment status and transaction history</li>
                <li>Supplier ranking based on volume and consistency</li>
                <li>Quality metrics and feedback summary</li>
              </ul>
              <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                <p className="text-sm text-gray-500">This report helps manage supplier relationships and identify top-performing suppliers.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
