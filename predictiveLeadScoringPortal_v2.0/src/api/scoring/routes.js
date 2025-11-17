const express = require('express');
const router = express.Router();
const handler = require('./handler');
const validator = require('./validator');
const { validate } = require('../../middleware/validator');
const { authenticate } = require('../../middleware/auth');

/**
 * @swagger
 * /score:
 *   post:
 *     summary: Calculate score for a lead
 *     tags: [Scoring]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leadId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Score calculated successfully
 */
router.post('/', authenticate, validate(validator.calculateScoreSchema), handler.calculateScore);

/**
 * @swagger
 * /score/batch:
 *   post:
 *     summary: Calculate scores for multiple leads
 *     tags: [Scoring]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leadIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Batch scoring completed
 */
router.post('/batch', authenticate, validate(validator.batchScoreSchema), handler.calculateScoresBatch);

module.exports = router;