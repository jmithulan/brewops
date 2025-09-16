import React, { useState } from 'react';
import { generateAndDownloadReport } from '../utils/reportGenerator';
import { format } from 'date-fns';
import axios from 'axios';

const ReportGenerator = ({ type = 'inventory' }) => {
  const [reportPeriod, setReportPeriod] = useState('current');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const reportTypes = {
    inventory: {
      title: 'Inventory Report',
      description: 'Generate a comprehensive report of current inventory levels, low stock alerts, and inventory trends.',
      endpoints: {
        current: '/api/reports/inventory/daily/',
        monthly: '/api/reports/inventory/monthly/'
      }
    },
    supplier: {
      title: 'Supplier Report',
      description: 'Generate a detailed report of supplier activities, deliveries, and payment status.',
      endpoints: {
        current: '/api/reports/suppliers/daily/',
        monthly: '/api/reports/suppliers/monthly/'
      }
    },
    dashboard: {
      title: 'Dashboard Report',
      description: 'Generate an executive summary report with key metrics from all areas of operations.',
      endpoints: {
        current: '/api/reports/dashboard'
      }
    }
  };
  
  const reportType = reportTypes[type] || reportTypes.inventory;
  
  const handleGenerateReport = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let endpoint;
      let params = {};
      const today = new Date();
      
      if (reportPeriod === 'current') {
        endpoint = reportType.endpoints.current + (type !== 'dashboard' ? format(today, 'yyyy-MM-dd') : '');
      } else if (reportPeriod === 'monthly') {
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        endpoint = reportType.endpoints.monthly + `${year}/${month}`;
      } else if (reportPeriod === '7d' || reportPeriod === '30d' || reportPeriod === '90d') {
        endpoint = reportType.endpoints.current;
        params = { period: reportPeriod };
      }
      
      // Get the token from localStorage
      const token = localStorage.getItem('jwtToken');
      
      // Make the API request
      const response = await axios.get(endpoint, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        // Generate and download the report
        await generateAndDownloadReport(type, response.data, reportPeriod);
      } else {
        throw new Error('Failed to fetch report data');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate the report. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-bold text-green-800 mb-2">{reportType.title}</h3>
      <p className="text-gray-600 mb-4">{reportType.description}</p>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Report Period</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setReportPeriod('current')}
            className={`px-3 py-1 rounded-md text-sm ${
              reportPeriod === 'current' 
                ? 'bg-green-700 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Current
          </button>
          <button
            onClick={() => setReportPeriod('7d')}
            className={`px-3 py-1 rounded-md text-sm ${
              reportPeriod === '7d' 
                ? 'bg-green-700 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setReportPeriod('30d')}
            className={`px-3 py-1 rounded-md text-sm ${
              reportPeriod === '30d' 
                ? 'bg-green-700 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setReportPeriod('monthly')}
            className={`px-3 py-1 rounded-md text-sm ${
              reportPeriod === 'monthly' 
                ? 'bg-green-700 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <button
        onClick={handleGenerateReport}
        disabled={isLoading}
        className="w-full bg-green-700 text-white py-2 px-4 rounded-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>Generate Report</>
        )}
      </button>
    </div>
  );
};

export default ReportGenerator;
