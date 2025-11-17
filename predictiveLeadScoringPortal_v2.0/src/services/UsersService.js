const pool = require('../database');
const PasswordService = require('./PasswordService');
const autoBind = require('../utils/autoBind');

class UsersService {
  constructor() {
    autoBind(this);
  }

  async getUserByUsername(username) {
    const query = `
      SELECT id, username, email, password_hash, full_name, role, is_active, created_at, updated_at
      FROM users
      WHERE username = $1
    `;
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  async getUserByEmail(email) {
    const query = `
      SELECT id, username, email, password_hash, full_name, role, is_active, created_at, updated_at
      FROM users
      WHERE email = $1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  async getUserById(id) {
    const query = `
      SELECT id, username, email, full_name, role, is_active, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async createUser(userData) {
    const { username, email = null, password, full_name, role = 'sales' } = userData;
    const passwordHash = await PasswordService.hashPassword(password);

    const query = `
      INSERT INTO users (username, email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, full_name, role, is_active, created_at, updated_at
    `;
    const result = await pool.query(query, [username, email, passwordHash, full_name, role]);
    return result.rows[0];
  }

  async updateUser(id, userData) {
    const { full_name, role, is_active } = userData;
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (full_name !== undefined) {
      updates.push(`full_name = $${paramCount++}`);
      values.push(full_name);
    }
    if (role !== undefined) {
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    if (updates.length === 0) {
      return await this.getUserById(id);
    }

    updates.push(`updated_at = current_timestamp`);
    values.push(id);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, username, email, full_name, role, is_active, created_at, updated_at
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = new UsersService();