const Joi = require('joi');

const validate = (schema, payload) => {
  const { error, value } = schema.validate(payload, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map((detail) => detail.message).join('; ');
    const validationError = new Error(details);
    validationError.statusCode = 400;
    throw validationError;
  }

  return value;
};

const credentialsSchema = Joi.object({
  username: Joi.string().min(3).required(),
  password: Joi.string().min(6).required(),
});

const leadCreateSchema = Joi.object({
  name: Joi.string().min(3).required(),
  age: Joi.number().required(),
  job: Joi.string().min(2).required(),
  balance: Joi.number().optional(),
  score: Joi.number().optional(),
});

const leadUpdateSchema = Joi.object({
  name: Joi.string().min(3),
  age: Joi.number(),
  job: Joi.string().min(2),
  balance: Joi.number(),
  score: Joi.number(),
}).min(1);

const predictSchema = Joi.object({
  name: Joi.string().min(3).optional(),
  age: Joi.number().required(),
  job: Joi.string().min(2).required(),
  marital: Joi.string().min(3).required(),
  balance: Joi.number().required(),
}).unknown(true);

module.exports = {
  validateRegisterPayload: (payload) => validate(credentialsSchema, payload),
  validateLoginPayload: (payload) => validate(credentialsSchema, payload),
  validateLeadCreatePayload: (payload) => validate(leadCreateSchema, payload),
  validateLeadUpdatePayload: (payload) => validate(leadUpdateSchema, payload),
  validatePredictPayload: (payload) => validate(predictSchema, payload),
};
