const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("Connected to database:", process.env.DB_NAME);

    // Check if inventory table exists
    const [tables] = await connection.execute('SHOW TABLES LIKE "inventory"');
    console.log("Inventory table exists:", tables.length > 0);

    if (tables.length > 0) {
      // Check table structure
      const [structure] = await connection.execute("DESCRIBE inventory");
      console.log("\nTable structure:");
      structure.forEach((col) => console.log(`  ${col.Field}: ${col.Type}`));

      // Check data count
      const [count] = await connection.execute(
        "SELECT COUNT(*) as count FROM inventory"
      );
      console.log(`\nNumber of records: ${count[0].count}`);

      // Show first 5 records if any exist
      if (count[0].count > 0) {
        const [rows] = await connection.execute(
          "SELECT * FROM inventory LIMIT 5"
        );
        console.log("\nSample data:");
        rows.forEach((row, index) => {
          console.log(`Record ${index + 1}:`, row);
        });
      } else {
        console.log("\nNo data found in inventory table");
      }
    } else {
      console.log("\nInventory table does not exist in the database");

      // Show all tables
      const [allTables] = await connection.execute("SHOW TABLES");
      console.log("\nExisting tables:");
      allTables.forEach((table) => console.log(`  ${Object.values(table)[0]}`));
    }

    await connection.end();
  } catch (error) {
    console.error("Database error:", error.message);
  }
})();
