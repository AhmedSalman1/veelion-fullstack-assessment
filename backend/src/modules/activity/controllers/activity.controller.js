const activityService = require('../services/activity.service');
const { validateCreateActivity } = require('../utils/activityValidator');

async function listActivity(req, res) {
  const activity = await activityService.getAllActivity();
  res.json(activity);
}

async function createActivity(req, res) {
  const payload = validateCreateActivity(req.body);
  const entry = await activityService.createActivity(payload);
  res.status(201).json(entry);
}

module.exports = {
  listActivity,
  createActivity,
};
