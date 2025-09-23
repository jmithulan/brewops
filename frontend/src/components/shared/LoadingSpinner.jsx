import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'text-green-600', 
  className = '',
  text = 'Loading...' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <FaSpinner 
          className={`${sizeClasses[size]} ${color} animate-spin`} 
        />
        {text && (
          <p className={`text-sm ${color} font-medium`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
