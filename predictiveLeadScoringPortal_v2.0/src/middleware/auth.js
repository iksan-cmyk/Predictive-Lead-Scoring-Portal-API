const JwtTokenManager = require('../utils/JwtTokenManager');
const responseFormatter = require('../utils/responseFormatter');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'fail',
        message: 'Anda harus login',
      });
    }

    const token = authHeader.substring(7);
    const tokenManager = new JwtTokenManager();
    const decoded = tokenManager.verifyAccessToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Anda harus login',
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Anda harus login',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Anda tidak berhak mengakses resource ini',
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };