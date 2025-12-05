const Joi = require('joi');

const calculateScoreSchema = Joi.object({
  leadId: Joi.number().integer().optional(),
  // Allow direct feature input as alternative - semua wajib jika tidak pakai leadId
  usia: Joi.number().integer().min(0).max(150).when('leadId', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  job: Joi.string().when('leadId', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  marital: Joi.string().valid('divorced', 'married', 'single', 'unknown').when('leadId', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  education: Joi.string().when('leadId', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  balance: Joi.number().optional(),
  loan: Joi.boolean().optional(),
  housing: Joi.boolean().optional(),
  contact_method: Joi.string().valid('cellular', 'telephone', 'unknown').optional(),
}).or('leadId', 'usia');

const batchScoreSchema = Joi.object({
  leadIds: Joi.array().items(Joi.number().integer()).min(1).required(),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

module.exports = {
  calculateScoreSchema,
  batchScoreSchema,
  querySchema,
};