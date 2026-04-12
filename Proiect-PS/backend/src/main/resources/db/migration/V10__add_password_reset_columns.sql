ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token_expiry TIMESTAMP;
