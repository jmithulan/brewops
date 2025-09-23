-- Add notification_settings column to users table
ALTER TABLE users
ADD COLUMN notification_settings TEXT NULL AFTER profile_image;

-- Add index for better performance
CREATE INDEX idx_users_notification_settings ON users(notification_settings(100));
