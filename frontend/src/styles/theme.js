// Centralized theme configuration for consistent styling

export const theme = {
  colors: {
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
  },

  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// Common component styles
export const componentStyles = {
  // Card styles
  card: {
    base: 'bg-white rounded-lg shadow-md border border-gray-200',
    hover: 'hover:shadow-lg transition-shadow duration-200',
    padding: 'p-6',
  },

  // Button styles
  button: {
    base: 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    primary: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    outline: 'border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white focus:ring-green-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    ghost: 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:ring-gray-500',
  },

  // Input styles
  input: {
    base: 'w-full px-4 py-3 rounded-lg border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent',
    default: 'border-gray-300 hover:border-gray-400 focus:border-green-500',
    error: 'border-red-500 bg-red-50',
    disabled: 'bg-gray-100 cursor-not-allowed',
  },

  // Table styles
  table: {
    container: 'overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg',
    table: 'min-w-full divide-y divide-gray-300',
    header: 'bg-gray-50',
    headerCell: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
    body: 'bg-white divide-y divide-gray-200',
    row: 'hover:bg-gray-50',
    cell: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
  },

  // Badge styles
  badge: {
    base: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800',
  },

  // Modal styles
  modal: {
    overlay: 'fixed inset-0 bg-black bg-opacity-50 transition-opacity',
    container: 'flex min-h-full items-center justify-center p-4',
    content: 'relative bg-white rounded-xl shadow-2xl w-full transform transition-all duration-300',
  },

  // Sidebar styles
  sidebar: {
    container: 'fixed top-0 left-0 min-h-screen w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out z-40',
    header: 'p-6 border-b border-gray-700',
    nav: 'p-4',
    link: {
      base: 'flex items-center px-3 py-3 rounded-lg transition-colors duration-200',
      active: 'bg-green-600 text-white shadow-lg',
      inactive: 'text-gray-300 hover:bg-gray-700 hover:text-white',
    },
  },
};

// Utility functions for consistent styling
export const styleUtils = {
  // Generate responsive classes
  responsive: (base, variants = {}) => {
    let classes = base;
    Object.entries(variants).forEach(([breakpoint, value]) => {
      classes += ` ${breakpoint}:${value}`;
    });
    return classes;
  },

  // Generate hover states
  hover: (base, hoverClass) => `${base} hover:${hoverClass}`,

  // Generate focus states
  focus: (base, focusClass) => `${base} focus:${focusClass}`,

  // Generate disabled states
  disabled: (base, disabledClass) => `${base} disabled:${disabledClass}`,
};

export default theme;
