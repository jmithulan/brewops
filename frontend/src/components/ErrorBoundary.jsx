import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 border border-red-100">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-700 mb-4">
              An error has occurred in the application. Please try refreshing the page or contact support if the issue persists.
            </p>
            
            <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-4 overflow-auto">
              <p className="font-mono text-sm text-gray-800">
                {this.state.error?.toString() || 'Unknown error'}
              </p>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Refresh Page
              </button>
              <button
                onClick={() => {
                  // Clear any stored tokens and reload
                  localStorage.removeItem('jwtToken');
                  localStorage.removeItem('lastLogin');
                  window.location.href = '/login';
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Reset & Go To Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
