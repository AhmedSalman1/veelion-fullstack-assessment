const config = require('../../../config');
const { readJsonArray } = require('../../../utils/jsonStore');

function summarizeTasks(tasks) {
  const byStatus = {
    todo: 0,
    'in-progress': 0,
    done: 0,
  };

  for (const task of tasks) {
    const status = task.completed === true ? 'done' : 'todo';
    byStatus[status] += 1;
  }

  return {
    total: tasks.length,
    byStatus,
  };
}

async function getTasksSummary() {
  const [tasks, activity] = await Promise.all([
    readJsonArray(config.tasksFilePath()),
    readJsonArray(config.activityFilePath()),
  ]);

  return {
    ...summarizeTasks(tasks),
    recentActivityCount: activity.length,
  };
}

module.exports = {
  getTasksSummary,
};
