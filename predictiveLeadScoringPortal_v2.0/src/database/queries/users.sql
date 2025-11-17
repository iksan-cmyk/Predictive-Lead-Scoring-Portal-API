-- Get user by username
-- name: GetUserByUsername
SELECT id, username, email, password_hash, full_name, role, is_active, created_at, updated_at
FROM users
WHERE username = $1;

-- Get user by email
-- name: GetUserByEmail
SELECT id, username, email, password_hash, full_name, role, is_active, created_at, updated_at
FROM users
WHERE email = $2;

-- Get user by ID
-- name: GetUserById
SELECT id, username, email, full_name, role, is_active, created_at, updated_at
FROM users
WHERE id = $1;

-- Create user
-- name: CreateUser
INSERT INTO users (username, email, password_hash, full_name, role)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, username, email, full_name, role, is_active, created_at, updated_at;

-- Update user
-- name: UpdateUser
UPDATE users
SET full_name = COALESCE($2, full_name),
    role = COALESCE($3, role),
    is_active = COALESCE($4, is_active),
    updated_at = current_timestamp
WHERE id = $1
RETURNING id, username, email, full_name, role, is_active, created_at, updated_at;

