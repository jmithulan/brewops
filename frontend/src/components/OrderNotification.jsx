import React, { useState, useEffect } from 'react';
import { X, Bell, ShoppingBag } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4322';

const OrderNotification = ({ userEmail }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Fetch user orders when component mounts
  useEffect(() => {
    if (userEmail) {
      fetchUserOrders();
    }
  }, [userEmail]);
  
  const fetchUserOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(`${API_URL}/api/orders/user/${userEmail}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        const orders = response.data.orders;
        // Filter to only show recent or pending orders
        const recentOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          return orderDate > threeDaysAgo || order.status !== 'delivered';
        });
        
        setNotifications(recentOrders);
        
        // Set unread count to orders that are newer than last viewed time
        const lastViewedTime = localStorage.getItem('lastOrderNotificationView');
        if (lastViewedTime) {
          const lastViewed = new Date(lastViewedTime);
          const newOrders = recentOrders.filter(order => new Date(order.createdAt) > lastViewed);
          setUnreadCount(newOrders.length);
        } else {
          setUnreadCount(recentOrders.length);
        }
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
    }
  };
  
  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
    localStorage.setItem('lastOrderNotificationView', new Date().toISOString());
  };
  
  const handleClose = () => {
    setIsOpen(false);
  };
  
  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (!userEmail || notifications.length === 0) {
    return null;
  }
  
  return (
    <>
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-600 hover:text-green-600 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end animate-fade-in">
          <div className="w-full max-w-md h-full bg-white shadow-lg overflow-hidden flex flex-col">
            <div className="p-4 bg-green-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Your Orders</h3>
              <button onClick={handleClose} className="p-1 hover:bg-green-700 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4">
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((order) => (
                    <div key={order._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <ShoppingBag className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-gray-800">Order #{order.orderReference}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
                            <span className="font-medium text-green-600">LKR {order.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
                    <ShoppingBag className="w-8 h-8 text-gray-500" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-700 mb-1">No recent orders</h4>
                  <p className="text-gray-500 text-sm">
                    When you place orders, they will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderNotification;