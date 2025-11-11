const { verifyToken } = require('../services/authService');
const { getUserById } = require('../services/dbService');

const unauthorized = (message = 'Unauthorized') => {
  const error = new Error(message);
  error.statusCode = 401;
  return error;
};

const authenticateRequest = async (request) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw unauthorized('Missing or invalid Authorization header');
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  let payload;
  try {
    payload = verifyToken(token);
  } catch (error) {
    throw unauthorized('Invalid token');
  }

  const user = await getUserById(payload.id);

  if (!user) {
    throw unauthorized('User not found');
  }

  return user;
};

module.exports = {
  authenticateRequest,
  unauthorized,
};
