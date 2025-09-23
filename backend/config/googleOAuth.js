import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { db } from '../config/db.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Configure Google OAuth Strategy
const setupGoogleOAuth = () => {
  // Log OAuth configuration for debugging
  console.log("Google OAuth Configuration:");
  console.log(`- Client ID: ${process.env.GOOGLE_CLIENT_ID ? "✓ Set" : "❌ Not Set"}`);
  console.log(`- Client Secret: ${process.env.GOOGLE_CLIENT_SECRET ? "✓ Set" : "❌ Not Set"}`);
  console.log(`- Redirect URI: ${process.env.GOOGLE_REDIRECT_URI || "❌ Not Set"}`);

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI,
    scope: ['profile', 'email'],
    proxy: true // Enable proxy for proper handling of callback URLs behind proxies/load balancers
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log("Google OAuth callback received for profile:", profile.id);
      console.log("Profile data:", JSON.stringify(profile, null, 2));
      
      // First check if the user exists by Google ID
      let user = await User.findByGoogleId(profile.id);
      
      if (user) {
        // User already exists with this Google ID, return the user
        console.log("User found by Google ID:", user.id);
        return done(null, user);
      }
      
      // If not found by Google ID, check by email
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      if (!email) {
        console.error("Google profile does not contain an email address");
        return done(new Error("Google profile missing email address"), null);
      }
      
      user = await User.findByEmail(email);
      
      if (user) {
        // User exists with this email, update with Google ID
        console.log("User found by email, updating with Google ID:", user.id);
        
        try {
          // Try to update with Google ID and profile image
          // Check if the columns exist before updating
          const [tableInfo] = await db.execute("DESCRIBE users");
          const columns = tableInfo.map(col => col.Field);
          
          // Build dynamic update query based on available columns
          const updateFields = [];
          const updateValues = [];
          
          if (columns.includes('google_id')) {
            updateFields.push('google_id = ?');
            updateValues.push(profile.id);
          }
          
          if (columns.includes('profile_image') && profile.photos && profile.photos[0]) {
            updateFields.push('profile_image = ?');
            updateValues.push(profile.photos[0].value);
          }
          
          if (columns.includes('last_login')) {
            updateFields.push('last_login = NOW()');
          }
          
          if (updateFields.length > 0) {
            // Add the user ID as the last parameter
            updateValues.push(user.id);
            
            // Check that all update values are defined
            const hasUndefined = updateValues.some(val => val === undefined);
            if (hasUndefined) {
              console.warn("Skipping update due to undefined values:", updateValues);
            } else {
              await db.execute(
                `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, 
                updateValues
              );
            }
          }
          
          // Get updated user
          const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [user.id]);
          return done(null, rows[0] || user); // Fallback to original user if query fails
        } catch (updateError) {
          console.warn("Could not update user with Google ID:", updateError.message);
          // Continue with original user even if update fails
          return done(null, user);
        }
      }
      
      console.log("Creating new user for Google account:", email);
      
      // User doesn't exist, create a new user
      // Generate a random password for the user (they can change it later if needed)
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      
      // Create new user
      const newUser = await User.create({
        name: profile.displayName,
        email: email,
        password: randomPassword, // This will be hashed by the create method
        role: 'staff', // Default role for OAuth users
        google_id: profile.id,
        profile_image: profile.photos?.[0]?.value || null
      });

      return done(null, newUser);
    } catch (error) {
      console.error('Google OAuth Error:', error);
      return done(error, null);
    }
  }));

  // Serialize user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  return passport;
};

export default setupGoogleOAuth;