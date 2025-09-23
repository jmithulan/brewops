import toast from 'react-hot-toast';
import { showSuccess, showError, showWarning, showInfo, showLoading } from './notifications.jsx';

/**
 * Comprehensive error handling utility for the application
 */

// Error types and their corresponding messages
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Error messages mapping
export const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'Network connection error. Please check your internet connection and try again.',
  [ERROR_TYPES.VALIDATION]: 'Please check your input and try again.',
  [ERROR_TYPES.AUTHENTICATION]: 'Authentication failed. Please log in again.',
  [ERROR_TYPES.AUTHORIZATION]: 'You do not have permission to perform this action.',
  [ERROR_TYPES.NOT_FOUND]: 'The requested resource was not found.',
  [ERROR_TYPES.SERVER]: 'Server error occurred. Please try again later.',
  [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

/**
 * Determine error type based on error response
 */
export const getErrorType = (error) => {
  if (!error.response) {
    return ERROR_TYPES.NETWORK;
  }

  const status = error.response.status;
  
  switch (status) {
    case 400:
      return ERROR_TYPES.VALIDATION;
    case 401:
      return ERROR_TYPES.AUTHENTICATION;
    case 403:
      return ERROR_TYPES.AUTHORIZATION;
    case 404:
      return ERROR_TYPES.NOT_FOUND;
    case 500:
    case 502:
    case 503:
      return ERROR_TYPES.SERVER;
    default:
      return ERROR_TYPES.UNKNOWN;
  }
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error) => {
  const errorType = getErrorType(error);
  
  // Try to get specific error message from response
  const specificMessage = error.response?.data?.message || error.response?.data?.error;
  
  if (specificMessage) {
    return specificMessage;
  }
  
  return ERROR_MESSAGES[errorType];
};

/**
 * Handle API errors with appropriate user feedback
 */
export const handleApiError = (error, customMessage = null) => {
  const errorType = getErrorType(error);
  const message = customMessage || getErrorMessage(error);
  
  console.error('API Error:', {
    type: errorType,
    message: message,
    status: error.response?.status,
    data: error.response?.data,
    originalError: error
  });
  
  // Show appropriate toast based on error type
  switch (errorType) {
    case ERROR_TYPES.AUTHENTICATION:
      showError(message, { duration: 5000 });
      // Optionally redirect to login
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      break;
    case ERROR_TYPES.AUTHORIZATION:
      showError(message, { duration: 4000 });
      break;
    case ERROR_TYPES.VALIDATION:
      showError(message, { duration: 4000 });
      break;
    case ERROR_TYPES.NETWORK:
      showError(message, { duration: 5000 });
      break;
    case ERROR_TYPES.SERVER:
      showError(message, { duration: 5000 });
      break;
    default:
      showError(message, { duration: 4000 });
  }
  
  return {
    type: errorType,
    message: message,
    status: error.response?.status
  };
};

/**
 * Handle form validation errors
 */
export const handleValidationError = (errors) => {
  const errorMessages = Object.values(errors).filter(Boolean);
  
  if (errorMessages.length > 0) {
    toast.error(errorMessages[0], { duration: 4000 });
  }
  
  return errorMessages;
};

/**
 * Handle success messages
 */
export const handleSuccess = (message, duration = 3000) => {
  showSuccess(message, { duration });
};

/**
 * Handle loading states
 */
export const handleLoading = (isLoading, setLoading) => {
  if (setLoading) {
    setLoading(isLoading);
  }
  
  if (isLoading) {
    showLoading('Processing...', { duration: 0 });
  } else {
    toast.dismiss();
  }
};

/**
 * Retry mechanism for failed requests
 */
export const withRetry = async (apiCall, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // Don't retry for certain error types
      const errorType = getErrorType(error);
      if ([ERROR_TYPES.AUTHENTICATION, ERROR_TYPES.AUTHORIZATION, ERROR_TYPES.VALIDATION].includes(errorType)) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
  
  throw lastError;
};

/**
 * Debounced error handling for rapid API calls
 */
export const createDebouncedErrorHandler = (delay = 1000) => {
  let timeoutId;
  let lastError = null;
  
  return (error) => {
    lastError = error;
    
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      if (lastError) {
        handleApiError(lastError);
        lastError = null;
      }
    }, delay);
  };
};

/**
 * Error boundary helper for React components
 */
export const createErrorBoundary = (Component, fallback = null) => {
  return class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }
    
    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }
    
    componentDidCatch(error, errorInfo) {
      console.error('Error Boundary caught an error:', error, errorInfo);
      handleApiError(error, 'An unexpected error occurred in this component.');
    }
    
    render() {
      if (this.state.hasError) {
        return fallback || (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-medium">Something went wrong</h3>
            <p className="text-red-600 text-sm mt-1">
              Please refresh the page or contact support if the problem persists.
            </p>
          </div>
        );
      }
      
      return <Component {...this.props} />;
    }
  };
};

/**
 * Async error wrapper for API calls
 */
export const asyncErrorHandler = (asyncFn) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  };
};

/**
 * Form submission error handler
 */
export const handleFormSubmission = async (submitFn, setLoading = null) => {
  try {
    if (setLoading) setLoading(true);
    const result = await submitFn();
    return result;
  } catch (error) {
    handleApiError(error);
    throw error;
  } finally {
    if (setLoading) setLoading(false);
  }
};

export default {
  ERROR_TYPES,
  ERROR_MESSAGES,
  getErrorType,
  getErrorMessage,
  handleApiError,
  handleValidationError,
  handleSuccess,
  handleLoading,
  withRetry,
  createDebouncedErrorHandler,
  createErrorBoundary,
  asyncErrorHandler,
  handleFormSubmission
};
