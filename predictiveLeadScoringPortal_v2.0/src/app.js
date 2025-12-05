const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const config = require('./config/environment');
const errorHandler = require('./utils/errorHandler');

// Import routes
const authRoutes = require('./api/auth');
const leadsRoutes = require('./api/leads');
const scoringRoutes = require('./api/scoring');
const rankingRoutes = require('./api/ranking');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes (without /api prefix as per requirements)
app.use('/auth', authRoutes);
app.use('/leads', leadsRoutes); // Includes /leads/:id/outcome
app.use('/score', scoringRoutes);
app.use('/api/ranking', rankingRoutes); // Keep ranking for now

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;