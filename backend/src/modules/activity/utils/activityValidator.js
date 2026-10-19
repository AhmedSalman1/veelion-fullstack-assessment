const HttpError = require('../../../utils/httpError');

/**
 * Single source of truth for activity payload validation.
 *
 * `action` and `info` are optional. When provided they must be strings,
 * are trimmed, and may not exceed their maximum length.
 */
const MAX_ACTION_LENGTH = 200;
const MAX_INFO_LENGTH = 1000;

function validatePayloadShape(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new HttpError(400, 'Body must be a JSON object.');
  }
}

function normalizeTextIfPresent(payload, field, maxLength, normalized) {
  if (!Object.hasOwn(payload, field)) {
    return;
  }

  if (typeof payload[field] !== 'string') {
    throw new HttpError(400, `"${field}" must be a string.`);
  }

  const trimmed = payload[field].trim();
  if (trimmed.length > maxLength) {
    throw new HttpError(400, `"${field}" must be at most ${maxLength} characters.`);
  }

  normalized[field] = trimmed;
}

function validateCreateActivity(payload) {
  validatePayloadShape(payload);

  const normalized = {};
  normalizeTextIfPresent(payload, 'action', MAX_ACTION_LENGTH, normalized);
  normalizeTextIfPresent(payload, 'info', MAX_INFO_LENGTH, normalized);

  return normalized;
}

module.exports = {
  validateCreateActivity,
};
