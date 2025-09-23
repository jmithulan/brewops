import db from './config/db.js';

async function addAddressColumn() {
  try {
    // Check if address column exists
    const [columns] = await db.execute("DESCRIBE users");
    const columnNames = columns.map(col => col.Field);
    
    console.log("Current columns in users table:", columnNames);
    
    if (!columnNames.includes('address')) {
      console.log("Adding address column...");
      await db.execute("ALTER TABLE users ADD COLUMN address TEXT DEFAULT NULL");
      console.log("✅ Address column added successfully");
    } else {
      console.log("✅ Address column already exists");
    }
    
    // Also check for avatar column since we're using it
    if (!columnNames.includes('avatar')) {
      console.log("Adding avatar column...");
      await db.execute("ALTER TABLE users ADD COLUMN avatar VARCHAR(255) DEFAULT NULL");
      console.log("✅ Avatar column added successfully");
    } else {
      console.log("✅ Avatar column already exists");
    }
    
    await db.end();
    console.log("Database connection closed");
    
  } catch (error) {
    console.error("Error:", error);
    await db.end();
    process.exit(1);
  }
}

addAddressColumn();