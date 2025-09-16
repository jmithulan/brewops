import React from 'react';

/**
 * Root Error Boundary component
 * 
 * This component catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('RootErrorBoundary caught an error:', error, errorInfo);
    
    // Store the error info for display
    this.setState({ errorInfo });
    
    // Log to localStorage for diagnostics
    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push({
        time: new Date().toISOString(),
        message: error?.message || 'Error in React component',
        componentStack: errorInfo?.componentStack,
        stack: error?.stack,
        type: 'react-error-boundary'
      });
      localStorage.setItem('app_errors', JSON.stringify(errors.slice(-10))); // Keep last 10 errors
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  // Handle retrying by clearing the error state
  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };
  
  // Handle clearing auth data and retrying
  handleClearAuthAndRetry = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('lastLogin');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div style={{
          padding: '40px',
          maxWidth: '800px',
          margin: '0 auto',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h1 style={{ 
            color: '#166534', 
            fontSize: '24px', 
            marginBottom: '20px' 
          }}>
            Something went wrong
          </h1>
          
          <p style={{ 
            marginBottom: '20px',
            lineHeight: '1.6'
          }}>
            The application encountered an error and couldn't continue. This is likely a temporary issue.
          </p>
          
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <p style={{ fontWeight: '600', marginBottom: '8px' }}>Try these steps:</p>
            <ul style={{ marginLeft: '24px', lineHeight: '1.8' }}>
              <li>Retry the operation</li>
              <li>Clear your authentication data and reload</li>
              <li>Refresh the page</li>
              <li>Clear your browser cache</li>
            </ul>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={this.handleRetry}
              style={{
                padding: '8px 16px',
                background: '#166534',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
            
            <button
              onClick={this.handleClearAuthAndRetry}
              style={{
                padding: '8px 16px',
                background: '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear Auth Data & Reload
            </button>
            
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                background: '#e2e8f0',
                color: '#4b5563',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Refresh Page
            </button>
          </div>
          
          <details style={{
            marginTop: '40px',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '16px'
          }}>
            <summary style={{ cursor: 'pointer', color: '#6b7280' }}>
              Technical Details (for support)
            </summary>
            <div style={{
              marginTop: '12px',
              background: '#f1f5f9',
              padding: '16px',
              borderRadius: '4px',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              fontSize: '14px'
            }}>
              <p style={{ fontWeight: '500', marginBottom: '8px' }}>Error:</p>
              <pre>{this.state.error?.toString()}</pre>
              
              {this.state.errorInfo && (
                <>
                  <p style={{ fontWeight: '500', marginTop: '16px', marginBottom: '8px' }}>Component Stack:</p>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </>
              )}
            </div>
          </details>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default RootErrorBoundary;