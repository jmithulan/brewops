import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './socketContext';
import { useAuth } from './authcontext';
import axios from 'axios';

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket, connected } = useSocket();
  const { isAuthenticated } = useAuth();

  // Fetch existing notifications when component mounts and user is authenticated
  useEffect(() => {
    // Skip if not authenticated
    if (!isAuthenticated || !isAuthenticated()) {
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Catch Network Errors - wrap in try/catch for network failures
        try {
          const response = await axios.get('/api/notifications', { 
            withCredentials: true,
            timeout: 5000 // 5 second timeout
          });
          
          setNotifications(response.data);
          
          // Calculate unread count
          const unread = response.data.filter(notification => !notification.isRead).length;
          setUnreadCount(unread);
        } catch (networkError) {
          console.error('Network error when fetching notifications:', networkError);
          // Don't fail completely, just set empty notifications
          setNotifications([]);
          setUnreadCount(0);
          setError('Failed to load notifications. Will retry automatically.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    
    // Set up periodic refresh every 2 minutes
    const refreshInterval = setInterval(fetchNotifications, 2 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [isAuthenticated]);

  // Listen for real-time notifications when socket connection is established
  useEffect(() => {
    if (!socket || !connected) return;

    // Handle incoming notifications
    const handleNewNotification = (newNotification) => {
      console.log('New notification received:', newNotification);
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // You can add sound or other effects here
      // const sound = new Audio('/notification-sound.mp3');
      // sound.play();
    };
    
    socket.on('notification', handleNewNotification);

    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [socket, connected]);

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`, {}, { withCredentials: true });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Continue with optimistic UI update even if API call fails
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/read-all', {}, { withCredentials: true });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Continue with optimistic UI update even if API call fails
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId) => {
    // Optimistic update - remove notification immediately
    const notificationToDelete = notifications.find(n => n.id === notificationId);
    const wasUnread = notificationToDelete && !notificationToDelete.isRead;
    
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    try {
      await axios.delete(`/api/notifications/${notificationId}`, { withCredentials: true });
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Revert the optimistic update if API call fails
      setNotifications(prev => [...prev, notificationToDelete].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ));
      if (wasUnread) {
        setUnreadCount(prev => prev + 1);
      }
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    // Save current notifications for rollback
    const currentNotifications = [...notifications];
    const currentUnreadCount = unreadCount;
    
    // Optimistic update
    setNotifications([]);
    setUnreadCount(0);
    
    try {
      await axios.delete('/api/notifications', { withCredentials: true });
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      // Revert if API call fails
      setNotifications(currentNotifications);
      setUnreadCount(currentUnreadCount);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}