import api from './api';

export const supplierService = {
  // Get all suppliers
  getSuppliers: async () => {
    try {
      const response = await api.get('/api/suppliers');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get supplier by ID
  getSupplierById: async (id) => {
    try {
      const response = await api.get(`/api/suppliers/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new supplier
  createSupplier: async (supplierData) => {
    try {
      const response = await api.post('/api/suppliers', supplierData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update supplier
  updateSupplier: async (id, supplierData) => {
    try {
      const response = await api.put(`/api/suppliers/${id}`, supplierData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete supplier
  deleteSupplier: async (id) => {
    try {
      const response = await api.delete(`/api/suppliers/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get supplier records
  getSupplierRecords: async (supplierId) => {
    try {
      const response = await api.get(`/api/suppliers/${supplierId}/records`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create supplier record
  createSupplierRecord: async (recordData) => {
    try {
      const response = await api.post('/api/suppliers/records', recordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update supplier record
  updateSupplierRecord: async (id, recordData) => {
    try {
      const response = await api.put(`/api/suppliers/records/${id}`, recordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete supplier record
  deleteSupplierRecord: async (id) => {
    try {
      const response = await api.delete(`/api/suppliers/records/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};


