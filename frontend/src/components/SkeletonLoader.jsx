import React from 'react';

/**
 * SkeletonLoader - Provides skeleton loading states for better UX
 * Different variants for different content types
 */
const SkeletonLoader = ({ 
  variant = 'text', 
  width = '100%', 
  height = '20px', 
  className = '',
  count = 1 
}) => {
  const getSkeletonStyle = () => {
    const baseStyle = {
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-loading 1.5s infinite',
      borderRadius: '4px',
      width,
      height
    };

    switch (variant) {
      case 'text':
        return { ...baseStyle, height: '16px', borderRadius: '2px' };
      case 'title':
        return { ...baseStyle, height: '24px', borderRadius: '4px' };
      case 'avatar':
        return { ...baseStyle, width: '40px', height: '40px', borderRadius: '50%' };
      case 'card':
        return { ...baseStyle, height: '200px', borderRadius: '8px' };
      case 'button':
        return { ...baseStyle, height: '36px', borderRadius: '6px' };
      case 'table':
        return { ...baseStyle, height: '48px', borderRadius: '4px' };
      default:
        return baseStyle;
    }
  };

  const renderSkeleton = () => {
    if (variant === 'card') {
      return (
        <div className={`skeleton-card ${className}`} style={{ width, height: '200px' }}>
          <div style={getSkeletonStyle()} />
          <div style={{ marginTop: '12px' }}>
            <div style={{ ...getSkeletonStyle(), height: '20px', marginBottom: '8px' }} />
            <div style={{ ...getSkeletonStyle(), height: '16px', width: '70%' }} />
          </div>
        </div>
      );
    }

    if (variant === 'table') {
      return (
        <div className={`skeleton-table ${className}`}>
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
              <div style={{ ...getSkeletonStyle(), width: '40px', height: '40px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ ...getSkeletonStyle(), height: '16px', marginBottom: '4px' }} />
                <div style={{ ...getSkeletonStyle(), height: '14px', width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (variant === 'list') {
      return (
        <div className={`skeleton-list ${className}`}>
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ ...getSkeletonStyle(), width: '32px', height: '32px', marginRight: '12px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ ...getSkeletonStyle(), height: '16px', marginBottom: '4px' }} />
                <div style={{ ...getSkeletonStyle(), height: '14px', width: '80%' }} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Default: render multiple skeleton items
    return Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className={`skeleton-item ${className}`}
        style={getSkeletonStyle()}
      />
    ));
  };

  return (
    <>
      {renderSkeleton()}
      <style>{`
        @keyframes skeleton-loading {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        .skeleton-card {
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
        }
        
        .skeleton-table {
          padding: 16px;
        }
        
        .skeleton-list {
          padding: 16px;
        }
        
        .skeleton-item {
          margin-bottom: 8px;
        }
        
        .skeleton-item:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </>
  );
};

// Predefined skeleton components for common use cases
export const SkeletonCard = (props) => <SkeletonLoader variant="card" {...props} />;
export const SkeletonText = (props) => <SkeletonLoader variant="text" {...props} />;
export const SkeletonTitle = (props) => <SkeletonLoader variant="title" {...props} />;
export const SkeletonAvatar = (props) => <SkeletonLoader variant="avatar" {...props} />;
export const SkeletonButton = (props) => <SkeletonLoader variant="button" {...props} />;
export const SkeletonTable = (props) => <SkeletonLoader variant="table" {...props} />;
export const SkeletonList = (props) => <SkeletonLoader variant="list" {...props} />;

export default SkeletonLoader;
