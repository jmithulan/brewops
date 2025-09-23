import React from 'react';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';

const SuccessMessage = ({ 
  message, 
  onDismiss, 
  className = '',
  showIcon = true 
}) => {
  if (!message) return null;

  return (
    <div className={`bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        {showIcon && (
          <div className="flex-shrink-0">
            <FaCheckCircle className="w-5 h-5 text-green-500" />
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
                className="inline-flex rounded-md p-1.5 text-green-500 hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-gray-600"
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

export default SuccessMessage;
