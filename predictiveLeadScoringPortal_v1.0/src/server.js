require('dotenv').config();
const Hapi = require('@hapi/hapi');

const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const predictRoutes = require('./routes/predict');
const { initDatabase } = require('./services/dbService');
const { warmupModel } = require('./services/modelService');

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT) || 5000;

const registerRoutes = (server) => {
  server.route([...authRoutes, ...leadRoutes, ...predictRoutes]);
};

const registerErrorHandling = (server) => {
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response.isBoom) {
      const { output } = response;
      return h
        .response({
          statusCode: output.statusCode,
          error: output.payload.error,
          message: output.payload.message,
        })
        .code(output.statusCode);
    }

    if (response instanceof Error) {
      const statusCode = response.statusCode || 500;
      return h.response({ message: response.message }).code(statusCode);
    }

    return h.continue;
  });
};

const createServer = async () => {
  await initDatabase();
  await warmupModel();

  const server = Hapi.server({
    port: PORT,
    host: HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  registerRoutes(server);
  registerErrorHandling(server);

  return server;
};

const start = async () => {
  const server = await createServer();
  await server.start();
  console.log(`Server running at ${server.info.uri}`);
};

start().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection detected:', reason);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down.');
  process.exit(0);
});
