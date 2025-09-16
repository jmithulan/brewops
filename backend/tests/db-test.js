import { db } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

// Simple test to check database connection and users table existence
async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test connection to the database
    const connection = await db.getConnection();
    console.log('✅ Database connection successful');
    connection.release();
    
    // Check if users table exists
    console.log('Checking for users table...');
    const [tables] = await db.query('SHOW TABLES LIKE "users"');
    
    if (tables.length > 0) {
      console.log('✅ Users table exists');
      
      // Check table structure
      const [columns] = await db.query('DESCRIBE users');
      console.log('Users table columns:');
      columns.forEach(col => {
        console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'}`);
      });
      
      // Check if there are any users in the database
      const [users] = await db.query('SELECT COUNT(*) as count FROM users');
      console.log(`Total users in database: ${users[0].count}`);
      
      if (users[0].count === 0) {
        console.log('⚠️ Warning: No users found in the users table');
        console.log('Consider creating a default admin user for testing');
      } else {
        // Get sample user (without password)
        const [sampleUser] = await db.query('SELECT id, name, email, role FROM users LIMIT 1');
        console.log('Sample user:', sampleUser[0]);
      }
    } else {
      console.error('❌ Users table does not exist!');
      console.log('This is likely causing the login issues');
      
      // Create users table with basic schema if it doesn't exist
      console.log('Would you like to create the users table? (Y/n)');
      process.stdout.write('> ');
      process.stdin.on('data', async (data) => {
        const input = data.toString().trim().toLowerCase();
        if (input === 'y' || input === '') {
          try {
            await createUsersTable();
            await createAdminUser();
            process.exit(0);
          } catch (error) {
            console.error('Error creating table:', error);
            process.exit(1);
          }
        } else {
          console.log('Exiting without creating table');
          process.exit(0);
        }
      });
    }
  } catch (error) {
    console.error('Database test failed:', error);
    process.exit(1);
  }
}

async function createUsersTable() {
  console.log('Creating users table...');
  
  const createTableSQL = `
    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'manager', 'staff', 'supplier') NOT NULL DEFAULT 'staff',
      phone VARCHAR(20),
      employee_id VARCHAR(50) UNIQUE,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      token_version INT NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      last_login TIMESTAMP NULL
    );
  `;
  
  await db.query(createTableSQL);
  console.log('✅ Users table created successfully');
}

async function createAdminUser() {
  console.log('Creating default admin user...');
  
  const bcrypt = await import('bcryptjs');
  const defaultPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 12);
  
  const insertUserSQL = `
    INSERT INTO users (name, email, password_hash, role, is_active)
    VALUES (?, ?, ?, ?, ?);
  `;
  
  await db.query(insertUserSQL, ['Admin User', 'admin@brewops.com', hashedPassword, 'admin', true]);
  
  console.log('✅ Default admin user created:');
  console.log('   Email: admin@brewops.com');
  console.log('   Password: admin123');
  console.log('   🔴 Please change this password after logging in!');
}

testDatabaseConnection();