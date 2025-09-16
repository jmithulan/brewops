import { useEffect, useState } from 'react';

/**
 * PerformanceMonitor - Tracks and reports performance metrics
 * This component helps identify performance bottlenecks
 */
const PerformanceMonitor = ({ enabled = false }) => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const collectMetrics = () => {
      if (!window.performance) return;

      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      const collectedMetrics = {
        // Navigation timing
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
        totalLoadTime: navigation?.duration,
        
        // Paint timing
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
        
        // Resource timing
        resourceCount: performance.getEntriesByType('resource').length,
        
        // Memory usage (if available)
        memoryUsage: window.performance.memory ? {
          used: window.performance.memory.usedJSHeapSize,
          total: window.performance.memory.totalJSHeapSize,
          limit: window.performance.memory.jsHeapSizeLimit
        } : null
      };

      setMetrics(collectedMetrics);
      
      // Log performance issues
      if (collectedMetrics.totalLoadTime > 3000) {
        console.warn('Slow page load detected:', collectedMetrics.totalLoadTime + 'ms');
      }
      
      if (collectedMetrics.firstContentfulPaint > 1500) {
        console.warn('Slow first contentful paint:', collectedMetrics.firstContentfulPaint + 'ms');
      }
    };

    // Collect metrics after page load
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
    }

    return () => {
      window.removeEventListener('load', collectMetrics);
    };
  }, [enabled]);

  // Only render in development or when explicitly enabled
  if (!enabled || process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      fontFamily: 'monospace'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#4ade80' }}>Performance Metrics</h4>
      {metrics ? (
        <div>
          <div>Total Load: {metrics.totalLoadTime?.toFixed(0)}ms</div>
          <div>First Paint: {metrics.firstPaint?.toFixed(0)}ms</div>
          <div>FCP: {metrics.firstContentfulPaint?.toFixed(0)}ms</div>
          <div>Resources: {metrics.resourceCount}</div>
          {metrics.memoryUsage && (
            <div>Memory: {(metrics.memoryUsage.used / 1024 / 1024).toFixed(1)}MB</div>
          )}
        </div>
      ) : (
        <div>Collecting metrics...</div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
