import api from './api';

export const paymentService = {
  // Get all payments
  getPayments: async () => {
    try {
      const response = await api.get('/api/payments');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get payment by ID
  getPaymentById: async (id) => {
    try {
      const response = await api.get(`/api/payments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new payment
  createPayment: async (paymentData) => {
    try {
      const response = await api.post('/api/payments', paymentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update payment
  updatePayment: async (id, paymentData) => {
    try {
      const response = await api.put(`/api/payments/${id}`, paymentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete payment
  deletePayment: async (id) => {
    try {
      const response = await api.delete(`/api/payments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get payments by supplier
  getPaymentsBySupplier: async (supplierId) => {
    try {
      const response = await api.get(`/api/payments/supplier/${supplierId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get payment summary
  getPaymentSummary: async () => {
    try {
      const response = await api.get('/api/payments/summary');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};


