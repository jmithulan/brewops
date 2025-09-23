import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const ErrorMessage = ({ 
  message, 
  onDismiss, 
  type = 'error',
  className = '',
  showIcon = true 
}) => {
  const typeClasses = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  };

  const iconClasses = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
    success: 'text-green-500'
  };

  if (!message) return null;

  return (
    <div className={`border rounded-lg p-4 ${typeClasses[type]} ${className}`}>
      <div className="flex items-start">
        {showIcon && (
          <div className="flex-shrink-0">
            <FaExclamationTriangle className={`w-5 h-5 ${iconClasses[type]}`} />
          </div>
        )}
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">
            {message}
          </p>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={`inline-flex rounded-md p-1.5 ${iconClasses[type]} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-gray-600`}
              >
                <span className="sr-only">Dismiss</span>
                <FaTimes className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
