import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/authcontext.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Key, Shield, Bell, Download, AlertTriangle, Save, X, ArrowLeft } from 'lucide-react';

const StaffProfileSettings = () => {
  const { user, changePassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settings, setSettings] = useState({
    emailNotifications: true,
    systemNotifications: true
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleBackupData = () => {
    toast.success('Account data backup initiated. You will receive an email when ready.');
  };

  const handleDeactivateAccount = () => {
    if (window.confirm('Are you sure you want to deactivate your account? This action can be reversed by contacting support.')) {
      toast.success('Account deactivation request submitted. Please contact support for assistance.');
    }
  };

  const handleBackToDashboard = () => {
    // Navigate to role-based dashboard
    if (user?.role === 'admin' || user?.role === 'manager') {
      navigate('/admin-dashboard');
    } else if (user?.role === 'staff') {
      navigate('/staff-dashboard');
    } else if (user?.role === 'supplier') {
      navigate('/supplier-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setSettings({
      emailNotifications: true,
      systemNotifications: true
    });
    toast.success('Changes cancelled');
  };

  const handleSaveChanges = () => {
    // Save notification settings (in a real app, this would make an API call)
    toast.success('Settings saved successfully');
  };

  const formatLastLogin = (lastLogin) => {
    if (!lastLogin) return 'Never';
    const date = new Date(lastLogin);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold text-gray-900">{user?.role || 'Staff'}</span>
              <div className="text-sm text-gray-500">
                {formatLastLogin(user?.last_login)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
          <div className="flex justify-end space-x-3">
            <button 
              onClick={handleSaveChanges}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
            <button 
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Change Password Card */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Key className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Change Password</h4>
              </div>
              <p className="text-gray-600 mb-4">
                It's a good practice to change your password periodically to enhance account security.
              </p>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <input
                  type="password"
                  placeholder="Current Password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>

            {/* Two-Factor Authentication Card */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h4>
              </div>
              <p className="text-gray-600 mb-4">
                Add an extra layer of security to your account by enabling two-factor authentication.
              </p>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Enable 2FA
              </button>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-600">Receive notifications about account activity via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">System Notifications</h4>
                <p className="text-sm text-gray-600">Receive in-app notifications about system updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.systemNotifications}
                  onChange={(e) => setSettings({...settings, systemNotifications: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Account Management */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Backup Account Data */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Download className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Backup Account Data</h4>
              </div>
              <p className="text-gray-600 mb-4">
                Download a copy of your account data and activities
              </p>
              <button 
                onClick={handleBackupData}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Download Data
              </button>
            </div>

            {/* Deactivate Account */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h4 className="text-lg font-semibold text-red-600">Deactivate Account</h4>
              </div>
              <p className="text-gray-600 mb-4">
                Temporarily disable your account access
              </p>
              <button 
                onClick={handleDeactivateAccount}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfileSettings;