import { db } from "../config/db.js";
import dotenv from 'dotenv';

dotenv.config();

/**
 * This script tests if the Google OAuth configuration is working correctly
 */
async function testGoogleOAuth() {
  console.log("Testing Google OAuth configuration...");
  
  // Test 1: Check if environment variables are set
  console.log("\n==== Testing Environment Variables ====");
  const requiredVars = [
    'GOOGLE_CLIENT_ID', 
    'GOOGLE_CLIENT_SECRET', 
    'GOOGLE_REDIRECT_URI'
  ];
  
  let missingVars = [];
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
      console.log(`❌ ${varName} is not set`);
    } else {
      console.log(`✅ ${varName} is set: ${process.env[varName].substring(0, 10)}...`);
    }
  });
  
  if (missingVars.length > 0) {
    console.log(`\nMissing environment variables: ${missingVars.join(', ')}`);
    console.log("Please add them to your .env file");
  } else {
    console.log("\nAll required environment variables are set");
  }
  
  // Test 2: Check if the database has the required columns
  console.log("\n==== Testing Database Schema ====");
  try {
    // Connect to database
    const connection = await db.getConnection();
    
    // Check if the users table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      console.log("❌ users table does not exist");
      connection.release();
      return;
    }
    
    console.log("✅ users table exists");
    
    // Check for Google OAuth columns
    const [columns] = await connection.execute("DESCRIBE users");
    
    // Create a map of column names
    const columnMap = columns.reduce((map, col) => {
      map[col.Field] = true;
      return map;
    }, {});
    
    // Check for required columns
    const requiredColumns = ['google_id', 'profile_image', 'token_version', 'is_active', 'last_login'];
    const missingColumns = [];
    
    requiredColumns.forEach(column => {
      if (columnMap[column]) {
        console.log(`✅ Column ${column} exists`);
      } else {
        console.log(`❌ Column ${column} is missing`);
        missingColumns.push(column);
      }
    });
    
    if (missingColumns.length > 0) {
      console.log(`\nMissing columns: ${missingColumns.join(', ')}`);
      console.log("You should run the OAuth migration script: run_oauth_migration.sh");
    } else {
      console.log("\nAll required columns exist in the users table");
    }
    
    connection.release();
  } catch (err) {
    console.error("Database error:", err.message);
  }
  
  // Test 3: Check if the backend server is running
  console.log("\n==== Testing Backend Connectivity ====");
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4323';
  
  try {
    const response = await fetch(`${backendUrl}/api/health`);
    if (response.ok) {
      console.log(`✅ Backend server is running at ${backendUrl}`);
      const data = await response.json();
      console.log(`   Server version: ${data.version}`);
      console.log(`   Server timestamp: ${data.timestamp}`);
    } else {
      console.log(`❌ Backend server at ${backendUrl} returned status ${response.status}`);
    }
  } catch (err) {
    console.log(`❌ Could not connect to backend at ${backendUrl}`);
    console.log(`   Error: ${err.message}`);
    console.log("   Make sure the server is running");
  }
  
  console.log("\n==== Google OAuth Configuration Test Complete ====");
}

// Run the test
testGoogleOAuth().catch(console.error);