import bcrypt from "bcryptjs";
import { db } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

async function setUserPassword() {
  try {
    const email = 'praveenasiva055@gmail.com';
    const newPassword = 'Prave&31'; // Change this to your desired password
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update user password
    const [result] = await db.execute(
      "UPDATE users SET password_hash = ? WHERE email = ?",
      [hashedPassword, email]
    );
    
    if (result.affectedRows > 0) {
      console.log(`✅ Password set successfully for user: ${email}`);
      console.log(`🔑 New password: ${newPassword}`);
      console.log("You can now login with this email and password");
    } else {
      console.log("❌ User not found");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error setting password:", error);
    process.exit(1);
  }
}

setUserPassword();