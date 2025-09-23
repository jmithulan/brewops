import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AlertTriangle, Home, ShoppingCart } from 'lucide-react';
import NavigationBar from '../../components/navigationBar.jsx';
import Footer from '../../components/footer.jsx';

const OrderCancel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderReference, setOrderReference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [location]);
  
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
      
      setOrderReference(reference);
      setLoading(false);
      
      // Optional: You can still get order details if needed
      // const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:4322'}/api/orders/details/${reference}`);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to fetch order details');
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <NavigationBar />
      <div className="flex-grow flex items-center justify-center bg-gray-50 py-10">
        <div className="container mx-auto px-4">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
            <div className="text-center">
              <div className="bg-yellow-100 p-4 rounded-full inline-block mb-4">
                <AlertTriangle className="text-yellow-500 w-10 h-10" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Cancelled</h1>
              <p className="text-gray-600 mb-6">
                Your order {orderReference && `(Ref: ${orderReference})`} has been cancelled and no payment has been processed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => navigate('/')}
                  className="flex items-center justify-center bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition duration-300"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Return Home
                </button>
                <button 
                  onClick={() => navigate('/products')}
                  className="flex items-center justify-center bg-gray-800 text-white py-2 px-6 rounded-md hover:bg-gray-900 transition duration-300"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderCancel;