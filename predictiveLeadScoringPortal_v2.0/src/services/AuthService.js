const UsersService = require('./UsersService');
const PasswordService = require('./PasswordService');
const TokenService = require('./TokenService');
const JwtTokenManager = require('../utils/JwtTokenManager');
const autoBind = require('../utils/autoBind');

class AuthService {
  constructor() {
    this.tokenManager = new JwtTokenManager();
    autoBind(this);
  }

  async login(username, password) {
    const user = await UsersService.getUserByUsername(username);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.is_active) {
      throw new Error('User account is inactive');
    }

    const isPasswordValid = await PasswordService.comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.tokenManager.generateAccessToken(payload);
    const refreshToken = this.tokenManager.generateRefreshToken(payload);

    const decoded = this.tokenManager.decodeToken(refreshToken);
    await TokenService.saveRefreshToken(user.id, refreshToken, new Date(decoded.exp * 1000));

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken) {
    const tokenData = await TokenService.findRefreshToken(refreshToken);
    if (!tokenData) {
      throw new Error('Invalid refresh token');
    }

    const payload = {
      userId: tokenData.user_id,
      username: tokenData.username,
      role: tokenData.role,
    };

    const newAccessToken = this.tokenManager.generateAccessToken(payload);
    return { accessToken: newAccessToken };
  }

  async logout(refreshToken) {
    await TokenService.deleteRefreshToken(refreshToken);
  }

  async register(userData) {
    const existingUser = await UsersService.getUserByUsername(userData.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const user = await UsersService.createUser({
      ...userData,
      full_name: userData.fullname,
    });
    return {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
    };
  }
}

module.exports = new AuthService();