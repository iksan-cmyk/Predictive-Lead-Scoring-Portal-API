const Joi = require('joi');

const createOutcomeSchema = Joi.object({
  outcome: Joi.string().valid('converted', 'not_converted', 'no_answer', 'invalid_contact').required(),
  contactedAt: Joi.date().optional(),
  notes: Joi.string().optional(),
});

const updateOutcomeSchema = Joi.object({
  outcome: Joi.string().valid('converted', 'not_converted', 'no_answer', 'invalid_contact').optional(),
  contactedAt: Joi.date().optional(),
  notes: Joi.string().optional(),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

module.exports = {
  createOutcomeSchema,
  updateOutcomeSchema,
  querySchema,
};