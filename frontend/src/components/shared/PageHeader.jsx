import React from 'react';

const PageHeader = ({
  title,
  subtitle,
  actions,
  breadcrumbs = [],
  className = ''
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="inline-flex items-center">
                {index > 0 && (
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                <a
                  href={crumb.href}
                  className={`text-sm font-medium ${
                    index === breadcrumbs.length - 1
                      ? 'text-gray-500'
                      : 'text-gray-700 hover:text-green-600'
                  }`}
                >
                  {crumb.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-lg text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="mt-4 sm:mt-0 sm:ml-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {actions}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
