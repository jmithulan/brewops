import toast from 'react-hot-toast';
import { handleApiError } from './errorHandler';

/**
 * Comprehensive notification system for the application
 */

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  LOADING: 'loading'
};

// Default notification options
const DEFAULT_OPTIONS = {
  duration: 4000,
  position: 'top-right',
  style: {
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '500'
  }
};

// Custom notification styles
const CUSTOM_STYLES = {
  success: {
    ...DEFAULT_OPTIONS.style,
    background: '#f0f9ff',
    color: '#065f46',
    border: '1px solid #10b981'
  },
  error: {
    ...DEFAULT_OPTIONS.style,
    background: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #ef4444'
  },
  warning: {
    ...DEFAULT_OPTIONS.style,
    background: '#fffbeb',
    color: '#92400e',
    border: '1px solid #f59e0b'
  },
  info: {
    ...DEFAULT_OPTIONS.style,
    background: '#eff6ff',
    color: '#1e40af',
    border: '1px solid #3b82f6'
  }
};

/**
 * Show a success notification
 */
export const showSuccess = (message, options = {}) => {
  return toast.success(message, {
    ...DEFAULT_OPTIONS,
    ...options,
    style: {
      ...CUSTOM_STYLES.success,
      ...options.style
    }
  });
};

/**
 * Show an error notification
 */
export const showError = (message, options = {}) => {
  return toast.error(message, {
    ...DEFAULT_OPTIONS,
    ...options,
    style: {
      ...CUSTOM_STYLES.error,
      ...options.style
    }
  });
};

/**
 * Show a warning notification
 */
export const showWarning = (message, options = {}) => {
  return toast(message, {
    ...DEFAULT_OPTIONS,
    ...options,
    style: {
      ...CUSTOM_STYLES.warning,
      ...options.style
    }
  });
};

/**
 * Show an info notification
 */
export const showInfo = (message, options = {}) => {
  return toast(message, {
    ...DEFAULT_OPTIONS,
    ...options,
    style: {
      ...CUSTOM_STYLES.info,
      ...options.style
    }
  });
};

/**
 * Show a loading notification
 */
export const showLoading = (message = 'Loading...', options = {}) => {
  return toast.loading(message, {
    ...DEFAULT_OPTIONS,
    ...options,
    duration: Infinity // Loading toasts don't auto-dismiss
  });
};

/**
 * Dismiss a specific notification
 */
export const dismissNotification = (toastId) => {
  toast.dismiss(toastId);
};

/**
 * Dismiss all notifications
 */
export const dismissAllNotifications = () => {
  toast.dismiss();
};

/**
 * Show a promise-based notification
 */
export const showPromise = (promise, messages = {}) => {
  const {
    loading = 'Loading...',
    success = 'Success!',
    error = 'Something went wrong!'
  } = messages;

  return toast.promise(promise, {
    loading,
    success,
    error: (err) => {
      // Use enhanced error handling for promise errors
      handleApiError(err);
      return error;
    }
  });
};

/**
 * Show a confirmation notification
 */
export const showConfirmation = (message, onConfirm, onCancel) => {
  const toastId = toast(
    (t) => (
      <div className="flex flex-col space-y-3">
        <p className="text-sm font-medium">{message}</p>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              onConfirm();
              toast.dismiss(t.id);
            }}
            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
          >
            Confirm
          </button>
          <button
            onClick={() => {
              onCancel && onCancel();
              toast.dismiss(t.id);
            }}
            className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    ),
    {
      duration: Infinity,
      position: 'top-center'
    }
  );

  return toastId;
};

/**
 * Show a notification with action buttons
 */
export const showActionNotification = (message, actions = []) => {
  const toastId = toast(
    (t) => (
      <div className="flex flex-col space-y-3">
        <p className="text-sm font-medium">{message}</p>
        {actions.length > 0 && (
          <div className="flex space-x-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  toast.dismiss(t.id);
                }}
                className={`px-3 py-1 text-xs rounded ${
                  action.primary 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    ),
    {
      duration: Infinity,
      position: 'top-center'
    }
  );

  return toastId;
};

/**
 * Show a notification for CRUD operations
 */
export const showCrudNotification = (operation, entity, success = true) => {
  const messages = {
    create: {
      success: `${entity} created successfully!`,
      error: `Failed to create ${entity}`
    },
    update: {
      success: `${entity} updated successfully!`,
      error: `Failed to update ${entity}`
    },
    delete: {
      success: `${entity} deleted successfully!`,
      error: `Failed to delete ${entity}`
    },
    fetch: {
      success: `${entity} data loaded successfully!`,
      error: `Failed to load ${entity} data`
    }
  };

  const message = messages[operation]?.[success ? 'success' : 'error'];
  
  if (success) {
    showSuccess(message);
  } else {
    showError(message);
  }
};

/**
 * Show a notification for form validation errors
 */
export const showValidationErrors = (errors) => {
  const errorMessages = Object.values(errors).filter(Boolean);
  
  if (errorMessages.length > 0) {
    showError(errorMessages[0]);
  }
};

/**
 * Show a notification for network errors
 */
export const showNetworkError = (error) => {
  if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
    showError('Network connection lost. Please check your internet connection.');
  } else {
    showError('Network error occurred. Please try again.');
  }
};

/**
 * Show a notification for authentication errors
 */
export const showAuthError = (error) => {
  if (error.response?.status === 401) {
    showError('Session expired. Please log in again.');
  } else if (error.response?.status === 403) {
    showError('You do not have permission to perform this action.');
  } else {
    showError('Authentication error occurred.');
  }
};

/**
 * Show a notification for server errors
 */
export const showServerError = (error) => {
  if (error.response?.status >= 500) {
    showError('Server error occurred. Please try again later.');
  } else {
    showError('An unexpected error occurred.');
  }
};

/**
 * Notification manager for handling different types of errors
 */
export const NotificationManager = {
  handleError: (error) => {
    if (error.response?.status === 401) {
      showAuthError(error);
    } else if (error.response?.status === 403) {
      showAuthError(error);
    } else if (error.response?.status >= 500) {
      showServerError(error);
    } else if (error.code === 'NETWORK_ERROR') {
      showNetworkError(error);
    } else {
      showError(error.message || 'An unexpected error occurred');
    }
  },

  handleSuccess: (message) => {
    showSuccess(message);
  },

  handleWarning: (message) => {
    showWarning(message);
  },

  handleInfo: (message) => {
    showInfo(message);
  }
};

export default {
  NOTIFICATION_TYPES,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  dismissNotification,
  dismissAllNotifications,
  showPromise,
  showConfirmation,
  showActionNotification,
  showCrudNotification,
  showValidationErrors,
  showNetworkError,
  showAuthError,
  showServerError,
  NotificationManager
};
