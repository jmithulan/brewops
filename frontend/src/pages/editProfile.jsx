import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { User, Mail, Phone, MapPin, CreditCard, Lock, Eye, EyeOff, Save, Home, Package, ShoppingCart, BarChart3, Settings, LogOut, X } from "lucide-react";
import NavigationBar from "../components/navigationBar";
import Footer from "../components/Footer";
import { Link } from 'react-router-dom';
import { FaUserCircle, FaUser as FaUserIcon, FaFileAlt, FaMoneyBillWave, FaCog, FaPlus, FaSearch, FaLeaf, FaChartBar, FaTruck } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';

const EditProfile = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    supplierId: '',
    name: '',
    email: '',
    contactNumber: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    bankAccountNumber: '',
    bankName: '',
    branchCode: '',
    password: '',
    confirmPassword: ''
  });

  // Load user profile data on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token found:', !!token);
      
      if (!token) {
        toast.error('Please login to access your profile');
        // Load empty form for now
        setFormData({
          supplierId: '',
          name: '',
          email: '',
          contactNumber: '',
          address: '',
          city: '',
          postalCode: '',
          country: '',
          bankAccountNumber: '',
          bankName: '',
          branchCode: '',
          password: '',
          confirmPassword: ''
        });
        setProfileLoading(false);
        return;
      }

      // Try different possible endpoints
      const endpoints = [
        'http://localhost:5000/api/suppliers/profile',
        'http://localhost:5000/api/suppliers/me',
        'http://localhost:5000/api/auth/profile',
        'http://localhost:5000/api/users/profile',
        'http://localhost:5000/api/profile/me'
      ];

      let response = null;
      let successEndpoint = null;

      for (const endpoint of endpoints) {
        try {
          console.log('Trying endpoint:', endpoint);
          response = await axios.get(endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          successEndpoint = endpoint;
          console.log('Success with endpoint:', endpoint, response.data);
          break;
        } catch (error) {
          console.log('Failed endpoint:', endpoint, error.response?.status);
          continue;
        }
      }

      if (!response) {
        throw new Error('All profile endpoints failed');
      }

      console.log('Profile response:', response.data);

      if (response.data.success || response.data.supplier || response.data.user) {
        const userData = response.data.supplier || response.data.user || response.data.data;
        setFormData({
          supplierId: userData.supplierId || userData.id || '',
          name: userData.name || '',
          email: userData.email || '',
          contactNumber: userData.contactNumber || userData.phone || '',
          address: userData.address || '',
          city: userData.city || '',
          postalCode: userData.postalCode || '',
          country: userData.country || '',
          bankAccountNumber: userData.bankAccountNumber || '',
          bankName: userData.bankName || '',
          branchCode: userData.branchCode || '',
          password: '',
          confirmPassword: ''
        });
        toast.success(`Profile loaded from: ${successEndpoint}`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Load empty form so user can still use the page
      setFormData({
        supplierId: '',
        name: '',
        email: '',
        contactNumber: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        bankAccountNumber: '',
        bankName: '',
        branchCode: '',
        password: '',
        confirmPassword: ''
      });
      
      if (error.response?.status === 403) {
        toast.error('Authentication failed. Please login again. (Form loaded for testing)');
        // Don't clear token yet, just inform user
      } else if (error.response?.status === 404) {
        toast.error('Profile endpoint not found. Using empty form for now.');
      } else {
        toast.error('Could not load profile. Using empty form for now.');
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to update your profile');
        return;
      }

      // Prepare data - only include password if it's being changed
      const updateData = {
        name: formData.name,
        email: formData.email,
        contactNumber: formData.contactNumber,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
        bankAccountNumber: formData.bankAccountNumber,
        bankName: formData.bankName,
        branchCode: formData.branchCode
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await axios.put('http://localhost:5000/api/suppliers/profile', updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        toast.success('Profile updated successfully!');
        // Clear password fields after successful update
        setFormData(prev => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { icon: Home, label: "Dashboard", href: "#" },
    { icon: Package, label: "Products", href: "#" },
    { icon: ShoppingCart, label: "Orders", href: "#" },
    { icon: BarChart3, label: "Analytics", href: "#" },
    { icon: User, label: "Profile", href: "#", active: true },
    { icon: Settings, label: "Settings", href: "#" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
  <NavigationBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        {/* Supplier Sidebar (keeps supplier dashboard styling) */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-80 transition-transform duration-300 ease-in-out`}>
          <div className="w-80 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-2xl border-r border-gray-700 h-full">
            <div className="p-6 h-full flex flex-col">
              {/* User Profile Section */}
              <div className="flex items-center space-x-4 mb-8 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <FaUserCircle className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Supplier Portal</h3>
                  <p className="text-gray-400 text-sm">Tea Leaf Supplier</p>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-2">
				<Link 
                  to="/" 
                  className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                >
                  <FaFileAlt className="text-xl" />
                  <span>Home</span>
                </Link>
                
                <Link 
                  to="/SupplierDashboard" 
                  className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                >
                  <MdDashboard className="text-xl" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                
                <Link 
                  to="/suppliers/transactions" 
                  className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                >
                  <FaFileAlt className="text-xl" />
                  <span>Supply Records</span>
                </Link>
                
                <Link 
                  to="/suppliers/paymentSummary" 
                  className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                >
                  <FaMoneyBillWave className="text-xl" />
                  <span>Payment Records</span>
                </Link>
                
                <Link 
                  to="/suppliers/editProfile" 
                  className="flex items-center space-x-3 p-3 rounded-lg bg-gray-700 text-white shadow-md"
                >
                  <FaUserIcon className="text-xl" />
                  <span>Edit Profile</span>
                </Link>
                
                <Link 
                  to="/supplier/settings" 
                  className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                >
                  <FaCog className="text-xl" />
                  <span>Settings</span>
                </Link>
              </div>

              {/* Quick Actions */}
              <div className="mt-8">
                <h4 className="text-gray-300 font-medium text-sm uppercase tracking-wider border-b border-gray-700 pb-2 mb-4">
                  Quick Actions
                </h4>
                
                <div className="space-y-3">
                  <Link 
                    to="/supplier/create-supply-recode" 
                    className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:from-green-700 hover:to-emerald-800 transition-all duration-200 shadow-lg"
                  >
                    <FaPlus className="text-lg" />
                    <span className="font-medium">New Supply Record</span>
                  </Link>
                  
                  <button className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg">
                    <FaSearch className="text-lg" />
                    <span className="font-medium">Search Records</span>
                  </button>
                </div>
              </div>

              {/* Quick Stats Section - Moved to Bottom */}
              <div className="space-y-4 mt-auto">
                <h4 className="text-gray-300 font-medium text-sm uppercase tracking-wider border-b border-gray-700 pb-2">
                  Quick Stats
                </h4>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-4 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Monthly Delivery</p>
                        <p className="text-white text-2xl font-bold">-- kg</p>
                      </div>
                      <FaLeaf className="text-green-200 text-2xl" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Quality Score</p>
                        <p className="text-white text-2xl font-bold">--%</p>
                      </div>
                      <FaChartBar className="text-blue-200 text-2xl" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Monthly Revenue</p>
                        <p className="text-white text-xl font-bold">Rs. --</p>
                      </div>
                      <FaMoneyBillWave className="text-purple-200 text-2xl" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm">Delivery Rate</p>
                        <p className="text-white text-2xl font-bold">--%</p>
                      </div>
                      <FaTruck className="text-orange-200 text-2xl" />
                    </div>
                  </div>
                </div>
              </div>
 
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-8 py-6 border-b border-gray-200">
                <h2 className="text-3xl font-bold text-green-700">Edit Profile</h2>
                <p className="text-gray-600 mt-2">Update your account information and settings</p>
              </div>
              
              {profileLoading ? (
                <div className="p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile data...</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Basic Information Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="mb-2 font-semibold text-gray-700 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Supplier ID
                    </label>
                    <input 
                      type="text"
                      name="supplierId"
                      value={formData.supplierId}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" 
                      placeholder="Enter your Supplier ID"
                      disabled
                    />
                  </div>
                  
                  <div>
                    <label className="mb-2 font-semibold text-gray-700 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Full Name
                    </label>
                    <input 
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" 
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="mb-2 font-semibold text-gray-700 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Address
                    </label>
                    <input 
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" 
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="mb-2 font-semibold text-gray-700 flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact Number
                    </label>
                    <input 
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" 
                      placeholder="Enter your contact number"
                      required
                    />
                  </div>
                </div>

                {/* Address Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center border-b pb-2">
                    <MapPin className="h-5 w-5 mr-2" />
                    Address Information
                  </h3>
                  
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">Street Address</label>
                    <input 
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" 
                      placeholder="Enter your street address"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">City</label>
                      <input 
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" 
                        placeholder="Enter city"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">Postal Code</label>
                      <input 
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" 
                        placeholder="Enter postal code"
                        required
                      />
                    </div>
                    

                  </div>
                </div>

                {/* Banking Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center border-b pb-2">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Banking Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">Bank Name</label>
                      <input 
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" 
                        placeholder="Enter bank name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">Branch Code</label>
                      <input 
                        type="text"
                        name="branchCode"
                        value={formData.branchCode}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" 
                        placeholder="Enter branch code"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">Bank Account Number</label>
                    <input 
                      type="text"
                      name="bankAccountNumber"
                      value={formData.bankAccountNumber}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" 
                      placeholder="Enter your bank account number"
                      required
                    />
                  </div>
                </div>

                {/* Password Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center border-b pb-2">
                    <Lock className="h-5 w-5 mr-2" />
                    Security Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">New Password</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded-lg px-4 py-3 w-full pr-12 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" 
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">Confirm Password</label>
                      <div className="relative">
                        <input 
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded-lg px-4 py-3 w-full pr-12 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" 
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-6">
                  <button 
                    type="button" 
                    onClick={handleSubmit}
                    disabled={loading || profileLoading}
                    className="flex items-center px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Debug Section */}
      <div className="max-w-4xl mx-auto p-6 mt-6">
        <div className="bg-gray-100 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Debug Tools</h3>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={async () => {
                  try {
                    const response = await axios.get('http://localhost:5000/api/test');
                    console.log('Backend test:', response.data);
                    toast.success('Backend is reachable!');
                  } catch (error) {
                    console.error('Backend test failed:', error);
                    toast.error('Backend connection failed');
                  }
                }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
              >
                Test Backend Connection
              </button>
              
              <button
                onClick={() => {
                  const token = localStorage.getItem('token');
                  console.log('Current token:', token);
                  toast.info(`Token ${token ? 'exists' : 'missing'}`);
                }}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md text-sm"
              >
                Check Token
              </button>

              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get('http://localhost:5000/api/suppliers/me', {
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      }
                    });
                    console.log('Profile endpoint response:', response.data);
                    toast.success('Profile endpoint works!');
                  } catch (error) {
                    console.error('Profile endpoint failed:', error);
                    toast.error(`Profile endpoint failed: ${error.response?.status || 'Unknown'}`);
                  }
                }}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm"
              >
                Test Profile Endpoint
              </button>

              <button
                onClick={async () => {
                  const endpoints = [
                    'http://localhost:5000/api/suppliers/profile',
                    'http://localhost:5000/api/suppliers/me',
                    'http://localhost:5000/api/auth/profile',
                    'http://localhost:5000/api/users/profile',
                    'http://localhost:5000/api/profile/me'
                  ];
                  
                  const token = localStorage.getItem('token');
                  for (const endpoint of endpoints) {
                    try {
                      const response = await axios.get(endpoint, {
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        }
                      });
                      console.log(`✅ SUCCESS: ${endpoint}`, response.data);
                      toast.success(`Found working endpoint: ${endpoint}`);
                      return;
                    } catch (error) {
                      console.log(`❌ FAILED: ${endpoint} - ${error.response?.status || 'No response'}`);
                    }
                  }
                  toast.error('All endpoints failed');
                }}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm"
              >
                Test All Endpoints
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  toast.info('Token cleared');
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
              >
                Clear Token
              </button>

              <button
                onClick={() => {
                  // Load mock data for development
                  setFormData({
                    supplierId: 'SUP001',
                    name: 'John Doe Supplier',
                    email: 'john@supplier.com',
                    contactNumber: '+1234567890',
                    address: '123 Tea Garden Lane',
                    city: 'Colombo',
                    postalCode: '10100',
                    country: 'Sri Lanka',
                    bankAccountNumber: '1234567890',
                    bankName: 'Bank of Ceylon',
                    branchCode: 'BOC001',
                    password: '',
                    confirmPassword: ''
                  });
                  setProfileLoading(false);
                  toast.success('Mock data loaded for development');
                }}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-sm"
              >
                Load Mock Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4aed88',
            },
          },
        }}
      />

  <Footer />
    </div>
  );
};

export default EditProfile;