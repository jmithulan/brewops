import React, { useState, useEffect, memo } from 'react';

/**
 * AppLoading Component - Optimized for better performance
 * 
 * This component provides a visual loading state for the application
 * with a progress indicator and helpful messages that update over time
 * to keep the user informed about what's happening.
 */
const AppLoading = ({ 
  message = 'Loading application...',
  timeout = 10000,  // Reduced to 10s for faster feedback
  onTimeout = null, // Callback for timeout
  showTips = true
}) => {
  const [loadingTime, setLoadingTime] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('initializing');
  const [tip, setTip] = useState(null);
  
  // Tips to show during longer loading times - smaller set for faster rendering
  const tips = [
    "Loading your data...",
    "Setting up your environment...",
    "Almost there...",
  ];
  
  // Status messages based on loading time - faster transition to normal state
  useEffect(() => {
    // Check if performance API reports slow network
    if (window.navigator && window.navigator.connection) {
      const conn = window.navigator.connection;
      if (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g' || conn.saveData) {
        // Show normal status immediately for slow connections
        setLoadingStatus('normal');
      }
    }
    
    const interval = setInterval(() => {
      setLoadingTime(prev => {
        const newTime = prev + 100;
        
        // Update status message based on elapsed time - faster transitions
        if (newTime > 10000 && loadingStatus !== 'long_wait') {
          setLoadingStatus('long_wait');
        } else if (newTime > 3000 && loadingStatus !== 'normal') { // Reduced from 5s to 3s
          setLoadingStatus('normal');
        }
        
        // If we hit timeout, call the onTimeout callback
        if (newTime >= timeout && onTimeout) {
          onTimeout();
        }
        
        return newTime;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [timeout, loadingStatus, onTimeout]);
  
  // Rotate through tips every few seconds - less frequent updates for better performance
  useEffect(() => {
    if (!showTips) return;
    
    // Set initial tip
    setTip(tips[0]);
    
    // Change tip every 4 seconds (increased from 3s to reduce state updates)
    const tipInterval = setInterval(() => {
      setTip(prevTip => {
        const currentIndex = tips.indexOf(prevTip);
        const nextIndex = (currentIndex + 1) % tips.length;
        return tips[nextIndex];
      });
    }, 4000);
    
    return () => clearInterval(tipInterval);
  }, [showTips]);
  
  // Calculate progress percentage (max 90% until actually complete)
  const progressPercentage = Math.min(90, (loadingTime / timeout) * 100);
  
  // Determine message to show
  let displayMessage = message;
  if (loadingStatus === 'long_wait') {
    displayMessage = "Still loading... This is taking longer than expected.";
  }
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#f8fafc', 
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Logo or App Name */}
      <div style={{ 
        marginBottom: '2rem', 
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#166534'
      }}>
        BrewOps
      </div>
      
      {/* Spinner */}
      <div style={{ 
        width: '60px', 
        height: '60px', 
        border: '5px solid #e2e8f0', 
        borderTop: '5px solid #166534', 
        borderRadius: '50%',
        marginBottom: '1.5rem',
        animation: 'spin 1s linear infinite'
      }} />
      
      {/* Progress Bar */}
      <div style={{ 
        width: '80%', 
        maxWidth: '300px', 
        height: '4px', 
        background: '#e2e8f0', 
        borderRadius: '2px',
        overflow: 'hidden',
        marginBottom: '1rem'
      }}>
        <div style={{ 
          height: '100%',
          width: `${progressPercentage}%`,
          background: '#166534',
          transition: 'width 0.3s ease'
        }} />
      </div>
      
      {/* Loading Message */}
      <p style={{ 
        color: '#374151', 
        marginBottom: '1rem',
        fontSize: '1rem'
      }}>
        {displayMessage}
      </p>
      
      {/* Tip (shows only during longer loads) */}
      {showTips && loadingStatus !== 'initializing' && (
        <p style={{ 
          color: '#6b7280', 
          fontSize: '0.875rem',
          maxWidth: '400px',
          textAlign: 'center',
          animation: 'fadeInOut 1.5s ease-in-out'
        }}>
          {tip}
        </p>
      )}
      
      {/* Loading indicator for too long */}
      {loadingStatus === 'long_wait' && (
        <div style={{ 
          marginTop: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Having trouble loading? Try these:
          </p>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                border: 'none',
                background: '#166534',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Reload Page
            </button>
            
            <button
              onClick={() => {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('lastLogin');
                window.location.reload();
              }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                background: 'white',
                color: '#4b5563',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Clear Auth & Reload
            </button>
          </div>
        </div>
      )}
      
      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeInOut {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(AppLoading);