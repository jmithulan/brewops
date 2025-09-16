import React from 'react';

/**
 * SimpleFallback - A minimal fallback component for when the main app fails to load
 */
const SimpleFallback = ({ error = null }) => {
  const handleReload = () => {
    window.location.reload();
  };

  const handleClearAndReload = () => {
    // Clear all local storage
    localStorage.clear();
    sessionStorage.clear();
    // Reload the page
    window.location.reload();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        {/* Logo/Title */}
        <div style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#166534',
          marginBottom: '20px'
        }}>
          BrewOps
        </div>
        
        <h1 style={{
          fontSize: '1.5rem',
          color: '#374151',
          marginBottom: '16px'
        }}>
          Tea Factory Management System
        </h1>
        
        <p style={{
          color: '#6b7280',
          marginBottom: '32px',
          lineHeight: '1.6'
        }}>
          {error ? 'The application encountered an error while loading.' : 'Loading the application...'}
        </p>

        {/* Error details if available */}
        {error && (
          <details style={{
            marginBottom: '24px',
            textAlign: 'left',
            backgroundColor: '#f3f4f6',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '8px' }}>
              Error Details
            </summary>
            <pre style={{
              fontSize: '12px',
              color: '#6b7280',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              margin: 0
            }}>
              {error.toString()}
            </pre>
          </details>
        )}

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleReload}
            style={{
              padding: '12px 24px',
              backgroundColor: '#166534',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#15803d'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#166534'}
          >
            Reload Page
          </button>
          
          <button
            onClick={handleClearAndReload}
            style={{
              padding: '12px 24px',
              backgroundColor: 'white',
              color: '#374151',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#f9fafb';
              e.target.style.borderColor = '#9ca3af';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#d1d5db';
            }}
          >
            Clear Data & Reload
          </button>
        </div>

        {/* Help text */}
        <div style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #bae6fd'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#0369a1',
            margin: 0,
            lineHeight: '1.5'
          }}>
            <strong>Having trouble?</strong> Try clearing your browser cache or using a different browser. 
            If the problem persists, contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleFallback;
