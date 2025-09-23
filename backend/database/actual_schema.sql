-- BrewOps Database Schema - Actual Database Structure
-- This file contains the actual database structure from the existing database

-- Users table (matches existing structure)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('supplier','manager','staff') NOT NULL,
  phone VARCHAR(15) DEFAULT NULL,
  employee_id VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers table (matches existing structure)
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  contact_number VARCHAR(20) DEFAULT NULL,
  nic_number VARCHAR(15) DEFAULT NULL UNIQUE,
  address TEXT,
  bank_account_number VARCHAR(30) DEFAULT NULL,
  bank_name VARCHAR(100) DEFAULT NULL,
  rate DECIMAL(10,2) NOT NULL DEFAULT 150.00,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Deliveries table (matches existing structure)
CREATE TABLE IF NOT EXISTS deliveries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id INT NOT NULL,
  delivery_date DATE NOT NULL DEFAULT (CURDATE()),
  quantity DECIMAL(10,2) NOT NULL,
  rate_per_kg DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('monthly','spot') DEFAULT 'monthly',
  notes TEXT,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

-- Payments table (matches existing structure)
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id INT NOT NULL,
  payment_type ENUM('monthly','spot-cash') NOT NULL,
  payment_month VARCHAR(7) DEFAULT NULL COMMENT 'Format: YYYY-MM for monthly payments',
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATETIME NOT NULL,
  payment_method ENUM('Cash','Bank Transfer','Cheque') NOT NULL DEFAULT 'Bank Transfer',
  status ENUM('pending','paid','cancelled') NOT NULL DEFAULT 'pending',
  reference_number VARCHAR(100) DEFAULT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

-- Inventory table (matches existing structure)
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inventoryid VARCHAR(100) NOT NULL UNIQUE,
  quantity INT NOT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Messages table (matches existing structure)
CREATE TABLE IF NOT EXISTS messages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  message TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  read_status TINYINT(1) DEFAULT 0
);

-- Employee table (matches existing structure)
CREATE TABLE IF NOT EXISTS employee (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  avatar VARCHAR(10) DEFAULT NULL,
  role VARCHAR(100) DEFAULT NULL,
  department VARCHAR(100) DEFAULT NULL,
  employee_id VARCHAR(20) DEFAULT NULL UNIQUE,
  join_date DATE DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  address VARCHAR(255) DEFAULT NULL,
  status ENUM('active','inactive') DEFAULT 'active',
  last_login DATETIME DEFAULT NULL,
  language VARCHAR(50) DEFAULT NULL,
  timezone VARCHAR(50) DEFAULT NULL,
  theme VARCHAR(20) DEFAULT NULL,
  notifications JSON DEFAULT NULL,
  privacy JSON DEFAULT NULL,
  display JSON DEFAULT NULL,
  years_of_service INT DEFAULT NULL,
  team_size INT DEFAULT NULL,
  production_target_achievement DECIMAL(5,2) DEFAULT NULL,
  quality_rating DECIMAL(3,1) DEFAULT NULL,
  attendance_rate DECIMAL(5,2) DEFAULT NULL,
  permissions JSON DEFAULT NULL
);

-- Employees table (matches existing structure)
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role ENUM('supplier','manager','staff') NOT NULL,
  employee_id VARCHAR(100) NOT NULL UNIQUE
);

-- Insert sample data to match existing database
INSERT IGNORE INTO users (name, email, password_hash, role, phone, employee_id) VALUES
('Sherin Perera', 'sherin@gmail.com', '$2b$10$StXn4zhzca6w/UTa51XA6OCcqL0vZ2VQnZsraaSUk/oUQnI8JmQX6', 'supplier', '0712128456', 'SUP123'),
('Sachin', 'sachin@gmail.com', '$2b$10$PHI/ashDSHwEjwkF3yGHcOgt4uw0vOoafgh0nsCW6LKr4jdkd8okm', 'manager', '0714228754', 'MAN456'),
('Kalpani', 'kalpani@gmail.com', '$2b$10$T15dUDBpGCR9uLUj2zVkGOOe0ri2VFR3pbVBoCzZ9fniKt2LpTkVW', 'staff', '0712345670', 'STF789'),
('Muthumali', 'muthumali@gmail.com', '$2b$10$LPFwLxA63EHXpeiKREsEsuROC12qBTJFNMifPtxEgGCuyP4x0BI4G', 'manager', '0714228778', 'MAN457'),
('Sherin Perera', 'smperera574@gmail.com', '$2b$10$YqDLzAu34UZ.UKfJf6ClHeCpIExbcBjll9kagwm2KS883Ix9pKAw2', 'staff', '0712345678', 'STF791');

INSERT IGNORE INTO suppliers (supplier_id, name, contact_number, nic_number, address, bank_account_number, bank_name, rate, is_active) VALUES
('SUP00001', 'Charles Perera', '3456413135', '542718541723', 'Pinkella Road, Hirana\n152/1', '548794', 'Commercial', 150.00, 0),
('SUP00002', 'Sherin Perera', '5646123264', '459879465456', 'Pinkella Road, Hirana\n152/1', '548794', 'BOC', 150.00, 0),
('SUP00003', 'Sachin', '0715689723', '233712368234', 'Pinkella Road, Hirana\n152/1', '32456212', 'BOC', 150.00, 0),
('SUP00004', 'Sherin Perera', '0715689723', '233712362001', 'Pinkella Road, Hirana\n152/1', '32456212', 'Commercial', 150.00, 1),
('SUP00005', 'Sachin Ranaweera', '0715689723', '459879465413', 'Pinkella Road, Hirana\n152/1', '4655651', 'Commercial', 150.00, 1);

