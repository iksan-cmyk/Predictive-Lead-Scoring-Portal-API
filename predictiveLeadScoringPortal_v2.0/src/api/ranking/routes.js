const express = require('express');
const router = express.Router();
const handler = require('./handler');
const { authenticate } = require('../../middleware/auth');

router.get('/top', authenticate, handler.getTopLeads);
router.get('/without-scores', authenticate, handler.getLeadsWithoutScores);
router.get('/distribution', authenticate, handler.getScoreDistribution);
router.get('/', authenticate, handler.getRankedLeads);

module.exports = router;