import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './authcontext';

const SocketContext = createContext();

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    // We'll allow the socket context to initialize even without authentication
    // This makes the app more robust when dealing with auth state changes
    let socketInstance = null;
    
    try {
      // Create socket connection if user is authenticated
      if (isAuthenticated && isAuthenticated() && user) {
        console.log('Creating socket connection for user:', user.id);
        
        socketInstance = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:4323', {
          withCredentials: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000,
          query: {
            userId: user.id,
            userRole: user.role
          }
        });

        // Set up event listeners
        socketInstance.on('connect', () => {
          console.log('Socket connected');
          setConnected(true);
          setConnectionError(null);
          
          // Join user's personal room for direct messages
          socketInstance.emit('join', user.id);
          
          // Join room based on role
          if (user.role) {
            socketInstance.emit('joinRole', user.role);
          }
        });

        socketInstance.on('disconnect', () => {
          console.log('Socket disconnected');
          setConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          setConnected(false);
          setConnectionError(`Connection error: ${error.message}`);
        });

        setSocket(socketInstance);
      }
    } catch (error) {
      console.error('Error initializing socket:', error);
      setConnectionError(`Failed to initialize socket: ${error.message}`);
    }

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        console.log('Disconnecting socket');
        socketInstance.disconnect();
      }
    };
  }, [user, isAuthenticated]);

  // Provide the socket and connection status
  const value = {
    socket,
    connected,
    connectionError,
    isConnected: connected,
    emit: (event, data) => {
      if (socket && connected) {
        socket.emit(event, data);
      } else {
        console.warn('Attempted to emit event but socket is not connected:', event);
        return false;
      }
      return true;
    }
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}