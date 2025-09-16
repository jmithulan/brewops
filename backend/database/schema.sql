-- BrewOps Database Schema
-- This file contains all the necessary tables for the tea factory management system

-- Users table (already exists)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'staff', 'supplier') NOT NULL,
  phone VARCHAR(20),
  employee_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Suppliers table (REQ-1: Supplier Management)
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  supplier_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  payment_preferences ENUM('cash', 'bank_transfer', 'check') DEFAULT 'cash',
  bank_details TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tea Leaves Quality table
CREATE TABLE IF NOT EXISTS tea_quality (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quality_name VARCHAR(100) NOT NULL,
  description TEXT,
  price_per_kg DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Supplier Deliveries table (REQ-3: Staff enter supplier details)
CREATE TABLE IF NOT EXISTS supplier_deliveries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id INT NOT NULL,
  staff_id INT NOT NULL,
  delivery_date DATE NOT NULL,
  weight_kg DECIMAL(10,2) NOT NULL,
  quality_id INT NOT NULL,
  price_per_kg DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (quality_id) REFERENCES tea_quality(id) ON DELETE CASCADE
);

-- Payments table (REQ-4: Payment records)
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id INT NOT NULL,
  delivery_id INT,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method ENUM('cash', 'bank_transfer', 'check') NOT NULL,
  reference_number VARCHAR(100),
  notes TEXT,
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
  FOREIGN KEY (delivery_id) REFERENCES supplier_deliveries(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Raw Tea Leaves Inventory (REQ-1: Inventory Management)
CREATE TABLE IF NOT EXISTS raw_tea_leaves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  delivery_id INT,
  quality_id INT NOT NULL,
  weight_kg DECIMAL(10,2) NOT NULL,
  received_date DATE NOT NULL,
  location VARCHAR(100),
  status ENUM('fresh', 'processing', 'processed', 'spoiled') DEFAULT 'fresh',
  notes TEXT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (delivery_id) REFERENCES supplier_deliveries(id) ON DELETE SET NULL,
  FOREIGN KEY (quality_id) REFERENCES tea_quality(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Finished Tea Products
CREATE TABLE IF NOT EXISTS finished_tea_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  product_type ENUM('black_tea', 'green_tea', 'white_tea', 'oolong_tea') NOT NULL,
  grade VARCHAR(50),
  description TEXT,
  price_per_kg DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Production Process table (REQ-2: Finished tea inventory)
CREATE TABLE IF NOT EXISTS production_process (
  id INT AUTO_INCREMENT PRIMARY KEY,
  process_name VARCHAR(255) NOT NULL,
  description TEXT,
  estimated_duration_hours INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Production Batches (REQ-4: Tea processing scheduling)
CREATE TABLE IF NOT EXISTS production_batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_number VARCHAR(50) UNIQUE NOT NULL,
  raw_tea_id INT NOT NULL,
  process_id INT NOT NULL,
  scheduled_date DATE NOT NULL,
  actual_start_date DATETIME,
  actual_end_date DATETIME,
  input_weight_kg DECIMAL(10,2) NOT NULL,
  output_weight_kg DECIMAL(10,2),
  output_quality VARCHAR(100),
  status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
  notes TEXT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (raw_tea_id) REFERENCES raw_tea_leaves(id) ON DELETE CASCADE,
  FOREIGN KEY (process_id) REFERENCES production_process(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Finished Tea Inventory (REQ-2: Finished tea tracking)
CREATE TABLE IF NOT EXISTS finished_tea_inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  quality_grade VARCHAR(50),
  packaging_type VARCHAR(100),
  location VARCHAR(100),
  status ENUM('available', 'reserved', 'sold', 'spoiled') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (batch_id) REFERENCES production_batches(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES finished_tea_products(id) ON DELETE CASCADE
);

-- Raw Material Requests (REQ-3: Production manager requests)
CREATE TABLE IF NOT EXISTS raw_material_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_number VARCHAR(50) UNIQUE NOT NULL,
  requested_by INT NOT NULL,
  quality_id INT NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  required_date DATE NOT NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  status ENUM('pending', 'approved', 'rejected', 'fulfilled') DEFAULT 'pending',
  notes TEXT,
  approved_by INT,
  approved_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (quality_id) REFERENCES tea_quality(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default data
INSERT IGNORE INTO tea_quality (quality_name, description, price_per_kg) VALUES
('Premium Grade', 'Highest quality tea leaves with excellent flavor', 15.00),
('First Grade', 'High quality tea leaves with good flavor', 12.00),
('Second Grade', 'Medium quality tea leaves', 9.00),
('Third Grade', 'Lower quality tea leaves', 6.00);

INSERT IGNORE INTO finished_tea_products (product_name, product_type, grade, description, price_per_kg) VALUES
('Ceylon Black Tea Premium', 'black_tea', 'Premium', 'Premium Ceylon black tea with rich flavor', 25.00),
('Ceylon Green Tea', 'green_tea', 'First', 'Fresh green tea with delicate taste', 22.00),
('Ceylon White Tea', 'white_tea', 'Premium', 'Rare white tea with subtle sweetness', 35.00),
('Ceylon Oolong Tea', 'oolong_tea', 'First', 'Semi-fermented tea with complex flavor', 28.00);

INSERT IGNORE INTO production_process (process_name, description, estimated_duration_hours) VALUES
('Withering', 'Fresh leaves are spread out to reduce moisture content', 12),
('Rolling', 'Leaves are rolled to break cell walls and release juices', 2),
('Fermentation', 'Leaves are left to oxidize for flavor development', 3),
('Drying', 'Leaves are dried to stop fermentation', 1),
('Sorting', 'Tea is sorted by size and quality', 1),
('Packaging', 'Final packaging and labeling', 1);

