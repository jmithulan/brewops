import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDatabase, FaDownload, FaTrash, FaClock, FaCheckCircle, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';

const BackupAndRecovery = () => {
  const navigate = useNavigate();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch('http://localhost:4323/api/backup/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBackups(data.backups || []);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
    }
  };

  const createBackup = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch('http://localhost:4323/api/backup/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: `Backup created successfully: ${data.backup.filename}` });
        fetchBackups(); // Refresh the list
      } else {
        throw new Error('Failed to create backup');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create backup. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const downloadBackup = async (filename) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`http://localhost:4323/api/backup/download/${filename}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to download backup');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to download backup.' });
    }
  };

  const deleteBackup = async (filename) => {
    if (!window.confirm('Are you sure you want to delete this backup?')) {
      return;
    }

    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`http://localhost:4323/api/backup/delete/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Backup deleted successfully' });
        fetchBackups(); // Refresh the list
      } else {
        throw new Error('Failed to delete backup');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete backup.' });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin-dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FaArrowLeft className="text-lg" />
                <span>Back</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Backup and Recovery</h1>
            </div>
            <button
              onClick={createBackup}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <FaDatabase className="text-lg" />
              <span>{loading ? 'Creating...' : 'Create Backup'}</span>
            </button>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
              <span>{message.text}</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Backup Actions */}
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center space-x-2">
                  <FaDatabase />
                  <span>Database Backup</span>
                </h2>
                <p className="text-blue-700 mb-4">Create a complete backup of your tea factory database including all tables, data, and configurations.</p>
                <button 
                  onClick={createBackup}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating Backup...' : 'Create Backup'}
                </button>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h2 className="text-lg font-semibold text-green-900 mb-4 flex items-center space-x-2">
                  <FaClock />
                  <span>System Recovery</span>
                </h2>
                <p className="text-green-700 mb-4">Restore your system from a previous backup. This will replace all current data.</p>
                <p className="text-sm text-green-600 mb-4">⚠️ Warning: This action cannot be undone.</p>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Restore System
                </button>
              </div>
            </div>

            {/* Backup List */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Backups</h2>
              {backups.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No backups available</p>
              ) : (
                <div className="space-y-3">
                  {backups.map((backup, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{backup.filename}</h3>
                          <p className="text-sm text-gray-500">
                            Created: {formatDate(backup.created)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Size: {formatFileSize(backup.size)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => downloadBackup(backup.filename)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Download"
                          >
                            <FaDownload />
                          </button>
                          <button
                            onClick={() => deleteBackup(backup.filename)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupAndRecovery;







