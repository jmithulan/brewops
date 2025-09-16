import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/authcontext';
import { toast } from 'react-hot-toast';

const GoogleAuthSuccessHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const handleTokenProcessing = async () => {
      try {
        console.log('Processing Google OAuth success callback', location);
        setIsProcessing(true);
        
        // Capture full URL and search params for debugging
        const fullUrl = window.location.href;
        const searchParams = location.search;
        const debugData = { fullUrl, searchParams };
        setDebugInfo(debugData);
        console.log('Debug info:', debugData);
        
        // Get token directly from URL
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) {
          console.error('No token received in success callback');
          setError('Authentication failed. No token received.');
          toast.error('Authentication failed. No token received.');
          setTimeout(() => navigate('/login'), 5000);
          return;
        }
        
        console.log('Token received, logging in user');
        
        // Call the loginWithToken method from auth context to set user state
        const success = await loginWithToken(token);
        
        if (success) {
          console.log('Google login successful');
          toast.success('Successfully logged in with Google!');
          navigate('/dashboard');
        } else {
          console.error('Failed to process authentication data');
          setError('Failed to process authentication data.');
          toast.error('Failed to process authentication data.');
          setTimeout(() => navigate('/login'), 5000);
        }
      } catch (error) {
        console.error('Error processing Google auth success:', error);
        setError(`Authentication failed: ${error.message || 'Unknown error'}`);
        toast.error(`Authentication failed: ${error.message || 'Please try again'}`);
        setTimeout(() => navigate('/login'), 5000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleTokenProcessing();
  }, [location, navigate, loginWithToken]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center justify-center">
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
              <h2 className="mt-4 text-xl font-semibold text-gray-700">
                Completing your login...
              </h2>
              <p className="mt-2 text-gray-500">
                Processing your Google authentication.
              </p>
            </>
          ) : error ? (
            <>
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h2 className="mt-2 text-xl font-semibold text-gray-700">
                Authentication Failed
              </h2>
              <p className="mt-2 text-red-500">{error}</p>
              <p className="mt-4 text-gray-500">
                Redirecting you back to login...
              </p>
              {debugInfo && (
                <div className="mt-4 p-2 bg-gray-100 rounded-md text-xs text-left w-full">
                  <p className="font-semibold">Debug Info:</p>
                  <p className="mt-1 break-all">URL: {debugInfo.fullUrl}</p>
                  <p className="mt-1 break-all">Search Params: {debugInfo.searchParams}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <h2 className="mt-2 text-xl font-semibold text-gray-700">
                Login Successful!
              </h2>
              <p className="mt-2 text-gray-500">
                Redirecting you to the dashboard...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthSuccessHandler;