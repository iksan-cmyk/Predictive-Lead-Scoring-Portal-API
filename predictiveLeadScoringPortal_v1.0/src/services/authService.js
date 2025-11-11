const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'predictive-lead-secret';

const hashPassword = (password) => bcrypt.hash(password, 10);
const comparePassword = (password, hash) => bcrypt.compare(password, hash);

const generateToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1h',
  });

const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
};
