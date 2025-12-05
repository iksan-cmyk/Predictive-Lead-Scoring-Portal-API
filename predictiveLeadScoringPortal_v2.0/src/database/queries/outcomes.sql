-- Get outcome by lead_id
-- name: GetOutcomeByLeadId
SELECT lo.*, l.customer_id, u.full_name as contacted_by_name
FROM lead_outcomes lo
JOIN leads l ON lo.lead_id = l.id
LEFT JOIN users u ON lo.contacted_by = u.id
WHERE lo.lead_id = $1;

-- Create outcome
-- name: CreateOutcome
INSERT INTO lead_outcomes (lead_id, outcome, contacted, contacted_at, contacted_by, notes)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- Update outcome
-- name: UpdateOutcome
UPDATE lead_outcomes
SET outcome = COALESCE($2, outcome),
    contacted = COALESCE($3, contacted),
    contacted_at = COALESCE($4, contacted_at),
    contacted_by = COALESCE($5, contacted_by),
    notes = COALESCE($6, notes),
    updated_at = current_timestamp
WHERE id = $1
RETURNING *;

-- Get outcomes with pagination
-- name: GetOutcomes
SELECT lo.*, l.customer_id, u.full_name as contacted_by_name
FROM lead_outcomes lo
JOIN leads l ON lo.lead_id = l.id
LEFT JOIN users u ON lo.contacted_by = u.id
ORDER BY lo.created_at DESC
LIMIT $1 OFFSET $2;

-- Get outcomes by outcome type
-- name: GetOutcomesByType
SELECT lo.*, l.customer_id, u.full_name as contacted_by_name
FROM lead_outcomes lo
JOIN leads l ON lo.lead_id = l.id
LEFT JOIN users u ON lo.contacted_by = u.id
WHERE lo.outcome = $1
ORDER BY lo.created_at DESC
LIMIT $2 OFFSET $3;

-- Get outcomes statistics
-- name: GetOutcomesStatistics
SELECT 
  outcome,
  COUNT(*) as count,
  COUNT(CASE WHEN contacted = true THEN 1 END) as contacted_count,
  ROUND(AVG(CASE WHEN contacted = true THEN 1.0 ELSE 0.0 END) * 100, 2) as contact_rate
FROM lead_outcomes
GROUP BY outcome;

