const pool = require('../database');
const ModelService = require('./ModelService');
const LeadsService = require('./LeadsService');
const CacheService = require('./CacheService');
const config = require('../config/environment');
const autoBind = require('../utils/autoBind');

class ScoringService {
  constructor() {
    autoBind(this);
  }

  async calculateScore(leadId) {
    const lead = await LeadsService.getLeadById(leadId);
    if (!lead) {
      throw new Error('Lead not found');
    }

    const prediction = await ModelService.predict(lead);

    const query = `
      INSERT INTO lead_scores (lead_id, score, probability, model_version, feature_vector)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (lead_id)
      DO UPDATE SET
        score = EXCLUDED.score,
        probability = EXCLUDED.probability,
        model_version = EXCLUDED.model_version,
        feature_vector = EXCLUDED.feature_vector,
        calculated_at = current_timestamp,
        updated_at = current_timestamp
      RETURNING *
    `;

    const result = await pool.query(query, [
      leadId,
      prediction.score,
      prediction.probability,
      prediction.modelVersion,
      JSON.stringify(prediction.featureVector),
    ]);

    return result.rows[0];
  }

  async getScoreByLeadId(leadId) {
    const query = `
      SELECT ls.*, l.customer_id, l.status as lead_status
      FROM lead_scores ls
      JOIN leads l ON ls.lead_id = l.id
      WHERE ls.lead_id = $1
    `;
    const result = await pool.query(query, [leadId]);
    return result.rows[0];
  }

  async getScores(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT ls.*, l.customer_id, l.status as lead_status
      FROM lead_scores ls
      JOIN leads l ON ls.lead_id = l.id
      ORDER BY ls.score DESC, ls.calculated_at DESC
      LIMIT $1 OFFSET $2
    `;
    const countQuery = 'SELECT COUNT(*) as total FROM lead_scores';

    const [result, countResult] = await Promise.all([
      pool.query(query, [limit, offset]),
      pool.query(countQuery),
    ]);

    return {
      data: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / limit),
      },
    };
  }

  async calculateScoreWithExplanation(input, useCache = true) {
    let cacheKey = null;
    let fromCache = false;

    // Generate cache key
    if (useCache) {
      if (input.leadId) {
        cacheKey = CacheService.generateLeadCacheKey(input.leadId);
      } else {
        // Use feature hash for cache key
        const featureData = {
          usia: input.usia,
          job: input.job,
          marital: input.marital,
          education: input.education,
          balance: input.balance,
          loan: input.loan,
          housing: input.housing,
        };
        cacheKey = CacheService.generateFeatureCacheKey(featureData);
      }

      // Try to get from cache
      const cachedResult = await CacheService.get(cacheKey);
      if (cachedResult) {
        return {
          ...cachedResult,
          fromCache: true,
        };
      }
    }

    // Cache miss - calculate score
    let lead;
    
    if (input.leadId) {
      lead = await LeadsService.getLeadById(input.leadId);
      if (!lead) {
        throw new Error('Lead not found');
      }
    } else {
      // Use direct feature input
      lead = LeadsService.mapLeadDataToDb(input);
    }

    const prediction = await ModelService.predict(lead);
    
    // Save score if leadId exists
    if (input.leadId) {
      const query = `
        INSERT INTO lead_scores (lead_id, score, probability, model_version, feature_vector)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (lead_id)
        DO UPDATE SET
          score = EXCLUDED.score,
          probability = EXCLUDED.probability,
          model_version = EXCLUDED.model_version,
          feature_vector = EXCLUDED.feature_vector,
          calculated_at = current_timestamp,
          updated_at = current_timestamp
      `;
      await pool.query(query, [
        input.leadId,
        prediction.score,
        prediction.probability,
        prediction.modelVersion,
        JSON.stringify(prediction.featureVector),
      ]);
    }

    // Generate explanation (simplified feature impact)
    const explanation = this.generateExplanation(lead, prediction.probability);

    const result = {
      probability: prediction.probability,
      explanation,
    };

    // Cache the result
    if (useCache && cacheKey) {
      await CacheService.set(cacheKey, result, config.redis.cacheTtl);
    }

    return {
      ...result,
      fromCache: false,
    };
  }

  generateExplanation(lead, probability) {
    // Simplified feature impact calculation
    // In production, this should use SHAP values or model interpretability
    const impacts = [];
    
    if (lead.balance > 0) {
      const balanceImpact = Math.min(0.15, (lead.balance / 10000) * 0.1);
      impacts.push({ feature: 'balance', impact: `+${balanceImpact.toFixed(2)}` });
    }
    
    if (lead.age) {
      const ageImpact = lead.age > 40 && lead.age < 60 ? 0.08 : -0.03;
      impacts.push({ feature: 'age', impact: ageImpact > 0 ? `+${ageImpact.toFixed(2)}` : ageImpact.toFixed(2) });
    }
    
    if (lead.housing_loan) {
      impacts.push({ feature: 'housing', impact: '+0.05' });
    }
    
    if (lead.personal_loan) {
      impacts.push({ feature: 'loan', impact: '-0.10' });
    }

    // Sort by absolute impact
    impacts.sort((a, b) => Math.abs(parseFloat(b.impact)) - Math.abs(parseFloat(a.impact)));
    
    return impacts.slice(0, 5); // Return top 5 features
  }

  async calculateScoresBatch(leadIds, useCache = true) {
    const results = [];
    for (const leadId of leadIds) {
      try {
        const result = await this.calculateScoreWithExplanation({ leadId }, useCache);
        results.push({ 
          leadId, 
          success: true, 
          score: { probability: result.probability },
          fromCache: result.fromCache || false,
        });
      } catch (error) {
        results.push({ leadId, success: false, error: error.message });
      }
    }
    return results;
  }
}

module.exports = new ScoringService();