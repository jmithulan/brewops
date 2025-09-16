import axios from 'axios';

// Request cache and deduplication
const requestCache = new Map();
const pendingRequests = new Map();

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4323'}/api`,
  timeout: 15000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and implement caching
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Implement request deduplication for GET requests
    if (config.method === 'get' && !config.skipDeduplication) {
      const requestKey = `${config.method}:${config.url}:${JSON.stringify(config.params)}`;
      
      // Check if request is already pending
      if (pendingRequests.has(requestKey)) {
        return pendingRequests.get(requestKey);
      }

      // Check cache for recent requests (5 minutes)
      const cached = requestCache.get(requestKey);
      if (cached && Date.now() - cached.timestamp < 300000) {
        return Promise.resolve(cached.response);
      }

      // Store pending request
      const requestPromise = config;
      pendingRequests.set(requestKey, requestPromise);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and caching
api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get' && !response.config.skipCaching) {
      const requestKey = `${response.config.method}:${response.config.url}:${JSON.stringify(response.config.params)}`;
      
      // Remove from pending requests
      pendingRequests.delete(requestKey);
      
      // Cache the response
      requestCache.set(requestKey, {
        response: response,
        timestamp: Date.now()
      });

      // Clean up old cache entries (keep only last 50)
      if (requestCache.size > 50) {
        const entries = Array.from(requestCache.entries());
        entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
        requestCache.clear();
        entries.slice(0, 50).forEach(([key, value]) => {
          requestCache.set(key, value);
        });
      }
    }

    return response;
  },
  (error) => {
    // Remove from pending requests on error
    if (error.config?.method === 'get') {
      const requestKey = `${error.config.method}:${error.config.url}:${JSON.stringify(error.config.params)}`;
      pendingRequests.delete(requestKey);
    }

    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('lastLogin');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Utility function to clear cache
export const clearApiCache = () => {
  requestCache.clear();
  pendingRequests.clear();
};

// Utility function to get cache stats
export const getCacheStats = () => ({
  cacheSize: requestCache.size,
  pendingRequests: pendingRequests.size
});

export default api;


