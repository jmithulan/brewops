import React from 'react';
import MinimalLayout from '../components/MinimalLayout';

const EmergencyFallback = () => {
  return (
    <MinimalLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-red-600 mb-6">Emergency Recovery Mode</h1>
          
          <div className="bg-gray-50 border-l-4 border-yellow-500 p-4 mb-6">
            <p className="text-gray-700">
              The application has encountered an issue and is running in emergency recovery mode.
              This allows you to access basic functionality and perform diagnostics.
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Available Actions</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Run diagnostics to identify issues</li>
                <li>Clear authentication data if needed</li>
                <li>Try logging in again</li>
                <li>Return to the home page</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Possible Issues</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Authentication token expired or invalid</li>
                <li>Network connectivity problems</li>
                <li>Server-side errors</li>
                <li>Data corruption in local storage</li>
              </ul>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => window.location.href = '/diagnostics'}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Run Diagnostics
              </button>
              
              <button
                onClick={() => {
                  localStorage.removeItem('jwtToken');
                  localStorage.removeItem('lastLogin');
                  window.location.href = '/login';
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Clear Data & Login
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </MinimalLayout>
  );
};

export default EmergencyFallback;