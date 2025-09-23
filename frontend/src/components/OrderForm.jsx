import React, { useState } from 'react';
import { X, CreditCard, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4322';

const OrderForm = ({ product, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Sri Lanka',
    quantity: 1
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Valid email is required";
    if (!formData.phone.trim()) return "Phone number is required";
    return null;
  };

  const validateStep2 = () => {
    if (!formData.address.trim()) return "Address is required";
    if (!formData.city.trim()) return "City is required";
    if (!formData.postalCode.trim()) return "Postal code is required";
    return null;
  };

  const handleNextStep = () => {
    const error = validateStep1();
    if (error) {
      setError(error);
      return;
    }
    setError(null);
    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateStep2();
    if (error) {
      setError(error);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare order data
      const orderData = {
        ...formData,
        productId: product.id,
        productName: product.name,
        price: product.price,
        totalAmount: parseFloat(product.price) * formData.quantity
      };

      // Send order to backend
      const response = await axios.post(`${API_URL}/api/orders/create`, orderData);
      
      if (response.data.paymentLink) {
        // Redirect to Stripe payment
        window.location.href = response.data.paymentLink;
      } else {
        // Handle successful order without payment link
        setSuccess(true);
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-xl overflow-hidden shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-full z-10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            {step === 3 ? 'Order Confirmed' : 'Order Now'}
          </h2>
          
          {step !== 3 && (
            <div className="mb-6">
              <p className="text-gray-600 text-sm mb-3">{product?.name}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-green-600">{product?.price}</span>
                <div className="h-1 bg-gray-200 rounded-full w-1/2 overflow-hidden">
                  <div 
                    className="h-full bg-green-600 rounded-full transition-all duration-300"
                    style={{ width: `${(step / 2) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {step === 1 && (
            <form>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="+94 XX XXX XXXX"
                    required
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Next: Shipping Details
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="123 Tea Garden Road"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Colombo"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                    <input 
                      type="text" 
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="10300"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <select 
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="sm:flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="sm:flex-1 px-6 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Proceed to Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Thank You!</h3>
              <p className="text-gray-600 mb-6">
                Your order has been received. We've sent a confirmation to your email.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderForm;