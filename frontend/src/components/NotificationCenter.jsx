import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button } from './shared';
import { commonApi } from '../utils/api';
import { FaBell, FaTimes, FaCheck, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaComment } from 'react-icons/fa';
import { useAuth } from '../contexts/authcontext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4323';

// This component can be used in both modal mode and dropdown mode
const NotificationCenter = ({ isOpen, onClose, isDropdown = false }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, unread
  const [socket, setSocket] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!token || !user) return;
    
    const newSocket = io(API_URL, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);
  
  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return;
    
    socket.on('notification', (notification) => {
      // Add the new notification to the list
      setNotifications(prev => [notification, ...prev]);
      
      // Increment unread count
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      toast(notification.title, {
        icon: getNotificationIconComponent(notification.type),
        duration: 5000,
      });
    });
    
    return () => {
      socket.off('notification');
    };
  }, [socket]);
  
  // Handle click outside for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdown && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdown]);
  
  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Try to use the API service first
      if (commonApi?.notifications?.getAll) {
        const result = await commonApi.notifications.getAll();
        if (result.success) {
          setNotifications(result.data);
          setUnreadCount(result.pagination?.unread || 0);
        }
      } else {
        // Fallback to direct axios call
        const response = await axios.get(`${API_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setNotifications(response.data.data);
          const unread = response.data.data.filter(n => !n.is_read).length;
          setUnreadCount(unread);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
    setLoading(false);
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      // Try to use the API service first
      if (commonApi?.notifications?.markAsRead) {
        const result = await commonApi.notifications.markAsRead(notificationId);
        if (result.success) {
          setNotifications(prev => 
            prev.map(notif => 
              notif.id === notificationId ? { ...notif, is_read: true } : notif
            )
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } else {
        // Fallback to direct axios call
        const response = await axios.put(
          `${API_URL}/api/notifications/${notificationId}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setNotifications(prev => 
            prev.map(notif => 
              notif.id === notificationId ? { ...notif, is_read: true } : notif
            )
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      // Try to use the API service first
      if (commonApi?.notifications?.markAllAsRead) {
        const result = await commonApi.notifications.markAllAsRead();
        if (result.success) {
          setNotifications(prev => 
            prev.map(notif => ({ ...notif, is_read: true }))
          );
          setUnreadCount(0);
        }
      } else {
        // Fallback to direct axios call
        const response = await axios.put(
          `${API_URL}/api/notifications/read-all`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setNotifications(prev => 
            prev.map(notif => ({ ...notif, is_read: true }))
          );
          setUnreadCount(0);
        }
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const result = await commonApi.notifications.delete(notificationId);
      if (result.success) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        setUnreadCount(prev => {
          const deletedNotif = notifications.find(n => n.id === notificationId);
          return deletedNotif && !deletedNotif.is_read ? prev - 1 : prev;
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  useEffect(() => {
    if (isOpen || (isDropdown && showDropdown)) {
      fetchNotifications();
    }
  }, [isOpen, isDropdown, showDropdown]);

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') {
      return !notification.is_read;
    }
    return true;
  });

  // Get notification icon based on type
  const getNotificationIcon = (type, priority) => {
    const iconClass = "w-5 h-5";
    
    switch (type) {
      case 'message':
        return <FaComment className={`${iconClass} text-blue-500`} />;
      case 'error':
        return <FaExclamationTriangle className={`${iconClass} text-red-500`} />;
      case 'warning':
        return <FaExclamationTriangle className={`${iconClass} text-yellow-500`} />;
      case 'success':
        return <FaCheckCircle className={`${iconClass} text-green-500`} />;
      case 'info':
      default:
        return <FaInfoCircle className={`${iconClass} text-blue-500`} />;
    }
  };
  
  // Get icon component for toasts
  const getNotificationIconComponent = (type) => {
    switch (type) {
      case 'message':
        return FaComment;
      case 'error':
        return FaExclamationTriangle;
      case 'warning':
        return FaExclamationTriangle;
      case 'success':
        return FaCheckCircle;
      case 'info':
      default:
        return FaInfoCircle;
    }
  };
  
  // Get action URL for clickable notifications
  const getNotificationAction = (notification) => {
    try {
      if (notification.type === 'message' && notification.metadata) {
        const metadata = typeof notification.metadata === 'string' 
          ? JSON.parse(notification.metadata) 
          : notification.metadata;
        
        if (metadata.senderId) {
          return `/messages/${metadata.senderId}`;
        }
      }
    } catch (error) {
      console.error('Error parsing notification metadata:', error);
    }
    
    return null;
  };

  // Get priority badge color
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // Render notification content - shared between modal and dropdown modes
  const renderNotificationContent = () => (
    <div className="flex flex-col h-full">
      {/* Header with tabs */}
      <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'unread'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
        
        {unreadCount > 0 && (
          <Button
            size="small"
            variant="outline"
            onClick={markAllAsRead}
          >
            Mark All Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <FaBell className="w-8 h-8 mb-2" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const actionUrl = getNotificationAction(notification);
              const NotificationItem = () => (
                <div
                  className={`p-4 border rounded-lg transition-colors ${
                    notification.is_read
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-white border-green-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityBadge(notification.priority)}`}>
                            {notification.priority}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.created_at)}
                          </span>
                          
                          <div className="flex space-x-2">
                            {!notification.is_read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  markAsRead(notification.id);
                                }}
                                className="text-xs text-green-600 hover:text-green-800"
                              >
                                <FaCheck className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                deleteNotification(notification.id);
                              }}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              <FaTimes className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
              
              return actionUrl ? (
                <Link 
                  key={notification.id}
                  to={actionUrl}
                  className="block"
                  onClick={() => {
                    if (!notification.is_read) {
                      markAsRead(notification.id);
                    }
                    
                    if (isDropdown) {
                      setShowDropdown(false);
                    } else if (onClose) {
                      onClose();
                    }
                  }}
                >
                  <NotificationItem />
                </Link>
              ) : (
                <div 
                  key={notification.id}
                  className="cursor-pointer"
                  onClick={() => {
                    if (!notification.is_read) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <NotificationItem />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
  
  // Render as dropdown
  if (isDropdown) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => {
            setShowDropdown(!showDropdown);
            if (!showDropdown) {
              fetchNotifications();
            }
          }}
          className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          <FaBell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-lg z-50 p-4 max-h-[80vh] overflow-hidden">
            <div className="h-96">
              {renderNotificationContent()}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Render as modal
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notifications"
      size="large"
    >
      <div className="flex flex-col h-96">
        {renderNotificationContent()}
      </div>
    </Modal>
  );
};

export default NotificationCenter;
