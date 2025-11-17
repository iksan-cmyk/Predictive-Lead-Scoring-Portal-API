const express = require('express');
const router = express.Router();
const handler = require('./handler');
const validator = require('./validator');
const { validate } = require('../../middleware/validator');
const { authenticate } = require('../../middleware/auth');

// These routes will be mounted at /leads/:id/outcome in app.js
router.get('/', authenticate, handler.getOutcomeByLeadId);
router.post('/', authenticate, validate(validator.createOutcomeSchema), handler.createOutcome);

module.exports = router;