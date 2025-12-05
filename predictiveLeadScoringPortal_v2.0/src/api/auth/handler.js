const AuthService = require('../../services/AuthService');
const responseFormatter = require('../../utils/responseFormatter');
const autoBind = require('../../utils/autoBind');

class AuthHandler {
  constructor() {
    autoBind(this);
  }

  async register(req, res, next) {
    try {
      const user = await AuthService.register(req.body);
      return res.status(201).json({
        status: 'success',
        data: {
          userId: user.id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await AuthService.login(req.body.username, req.body.password);
      return res.status(200).json({
        status: 'success',
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const result = await AuthService.refreshToken(req.body.refreshToken);
      return res.status(200).json({
        status: 'success',
        data: {
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      await AuthService.logout(req.body.refreshToken);
      return responseFormatter.success(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthHandler();

