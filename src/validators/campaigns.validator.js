const { ValidationError } = require('../utils/errors');

function id(raw) {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) throw new ValidationError('id must be a positive integer');
  return value;
}

function createBody(body) {
  if (!body || typeof body !== 'object') throw new ValidationError('JSON body required');
  const errors = [];

  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  if (!subject || subject.length > 200) errors.push('subject is required (1-200 characters)');

  const text = typeof body.body === 'string' ? body.body.trim() : '';
  if (!text || text.length > 10000) errors.push('body is required (1-10000 characters)');

  if (errors.length) throw new ValidationError('Invalid body', errors);
  return { subject, body: text };
}

module.exports = { id, createBody };
