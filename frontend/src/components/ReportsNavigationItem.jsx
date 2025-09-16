import React from 'react';
import { Link } from 'react-router-dom';
import { FaFileAlt } from 'react-icons/fa';

const ReportsNavigationItem = ({ className = "" }) => {
  return (
    <Link 
      to="/reports" 
      className={`flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 ${className}`}
    >
      <FaFileAlt className="text-xl" />
      <span>Reports</span>
    </Link>
  );
};

export default ReportsNavigationItem;
