const OutcomesService = require('../../services/OutcomesService');
const responseFormatter = require('../../utils/responseFormatter');
const autoBind = require('../../utils/autoBind');

class OutcomesHandler {
  constructor() {
    autoBind(this);
  }

  async createOutcome(req, res, next) {
    try {
      const leadId = parseInt(req.params.id);
      const outcome = await OutcomesService.createOutcome({
        lead_id: leadId,
        outcome: req.body.outcome,
        contacted: true,
        contacted_at: req.body.contactedAt || new Date(),
        contacted_by: req.user.userId,
        notes: req.body.notes,
      });
      return res.status(201).json({
        status: 'success',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOutcomeByLeadId(req, res, next) {
    try {
      const leadId = parseInt(req.params.id);
      const outcome = await OutcomesService.getOutcomeByLeadId(leadId);
      return res.status(200).json({
        status: 'success',
        data: {
          outcome: outcome ? {
            outcome: outcome.outcome,
            contactedAt: outcome.contacted_at,
            notes: outcome.notes,
          } : null,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateOutcome(req, res, next) {
    try {
      const outcome = await OutcomesService.updateOutcome(req.params.id, req.body);
      if (!outcome) {
        return responseFormatter.error(res, 'Outcome not found', 404);
      }
      return responseFormatter.success(res, outcome, 'Outcome updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getOutcomes(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const result = await OutcomesService.getOutcomes(page, limit);
      return responseFormatter.paginated(res, result.data, result.pagination, 'Outcomes retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getOutcomesStatistics(req, res, next) {
    try {
      const statistics = await OutcomesService.getOutcomesStatistics();
      return responseFormatter.success(res, statistics, 'Statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OutcomesHandler();