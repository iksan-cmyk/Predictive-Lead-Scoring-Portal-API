/**
 * Centralized error handler middleware
 * Format mengikuti OpenMusic specification
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Joi validation error - 400 Bad Request
  if (err.isJoi) {
    return res.status(400).json({
      status: 'fail',
      message: 'Data yang Anda masukkan tidak valid',
    });
  }

  // Custom validation errors - 400 Bad Request
  if (err.statusCode === 400) {
    return res.status(400).json({
      status: 'fail',
      message: err.message || 'Data yang Anda masukkan tidak valid',
    });
  }

  // Not Found - 404
  if (err.statusCode === 404 || err.status === 404) {
    return res.status(404).json({
      status: 'fail',
      message: 'Resource tidak ditemukan',
    });
  }

  // JWT errors - 401 Unauthorized
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Anda harus login',
    });
  }

  // Forbidden - 403
  if (err.statusCode === 403 || err.status === 403) {
    return res.status(403).json({
      status: 'fail',
      message: 'Anda tidak berhak mengakses resource ini',
    });
  }

  // PostgreSQL errors
  if (err.code === '23505') { // Unique violation - 400
    return res.status(400).json({
      status: 'fail',
      message: 'Data yang Anda masukkan tidak valid',
    });
  }

  if (err.code === '23503') { // Foreign key violation - 400
    return res.status(400).json({
      status: 'fail',
      message: 'Data yang Anda masukkan tidak valid',
    });
  }

  // Default error - 500 Server Error
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    status: statusCode === 500 ? 'error' : 'fail',
    message: statusCode === 500 ? 'Internal server error' : message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;