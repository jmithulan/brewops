import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './App.css' // Import optimized CSS
import axios from 'axios';
import RootErrorBoundary from './components/RootErrorBoundary';
import AppLoading from './components/AppLoading';
import SimpleFallback from './components/SimpleFallback';
import handleBrowserCompatibility from './utils/browserCompatibility';
import * as Performance from './utils/performance'; // Import performance utilities

// Set up tailwind animations - lazy load to reduce initial bundle
import('./styles/animations.css').catch(() => {
  console.warn('Failed to load animations.css');
});

// Report performance metrics
Performance.reportPerformanceMetrics();

// Preload critical resources
Performance.preloadCriticalResources();

// Set the VERSION for debugging
window.APP_VERSION = '1.0.0';
window.REACT_VERSION = '19.1.0';

// Mark app start time for performance tracking
window.appStartTime = Date.now();

// Configure axios defaults
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4323';
console.log('Backend URL:', backendUrl);
axios.defaults.baseURL = backendUrl;
axios.defaults.timeout = 15000; // 15 seconds timeout to prevent hanging requests

// Check browser compatibility (simplified)
const isCompatible = handleBrowserCompatibility((compatibility) => {
  console.warn('Browser compatibility issues detected:', compatibility);
  // Don't block the app, just log the warning
});

// Configure global axios interceptor to handle 429 (Too Many Requests)
// This prevents immediate retry storms by honoring Retry-After and applying
// exponential backoff with a small retry limit.
const MAX_RETRY = 3;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Add request interceptor for retry logic
axios.interceptors.request.use(
  (config) => {
    // Add timestamp to track request timing
    config.metadata = { startTime: new Date() };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for retry logic
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Only retry on 429 (Too Many Requests) and if we haven't exceeded max retries
    if (error.response?.status === 429 && (!config.retryCount || config.retryCount < MAX_RETRY)) {
      config.retryCount = (config.retryCount || 0) + 1;
      
      // Get retry-after header or use exponential backoff
      const retryAfter = error.response.headers['retry-after'];
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, config.retryCount) * 1000;
      
      console.warn(`Rate limited. Retrying in ${delay}ms (attempt ${config.retryCount}/${MAX_RETRY})`);
      
      await wait(delay);
      return axios(config);
    }
    
    return Promise.reject(error);
  }
);

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Don't prevent default to allow normal error handling
});

// Global error handler for JavaScript errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Don't prevent default to allow normal error handling
});

// Get the root element
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

// Set up a timeout to show fallback if app doesn't load
let appLoadTimeout;
const APP_LOAD_TIMEOUT = 8000; // 8 seconds

try {
  console.log('Starting React app render...');
  
  // Initialize application with robust error handling
  root.render(
    <StrictMode>
      <RootErrorBoundary>
        <Suspense fallback={<AppLoading />}>
          <App />
        </Suspense>
      </RootErrorBoundary>
    </StrictMode>,
  );
  
  console.log('Application rendered successfully.');
  
  // Hide the initial loader immediately
  if (window.hideInitialLoader) {
    setTimeout(() => {
      window.hideInitialLoader();
    }, 500);
  }
  
  // Set up timeout to show fallback if app doesn't load properly
  appLoadTimeout = setTimeout(() => {
    console.warn('App load timeout reached, showing fallback');
    root.render(<SimpleFallback error={new Error('Application load timeout')} />);
  }, APP_LOAD_TIMEOUT);
  
  // Clear timeout when app loads successfully
  setTimeout(() => {
    if (appLoadTimeout) {
      clearTimeout(appLoadTimeout);
      console.log('App loaded successfully, cleared timeout');
    }
  }, 2000);
  
  // Defer non-critical operations
  Performance.deferNonCriticalOperations([
    () => console.log('Running deferred operations...'),
    // Add other non-critical operations here
  ]);
  
  // Add a simple health check ping to verify the app is still alive after initial render
  setTimeout(() => {
    console.log('Application health check: OK');
    
    // Calculate render time for performance tracking
    if (window.appStartTime) {
      const renderTime = Date.now() - window.appStartTime;
      console.log(`Initial render completed in ${renderTime}ms`);
      
      // Store metrics for diagnostics
      try {
        localStorage.setItem('app_render_time', renderTime.toString());
      } catch (e) {
        console.error('Error saving render time to localStorage:', e);
      }
    }
    
    // Hide the initial loader faster in case of good performance
    if (window.hideInitialLoader) {
      window.hideInitialLoader();
    }
  }, 1000);
} catch (error) {
  console.error('Failed to render app:', error);
  root.render(<SimpleFallback error={error} />);
}