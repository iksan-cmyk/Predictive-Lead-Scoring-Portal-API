const pool = require('../database');
const autoBind = require('../utils/autoBind');

class RankingService {
  constructor() {
    autoBind(this);
  }

  async getRankedLeads(status = null, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const query = `
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
      ${status ? 'WHERE l.status = $3' : ''}
      ORDER BY ls.score DESC NULLS LAST, l.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = status
      ? 'SELECT COUNT(*) as total FROM leads WHERE status = $1'
      : 'SELECT COUNT(*) as total FROM leads';

    const queryParams = status ? [limit, offset, status] : [limit, offset];
    const countParams = status ? [status] : [];

    const [result, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, countParams),
    ]);

    return {
      data: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / limit),
      },
    };
  }

  async getTopLeads(limit = 10, status = null) {
    const query = `
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
      ${status ? 'WHERE l.status = $2' : ''}
      ORDER BY ls.score DESC
      LIMIT $1
    `;

    const queryParams = status ? [limit, status] : [limit];
    const result = await pool.query(query, queryParams);
    return result.rows;
  }

  async getLeadsWithoutScores(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT l.*, u.full_name as assigned_to_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      LEFT JOIN lead_scores ls ON l.id = ls.lead_id
      WHERE ls.id IS NULL
      ORDER BY l.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  async getScoreDistribution() {
    const query = `
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
      ORDER BY MIN(score) DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = new RankingService();