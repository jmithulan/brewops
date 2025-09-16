import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

// Generic API functions to eliminate duplication

export const apiHelpers = {
  // Generic GET request
  async get(url, options = {}) {
    try {
      const response = await api.get(url, options);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  },

  // Generic POST request
  async post(url, data, options = {}) {
    try {
      const response = await api.post(url, data, options);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  },

  // Generic PUT request
  async put(url, data, options = {}) {
    try {
      const response = await api.put(url, data, options);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  },

  // Generic DELETE request
  async delete(url, options = {}) {
    try {
      const response = await api.delete(url, options);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  },

  // Error handling
  handleError(error) {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    // Don't show toast for 401 errors (handled by interceptor)
    if (error.response?.status !== 401) {
      toast.error(message);
    }
    
    return { 
      success: false, 
      error: message,
      status: error.response?.status 
    };
  }
};

// Specific API functions for common operations
export const commonApi = {
  // User management
  users: {
    getAll: () => apiHelpers.get('/users'),
    getById: (id) => apiHelpers.get(`/users/${id}`),
    create: (userData) => apiHelpers.post('/users/register', userData),
    update: (id, userData) => apiHelpers.put(`/users/${id}`, userData),
    delete: (id) => apiHelpers.delete(`/users/${id}`),
  },

  // Supplier management
  suppliers: {
    getAll: () => apiHelpers.get('/suppliers'),
    getById: (id) => apiHelpers.get(`/suppliers/${id}`),
    create: (supplierData) => apiHelpers.post('/suppliers', supplierData),
    update: (id, supplierData) => apiHelpers.put(`/suppliers/${id}`, supplierData),
    delete: (id) => apiHelpers.delete(`/suppliers/${id}`),
    search: (query) => apiHelpers.get(`/suppliers/search?q=${encodeURIComponent(query)}`),
  },

  // Delivery management
  deliveries: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiHelpers.get(`/deliveries${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => apiHelpers.get(`/deliveries/${id}`),
    create: (deliveryData) => apiHelpers.post('/deliveries', deliveryData),
    update: (id, deliveryData) => apiHelpers.put(`/deliveries/${id}`, deliveryData),
    delete: (id) => apiHelpers.delete(`/deliveries/${id}`),
  },

  // Inventory management
  inventory: {
    getAll: () => apiHelpers.get('/inventory'),
    getById: (id) => apiHelpers.get(`/inventory/${id}`),
    create: (inventoryData) => apiHelpers.post('/inventory', inventoryData),
    update: (id, inventoryData) => apiHelpers.put(`/inventory/${id}`, inventoryData),
    delete: (id) => apiHelpers.delete(`/inventory/${id}`),
    generateId: () => apiHelpers.get('/inventory/generate-inventory-id'),
  },

  // Payment management
  payments: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiHelpers.get(`/payments${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => apiHelpers.get(`/payments/${id}`),
    create: (paymentData) => apiHelpers.post('/payments', paymentData),
    update: (id, paymentData) => apiHelpers.put(`/payments/${id}`, paymentData),
    delete: (id) => apiHelpers.delete(`/payments/${id}`),
  },
};

// Custom hook for API calls with loading states
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (apiCall) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, execute };
};

// Custom hook for CRUD operations
export const useCrud = (apiEndpoint) => {
  const { loading, error, execute } = useApi();
  const [items, setItems] = useState([]);
  const [item, setItem] = useState(null);

  const fetchAll = async (params = {}) => {
    const result = await execute(() => apiHelpers.get(`${apiEndpoint}${params ? `?${new URLSearchParams(params).toString()}` : ''}`));
    if (result.success) {
      setItems(result.data);
    }
    return result;
  };

  const fetchById = async (id) => {
    const result = await execute(() => apiHelpers.get(`${apiEndpoint}/${id}`));
    if (result.success) {
      setItem(result.data);
    }
    return result;
  };

  const create = async (data) => {
    const result = await execute(() => apiHelpers.post(apiEndpoint, data));
    if (result.success) {
      setItems(prev => [...prev, result.data]);
    }
    return result;
  };

  const update = async (id, data) => {
    const result = await execute(() => apiHelpers.put(`${apiEndpoint}/${id}`, data));
    if (result.success) {
      setItems(prev => prev.map(item => item.id === id ? result.data : item));
      setItem(result.data);
    }
    return result;
  };

  const remove = async (id) => {
    const result = await execute(() => apiHelpers.delete(`${apiEndpoint}/${id}`));
    if (result.success) {
      setItems(prev => prev.filter(item => item.id !== id));
      if (item && item.id === id) {
        setItem(null);
      }
    }
    return result;
  };

  return {
    loading,
    error,
    items,
    item,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    setItems,
    setItem,
  };
};
