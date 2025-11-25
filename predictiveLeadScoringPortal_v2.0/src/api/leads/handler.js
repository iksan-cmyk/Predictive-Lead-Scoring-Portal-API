const LeadsService = require('../../services/LeadsService');
const RankingService = require('../../services/RankingService');
const responseFormatter = require('../../utils/responseFormatter');
const autoBind = require('../../utils/autoBind');

class LeadsHandler {
  constructor() {
    autoBind(this);
  }

  async getAllLeads(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || parseInt(req.query.limit) || 20;
      const filters = {
        page,
        limit: pageSize,
        min_prob: req.query.min_prob ? parseFloat(req.query.min_prob) : undefined,
        max_age: req.query.max_age ? parseInt(req.query.max_age) : undefined,
        job: req.query.job,
        status: req.query.status,
        sort: req.query.sort || 'created_desc',
      };
      
      const result = await LeadsService.getAllLeads(filters);
      return res.status(200).json({
        status: 'success',
        data: {
          leads: result.data.map(lead => ({
            ...LeadsService.formatLeadResponse(lead),
            probability: lead.score ? parseFloat(lead.score) : null,
          })),
        },
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLeadById(req, res, next) {
    try {
      const lead = await LeadsService.getLeadById(req.params.id);
      if (!lead) {
        const err = new Error('Lead not found');
        err.statusCode = 404;
        return next(err);
      }
      return res.status(200).json({
        status: 'success',
        data: {
          lead: LeadsService.formatLeadResponse(lead),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async createLead(req, res, next) {
    try {
      const lead = await LeadsService.createLead(req.body);
      return res.status(201).json({
        status: 'success',
        data: {
          leadId: lead.id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateLead(req, res, next) {
    try {
      const lead = await LeadsService.updateLead(req.params.id, req.body);
      if (!lead) {
        const err = new Error('Lead not found');
        err.statusCode = 404;
        return next(err);
      }
      return responseFormatter.success(res, lead, 'Lead updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteLead(req, res, next) {
    try {
      const lead = await LeadsService.deleteLead(req.params.id);
      if (!lead) {
        const err = new Error('Lead not found');
        err.statusCode = 404;
        return next(err);
      }
      return responseFormatter.success(res, null, 'Lead deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getLeadsByStatus(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const leads = await LeadsService.getLeadsByStatus(req.params.status, page, limit);
      return responseFormatter.success(res, leads, 'Leads retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getRankedLeads(req, res, next) {
    try {
      const minProb = parseFloat(req.query.min_prob) || 0;
      const sort = req.query.sort || 'desc';
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      
      const result = await RankingService.getRankedLeads(null, page, limit);
      
      // Filter by min_prob and format response
      let leads = result.data
        .filter(lead => lead.score >= minProb)
        .map(lead => ({
          ...LeadsService.formatLeadResponse(lead),
          probability: parseFloat(lead.score) || 0,
        }));
      
      if (sort === 'asc') {
        leads.sort((a, b) => a.probability - b.probability);
      } else {
        leads.sort((a, b) => b.probability - a.probability);
      }
      
      return res.status(200).json({
        status: 'success',
        data: {
          leads,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LeadsHandler();