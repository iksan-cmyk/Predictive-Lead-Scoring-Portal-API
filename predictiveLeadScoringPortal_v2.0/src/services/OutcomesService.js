const pool = require('../database');
const autoBind = require('../utils/autoBind');

class OutcomesService {
  constructor() {
    autoBind(this);
  }

  async createOutcome(outcomeData) {
    const { lead_id, outcome, contacted, contacted_at, contacted_by, notes } = outcomeData;

    const query = `
      INSERT INTO lead_outcomes (lead_id, outcome, contacted, contacted_at, contacted_by, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await pool.query(query, [
      lead_id,
      outcome,
      contacted || false,
      contacted_at || null,
      contacted_by || null,
      notes || null,
    ]);

    return result.rows[0];
  }

  async getOutcomeByLeadId(leadId) {
    const query = `
      SELECT lo.*, l.customer_id, u.full_name as contacted_by_name
      FROM lead_outcomes lo
      JOIN leads l ON lo.lead_id = l.id
      LEFT JOIN users u ON lo.contacted_by = u.id
      WHERE lo.lead_id = $1
    `;
    const result = await pool.query(query, [leadId]);
    return result.rows[0];
  }

  async updateOutcome(id, outcomeData) {
    const { outcome, contacted, contacted_at, contacted_by, notes } = outcomeData;
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (outcome !== undefined) {
      updates.push(`outcome = $${paramCount++}`);
      values.push(outcome);
    }
    if (contacted !== undefined) {
      updates.push(`contacted = $${paramCount++}`);
      values.push(contacted);
    }
    if (contacted_at !== undefined) {
      updates.push(`contacted_at = $${paramCount++}`);
      values.push(contacted_at);
    }
    if (contacted_by !== undefined) {
      updates.push(`contacted_by = $${paramCount++}`);
      values.push(contacted_by);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(notes);
    }

    if (updates.length === 0) {
      const query = 'SELECT * FROM lead_outcomes WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    }

    updates.push('updated_at = current_timestamp');
    values.push(id);

    const query = `
      UPDATE lead_outcomes
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getOutcomes(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT lo.*, l.customer_id, u.full_name as contacted_by_name
      FROM lead_outcomes lo
      JOIN leads l ON lo.lead_id = l.id
      LEFT JOIN users u ON lo.contacted_by = u.id
      ORDER BY lo.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const countQuery = 'SELECT COUNT(*) as total FROM lead_outcomes';

    const [result, countResult] = await Promise.all([
      pool.query(query, [limit, offset]),
      pool.query(countQuery),
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

  async getOutcomesStatistics() {
    const query = `
      SELECT 
        outcome,
        COUNT(*) as count,
        COUNT(CASE WHEN contacted = true THEN 1 END) as contacted_count,
        ROUND(AVG(CASE WHEN contacted = true THEN 1.0 ELSE 0.0 END) * 100, 2) as contact_rate
      FROM lead_outcomes
      GROUP BY outcome
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = new OutcomesService();