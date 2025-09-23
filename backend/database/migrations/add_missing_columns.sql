-- Migration: Add missing columns and tables for full BrewOps functionality
-- Run this script to update the database schema

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS status ENUM('active','inactive','pending') DEFAULT 'active',
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS token_version INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update users table to use 'password' instead of 'password_hash' if needed
-- (This is handled in the User model)

-- Create supplier_requests table
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
);

-- Create notifications table (if not exists)
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  type VARCHAR(100),
  title VARCHAR(255),
  message TEXT,
  data JSON,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add min_quantity to inventory table (if exists)
-- Note: The actual table is 'raw_tea_leaves', not 'inventory'
ALTER TABLE raw_tea_leaves 
ADD COLUMN IF NOT EXISTS min_quantity DECIMAL(10,2) DEFAULT 0;

-- Create backups table to track created backups
CREATE TABLE IF NOT EXISTS backups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create uploads directory structure (this will be handled by the application)
-- The application will create /backend/uploads/avatars directory

-- Update suppliers table to match expected schema
ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS supplier_name VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS email VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_preferences ENUM('cash', 'bank_transfer', 'check') DEFAULT 'cash',
ADD COLUMN IF NOT EXISTS bank_details TEXT DEFAULT NULL;

-- Update suppliers table to use correct column names
-- Map existing columns to new schema
UPDATE suppliers SET supplier_name = name WHERE supplier_name IS NULL;
UPDATE suppliers SET contact_person = name WHERE contact_person IS NULL;
UPDATE suppliers SET phone = contact_number WHERE phone IS NULL;

-- Create raw_tea_leaves table if it doesn't exist (it should exist based on schema)
CREATE TABLE IF NOT EXISTS raw_tea_leaves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  delivery_id INT,
  quality_id INT NOT NULL,
  weight_kg DECIMAL(10,2) NOT NULL,
  received_date DATE NOT NULL,
  location VARCHAR(100),
  status ENUM('fresh', 'processing', 'processed', 'spoiled') DEFAULT 'fresh',
  notes TEXT,
  min_quantity DECIMAL(10,2) DEFAULT 0,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE SET NULL,
  FOREIGN KEY (quality_id) REFERENCES tea_quality(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default tea qualities if not exist
INSERT IGNORE INTO tea_quality (quality_name, description, price_per_kg, min_weight, max_weight) VALUES
('Premium Green Tea', 'Highest quality green tea leaves', 180.00, 10.00, 1000.00),
('Standard Green Tea', 'Good quality green tea leaves', 150.00, 10.00, 1000.00),
('Premium Black Tea', 'Highest quality black tea leaves', 200.00, 10.00, 1000.00),
('Standard Black Tea', 'Good quality black tea leaves', 170.00, 10.00, 1000.00),
('Oolong Tea', 'Traditional oolong tea leaves', 220.00, 10.00, 1000.00),
('White Tea', 'Premium white tea leaves', 250.00, 5.00, 500.00);

-- Insert default production processes if not exist
INSERT IGNORE INTO production_process (process_name, description, estimated_duration_hours, required_temperature, required_humidity) VALUES
('Withering', 'Traditional withering process for tea leaves', 18.00, 25.00, 70.00),
('Rolling', 'Mechanical rolling to break cell walls', 2.00, 30.00, 60.00),
('Oxidation', 'Controlled oxidation process', 4.00, 25.00, 80.00),
('Drying', 'Final drying to reduce moisture', 1.00, 80.00, 20.00),
('Sorting', 'Quality sorting and grading', 0.50, 20.00, 50.00),
('Packaging', 'Final packaging for storage', 0.25, 20.00, 40.00);

