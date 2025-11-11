const { validatePredictPayload } = require('../utils/validators');
const { runInference } = require('../services/modelService');
const { createPredictionRecord } = require('../services/dbService');
const { authenticateRequest } = require('../utils/authHelpers');

const normalizeProbability = (value) => {
  if (Number.isNaN(Number(value))) {
    return 0;
  }
  const clamped = Math.max(0, Math.min(1, Number(value)));
  return Number(clamped.toFixed(4));
};

const hashStringFeature = (text = '') => {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) % 1000;
  }
  return hash / 1000;
};

const coerceNumericValue = (value) => {
  if (value === null || typeof value === 'undefined') {
    return null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  if (typeof value === 'string') {
    const numericCandidate = Number(value);
    if (Number.isFinite(numericCandidate)) {
      return numericCandidate;
    }
    return hashStringFeature(value);
  }

  return null;
};

const buildFeatureVector = (payload) => {
  const entries = Object.entries(payload).filter(([key]) => key !== 'name');
  const vector = entries
    .map(([, value]) => coerceNumericValue(value))
    .filter((value) => typeof value === 'number');

  if (!vector.length) {
    const error = new Error('Payload must include at least one numeric-like field for prediction.');
    error.statusCode = 400;
    throw error;
  }

  return vector;
};

const derivePredictedClass = (probability) =>
  probability >= 0.5 ? 'berlangganan' : 'tidak_berlangganan';

const getSafeNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const getSafeString = (value) => (typeof value === 'string' && value.trim().length ? value.trim() : null);

module.exports = [
  {
    method: 'POST',
    path: '/predict',
    handler: async (request, h) => {
      await authenticateRequest(request);
      const payload = validatePredictPayload(request.payload || {});
      const featureVector = buildFeatureVector(payload);
      const { probability } = await runInference(featureVector);

      const normalizedProbability = normalizeProbability(probability);
      const predictedClass = derivePredictedClass(normalizedProbability);

      const name = getSafeString(payload.name);
      const age = getSafeNumber(payload.age);
      const job = getSafeString(payload.job);
      const balance = getSafeNumber(payload.balance);

      await createPredictionRecord({
        name,
        age,
        job,
        balance,
        probability: normalizedProbability,
        predictedClass,
        payload,
      });

      return h
        .response({
          status: 'success',
          data: {
            probability: normalizedProbability,
            predicted_class: predictedClass,
          },
        })
        .code(200);
    },
  },
];
