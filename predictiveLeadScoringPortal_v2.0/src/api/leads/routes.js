const express = require('express');
const router = express.Router();
const handler = require('./handler');
const validator = require('./validator');
const { validate } = require('../../middleware/validator');
const { authenticate } = require('../../middleware/auth');
const outcomesRoutes = require('../outcomes');

router.get('/ranking', authenticate, handler.getRankedLeads);
router.get('/', authenticate, validate(validator.querySchema, 'query'), handler.getAllLeads);
router.get('/status/:status', authenticate, validate(validator.querySchema, 'query'), handler.getLeadsByStatus);
router.get('/:id', authenticate, handler.getLeadById);
router.post('/', authenticate, validate(validator.createLeadSchema), handler.createLead);
router.put('/:id', authenticate, validate(validator.updateLeadSchema), handler.updateLead);
router.delete('/:id', authenticate, handler.deleteLead);

// Mount outcomes routes
router.use('/:id/outcome', outcomesRoutes);

module.exports = router;