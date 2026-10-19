const HttpError = require('../../../utils/httpError');

/**
 * Single source of truth for task payload validation.
 *
 * Title rule (identical for create and update): when provided,
 * `title` must be a string; it is trimmed and must then be non-empty.
 *
 * `completed`, when provided, must be a boolean. Unknown fields are rejected so
 * clients cannot set server-owned fields such as `id` or `createdAt`.
 */
const ALLOWED_FIELDS = ['title', 'completed'];

function validatePayloadShape(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new HttpError(400, 'Body must be a JSON object.');
  }
}

function ensureNoUnknownFields(payload) {
  const unknownFields = Object.keys(payload).filter((field) => !ALLOWED_FIELDS.includes(field));

  if (unknownFields.length > 0) {
    throw new HttpError(400, 'Body contains unsupported fields.', {
      unsupportedFields: unknownFields,
    });
  }
}

function normalizeTitleIfPresent(payload, normalized) {
  if (!Object.hasOwn(payload, 'title')) {
    return;
  }

  if (typeof payload.title !== 'string') {
    throw new HttpError(400, '"title" must be a string.');
  }

  const trimmedTitle = payload.title.trim();
  if (!trimmedTitle) {
    throw new HttpError(400, '"title" cannot be empty.');
  }

  normalized.title = trimmedTitle;
}

function normalizeCompletedIfPresent(payload, normalized) {
  if (!Object.hasOwn(payload, 'completed')) {
    return;
  }

  if (typeof payload.completed !== 'boolean') {
    throw new HttpError(400, '"completed" must be a boolean.');
  }

  normalized.completed = payload.completed;
}

function validateCreateTask(payload) {
  validatePayloadShape(payload);
  ensureNoUnknownFields(payload);

  const normalized = {};
  normalizeTitleIfPresent(payload, normalized);
  normalizeCompletedIfPresent(payload, normalized);

  if (!Object.hasOwn(normalized, 'title')) {
    throw new HttpError(400, '"title" is required.');
  }

  if (!Object.hasOwn(normalized, 'completed')) {
    normalized.completed = false;
  }

  return normalized;
}

function validateUpdateTask(payload) {
  validatePayloadShape(payload);
  ensureNoUnknownFields(payload);

  const normalized = {};
  normalizeTitleIfPresent(payload, normalized);
  normalizeCompletedIfPresent(payload, normalized);

  if (Object.keys(normalized).length === 0) {
    throw new HttpError(400, 'Provide at least one updatable field.');
  }

  return normalized;
}

module.exports = {
  validateCreateTask,
  validateUpdateTask,
};
