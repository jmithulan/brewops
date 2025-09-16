import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Package, Home, ShoppingBag } from 'lucide-react';
import NavigationBar from '../components/navigationBar';
import Footer from '../components/Footer';

const OrderSuccess = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Get the order reference from URL query parameters
        const params = new URLSearchParams(location.search);
        const reference = params.get('reference');
        
        if (!reference) {
          setError('Order reference not found');
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4322'}/api/orders/details/${reference}`);
        
        if (response.data.success) {
          setOrderDetails(response.data.order);
        } else {
          setError('Failed to load order details');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('An error occurred while fetching your order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [location.search]);
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <NavigationBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mx-auto mb-4"></div>
            <p className="text-xl">Loading your order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <NavigationBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <div className="text-center">
              <div className="bg-red-100 p-4 rounded-full inline-block mb-4">
                <ShoppingBag className="text-red-500 w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => navigate('/')}
                className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition duration-300"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <NavigationBar />
      <div className="flex-grow bg-gray-50 py-10">
        <div className="container mx-auto px-4">
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-md max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="bg-green-100 p-4 rounded-full inline-block mb-4">
                <CheckCircle className="text-green-500 w-10 h-10" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Order Confirmed!</h1>
              <p className="text-gray-600 mt-2">Thank you for your purchase. Your order has been successfully processed.</p>
            </div>
            
            {orderDetails && (
              <div className="space-y-6">
                <div className="border-t border-b border-gray-200 py-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Order Details</h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Order Reference:</div>
                    <div className="font-medium">{orderDetails.orderReference}</div>
                    <div className="text-gray-600">Order Date:</div>
                    <div className="font-medium">
                      {new Date(orderDetails.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-gray-600">Status:</div>
                    <div className="font-medium">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Items</h2>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <div className="divide-y divide-gray-200">
                      {orderDetails.items.map((item, index) => (
                        <div key={index} className="flex py-4 px-4">
                          <div className="flex-shrink-0 mr-4">
                            <div className="bg-gray-200 rounded-md h-16 w-16 flex items-center justify-center">
                              <Package className="text-gray-500 w-6 h-6" />
                            </div>
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-medium">{item.name}</h3>
                            <div className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</div>
                          </div>
                          <div className="flex-shrink-0 ml-4 text-right">
                            <div className="font-medium">LKR {item.price.toFixed(2)}</div>
                            <div className="text-sm text-gray-500 mt-1">per unit</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-100 py-3 px-4 flex justify-between items-center">
                      <span className="font-medium">Total</span>
                      <span className="font-bold">LKR {orderDetails.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Delivery Information</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-1">
                      <p className="font-medium">{orderDetails.customer.name}</p>
                      <p>{orderDetails.customer.address.street}</p>
                      <p>{orderDetails.customer.address.city}, {orderDetails.customer.address.postalCode}</p>
                      <p>{orderDetails.customer.address.country}</p>
                      <p className="pt-2">📱 {orderDetails.customer.phone}</p>
                      <p>📧 {orderDetails.customer.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mt-8 space-y-4">
                  <p className="text-gray-600">A confirmation email has been sent to your email address.</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => navigate('/')}
                      className="flex items-center justify-center bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition duration-300"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Return to Home
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderSuccess;