-- Get score by lead_id
-- name: GetScoreByLeadId
SELECT ls.*, l.customer_id, l.status as lead_status
FROM lead_scores ls
JOIN leads l ON ls.lead_id = l.id
WHERE ls.lead_id = $1;

-- Create or update score
-- name: UpsertScore
INSERT INTO lead_scores (lead_id, score, probability, model_version, feature_vector)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (lead_id)
DO UPDATE SET
  score = EXCLUDED.score,
  probability = EXCLUDED.probability,
  model_version = EXCLUDED.model_version,
  feature_vector = EXCLUDED.feature_vector,
  calculated_at = current_timestamp,
  updated_at = current_timestamp
RETURNING *;

-- Get scores with pagination
-- name: GetScores
SELECT ls.*, l.customer_id, l.status as lead_status
FROM lead_scores ls
JOIN leads l ON ls.lead_id = l.id
ORDER BY ls.score DESC, ls.calculated_at DESC
LIMIT $1 OFFSET $2;

-- Get scores by date range
-- name: GetScoresByDateRange
SELECT ls.*, l.customer_id, l.status as lead_status
FROM lead_scores ls
JOIN leads l ON ls.lead_id = l.id
WHERE ls.calculated_at BETWEEN $1 AND $2
ORDER BY ls.score DESC
LIMIT $3 OFFSET $4;

