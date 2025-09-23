import React from 'react';
import Chat from '../../components/Chat.jsx';
import { useAuth } from '../../contexts/authcontext.jsx';
import { Navigate } from 'react-router-dom';

const MessagesPage = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <h1 className="text-2xl font-bold p-4 bg-green-700 text-white">Messages</h1>
        <div className="h-[80vh]">
          <Chat />
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;