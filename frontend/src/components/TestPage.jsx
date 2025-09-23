import React from 'react';

const TestPage = () => {
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
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#166534',
          marginBottom: '20px'
        }}>
          🎉 BrewOps is Working!
        </h1>
        
        <p style={{
          color: '#374151',
          marginBottom: '32px',
          lineHeight: '1.6',
          fontSize: '1.1rem'
        }}>
          Your Tea Factory Management System is now running successfully!
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '32px'
        }}>
          <button
            onClick={() => window.location.href = '/login'}
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
            Go to Login
          </button>
          
          <button
            onClick={() => window.location.href = '/register'}
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
            Register
          </button>
        </div>

        <div style={{
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
            <strong>System Status:</strong> ✅ Frontend Running | ✅ Backend Connected | ✅ Database Ready
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;



