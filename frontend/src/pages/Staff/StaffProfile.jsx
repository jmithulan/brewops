import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/authcontext.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, IdCard, Calendar, Shield, Key, Bell, Download, AlertTriangle, ArrowLeft } from 'lucide-react';
import ProfileImageUpload from '../../components/ProfileImageUpload.jsx';

const StaffProfile = () => {
  const { user, updateProfile, changePassword, uploadProfileImage } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    employee_id: '',
    address: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settings, setSettings] = useState({
    emailNotifications: true,
    systemNotifications: true
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        employee_id: user.employee_id || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Updating profile with data:', profileData);
      console.log('Current user:', user);
      
      // Validate required fields
      if (!profileData.name.trim()) {
        setError('Name is required');
        toast.error('Name is required');
        return;
      }
      if (!profileData.email.trim()) {
        setError('Email is required');
        toast.error('Email is required');
        return;
      }
      
      const result = await updateProfile(profileData);
      console.log('Profile update result:', result);
      
      setSuccess('Profile updated successfully!');
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.message || 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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

  const handleImageUpdate = (newAvatar) => {
    // Update local user state when image is successfully uploaded
    console.log('Image updated:', newAvatar);
    // This will trigger the useEffect to update profileData as well
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
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        employee_id: user.employee_id || '',
        address: user.address || ''
      });
    }
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    // Clear error and success messages
    setError('');
    setSuccess('');
    
    toast.success('Changes cancelled');
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
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setError('');
                  setSuccess('');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setError('');
                  setSuccess('');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Account Settings
              </button>
            </nav>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-end space-x-3">
            {activeTab === 'profile' && (
              <button
                onClick={handleProfileUpdate}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z"/>
                </svg>
                <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            )}
            {activeTab === 'settings' && (
              <button
                onClick={() => {
                  // Save settings (notifications, etc.)
                  toast.success('Settings saved successfully');
                }}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z"/>
                </svg>
                <span>Save Settings</span>
              </button>
            )}
            <button 
              onClick={handleCancel}
              disabled={loading}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              ✕ Cancel
            </button>
          </div>
        </div>

        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-700">{success}</p>
                </div>
              </div>
            )}

            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-6">
                <ProfileImageUpload
                  currentAvatar={user?.avatar}
                  onImageUpdate={handleImageUpdate}
                  className="flex-shrink-0"
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user?.name || 'staff3'}</h2>
                  <p className="text-green-600 font-medium">{user?.role || 'Staff'}</p>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 text-green-600" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 text-green-600" />
                      <span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 text-green-600" />
                      <span>Phone Number</span>
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <IdCard className="w-4 h-4 text-green-600" />
                      <span>Employee/Supplier ID</span>
                    </label>
                    <input
                      type="text"
                      value={profileData.employee_id}
                      onChange={(e) => setProfileData({...profileData, employee_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your employee ID"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 text-green-600" />
                      <span>Address</span>
                    </label>
                    <textarea
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your address"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 text-green-600" />
                      <span>Role</span>
                    </label>
                    <input
                      type="text"
                      value={user?.role || 'Staff'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span>Last Login</span>
                    </label>
                    <input
                      type="text"
                      value={formatLastLogin(user?.last_login)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Permissions & Access */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions & Access</h3>
              <p className="text-gray-600 mb-4">
                As a Staff, you have access to various features in the system.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Security Note:</strong> For security reasons, some information can only be changed by administrators. Please contact support if you need to update protected fields.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Account Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Security Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
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
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Change Password
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
            <div className="bg-white rounded-lg shadow-sm p-6">
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
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
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
                  <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                    Deactivate Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffProfile;