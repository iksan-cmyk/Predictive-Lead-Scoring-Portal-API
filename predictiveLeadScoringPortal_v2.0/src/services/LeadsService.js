const pool = require('../database');
const autoBind = require('../utils/autoBind');

class LeadsService {
  constructor() {
    autoBind(this);
  }

  async getAllLeads(filters = {}) {
    const {
      page = 1,
      limit = 20,
      min_prob,
      max_age,
      job,
      status,
      sort = 'created_desc',
    } = filters;

    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let paramCount = 1;

    // Build WHERE conditions
    if (min_prob !== undefined) {
      conditions.push(`ls.score >= $${paramCount++}`);
      values.push(min_prob);
    }
    if (max_age !== undefined) {
      conditions.push(`l.age <= $${paramCount++}`);
      values.push(max_age);
    }
    if (job) {
      conditions.push(`l.job = $${paramCount++}`);
      values.push(job);
    }
    if (status) {
      conditions.push(`l.status = $${paramCount++}`);
      values.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Build ORDER BY clause
    let orderBy = 'l.created_at DESC';
    switch (sort) {
      case 'probability_desc':
        orderBy = 'ls.score DESC NULLS LAST, l.created_at DESC';
        break;
      case 'probability_asc':
        orderBy = 'ls.score ASC NULLS LAST, l.created_at DESC';
        break;
      case 'age_desc':
        orderBy = 'l.age DESC, l.created_at DESC';
        break;
      case 'age_asc':
        orderBy = 'l.age ASC, l.created_at DESC';
        break;
      case 'created_desc':
        orderBy = 'l.created_at DESC';
        break;
      case 'created_asc':
        orderBy = 'l.created_at ASC';
        break;
    }

    const query = `
      SELECT l.*, ls.score, ls.probability, u.full_name as assigned_to_name
      FROM leads l
      LEFT JOIN lead_scores ls ON l.id = ls.lead_id
      LEFT JOIN users u ON l.assigned_to = u.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramCount++} OFFSET $${paramCount++}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM leads l
      LEFT JOIN lead_scores ls ON l.id = ls.lead_id
      ${whereClause}
    `;

    values.push(limit, offset);
    const countValues = values.slice(0, -2); // Remove limit and offset for count

    const [result, countResult] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, countValues),
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

  async getLeadById(id) {
    const query = `
      SELECT l.*, u.full_name as assigned_to_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async getLeadByCustomerId(customerId) {
    const query = `
      SELECT l.*, u.full_name as assigned_to_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.customer_id = $1
    `;
    const result = await pool.query(query, [customerId]);
    return result.rows[0];
  }

  // Map API field names to database field names
  mapLeadDataToDb(leadData) {
    return {
      customer_id: leadData.customer_id || `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      age: leadData.usia || leadData.age,
      job: leadData.job,
      marital: leadData.marital,
      education: leadData.education,
      default_credit: leadData.default_credit || false,
      balance: leadData.balance || 0,
      housing_loan: leadData.housing !== undefined ? leadData.housing : (leadData.housing_loan || false),
      personal_loan: leadData.loan !== undefined ? leadData.loan : (leadData.personal_loan || false),
      contact_type: leadData.contact_method || leadData.contact_type,
      day_of_month: leadData.day_of_month,
      month: leadData.month,
      duration: leadData.duration,
      campaign: leadData.campaign || 0,
      pdays: leadData.pdays,
      previous: leadData.previous || 0,
      poutcome: leadData.poutcome,
      assigned_to: leadData.assigned_to,
      status: leadData.status || 'new',
      notes: leadData.notes,
    };
  }

  // Format lead response for API
  formatLeadResponse(lead) {
    return {
      id: lead.customer_id || `lead-${lead.id}`,
      age: lead.age,
      job: lead.job,
      marital: lead.marital,
      education: lead.education,
      balance: parseFloat(lead.balance) || 0,
      loan: lead.personal_loan || false,
      housing: lead.housing_loan || false,
      contact_method: lead.contact_type || 'unknown',
    };
  }

  async createLead(leadData) {
    const mappedData = this.mapLeadDataToDb(leadData);
    const {
      customer_id, age, job, marital, education, default_credit, balance,
      housing_loan, personal_loan, contact_type, day_of_month, month,
      duration, campaign, pdays, previous, poutcome, assigned_to, status, notes
    } = mappedData;

    const query = `
      INSERT INTO leads (
        customer_id, age, job, marital, education, default_credit, balance,
        housing_loan, personal_loan, contact_type, day_of_month, month,
        duration, campaign, pdays, previous, poutcome, assigned_to, status, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *
    `;

    const result = await pool.query(query, [
      customer_id, age, job, marital, education, default_credit, balance,
      housing_loan, personal_loan, contact_type, day_of_month, month,
      duration, campaign, pdays, previous, poutcome, assigned_to, status, notes
    ]);

    return result.rows[0];
  }

  async updateLead(id, leadData) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    const fields = [
      'age', 'job', 'marital', 'education', 'default_credit', 'balance',
      'housing_loan', 'personal_loan', 'contact_type', 'day_of_month', 'month',
      'duration', 'campaign', 'pdays', 'previous', 'poutcome', 'assigned_to', 'status', 'notes'
    ];

    fields.forEach(field => {
      if (leadData[field] !== undefined) {
        updates.push(`${field} = $${paramCount++}`);
        values.push(leadData[field]);
      }
    });

    if (updates.length === 0) {
      return await this.getLeadById(id);
    }

    updates.push('updated_at = current_timestamp');
    values.push(id);

    const query = `
      UPDATE leads
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async deleteLead(id) {
    const query = 'DELETE FROM leads WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async getLeadsByStatus(status, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT l.*, u.full_name as assigned_to_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.status = $1
      ORDER BY l.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [status, limit, offset]);
    return result.rows;
  }
}

module.exports = new LeadsService();