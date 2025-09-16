-- Add Google OAuth columns to users table
ALTER TABLE users
ADD COLUMN google_id VARCHAR(255) NULL AFTER employee_id,
ADD COLUMN profile_image VARCHAR(255) NULL AFTER google_id,
ADD COLUMN token_version INT DEFAULT 1,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN last_login TIMESTAMP NULL;

-- Add index to google_id for faster lookups
CREATE INDEX idx_users_google_id ON users(google_id);