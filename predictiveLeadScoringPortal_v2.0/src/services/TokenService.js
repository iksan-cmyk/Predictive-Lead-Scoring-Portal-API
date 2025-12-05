const pool = require('../database');
const JwtTokenManager = require('../utils/JwtTokenManager');

class TokenService {
  constructor() {
    this.tokenManager = new JwtTokenManager();
  }

  async saveRefreshToken(userId, token, expiresAt) {
    const query = `
      INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [userId, token, expiresAt]);
    return result.rows[0];
  }

  async findRefreshToken(token) {
    const query = `
      SELECT rt.*, u.id as user_id, u.username, u.email, u.role
      FROM refresh_tokens rt
      JOIN users u ON rt.user_id = u.id
      WHERE rt.token = $1 AND rt.expires_at > current_timestamp
    `;
    const result = await pool.query(query, [token]);
    return result.rows[0];
  }

  async deleteRefreshToken(token) {
    const query = 'DELETE FROM refresh_tokens WHERE token = $1';
    await pool.query(query, [token]);
  }

  async deleteAllUserRefreshTokens(userId) {
    const query = 'DELETE FROM refresh_tokens WHERE user_id = $1';
    await pool.query(query, [userId]);
  }

  async cleanupExpiredTokens() {
    const query = 'DELETE FROM refresh_tokens WHERE expires_at < current_timestamp';
    await pool.query(query);
  }
}

module.exports = new TokenService();