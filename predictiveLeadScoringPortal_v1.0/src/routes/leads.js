const {
  validateLeadCreatePayload,
  validateLeadUpdatePayload,
} = require('../utils/validators');
const {
  createLeadRecord,
  listLeadRecords,
  getLeadRecordById,
  updateLeadRecordById,
  deleteLeadRecordById,
} = require('../services/dbService');
const { authenticateRequest } = require('../utils/authHelpers');

const normalizeProbability = (score) => {
  const value = Number(score);
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value >= 0 && value <= 1) {
    return Number(value.toFixed(4));
  }
  const sigmoid = 1 / (1 + Math.exp(-value));
  return Number(sigmoid.toFixed(4));
};

const toLeadResponse = (lead) => ({
  id: lead.id,
  name: lead.name,
  age: lead.age,
  job: lead.job,
  balance: lead.balance,
  probability: lead.probability,
  score: lead.score,
});

const notFound = (id) => {
  const error = new Error(`Lead with ID ${id} not found`);
  error.statusCode = 404;
  return error;
};

module.exports = [
  {
    method: 'POST',
    path: '/leads',
    handler: async (request, h) => {
      await authenticateRequest(request);
      const payload = validateLeadCreatePayload(request.payload || {});
      const score = typeof payload.score === 'number' ? payload.score : 0;
      const probability = normalizeProbability(score);

      const result = await createLeadRecord({
        name: payload.name,
        age: payload.age,
        job: payload.job,
        balance: payload.balance,
        score,
        probability,
      });

      return h
        .response({
          status: 'success',
          message: 'Lead added successfully',
          data: { id: result.id },
        })
        .code(201);
    },
  },
  {
    method: 'GET',
    path: '/get_leads',
    handler: async (request) => {
      await authenticateRequest(request);
      const leads = await listLeadRecords();

      return {
        status: 'success',
        data: {
          leads: leads.map(toLeadResponse),
        },
      };
    },
  },
  {
    method: 'GET',
    path: '/leads/{id}',
    handler: async (request) => {
      await authenticateRequest(request);
      const id = Number(request.params.id);
      const lead = await getLeadRecordById(id);

      if (!lead) {
        throw notFound(id);
      }

      return {
        status: 'success',
        data: {
          lead: toLeadResponse(lead),
        },
      };
    },
  },
  {
    method: 'PUT',
    path: '/leads/{id}',
    handler: async (request) => {
      await authenticateRequest(request);
      const id = Number(request.params.id);
      const payload = validateLeadUpdatePayload(request.payload || {});
      const existing = await getLeadRecordById(id);

      if (!existing) {
        throw notFound(id);
      }

      const nextLead = {
        name: payload.name ?? existing.name,
        age: typeof payload.age === 'number' ? payload.age : existing.age,
        job: payload.job ?? existing.job,
        balance:
          typeof payload.balance === 'number' || payload.balance === null
            ? payload.balance
            : existing.balance,
      };

      const score =
        typeof payload.score === 'number' ? payload.score : existing.score;
      const probability =
        typeof payload.score === 'number'
          ? normalizeProbability(payload.score)
          : existing.probability;

      await updateLeadRecordById(id, {
        ...nextLead,
        score,
        probability,
      });

      return {
        status: 'success',
        message: 'Lead updated successfully',
      };
    },
  },
  {
    method: 'DELETE',
    path: '/leads/{id}',
    handler: async (request) => {
      await authenticateRequest(request);
      const id = Number(request.params.id);
      const existing = await getLeadRecordById(id);

      if (!existing) {
        throw notFound(id);
      }

      await deleteLeadRecordById(id);

      return {
        status: 'success',
        message: 'Lead deleted successfully',
      };
    },
  },
];
