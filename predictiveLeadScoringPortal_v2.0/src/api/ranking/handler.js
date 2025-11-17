const RankingService = require('../../services/RankingService');
const responseFormatter = require('../../utils/responseFormatter');
const autoBind = require('../../utils/autoBind');

class RankingHandler {
  constructor() {
    autoBind(this);
  }

  async getRankedLeads(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const status = req.query.status || null;
      const result = await RankingService.getRankedLeads(status, page, limit);
      return responseFormatter.paginated(res, result.data, result.pagination, 'Ranked leads retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getTopLeads(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status || null;
      const leads = await RankingService.getTopLeads(limit, status);
      return responseFormatter.success(res, leads, 'Top leads retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getLeadsWithoutScores(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const leads = await RankingService.getLeadsWithoutScores(page, limit);
      return responseFormatter.success(res, leads, 'Leads without scores retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getScoreDistribution(req, res, next) {
    try {
      const distribution = await RankingService.getScoreDistribution();
      return responseFormatter.success(res, distribution, 'Score distribution retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RankingHandler();