/**
 * performance.js - Utility functions to optimize application performance
 */

// Detect slow loading and apply optimizations
export const detectSlowLoading = () => {
  // Check if the page load is slow
  if (window.performance) {
    const pageNav = performance.getEntriesByType('navigation')[0];
    if (pageNav && pageNav.duration > 3000) { // 3 seconds threshold
      console.log('Slow page load detected, applying performance optimizations');
      
      // Apply lazy loading to non-critical images
      document.querySelectorAll('img:not(.critical-img)').forEach(img => {
        img.loading = 'lazy';
      });
      
      // Apply content-visibility to off-screen content
      document.querySelectorAll('.optimize-eligible').forEach(el => {
        el.classList.add('optimize-offscreen');
      });
      
      return true;
    }
  }
  return false;
};

// Preload critical resources
export const preloadCriticalResources = (resources = []) => {
  // Default critical resources
  const criticalResources = [
    { type: 'image', url: '/icon.png' },
    ...resources
  ];
  
  criticalResources.forEach(resource => {
    if (resource.type === 'image') {
      const img = new Image();
      img.src = resource.url;
    } else if (resource.type === 'font') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.url;
      link.as = 'font';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    } else if (resource.type === 'script') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.url;
      link.as = 'script';
      document.head.appendChild(link);
    }
  });
};

// Defer non-critical operations
export const deferNonCriticalOperations = (operations = []) => {
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(() => {
      console.log('Running deferred operations during idle time');
      operations.forEach(operation => {
        if (typeof operation === 'function') {
          try {
            operation();
          } catch (e) {
            console.error('Error in deferred operation:', e);
          }
        }
      });
    });
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(() => {
      console.log('Running deferred operations with setTimeout fallback');
      operations.forEach(operation => {
        if (typeof operation === 'function') {
          try {
            operation();
          } catch (e) {
            console.error('Error in deferred operation:', e);
          }
        }
      });
    }, 2000); // 2 seconds after initial render
  }
};

// Optimize React rendering
export const optimizeReactRendering = (component) => {
  // Apply performance optimizations to React components
  // This is a placeholder for component-specific optimizations
  return component;
};

// Create performance metrics reporter
export const reportPerformanceMetrics = () => {
  if (window.performance) {
    // Wait for page to be fully loaded
    window.addEventListener('load', () => {
      // Use setTimeout to ensure we capture post-load metrics
      setTimeout(() => {
        const navigationTiming = performance.getEntriesByType('navigation')[0];
        const paintTimings = performance.getEntriesByType('paint');
        
        // Calculate key metrics
        const metrics = {
          totalLoadTime: navigationTiming ? navigationTiming.duration : 'Not available',
          domComplete: navigationTiming ? navigationTiming.domComplete : 'Not available',
          firstPaint: paintTimings.find(t => t.name === 'first-paint')?.startTime || 'Not available',
          firstContentfulPaint: paintTimings.find(t => t.name === 'first-contentful-paint')?.startTime || 'Not available'
        };
        
        console.log('Performance metrics:', metrics);
        
        // Store metrics for debugging
        try {
          localStorage.setItem('performanceMetrics', JSON.stringify({
            ...metrics,
            timestamp: new Date().toISOString()
          }));
        } catch (e) {
          console.error('Failed to save performance metrics to localStorage:', e);
        }
      }, 0);
    });
  }
};

export default {
  detectSlowLoading,
  preloadCriticalResources,
  deferNonCriticalOperations,
  optimizeReactRendering,
  reportPerformanceMetrics
};