import React from 'react';
import { Outlet } from 'react-router-dom';

// This is a minimal layout component without any context dependencies
// It can be used for login/register pages and other standalone views
const MinimalLayout = () => {
  return (
    <div className="min-h-screen">
      {/* Main content - directly render the children with no header/footer */}
      <Outlet />
    </div>
  );
};

export default MinimalLayout;