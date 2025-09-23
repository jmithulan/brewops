import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  port: process.env.DB_PORT || 3306,
  socketPath: process.platform === 'darwin' ? "/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock" : undefined
};

async function setupDatabase() {
  let connection;
  
  try {
    // Connect to MySQL server (without database)
    connection = await mysql.createConnection(dbConfig);
    
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS brewops_db`);
    console.log('✅ Database created/verified');
    
    // Switch to the database
    await connection.execute(`USE brewops_db`);
    
    // Create notifications table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        recipient_id INT,
        type VARCHAR(100),
        title VARCHAR(255),
        message TEXT,
        data JSON,
        read BOOLEAN DEFAULT FALSE,
        read_bool BOOLEAN DEFAULT FALSE,
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Notifications table created');
    
    // Create messages table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Messages table created');
    
    // Add missing columns to users table
    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS avatar VARCHAR(255) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS address TEXT DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS status ENUM('active','inactive','pending') DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS token_version INT DEFAULT 1,
      ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `);
    console.log('✅ Users table updated');
    
    // Create supplier_requests table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS supplier_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        supplier_id INT NOT NULL,
        assigned_by INT NOT NULL,
        product VARCHAR(255),
        quantity DECIMAL(10,2),
        status ENUM('assigned','accepted','completed','rejected') DEFAULT 'assigned',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Supplier requests table created');
    
    // Add min_quantity to raw_tea_leaves table
    await connection.execute(`
      ALTER TABLE raw_tea_leaves 
      ADD COLUMN IF NOT EXISTS min_quantity DECIMAL(10,2) DEFAULT 0
    `);
    console.log('✅ Raw tea leaves table updated');
    
    // Create backups table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS backups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Backups table created');
    
    // Update suppliers table to match expected schema
    await connection.execute(`
      ALTER TABLE suppliers 
      ADD COLUMN IF NOT EXISTS supplier_name VARCHAR(255) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS email VARCHAR(255) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS address TEXT DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS payment_preferences ENUM('cash', 'bank_transfer', 'check') DEFAULT 'cash',
      ADD COLUMN IF NOT EXISTS bank_details TEXT DEFAULT NULL
    `);
    console.log('✅ Suppliers table updated');
    
    // Insert default tea qualities if not exist
    await connection.execute(`
      INSERT IGNORE INTO tea_quality (quality_name, description, price_per_kg, min_weight, max_weight) VALUES
      ('Premium Green Tea', 'Highest quality green tea leaves', 180.00, 10.00, 1000.00),
      ('Standard Green Tea', 'Good quality green tea leaves', 150.00, 10.00, 1000.00),
      ('Premium Black Tea', 'Highest quality black tea leaves', 200.00, 10.00, 1000.00),
      ('Standard Black Tea', 'Good quality black tea leaves', 170.00, 10.00, 1000.00),
      ('Oolong Tea', 'Traditional oolong tea leaves', 220.00, 10.00, 1000.00),
      ('White Tea', 'Premium white tea leaves', 250.00, 5.00, 500.00)
    `);
    console.log('✅ Default tea qualities inserted');
    
    // Insert default production processes if not exist
    await connection.execute(`
      INSERT IGNORE INTO production_process (process_name, description, estimated_duration_hours, required_temperature, required_humidity) VALUES
      ('Withering', 'Traditional withering process for tea leaves', 18.00, 25.00, 70.00),
      ('Rolling', 'Mechanical rolling to break cell walls', 2.00, 30.00, 60.00),
      ('Oxidation', 'Controlled oxidation process', 4.00, 25.00, 80.00),
      ('Drying', 'Final drying to reduce moisture', 1.00, 80.00, 20.00),
      ('Sorting', 'Quality sorting and grading', 0.50, 20.00, 50.00),
      ('Packaging', 'Final packaging for storage', 0.25, 20.00, 40.00)
    `);
    console.log('✅ Default production processes inserted');
    
    console.log('\n🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();

