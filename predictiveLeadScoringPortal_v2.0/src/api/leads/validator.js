const Joi = require('joi');

const createLeadSchema = Joi.object({
  usia: Joi.number().integer().min(0).max(150).required()
    .messages({
      'number.base': 'age harus berupa number',
      'any.required': 'age wajib diisi',
    }),
  job: Joi.string().required()
    .messages({
      'string.base': 'job harus berupa string',
      'any.required': 'job wajib diisi',
    }),
  marital: Joi.string().valid('divorced', 'married', 'single', 'unknown').required()
    .messages({
      'string.base': 'marital harus berupa string',
      'any.required': 'marital wajib diisi',
      'any.only': 'marital harus salah satu dari: divorced, married, single, unknown',
    }),
  education: Joi.string().required()
    .messages({
      'string.base': 'education harus berupa string',
      'any.required': 'education wajib diisi',
    }),
  balance: Joi.number().optional()
    .messages({
      'number.base': 'balance harus berupa number',
    }),
  loan: Joi.boolean().optional()
    .messages({
      'boolean.base': 'loan harus berupa boolean',
    }),
  housing: Joi.boolean().optional().default(false),
  contact_method: Joi.string().valid('cellular', 'telephone', 'unknown').optional(),
  // Additional fields for model
  default_credit: Joi.boolean().optional(),
  personal_loan: Joi.boolean().optional(),
  day_of_month: Joi.number().integer().min(1).max(31).optional(),
  month: Joi.string().optional(),
  duration: Joi.number().integer().optional(),
  campaign: Joi.number().integer().optional(),
  pdays: Joi.number().integer().optional(),
  previous: Joi.number().integer().optional(),
  poutcome: Joi.string().valid('failure', 'nonexistent', 'success', 'unknown').optional(),
});

const updateLeadSchema = Joi.object({
  age: Joi.number().integer().min(0).max(150).optional(),
  job: Joi.string().optional(),
  marital: Joi.string().valid('divorced', 'married', 'single', 'unknown').optional(),
  education: Joi.string().optional(),
  default_credit: Joi.boolean().optional(),
  balance: Joi.number().optional(),
  housing_loan: Joi.boolean().optional(),
  personal_loan: Joi.boolean().optional(),
  contact_type: Joi.string().valid('cellular', 'telephone', 'unknown').optional(),
  day_of_month: Joi.number().integer().min(1).max(31).optional(),
  month: Joi.string().optional(),
  duration: Joi.number().integer().optional(),
  campaign: Joi.number().integer().optional(),
  pdays: Joi.number().integer().optional(),
  previous: Joi.number().integer().optional(),
  poutcome: Joi.string().valid('failure', 'nonexistent', 'success', 'unknown').optional(),
  assigned_to: Joi.number().integer().optional(),
  status: Joi.string().valid('new', 'contacted', 'qualified', 'converted', 'lost').optional(),
  notes: Joi.string().optional(),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  pageSize: Joi.number().integer().min(1).max(100).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(), // Alias for pageSize
  status: Joi.string().optional(),
  // Dashboard query filters
  min_prob: Joi.number().min(0).max(1).optional(),
  max_age: Joi.number().integer().min(0).max(150).optional(),
  job: Joi.string().optional(),
  // Sorting
  sort: Joi.string().valid('probability_desc', 'probability_asc', 'age_desc', 'age_asc', 'created_desc', 'created_asc').optional(),
});

module.exports = {
  createLeadSchema,
  updateLeadSchema,
  querySchema,
};