require('dotenv').config();

module.exports = {
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    accessTokenSecret: process.env.ACCESS_TOKEN_KEY || 'your-access-token-secret-change-in-production',
    refreshTokenSecret: process.env.REFRESH_TOKEN_KEY || 'your-refresh-token-secret-change-in-production',
    accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d',
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  model: {
    path: process.env.MODEL_PATH || './src/model/model.onnx',
    featureSchemaVersion: process.env.FEATURE_SCHEMA_VERSION || '1.0.0',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    cacheTtl: parseInt(process.env.CACHE_TTL) || 600, // 10 minutes in seconds
  },
};

