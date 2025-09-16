import React, { useState } from 'react';

const SystemSecurity = () => {
  const [securitySettings, setSecuritySettings] = useState({
    passwordPolicy: true,
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginAttempts: 5
  });

  const handleSettingChange = (setting, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">System Security Settings</h1>
          
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Password Policy</h3>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Timeout (minutes)</h3>
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

            <div className="flex justify-end">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                Save Security Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSecurity;




