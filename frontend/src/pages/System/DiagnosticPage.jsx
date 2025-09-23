import React, { useState, useEffect } from 'react';
import axios from 'axios';

// This is a diagnostic component to help identify rendering issues
const DiagnosticPage = () => {
  // Directly test API connectivity to identify issues
  const testBackendConnection = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4323';
      const response = await axios.get(`${backendUrl}/api/health`, { timeout: 5000 });
      return { 
        success: true,
        status: response.status,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.response?.status || 'No response'
      };
    }
  };
  const [componentState, setComponentState] = useState({
    errorMessage: null,
    browserInfo: null,
    reactVersion: null,
    routerVersion: null
  });

  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        // Get browser info
        const browserInfo = {
          userAgent: navigator.userAgent,
          language: navigator.language,
          cookiesEnabled: navigator.cookieEnabled,
          localStorage: typeof localStorage !== 'undefined',
          sessionStorage: typeof sessionStorage !== 'undefined'
        };

        // Check if we can access localStorage
        let tokenInfo = { exists: false };
        try {
          const token = localStorage.getItem('jwtToken');
          tokenInfo = {
            exists: !!token,
            length: token ? token.length : 0,
            expired: token ? isTokenExpired(token) : false
          };
        } catch (e) {
          tokenInfo.error = e.message;
        }

        // Get React version from React metadata if available
        let reactVersion = "Unknown";
        try {
          reactVersion = React.version;
        } catch (e) {
          console.error("Could not determine React version:", e);
        }
        
        // Test backend connectivity
        const backendConnectivity = await testBackendConnection();
        
        // Check for any errors stored in localStorage
        let storedErrors = [];
        try {
          storedErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
        } catch (e) {
          console.error('Failed to parse stored errors:', e);
        }
        
        // Check React 19 compatibility issues
        const react19Issues = checkReact19Compatibility();

        // Update component state
        setComponentState({
          errorMessage: null,
          browserInfo,
          reactVersion,
          tokenInfo,
          backendConnectivity,
          storedErrors,
          react19Issues
        });
      } catch (err) {
        console.error('Diagnostic error:', err);
        setComponentState(prev => ({
          ...prev,
          errorMessage: err.message
        }));
      }
    };

    runDiagnostics();
  }, []);

  // Helper function to check if JWT is expired
  function isTokenExpired(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
  
      const { exp } = JSON.parse(jsonPayload);
      const currentTime = Date.now() / 1000;
      return exp < currentTime;
    } catch (e) {
      console.error("Error checking token expiration:", e);
      return "Error checking expiration";
    }
  }
  
  // Check for React 19 compatibility issues
  function checkReact19Compatibility() {
    const issues = [];
    
    // Check for React 19 specific issues
    if (React.version && React.version.startsWith('19')) {
      // Check for use of deprecated lifecycle methods
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers) {
        issues.push("Using React DevTools - may cause compatibility issues with React 19");
      }
      
      // Check for context API usage
      try {
        const hasOldContextWarning = false; // This would need deeper inspection
        if (hasOldContextWarning) {
          issues.push("Possibly using legacy Context API - not compatible with React 19");
        }
      } catch (e) {
        issues.push(`Error checking Context API: ${e.message}`);
      }
    }
    
    // Check for common dependency issues
    try {
      const packageVersions = {
        reactRouterVersion: '7.7.1', // This would come from your package.json or detected runtime
        reduxVersion: '9.2.0',
      };
      
      // React Router version compatibility check
      if (packageVersions.reactRouterVersion && !packageVersions.reactRouterVersion.startsWith('6.') && !packageVersions.reactRouterVersion.startsWith('7.')) {
        issues.push(`React Router version ${packageVersions.reactRouterVersion} may not be compatible with React 19`);
      }
    } catch (e) {
      issues.push(`Error checking package versions: ${e.message}`);
    }
    
    return issues;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">BrewOps Diagnostics</h1>
        
        {componentState.errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <h3 className="font-semibold mb-2">Diagnostic Error:</h3>
            <p>{componentState.errorMessage}</p>
          </div>
        )}

        <div className="space-y-6">
          <section className="border border-gray-200 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">System Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">React Version</p>
                <p className="text-lg">{componentState.reactVersion || "Loading..."}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Browser</p>
                <p className="text-lg">{componentState.browserInfo?.userAgent?.split(' ').slice(-1) || "Loading..."}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Cookies Enabled</p>
                <p className="text-lg">{componentState.browserInfo?.cookiesEnabled?.toString() || "Loading..."}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">localStorage Available</p>
                <p className="text-lg">{componentState.browserInfo?.localStorage?.toString() || "Loading..."}</p>
              </div>
            </div>
          </section>
          
          <section className="border border-gray-200 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">Authentication Status</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Token present:</span> {componentState.tokenInfo?.exists ? "Yes" : "No"}</p>
              {componentState.tokenInfo?.exists && (
                <>
                  <p><span className="font-medium">Token length:</span> {componentState.tokenInfo.length} characters</p>
                  <p><span className="font-medium">Token expired:</span> {componentState.tokenInfo.expired ? "Yes" : "No"}</p>
                </>
              )}
              {componentState.tokenInfo?.error && (
                <p className="text-red-600">Error: {componentState.tokenInfo.error}</p>
              )}
            </div>
          </section>
          
          <section className="border border-gray-200 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">Backend Connectivity</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Status:</span>{' '}
                {componentState.backendConnectivity ? (
                  <span className={componentState.backendConnectivity.success ? 'text-green-600' : 'text-red-600'}>
                    {componentState.backendConnectivity.success ? 'Connected' : 'Failed'}
                  </span>
                ) : (
                  'Testing...'
                )}
              </p>
              {componentState.backendConnectivity && (
                <>
                  <p><span className="font-medium">Response code:</span> {componentState.backendConnectivity.status}</p>
                  {componentState.backendConnectivity.error && (
                    <p className="text-red-600">Error: {componentState.backendConnectivity.error}</p>
                  )}
                </>
              )}
            </div>
          </section>
          
          {componentState.react19Issues && componentState.react19Issues.length > 0 && (
            <section className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h2 className="text-xl font-semibold mb-3 text-red-700">React 19 Compatibility Issues</h2>
              <ul className="list-disc pl-5 space-y-1">
                {componentState.react19Issues.map((issue, idx) => (
                  <li key={idx} className="text-red-700">{issue}</li>
                ))}
              </ul>
            </section>
          )}
          
          {componentState.storedErrors && componentState.storedErrors.length > 0 && (
            <section className="border border-orange-200 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-3 text-orange-700">Recent Errors</h2>
              <div className="max-h-60 overflow-y-auto">
                {componentState.storedErrors.map((error, idx) => (
                  <div key={idx} className="mb-3 p-2 bg-orange-50 rounded border border-orange-100">
                    <p className="text-sm text-gray-500">{new Date(error.time).toLocaleString()}</p>
                    <p className="font-medium">{error.message}</p>
                    {error.stack && (
                      <details>
                        <summary className="text-sm text-orange-700 cursor-pointer">Stack trace</summary>
                        <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-x-auto">{error.stack}</pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="flex flex-wrap gap-3 justify-between">
            <button 
              onClick={() => window.location.href = '/login'} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('lastLogin');
                localStorage.removeItem('app_errors');
                localStorage.removeItem('app_startup_error');
                window.location.reload();
              }} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear All Data & Reload
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Refresh Page
            </button>
            <button 
              onClick={() => window.location.href = '/emergency'}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Emergency Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPage;