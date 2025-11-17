-- Get all leads with pagination
-- name: GetAllLeads
SELECT l.*, u.full_name as assigned_to_name
FROM leads l
LEFT JOIN users u ON l.assigned_to = u.id
ORDER BY l.created_at DESC
LIMIT $1 OFFSET $2;

-- Get lead by ID
-- name: GetLeadById
SELECT l.*, u.full_name as assigned_to_name
FROM leads l
LEFT JOIN users u ON l.assigned_to = u.id
WHERE l.id = $1;

-- Get lead by customer_id
-- name: GetLeadByCustomerId
SELECT l.*, u.full_name as assigned_to_name
FROM leads l
LEFT JOIN users u ON l.assigned_to = u.id
WHERE l.customer_id = $1;

-- Create lead
-- name: CreateLead
INSERT INTO leads (
  customer_id, age, job, marital, education, default_credit, balance,
  housing_loan, personal_loan, contact_type, day_of_month, month,
  duration, campaign, pdays, previous, poutcome, assigned_to, status, notes
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
RETURNING *;

-- Update lead
-- name: UpdateLead
UPDATE leads
SET age = COALESCE($2, age),
    job = COALESCE($3, job),
    marital = COALESCE($4, marital),
    education = COALESCE($5, education),
    default_credit = COALESCE($6, default_credit),
    balance = COALESCE($7, balance),
    housing_loan = COALESCE($8, housing_loan),
    personal_loan = COALESCE($9, personal_loan),
    contact_type = COALESCE($10, contact_type),
    day_of_month = COALESCE($11, day_of_month),
    month = COALESCE($12, month),
    duration = COALESCE($13, duration),
    campaign = COALESCE($14, campaign),
    pdays = COALESCE($15, pdays),
    previous = COALESCE($16, previous),
    poutcome = COALESCE($17, poutcome),
    assigned_to = COALESCE($18, assigned_to),
    status = COALESCE($19, status),
    notes = COALESCE($20, notes),
    updated_at = current_timestamp
WHERE id = $1
RETURNING *;

-- Delete lead
-- name: DeleteLead
DELETE FROM leads WHERE id = $1;

-- Get leads by status
-- name: GetLeadsByStatus
SELECT l.*, u.full_name as assigned_to_name
FROM leads l
LEFT JOIN users u ON l.assigned_to = u.id
WHERE l.status = $1
ORDER BY l.created_at DESC
LIMIT $2 OFFSET $3;

-- Get leads assigned to user
-- name: GetLeadsByAssignedUser
SELECT l.*, u.full_name as assigned_to_name
FROM leads l
LEFT JOIN users u ON l.assigned_to = u.id
WHERE l.assigned_to = $1
ORDER BY l.created_at DESC
LIMIT $2 OFFSET $3;

-- Count total leads
-- name: CountLeads
SELECT COUNT(*) as total FROM leads;

