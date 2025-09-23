import api from "./api.js";

// Dashboard service for fetching dashboard data
export const dashboardService = {
  // Get dashboard summary data
  getDashboardData: async () => {
    try {
      // Try to use the dashboard report endpoint first
      const response = await api.get("/reports/dashboard");

      if (response.data.success) {
        return response.data.dashboardData;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch dashboard data"
        );
      }
    } catch (error) {
      console.error("Dashboard API error, trying fallback:", error);

      // Fallback: try to get data from individual endpoints
      try {
        const [suppliersResponse, inventoryResponse] = await Promise.all([
          api.get("/suppliers"),
          api.get("/inventory"),
        ]);

        // Calculate dashboard metrics
        const totalSuppliers = suppliersResponse.data?.length || 0;

        const inventoryData = inventoryResponse.data || [];
        const rawTeaInventory = inventoryData.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        );
        const lowStockItems = inventoryData.filter(
          (item) => item.quantity < 1000
        ).length;

        return {
          totalSuppliers,
          rawTeaInventory,
          lowStockItems,
          activeOrders: 0, // Would need orders endpoint
          monthlyRevenue: 0, // Would need payments endpoint
          productionTarget: 85.6, // This would need a production endpoint
          todayProduction: 2340, // This would need a production endpoint
          weeklyGrowth: 12.5, // This would need historical data calculation
          monthlyLeaves: Math.floor(rawTeaInventory / 10), // Estimated from inventory
          qualityScore: 92, // This would need a quality endpoint
          deliveryRate: 96, // This would need delivery tracking
        };
      } catch (fallbackError) {
        console.error("Fallback API calls also failed:", fallbackError);
        throw error;
      }
    }
  },

  // Get chart data for dashboard
  getChartData: async () => {
    try {
      const [inventoryResponse, suppliersResponse] = await Promise.all([
        api.get("/inventory"),
        api.get("/suppliers"),
      ]);

      const inventoryData = inventoryResponse.data || [];
      const suppliersData = suppliersResponse.data || [];

      // Generate stock data (this would ideally come from historical data)
      const stockData = [
        { name: "Jan", stock: 45000, target: 50000, production: 38000 },
        { name: "Feb", stock: 52000, target: 50000, production: 42000 },
        { name: "Mar", stock: 48000, target: 50000, production: 39000 },
        { name: "Apr", stock: 51000, target: 50000, production: 44000 },
        {
          name: "May",
          stock: inventoryData.reduce(
            (total, item) => total + (item.quantity || 0),
            0
          ),
          target: 50000,
          production: 41000,
        },
      ];

      // Generate supplier distribution data
      const supplierData = suppliersData.slice(0, 4).map((supplier, index) => ({
        name: supplier.name || `Supplier ${index + 1}`,
        value: Math.floor(Math.random() * 30) + 10, // This would need actual delivery percentages
        color: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"][index] || "#6B7280",
      }));

      // Generate production trends (this would need real production data)
      const productionTrends = [
        { time: "00:00", black: 120, green: 85, white: 45, oolong: 30 },
        { time: "04:00", black: 150, green: 92, white: 52, oolong: 38 },
        { time: "08:00", black: 180, green: 110, white: 68, oolong: 45 },
        { time: "12:00", black: 220, green: 135, white: 82, oolong: 55 },
        { time: "16:00", black: 200, green: 128, white: 75, oolong: 50 },
        { time: "20:00", black: 170, green: 105, white: 60, oolong: 42 },
      ];

      return {
        stockData,
        supplierData,
        productionTrends,
      };
    } catch (error) {
      console.error("Error fetching chart data:", error);
      throw error;
    }
  },

  // Get recent activities
  getRecentActivities: async () => {
    try {
      // This would need to be implemented based on available endpoints
      // For now, return mock data that could be replaced with real API calls
      return [
        {
          id: 1,
          action: "Batch PT-2024-045 started",
          user: "John Smith",
          time: "10 mins ago",
          type: "production",
        },
        {
          id: 2,
          action: "Inventory updated: +2500kg Green Tea",
          user: "Sarah Wilson",
          time: "25 mins ago",
          type: "inventory",
        },
        {
          id: 3,
          action: "Quality check completed",
          user: "Mike Chen",
          time: "1 hour ago",
          type: "quality",
        },
        {
          id: 4,
          action: "New supplier onboarded",
          user: "Emma Davis",
          time: "2 hours ago",
          type: "supplier",
        },
      ];
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      throw error;
    }
  },
};

export default dashboardService;
