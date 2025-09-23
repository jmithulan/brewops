import React, { useState } from 'react';
import { X, CalendarDays, Users, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4322';

const TourBookingForm = ({ tour, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '10:00',
    participants: 1,
    specialRequests: ''
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
    if (!formData.date) return "Date is required";
    if (!formData.time) return "Time is required";
    if (!formData.participants || formData.participants < 1) return "Number of participants is required";
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
      // Prepare booking data
      const bookingData = {
        ...formData,
        tourId: tour.id,
        tourName: tour.title,
        price: tour.price,
        duration: tour.duration,
        bookingReference: `TOUR-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      };

      // Simulate API call - replace with actual endpoint when backend is ready
      // const response = await axios.post(`${API_URL}/api/tours/book`, bookingData);
      
      // For now, simulate success response after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      setStep(3);
      
      // In a real implementation, you'd handle the response like this:
      // if (response.data.success) {
      //   setSuccess(true);
      //   setStep(3);
      // } else {
      //   setError(response.data.message || 'Failed to book your tour');
      // }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || 'Failed to process your booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate minimum date (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

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
            {step === 3 ? 'Booking Confirmed' : 'Book Tour'}
          </h2>
          
          {step !== 3 && (
            <div className="mb-6">
              <p className="text-gray-600 text-sm mb-3">{tour?.title}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-green-600">{tour?.price}</span>
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
                Next: Tour Details
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tour Date *</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      min={minDateStr}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      required
                    />
                    <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tour Time *</label>
                  <div className="relative">
                    <select
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors appearance-none"
                      required
                    >
                      <option value="10:00">10:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="14:00">2:00 PM</option>
                    </select>
                    <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Participants *</label>
                  <div className="relative">
                    <select
                      name="participants"
                      value={formData.participants}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors appearance-none"
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
                      ))}
                    </select>
                    <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                  <textarea 
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Any special requirements or questions..."
                    rows={3}
                  />
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
                    'Confirm Booking'
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
              <h3 className="text-xl font-bold text-gray-800 mb-2">Tour Booking Confirmed!</h3>
              <p className="text-gray-600 mb-6">
                We've sent the booking confirmation to your email. We're excited to welcome you to our tea factory!
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Booking Reference:</span>
                  <span className="font-medium">TOUR-{Math.floor(Math.random() * 10000)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Tour:</span>
                  <span className="font-medium">{tour?.title}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formData.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">
                    {formData.time === '10:00' ? '10:00 AM' : 
                     formData.time === '12:00' ? '12:00 PM' : '2:00 PM'}
                  </span>
                </div>
              </div>
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

export default TourBookingForm;