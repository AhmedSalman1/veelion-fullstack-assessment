const config = require('../../../config');
const { createId } = require('../../../utils/id');
const { readJsonArray, writeJsonArray } = require('../../../utils/jsonStore');

function getAllActivity() {
  return readJsonArray(config.activityFilePath());
}

async function createActivity(payload) {
  const activity = await readJsonArray(config.activityFilePath());
  const entry = {
    id: createId(),
    action: payload.action,
    info: payload.info,
    when: new Date().toISOString(),
  };

  activity.push(entry);
  await writeJsonArray(config.activityFilePath(), activity);

  return entry;
}

module.exports = {
  getAllActivity,
  createActivity,
};
