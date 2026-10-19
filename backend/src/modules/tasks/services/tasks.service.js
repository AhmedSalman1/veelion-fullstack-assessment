const config = require('../../../config');
const { createId } = require('../../../utils/id');
const { readJsonArray, writeJsonArray } = require('../../../utils/jsonStore');
const HttpError = require('../../../utils/httpError');

function buildTaskRecord(payload) {
  const now = new Date().toISOString();

  return {
    id: createId(),
    title: payload.title,
    completed: payload.completed,
    createdAt: now,
    updatedAt: now,
  };
}

async function getAllTasks() {
  return readJsonArray(config.tasksFilePath());
}

async function getTaskById(taskId) {
  const tasks = await readJsonArray(config.tasksFilePath());
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    throw new HttpError(404, 'Task not found.');
  }

  return task;
}

async function createTask(payload) {
  const tasks = await readJsonArray(config.tasksFilePath());
  const newTask = buildTaskRecord(payload);

  tasks.push(newTask);
  await writeJsonArray(config.tasksFilePath(), tasks);

  return newTask;
}

async function updateTask(taskId, updates) {
  const tasks = await readJsonArray(config.tasksFilePath());
  const taskIndex = tasks.findIndex((item) => item.id === taskId);

  if (taskIndex === -1) {
    throw new HttpError(404, 'Task not found.');
  }

  const existingTask = tasks[taskIndex];
  const updatedTask = {
    ...existingTask,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  tasks[taskIndex] = updatedTask;
  await writeJsonArray(config.tasksFilePath(), tasks);

  return updatedTask;
}

async function deleteTask(taskId) {
  const tasks = await readJsonArray(config.tasksFilePath());
  const taskIndex = tasks.findIndex((item) => item.id === taskId);

  if (taskIndex === -1) {
    throw new HttpError(404, 'Task not found.');
  }

  const [removedTask] = tasks.splice(taskIndex, 1);
  await writeJsonArray(config.tasksFilePath(), tasks);

  return removedTask;
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
