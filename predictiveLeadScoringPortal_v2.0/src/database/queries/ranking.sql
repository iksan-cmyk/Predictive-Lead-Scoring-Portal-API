-- Get leads ranked by score
-- name: GetRankedLeads
SELECT 
  l.*,
  ls.score,
  ls.probability,
  ls.calculated_at as score_calculated_at,
  ROW_NUMBER() OVER (ORDER BY ls.score DESC NULLS LAST, l.created_at DESC) as rank,
  u.full_name as assigned_to_name
FROM leads l
LEFT JOIN lead_scores ls ON l.id = ls.lead_id
LEFT JOIN users u ON l.assigned_to = u.id
WHERE l.status = COALESCE($1, l.status)
ORDER BY ls.score DESC NULLS LAST, l.created_at DESC
LIMIT $2 OFFSET $3;

-- Get top N leads by score
-- name: GetTopLeads
SELECT 
  l.*,
  ls.score,
  ls.probability,
  ls.calculated_at as score_calculated_at,
  ROW_NUMBER() OVER (ORDER BY ls.score DESC) as rank,
  u.full_name as assigned_to_name
FROM leads l
JOIN lead_scores ls ON l.id = ls.lead_id
LEFT JOIN users u ON l.assigned_to = u.id
WHERE l.status = COALESCE($1, l.status)
ORDER BY ls.score DESC
LIMIT $2;

-- Get leads without scores
-- name: GetLeadsWithoutScores
SELECT l.*, u.full_name as assigned_to_name
FROM leads l
LEFT JOIN users u ON l.assigned_to = u.id
LEFT JOIN lead_scores ls ON l.id = ls.lead_id
WHERE ls.id IS NULL
ORDER BY l.created_at DESC
LIMIT $1 OFFSET $2;

-- Get score distribution
-- name: GetScoreDistribution
SELECT 
  CASE 
    WHEN score >= 0.8 THEN 'Very High (0.8-1.0)'
    WHEN score >= 0.6 THEN 'High (0.6-0.8)'
    WHEN score >= 0.4 THEN 'Medium (0.4-0.6)'
    WHEN score >= 0.2 THEN 'Low (0.2-0.4)'
    ELSE 'Very Low (0.0-0.2)'
  END as score_range,
  COUNT(*) as count
FROM lead_scores
GROUP BY score_range
ORDER BY MIN(score) DESC;

