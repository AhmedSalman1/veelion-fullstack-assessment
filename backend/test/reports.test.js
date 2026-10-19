const fs = require('node:fs');
const path = require('node:path');

const request = require('supertest');

const app = require('../src/app');
const { useTempDataDir, writeJson, cleanup } = require('./helpers');

const tasks = [
  {
    id: 'task-1',
    title: 'Done task',
    completed: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'task-2',
    title: 'Another done task',
    completed: true,
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'task-3',
    title: 'Todo task',
    completed: false,
    createdAt: '2026-01-03T00:00:00.000Z',
    updatedAt: '2026-01-03T00:00:00.000Z',
  },
];

const activity = [
  {
    id: 'activity-1',
    action: 'created',
    info: 'task-1',
    when: '2020-01-01T00:00:00.000Z',
  },
  {
    id: 'activity-2',
    action: 'completed',
    info: 'task-1',
    when: '2026-01-01T00:00:00.000Z',
  },
];

let dir;

beforeEach(() => {
  dir = useTempDataDir();
  writeJson(dir, 'tasks.json', tasks);
  writeJson(dir, 'activity.json', activity);
});

afterEach(() => {
  cleanup(dir);
});

describe('reports', () => {
  it('returns a task summary with status counts and the activity count', async () => {
    const response = await request(app).get('/reports/tasks-summary');

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({
      total: 3,
      byStatus: {
        todo: 1,
        'in-progress': 0,
        done: 2,
      },
      recentActivityCount: 2,
    });
  });

  it('counts all activity entries regardless of when they happened', async () => {
    const response = await request(app).get('/reports/tasks-summary');

    expect(response.body.recentActivityCount).toBe(activity.length);
  });

  it('returns zeros when both data files are empty', async () => {
    writeJson(dir, 'tasks.json', []);
    writeJson(dir, 'activity.json', []);

    const response = await request(app).get('/reports/tasks-summary');

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({
      total: 0,
      byStatus: {
        todo: 0,
        'in-progress': 0,
        done: 0,
      },
      recentActivityCount: 0,
    });
  });

  it('returns zeros when both data files are missing', async () => {
    fs.rmSync(path.join(dir, 'tasks.json'));
    fs.rmSync(path.join(dir, 'activity.json'));

    const response = await request(app).get('/reports/tasks-summary');

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({
      total: 0,
      byStatus: {
        todo: 0,
        'in-progress': 0,
        done: 0,
      },
      recentActivityCount: 0,
    });
  });
});
