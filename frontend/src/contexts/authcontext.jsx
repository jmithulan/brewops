import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { handleSuccess, handleApiError } from '../utils/errorHandler.jsx';

const AuthContext = createContext();

/**
 * Custom hook to access authentication context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('useAuth was called outside of its Provider. Make sure the component is wrapped in AuthProvider.');
    // Instead of throwing, return a safe fallback state
    return {
      user: null,
      token: null,
      loading: false,
      authError: 'Auth context not available',
      permissions: [],
      login: () => Promise.resolve({ success: false, message: 'Auth context not available' }),
      register: () => Promise.resolve({ success: false, message: 'Auth context not available' }),
      logout: () => {},
      loginWithToken: () => Promise.resolve(false),
      isAuthenticated: () => false,
      hasRole: () => false,
      hasPermission: () => false,
      hasAnyPermission: () => false,
      setUser: () => {},
      setToken: () => {}
    };
  }
  return context;
};

/**
 * Authentication Provider Component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('jwtToken'));
  const [permissions, setPermissions] = useState([]);
  const [authError, setAuthError] = useState(null);
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4323';

  // Configure axios defaults when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Extract token expiration and set auto-logout
      try {
        const decodedToken = jwtDecode(token);
        const expiryTime = decodedToken.exp * 1000; // convert to ms
        const currentTime = Date.now();
        
        if (expiryTime > currentTime) {
          // Set timeout to logout when token expires
          const timeoutId = setTimeout(() => {
            console.log('Token expired, logging out');
            logout();
          }, expiryTime - currentTime);
          
          return () => clearTimeout(timeoutId);
        } else {
          // Token already expired
          console.log('Token already expired on load');
          logout();
        }
      } catch (error) {
        console.error('Error processing token:', error);
        logout();
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load - optimized for faster loading
  useEffect(() => {
    const checkAuth = async () => {
      setAuthError(null);
      
      try {
        // First, check for token and immediately set user to speed up UI rendering
        // This gives the user immediate access to the app while validation happens in the background
        if (!token) {
          console.log('No token found, skipping auth check');
          setLoading(false);
          return;
        }
        
        // Start validation immediately
        let tokenIsValid = false;
        let decodedToken = null;
        let quickLoad = false;
        
        // Quick validation without network requests
        try {
          decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          // Check expiration - but don't block rendering yet
          if (decodedToken.exp && decodedToken.exp <= currentTime) {
            console.warn('Token appears expired, will verify');
            // Don't throw here - we'll confirm with the server
          }
          
          // Check for required fields in token
          if (decodedToken.id && decodedToken.email) {
            // Set user immediately from token to speed up UI rendering
            // This "optimistic UI" approach improves perceived performance
            tokenIsValid = true;
            console.log('Initial token validation successful');
            
            // Set user data from token for immediate UI rendering
            setUser({
              id: decodedToken.id,
              email: decodedToken.email,
              name: decodedToken.name || decodedToken.email.split('@')[0],
              role: decodedToken.role || 'user',
              effectiveRole: decodedToken.effectiveRole || decodedToken.role || 'user'
            });
            
            if (decodedToken.permissions) {
              setPermissions(decodedToken.permissions);
            }
            
            // Reduce loading time if token looks valid
            setLoading(false);
            quickLoad = true;
          }
        } catch (tokenError) {
          console.error('Token validation failed:', tokenError.message);
          logout();
          setLoading(false);
          return;
        }
        
        // Continue with server validation in the background
        console.log('Verifying authentication with server...');
        // Shorter timeout for better UX
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // Further reduced from 5s to 3s
        
        try {
          // Start the request but don't block the UI
          const response = await axios.get(`${API_URL}/api/auth/user`, {
            signal: controller.signal,
            withCredentials: true,
            timeout: 2500 // Further reduced from 4s to 2.5s
          });
          
          clearTimeout(timeoutId);
          const userData = response.data;
          
          console.log('Auth check successful, user data:', userData);
          setUser(userData);
          
          // Set permissions from token
          if (userData.permissions) {
            setPermissions(userData.permissions);
          }
        } catch (apiError) {
          console.error('API auth check failed:', apiError);
          
          // If API call fails but token is valid, use token data as fallback
          if (tokenIsValid && decodedToken) {
            console.log('Using token data as fallback');
            setUser({
              id: decodedToken.id,
              email: decodedToken.email,
              name: decodedToken.name || decodedToken.email.split('@')[0],
              role: decodedToken.role || 'user',
              effectiveRole: decodedToken.effectiveRole || decodedToken.role || 'user'
            });
            
            if (decodedToken.permissions) {
              setPermissions(decodedToken.permissions);
            }
          } else {
            // Handle API errors
            if (apiError.message === 'Network Error' || apiError.name === 'AbortError' || apiError.code === 'ECONNABORTED') {
              console.warn('Network error or timeout during auth check. Using token data as fallback.');
              setAuthError('Network connectivity issues. Some features may be limited.');
            } else {
              const errorMsg = apiError.response?.data?.message || 'Authentication failed';
              setAuthError(errorMsg);
              logout();
            }
          }
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (error) {
        // Catch any unexpected errors in the auth check process
        console.error('Unexpected error in auth check:', error);
        setAuthError('An unexpected error occurred. Please try again.');
        logout();
      } finally {
        // Ensure loading is always set to false
        setLoading(false);
      }
    };

    // Wrap checkAuth in a try-catch to ensure it never crashes the app
    try {
      checkAuth();
    } catch (error) {
      console.error('Fatal error in auth check:', error);
      setLoading(false);
      setAuthError('Critical authentication error occurred');
      // Don't logout here, as that might cause a loop
    }
  }, [token]);

  /**
   * Login user with email/username and password
   * @param {string} emailOrUsername - The user's email or username
   * @param {string} password - The user's password
   * @param {boolean} isUsername - Whether the first parameter is a username instead of an email
   */
  const login = async (emailOrUsername, password, isUsername = false) => {
    setAuthError(null);
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: emailOrUsername, // We're reusing the email field for both email and username
        password,
        isUsername // Send flag to backend to determine login method
      });

      const { jwtToken, role, effectiveRole, user: userData, permissions: userPermissions } = response.data;
      
      if (jwtToken) {
        localStorage.setItem('jwtToken', jwtToken);
        localStorage.setItem('lastLogin', new Date().toISOString());
        
        setToken(jwtToken);
        setUser({
          ...userData,
          effectiveRole: effectiveRole || role // Use effectiveRole if provided
        });
        
        if (userPermissions) {
          setPermissions(userPermissions);
        }
        
        return { 
          success: true, 
          role, 
          effectiveRole,
          user: userData 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.message || 'Login failed';
      setAuthError(errorMsg);
      
      return { 
        success: false, 
        message: errorMsg
      };
    }
  };

  /**
   * Register a new user
   */
  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, userData);
      return { 
        success: true, 
        message: response.data.message,
        user: response.data.user 
      };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = error.response?.data?.message || 'Registration failed';
      
      return { 
        success: false, 
        message: errorMsg
      };
    }
  };
  
  /**
   * Handle login with existing JWT token (for OAuth callbacks)
   */
  const loginWithToken = async (token) => {
    setAuthError(null);
    try {
      console.log('Logging in with token:', token.substring(0, 20) + '...');
      
      // Set the token
      localStorage.setItem('jwtToken', token);
      localStorage.setItem('lastLogin', new Date().toISOString());
      setToken(token);
      
      // Decode token to get basic user info
      let decodedToken;
      try {
        decodedToken = jwtDecode(token);
        console.log('Decoded token:', {
          id: decodedToken.id,
          email: decodedToken.email,
          role: decodedToken.role,
          effectiveRole: decodedToken.effectiveRole,
          exp: new Date(decodedToken.exp * 1000).toLocaleString()
        });
      } catch (decodeError) {
        console.error('Failed to decode token:', decodeError);
        setAuthError('Invalid token format');
        logout();
        return false;
      }
      
      // Check token expiration
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp <= currentTime) {
        console.error('Token has expired');
        setAuthError('Authentication token has expired');
        logout();
        return false;
      }
      
      // Set axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      try {
        // Fetch user details from API
        const response = await axios.get(`${API_URL}/api/auth/user`);
        const userData = response.data;
        
        setUser({
          ...userData,
          effectiveRole: decodedToken.effectiveRole || decodedToken.role
        });
        
        // Set permissions
        if (decodedToken.permissions) {
          setPermissions(decodedToken.permissions);
        } else if (userData.permissions) {
          setPermissions(userData.permissions);
        }
        
        return true;
      } catch (apiError) {
        console.warn('Could not fetch user details, using token data instead:', apiError);
        
        // Use token data if API call fails
        setUser({
          id: decodedToken.id,
          email: decodedToken.email,
          name: decodedToken.name,
          role: decodedToken.role,
          effectiveRole: decodedToken.effectiveRole || decodedToken.role
        });
        
        if (decodedToken.permissions) {
          setPermissions(decodedToken.permissions);
        }
        
        return true;
      }
    } catch (error) {
      console.error('Token login error:', error);
      logout();
      return false;
    }
  };

  /**
   * Logout user and clear authentication state
   */
  const logout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('lastLogin');
    setToken(null);
    setUser(null);
    setPermissions([]);
    delete axios.defaults.headers.common['Authorization'];
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  /**
   * Check if user has specific role
   * This function considers manager as admin
   */
  const hasRole = (roleToCheck) => {
    if (!user) return false;
    
    // Handle the special case where managers are treated as admins
    if (roleToCheck === 'admin' && user.role === 'manager') {
      return true;
    }
    
    // Use effectiveRole if available, otherwise fall back to role
    return (user.effectiveRole || user.role) === roleToCheck;
  };

  /**
   * Check if user has specific permission
   */
  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  /**
   * Check if user has any of the permissions in the list
   */
  const hasAnyPermission = (permissionList) => {
    return permissionList.some(permission => permissions.includes(permission));
  };

  /**
   * Update user profile
   */
  const updateProfile = async (formData) => {
    try {
      const response = await axios.put(`${API_URL}/api/profile`, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setUser(response.data.profile);
        return { success: true, user: response.data.profile };
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
      throw new Error(errorMessage);
    }
  };

  /**
   * Change user password
   */
  const changePassword = async (passwordData) => {
    try {
      const response = await axios.post(`${API_URL}/api/profile/change-password`, passwordData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to change password');
      }
        } catch (error) {
          handleApiError(error, 'Failed to change password');
          throw new Error(error.response?.data?.message || error.message || 'Failed to change password');
        }
  };

  /**
   * Upload profile image
   */
  const uploadProfileImage = async (imageData) => {
    try {
      const response = await axios.post(`${API_URL}/api/profile/upload-avatar`, imageData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setUser(response.data.profile);
        return { success: true, user: response.data.profile };
      } else {
        throw new Error(response.data.message || 'Failed to upload profile image');
      }
    } catch (error) {
      console.error('Profile image upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload profile image';
      throw new Error(errorMessage);
    }
  };

  // Provide authentication context values
  const value = {
    user,
    token,
    loading,
    authError,
    permissions,
    login,
    register,
    logout,
    loginWithToken,
    isAuthenticated,
    hasRole,
    hasPermission,
    hasAnyPermission,
    updateProfile,
    changePassword,
    uploadProfileImage,
    setUser,
    setToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

