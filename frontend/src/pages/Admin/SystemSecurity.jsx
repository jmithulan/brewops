import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaLock, FaClock, FaUserShield, FaCheckCircle, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';

const SystemSecurity = () => {
  const navigate = useNavigate();
  const [securitySettings, setSecuritySettings] = useState({
    passwordPolicy: true,
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginAttempts: 5,
    ipWhitelist: false,
    auditLogging: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [securityScan, setSecurityScan] = useState({
    lastScan: null,
    threats: 0,
    vulnerabilities: []
  });

  useEffect(() => {
    fetchSecuritySettings();
    performSecurityScan();
  }, []);

  const fetchSecuritySettings = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch('http://localhost:4323/api/admin/security-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSecuritySettings(data.settings || securitySettings);
      }
    } catch (error) {
      console.error('Error fetching security settings:', error);
    }
  };

  const performSecurityScan = async () => {
    try {
      // Simulate security scan
      const vulnerabilities = [
        'Weak password detected for user: john.doe',
        'Outdated SSL certificate',
        'Unused admin accounts found'
      ];
      
      setSecurityScan({
        lastScan: new Date().toISOString(),
        threats: 0,
        vulnerabilities: vulnerabilities
      });
    } catch (error) {
      console.error('Security scan failed:', error);
    }
  };

  const handleSettingChange = (setting, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const saveSecuritySettings = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch('http://localhost:4323/api/admin/security-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(securitySettings)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Security settings saved successfully' });
      } else {
        throw new Error('Failed to save security settings');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save security settings. Please try again.' });
    } finally {
      setLoading(false);
    }
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
              <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <FaShieldAlt />
                <span>System Security Settings</span>
              </h1>
            </div>
            <button
              onClick={performSecurityScan}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              <FaShieldAlt />
              <span>Run Security Scan</span>
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
            {/* Security Settings */}
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <FaLock />
                  <span>Password Policy</span>
                </h3>
                <div className="flex items-center justify-between">
                  <span>Enforce strong password policy</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.passwordPolicy}
                      onChange={(e) => handleSettingChange('passwordPolicy', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <FaUserShield />
                  <span>Two-Factor Authentication</span>
                </h3>
                <div className="flex items-center justify-between">
                  <span>Enable 2FA for all users</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.twoFactorAuth}
                      onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <FaClock />
                  <span>Session Timeout (minutes)</span>
                </h3>
                <input
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 w-20"
                  min="5"
                  max="120"
                />
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Max Login Attempts</h3>
                <input
                  type="number"
                  value={securitySettings.loginAttempts}
                  onChange={(e) => handleSettingChange('loginAttempts', parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 w-20"
                  min="3"
                  max="10"
                />
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">IP Whitelist</h3>
                <div className="flex items-center justify-between">
                  <span>Enable IP address whitelist</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.ipWhitelist}
                      onChange={(e) => handleSettingChange('ipWhitelist', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Logging</h3>
                <div className="flex items-center justify-between">
                  <span>Enable comprehensive audit logging</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.auditLogging}
                      onChange={(e) => handleSettingChange('auditLogging', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={saveSecuritySettings}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Security Settings'}
                </button>
              </div>
            </div>

            {/* Security Scan Results */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Scan Results</h2>
              {securityScan.lastScan ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Scan:</span>
                    <span className="text-sm font-medium">
                      {new Date(securityScan.lastScan).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Threats Detected:</span>
                    <span className={`text-sm font-medium ${securityScan.threats > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {securityScan.threats}
                    </span>
                  </div>
                  {securityScan.vulnerabilities.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Vulnerabilities Found:</h3>
                      <ul className="space-y-1">
                        {securityScan.vulnerabilities.map((vuln, index) => (
                          <li key={index} className="text-sm text-red-600 flex items-start space-x-2">
                            <FaExclamationTriangle className="text-xs mt-0.5 flex-shrink-0" />
                            <span>{vuln}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No security scan performed yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSecurity;







