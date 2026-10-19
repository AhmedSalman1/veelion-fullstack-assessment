const path = require('node:path');

const BACKEND_ROOT = path.resolve(__dirname, '..');

function getDataDir() {
  return process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.join(BACKEND_ROOT, 'data');
}

function tasksFilePath() {
  return path.join(getDataDir(), 'tasks.json');
}

function activityFilePath() {
  return path.join(getDataDir(), 'activity.json');
}

module.exports = {
  getDataDir,
  tasksFilePath,
  activityFilePath,
};
