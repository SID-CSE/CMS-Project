-- MANUAL MIGRATION ONLY.
-- Run only after a full backup and after confirming the target database is the intended Contify database.
-- This migration is additive: it does not update or delete existing users or application rows.

SET @users_email_verified_exists := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'users'
      AND column_name = 'email_verified'
);
SET @sql := IF(
    @users_email_verified_exists = 0,
    'ALTER TABLE users ADD COLUMN email_verified BOOLEAN NULL',
    'SELECT 1'
);
PREPARE add_email_verified FROM @sql;
EXECUTE add_email_verified;
DEALLOCATE PREPARE add_email_verified;

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_email_verification_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_email_verification_user ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_expiry ON email_verification_tokens(expires_at);
