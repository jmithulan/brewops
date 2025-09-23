import api from "./api";

export const inventoryService = {
  // Get all inventories
  getInventories: async (config = {}) => {
    try {
      const response = await api.get("/inventory", config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get inventory by ID
  getInventoryById: async (id) => {
    try {
      const response = await api.get(`/inventory/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new inventory
  createInventory: async (inventoryData) => {
    try {
      const response = await api.post("/inventorY", inventoryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update inventory
  updateInventory: async (id, inventoryData) => {
    try {
      const response = await api.put(`/inventory/${id}`, inventoryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete inventory
  deleteInventory: async (id) => {
    try {
      const response = await api.delete(`/inventory/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search inventories
  searchInventories: async (searchTerm) => {
    try {
      const response = await api.get(`/inventory/search?q=${searchTerm}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Generate inventory ID
  generateInventoryId: async () => {
    try {
      const response = await api.get("/inventory/generate-inventory-id");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
