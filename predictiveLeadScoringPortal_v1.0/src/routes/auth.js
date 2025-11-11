const {
  validateRegisterPayload,
  validateLoginPayload,
} = require('../utils/validators');
const { getUserByUsername, createUser } = require('../services/dbService');
const { hashPassword, comparePassword, generateToken } = require('../services/authService');
const { authenticateRequest } = require('../utils/authHelpers');

const conflict = (message) => {
  const error = new Error(message);
  error.statusCode = 409;
  return error;
};

module.exports = [
  {
    method: 'POST',
    path: '/register',
    handler: async (request, h) => {
      const payload = validateRegisterPayload(request.payload || {});
      const existingUser = await getUserByUsername(payload.username);

      if (existingUser) {
        throw conflict('Username is already registered');
      }

      const passwordHash = await hashPassword(payload.password);
      await createUser({ username: payload.username, passwordHash });

      return h
        .response({
          status: 'success',
          message: 'User registered successfully',
        })
        .code(201);
    },
  },
  {
    method: 'POST',
    path: '/login',
    handler: async (request, h) => {
      const credentials = validateLoginPayload(request.payload || {});
      const user = await getUserByUsername(credentials.username);

      if (!user) {
        return h
          .response({ status: 'fail', message: 'Invalid username or password' })
          .code(401);
      }

      const isValid = await comparePassword(credentials.password, user.password_hash);

      if (!isValid) {
        return h
          .response({ status: 'fail', message: 'Invalid username or password' })
          .code(401);
      }

      const token = generateToken({ id: user.id, role: user.role });

      return {
        status: 'success',
        message: 'Login successful',
        token,
      };
    },
  },
  {
    method: 'GET',
    path: '/users/profile',
    handler: async (request) => {
      const user = await authenticateRequest(request);

      return {
        status: 'success',
        data: {
          username: user.username,
        },
      };
    },
  },
];
