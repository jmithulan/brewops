import React, { useEffect } from 'react';

/**
 * This component preloads JavaScript modules that might be used in dashboard pages
 * to prevent white screen issues when navigating between dashboard pages.
 */
const DashboardPreloader = () => {
  useEffect(() => {
    // Preload key dashboard modules
    const preloadModules = async () => {
      try {
        // Preload dashboard pages
        const preloads = [
          import('../pages/Admin/adminDashboard'),
          import('../pages/Staff/StaffDashboard'),
          import('../pages/Supplier/supplierDashboard'),
          import('../components/Footer')
        ];
        
        // Execute all preloads in parallel
        await Promise.allSettled(preloads);
        console.log('Dashboard modules preloaded successfully');
      } catch (error) {
        console.log('Preloading some dashboard modules failed, but this is not critical');
      }
    };
    
    preloadModules();
  }, []);
  
  // This component doesn't render anything
  return null;
};

export default DashboardPreloader;