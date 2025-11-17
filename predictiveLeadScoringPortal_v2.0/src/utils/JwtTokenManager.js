const jwt = require('jsonwebtoken');
const config = require('../config/environment');

class JwtTokenManager {
  generateAccessToken(payload) {
    return jwt.sign(payload, config.jwt.accessTokenSecret, {
      expiresIn: config.jwt.accessTokenExpiry,
    });
  }

  generateRefreshToken(payload) {
    return jwt.sign(payload, config.jwt.refreshTokenSecret, {
      expiresIn: config.jwt.refreshTokenExpiry,
    });
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.jwt.accessTokenSecret);
    } catch (error) {
      throw error;
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, config.jwt.refreshTokenSecret);
    } catch (error) {
      throw error;
    }
  }

  decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = JwtTokenManager;