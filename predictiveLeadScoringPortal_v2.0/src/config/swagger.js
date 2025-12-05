const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./environment');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Predictive Lead Scoring API',
      version: '1.0.0',
      description: 'API untuk sistem Predictive Lead Scoring Portal for Banking Sales',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://${config.host}:${config.port}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/api/**/*.js', './src/app.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

