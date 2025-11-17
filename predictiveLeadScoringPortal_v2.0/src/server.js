const app = require('./app');
const config = require('./config/environment');
const pool = require('./config/db');
const CacheService = require('./services/CacheService');

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Database connected successfully');
});

// Initialize Redis connection (optional - app works without it)
CacheService.connect().catch((err) => {
  console.warn('Redis connection failed - caching disabled:', err.message);
  console.warn('Application will continue without caching');
});

const server = app.listen(config.port, config.host, () => {
  console.log(`Server is running on http://${config.host}:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`API Documentation: http://${config.host}:${config.port}/api-docs`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
});

module.exports = server;