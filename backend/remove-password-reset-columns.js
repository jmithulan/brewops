import { db } from './config/db.js';

async function removePasswordResetColumns() {
  try {
    console.log("Removing password reset columns from users table...");
    
    // Check current table structure
    const [columns] = await db.execute("DESCRIBE users");
    const columnNames = columns.map(col => col.Field);
    
    console.log("Current columns:", columnNames);
    
    // Remove reset_token column if it exists
    if (columnNames.includes('reset_token')) {
      await db.execute(`ALTER TABLE users DROP COLUMN reset_token`);
      console.log("✅ Removed reset_token column");
    } else {
      console.log("ℹ️ reset_token column doesn't exist");
    }
    
    // Remove reset_token_expires column if it exists
    if (columnNames.includes('reset_token_expires')) {
      await db.execute(`ALTER TABLE users DROP COLUMN reset_token_expires`);
      console.log("✅ Removed reset_token_expires column");
    } else {
      console.log("ℹ️ reset_token_expires column doesn't exist");
    }
    
    // Remove index if it exists
    try {
      await db.execute(`DROP INDEX idx_reset_token ON users`);
      console.log("✅ Removed index on reset_token");
    } catch (error) {
      if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log("ℹ️ Index on reset_token doesn't exist");
      } else {
        console.log("ℹ️ Index removal skipped:", error.message);
      }
    }
    
    console.log("✅ Password reset columns removal completed successfully");
    
  } catch (error) {
    console.error("Error removing password reset columns:", error);
    process.exit(1);
  }
}

removePasswordResetColumns();