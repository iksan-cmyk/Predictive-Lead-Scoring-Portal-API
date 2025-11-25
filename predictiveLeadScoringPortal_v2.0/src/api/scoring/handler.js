const ScoringService = require('../../services/ScoringService');
const responseFormatter = require('../../utils/responseFormatter');
const autoBind = require('../../utils/autoBind');

class ScoringHandler {
  constructor() {
    autoBind(this);
  }

  async calculateScore(req, res, next) {
    try {
      // Validate lead exists if leadId is provided
      if (req.body.leadId) {
        const LeadsService = require('../../services/LeadsService');
        const lead = await LeadsService.getLeadById(req.body.leadId);
        if (!lead) {
          const err = new Error('Lead not found');
          err.statusCode = 404;
          return next(err);
        }
      }
      
      const result = await ScoringService.calculateScoreWithExplanation(req.body, true);
      
      // Set cache header if result is from cache
      if (result.fromCache) {
        res.setHeader('X-Data-Source', 'cache');
      } else {
        res.setHeader('X-Data-Source', 'database');
      }
      
      return res.status(200).json({
        status: 'success',
        data: {
          probability: result.probability,
          explanation: result.explanation,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async calculateScoresBatch(req, res, next) {
    try {
      const results = await ScoringService.calculateScoresBatch(req.body.leadIds);
      return res.status(200).json({
        status: 'success',
        data: results.map(r => ({
          leadId: r.leadId,
          probability: r.score?.probability || null,
          success: r.success,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ScoringHandler();