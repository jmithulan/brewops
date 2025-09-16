/**
 * Browser Compatibility Checker for React 19
 * 
 * This utility checks if the current browser is compatible with React 19
 * and provides detailed information about potential issues.
 */

// Required browser features for React 19
const REQUIRED_FEATURES = [
  {
    name: 'Promise',
    check: () => typeof Promise !== 'undefined',
    critical: true
  },
  {
    name: 'Map',
    check: () => typeof Map !== 'undefined',
    critical: true
  },
  {
    name: 'Set',
    check: () => typeof Set !== 'undefined',
    critical: true
  },
  {
    name: 'Array.from',
    check: () => typeof Array.from !== 'undefined',
    critical: true
  },
  {
    name: 'Object.assign',
    check: () => typeof Object.assign !== 'undefined',
    critical: true
  },
  {
    name: 'Symbol',
    check: () => typeof Symbol !== 'undefined',
    critical: true
  },
  {
    name: 'AbortController',
    check: () => typeof AbortController !== 'undefined',
    critical: false
  },
  {
    name: 'WeakMap',
    check: () => typeof WeakMap !== 'undefined',
    critical: true
  },
  {
    name: 'IntersectionObserver',
    check: () => typeof IntersectionObserver !== 'undefined',
    critical: false
  },
  {
    name: 'ResizeObserver',
    check: () => typeof ResizeObserver !== 'undefined',
    critical: false
  },
  {
    name: 'BigInt',
    check: () => typeof BigInt !== 'undefined',
    critical: false
  },
  {
    name: 'Intl',
    check: () => typeof Intl !== 'undefined',
    critical: false
  }
];

// Known browser compatibility issues with React 19
const KNOWN_ISSUES = {
  'Internet Explorer': 'React 19 does not support Internet Explorer. Please use Microsoft Edge, Chrome, Firefox, or Safari.',
  'Old Safari (< 16.0)': 'Some features might not work correctly in older Safari versions. Consider updating to Safari 16.0 or newer.',
  'Old Chrome (< 90)': 'React 19 requires Chrome 90 or newer for all features to work properly.'
};

/**
 * Check if the current browser is compatible with React 19
 * @returns {Object} Compatibility result with details
 */
export function checkBrowserCompatibility() {
  // Start with a clean result object
  const result = {
    compatible: true,
    missingFeatures: [],
    missingCriticalFeatures: [],
    browserInfo: getBrowserInfo(),
    knownIssue: null
  };
  
  // Check each required feature
  REQUIRED_FEATURES.forEach(feature => {
    try {
      const hasFeature = feature.check();
      if (!hasFeature) {
        result.missingFeatures.push(feature.name);
        if (feature.critical) {
          result.missingCriticalFeatures.push(feature.name);
          result.compatible = false;
        }
      }
    } catch (error) {
      result.missingFeatures.push(feature.name);
      if (feature.critical) {
        result.missingCriticalFeatures.push(feature.name);
        result.compatible = false;
      }
    }
  });
  
  // Check for known issues based on browser detection
  const { name, version } = result.browserInfo;
  
  // Check for Internet Explorer
  if (name === 'Internet Explorer') {
    result.compatible = false;
    result.knownIssue = KNOWN_ISSUES['Internet Explorer'];
  }
  
  // Check for old Safari versions
  if (name === 'Safari' && parseFloat(version) < 16.0) {
    result.knownIssue = KNOWN_ISSUES['Old Safari (< 16.0)'];
  }
  
  // Check for old Chrome versions
  if (name === 'Chrome' && parseInt(version) < 90) {
    result.knownIssue = KNOWN_ISSUES['Old Chrome (< 90)'];
  }
  
  return result;
}

/**
 * Get browser name and version
 * @returns {Object} Browser name and version
 */
function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  let name = 'Unknown';
  let version = 'Unknown';
  
  // Detect browser name and version
  if (userAgent.includes('Firefox/')) {
    name = 'Firefox';
    version = userAgent.split('Firefox/')[1].split(' ')[0];
  } else if (userAgent.includes('Chrome/') && !userAgent.includes('Edg/')) {
    name = 'Chrome';
    version = userAgent.split('Chrome/')[1].split(' ')[0];
  } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
    name = 'Safari';
    // Safari version is found in Version/ part
    if (userAgent.includes('Version/')) {
      version = userAgent.split('Version/')[1].split(' ')[0];
    }
  } else if (userAgent.includes('Edg/')) {
    name = 'Edge';
    version = userAgent.split('Edg/')[1].split(' ')[0];
  } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
    name = 'Internet Explorer';
    if (userAgent.includes('MSIE')) {
      version = userAgent.split('MSIE ')[1].split(';')[0];
    } else {
      version = '11.0'; // Trident is IE 11
    }
  }
  
  return { name, version };
}

/**
 * Display a compatibility warning if needed
 * @param {Object} compatibility Result of checkBrowserCompatibility()
 */
export function showCompatibilityWarning(compatibility) {
  if (!compatibility.compatible || compatibility.knownIssue) {
    console.warn('Browser compatibility issues detected:');
    
    if (compatibility.missingCriticalFeatures.length > 0) {
      console.warn('Missing critical browser features:', compatibility.missingCriticalFeatures);
    }
    
    if (compatibility.knownIssue) {
      console.warn('Known issue:', compatibility.knownIssue);
    }
    
    // Log the detailed information
    console.info('Browser compatibility details:', compatibility);
    
    // Add a warning to localStorage for diagnostics
    try {
      localStorage.setItem('browser_compatibility_warning', JSON.stringify({
        time: new Date().toISOString(),
        ...compatibility
      }));
    } catch (e) {
      console.error('Error saving compatibility warning to localStorage:', e);
    }
    
    return true;
  }
  
  return false;
}

/**
 * Checks and handles browser compatibility
 * @param {Function} onIncompatible Callback when browser is incompatible
 * @returns {boolean} Whether the browser is compatible
 */
export default function handleBrowserCompatibility(onIncompatible) {
  const compatibility = checkBrowserCompatibility();
  const hasWarning = showCompatibilityWarning(compatibility);
  
  if (!compatibility.compatible && onIncompatible) {
    onIncompatible(compatibility);
    return false;
  }
  
  return !hasWarning;
}