INSERT IGNORE INTO deliveries (supplier_id, delivery_date, quantity, rate_per_kg, total_amount, payment_method, notes) VALUES
(1, '2025-09-01', 150.50, 120.00, 18060.00, 'monthly', 'Good quality tea leaves from morning harvest'),
(2, '2025-09-02', 200.75, 115.00, 23086.25, 'monthly', 'Premium grade tea leaves'),
(3, '2025-09-03', 175.25, 120.00, 21030.00, 'spot', 'Express delivery requested'),
(4, '2025-09-04', 300.00, 110.00, 33000.00, 'monthly', 'Bulk delivery from estate'),
(5, '2025-09-05', 125.80, 115.00, 14467.00, 'spot', 'Small batch, high quality');

INSERT IGNORE INTO employees (role, employee_id) VALUES
('supplier', 'SUP123'),
('supplier', 'SUP124'),
('supplier', 'SUP125'),
('manager', 'MAN456'),
('manager', 'MAN457'),
('manager', 'MAN458'),
('staff', 'STF789'),
('staff', 'STF790'),
('staff', 'STF791');

-- Tea Quality table
CREATE TABLE IF NOT EXISTS tea_quality (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quality_name VARCHAR(100) NOT NULL,
  description TEXT,
  price_per_kg DECIMAL(10,2) NOT NULL,
  min_weight DECIMAL(10,2) DEFAULT 0,
  max_weight DECIMAL(10,2) DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Production Process table
CREATE TABLE IF NOT EXISTS production_process (
  id INT AUTO_INCREMENT PRIMARY KEY,
  process_name VARCHAR(100) NOT NULL,
  description TEXT,
  estimated_duration_hours DECIMAL(5,2),
  required_temperature DECIMAL(5,2),
  required_humidity DECIMAL(5,2),
  quality_standards JSON,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Raw Material Requests table
CREATE TABLE IF NOT EXISTS raw_material_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_number VARCHAR(50) NOT NULL UNIQUE,
  requested_by INT NOT NULL,
  quality_id INT NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  required_date DATE NOT NULL,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  status ENUM('pending', 'approved', 'rejected', 'fulfilled') DEFAULT 'pending',
  approved_by INT DEFAULT NULL,
  approved_at TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (quality_id) REFERENCES tea_quality(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Production Batches table
CREATE TABLE IF NOT EXISTS production_batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_number VARCHAR(50) NOT NULL UNIQUE,
  raw_tea_id INT NOT NULL,
  process_id INT NOT NULL,
  scheduled_date DATE NOT NULL,
  actual_start_date DATETIME NULL,
  actual_end_date DATETIME NULL,
  input_weight_kg DECIMAL(10,2) NOT NULL,
  output_weight DECIMAL(10,2) DEFAULT NULL,
  output_quality VARCHAR(100) DEFAULT NULL,
  efficiency DECIMAL(5,2) DEFAULT NULL COMMENT 'Percentage efficiency',
  status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
  created_by INT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (raw_tea_id) REFERENCES raw_tea_leaves(id) ON DELETE CASCADE,
  FOREIGN KEY (process_id) REFERENCES production_process(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
  recipient_id INT DEFAULT NULL,
  recipient_role ENUM('supplier', 'manager', 'staff') DEFAULT NULL,
  metadata JSON DEFAULT NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample tea qualities
INSERT IGNORE INTO tea_quality (quality_name, description, price_per_kg, min_weight, max_weight) VALUES
('Premium Green Tea', 'Highest quality green tea leaves', 180.00, 10.00, 1000.00),
('Standard Green Tea', 'Good quality green tea leaves', 150.00, 10.00, 1000.00),
('Premium Black Tea', 'Highest quality black tea leaves', 200.00, 10.00, 1000.00),
('Standard Black Tea', 'Good quality black tea leaves', 170.00, 10.00, 1000.00),
('Oolong Tea', 'Traditional oolong tea leaves', 220.00, 10.00, 1000.00),
('White Tea', 'Premium white tea leaves', 250.00, 5.00, 500.00);

-- Insert sample production processes
INSERT IGNORE INTO production_process (process_name, description, estimated_duration_hours, required_temperature, required_humidity) VALUES
('Withering', 'Traditional withering process for tea leaves', 18.00, 25.00, 70.00),
('Rolling', 'Mechanical rolling to break cell walls', 2.00, 30.00, 60.00),
('Oxidation', 'Controlled oxidation process', 4.00, 25.00, 80.00),
('Drying', 'Final drying to reduce moisture', 1.00, 80.00, 20.00),
('Sorting', 'Quality sorting and grading', 0.50, 20.00, 50.00),
('Packaging', 'Final packaging for storage', 0.25, 20.00, 40.00);


