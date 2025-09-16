import React from 'react';

const BackupAndRecovery = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Backup and Recovery</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">Database Backup</h2>
              <p className="text-blue-700 mb-4">Create a complete backup of your tea factory database.</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Create Backup
              </button>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-green-900 mb-4">System Recovery</h2>
              <p className="text-green-700 mb-4">Restore your system from a previous backup.</p>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Restore System
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupAndRecovery;




