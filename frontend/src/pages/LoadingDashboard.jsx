import React from 'react';

const LoadingDashboard = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center p-8">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Dashboard</h2>
        <p className="text-gray-600">Please wait while we prepare your dashboard...</p>
      </div>
    </div>
  );
};

export default LoadingDashboard;