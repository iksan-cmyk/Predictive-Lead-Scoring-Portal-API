/**
 * Standard response formatter
 */
const responseFormatter = {
  success: (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data,
    });
  },

  error: (res, message = 'Error', statusCode = 400, errors = null) => {
    return res.status(statusCode).json({
      status: 'error',
      message,
      ...(errors && { errors }),
    });
  },

  paginated: (res, data, pagination, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data,
      pagination,
    });
  },
};

module.exports = responseFormatter;