import mysql from "mysql2/promise";

let pool;

// Create connection pool for better performance
const createPool = () => {
  if (!pool) {
    // Check if we're using XAMPP MySQL
    const isXAMPP = process.platform === 'darwin' && process.env.HOME && process.env.HOME.includes('Users');
    
    const poolConfig = {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "brewops_db",
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: "utf8mb4",
      timezone: "+00:00",
    };

    // Use XAMPP socket if available
    if (isXAMPP) {
      poolConfig.socketPath = "/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock";
    }

    pool = mysql.createPool(poolConfig);
  }
  return pool;
};

// Legacy function for backward compatibility
export default async function connectDB() {
  const pool = createPool();
  // Return a connection from the pool
  return await pool.getConnection();
}

// Export the database object with execute and query methods
export const db = {
  execute: async (query, params = []) => {
    const pool = createPool();
    return await pool.execute(query, params);
  },

  query: async (query, params = []) => {
    const pool = createPool();
    return await pool.query(query, params);
  },

  getConnection: async () => {
    const pool = createPool();
    return await pool.getConnection();
  },

  end: async () => {
    if (pool) {
      await pool.end();
      pool = null;
    }
  },
};
