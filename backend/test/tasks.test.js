const request = require('supertest');

const app = require('../src/app');
const { useTempDataDir, writeJson, readJson, cleanup } = require('./helpers');

const firstTask = {
  id: 'task-1',
  title: 'First task',
  completed: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

let dir;

beforeEach(() => {
  dir = useTempDataDir();
  writeJson(dir, 'tasks.json', [firstTask]);
});

afterEach(() => {
  cleanup(dir);
});

describe('tasks', () => {
  it('lists tasks wrapped in data', async () => {
    const response = await request(app).get('/tasks');

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({ data: [firstTask] });
  });

  it('returns one task by id', async () => {
    const response = await request(app).get('/tasks/task-1');

    expect(response.status).toBe(200);
    expect(response.body.data).toStrictEqual(firstTask);
  });

  it('returns 404 for an unknown id', async () => {
    const response = await request(app).get('/tasks/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body.error.message).toBe('Task not found.');
  });

  it('creates a task with a trimmed title and defaults', async () => {
    const response = await request(app).post('/tasks').send({ title: '  New task  ' });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({ title: 'New task', completed: false });
    expect(typeof response.body.data.id).toBe('string');
    expect(readJson(dir, 'tasks.json')).toHaveLength(2);
  });

  it('rejects a missing title', async () => {
    const response = await request(app).post('/tasks').send({});

    expect(response.status).toBe(400);
    expect(response.body.error.message).toEqual(expect.any(String));
  });

  it('rejects an empty title', async () => {
    const response = await request(app).post('/tasks').send({ title: '   ' });

    expect(response.status).toBe(400);
  });

  it('rejects a non-boolean completed value', async () => {
    const response = await request(app).post('/tasks').send({ title: 'Task', completed: 'yes' });

    expect(response.status).toBe(400);
  });

  it('rejects unknown fields on create', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: 'Task', id: 'client-chosen-id', createdAt: 'fake' });

    expect(response.status).toBe(400);
    expect(response.body.error.details.unsupportedFields).toStrictEqual(['id', 'createdAt']);
  });

  it('rejects unknown fields on update', async () => {
    const response = await request(app)
      .patch('/tasks/task-1')
      .send({ completed: true, id: 'hijacked', updatedAt: 'fake' });

    expect(response.status).toBe(400);
    expect(response.body.error.details.unsupportedFields).toStrictEqual(['id', 'updatedAt']);
    expect(readJson(dir, 'tasks.json')[0].id).toBe('task-1');
  });

  it('rejects an empty title on update', async () => {
    const response = await request(app).patch('/tasks/task-1').send({ title: '   ' });

    expect(response.status).toBe(400);
  });

  it('rejects a non-object body', async () => {
    const response = await request(app)
      .post('/tasks')
      .send([{ title: 'Task' }]);

    expect(response.status).toBe(400);
  });

  it('updates the title and preserves server-owned fields', async () => {
    const response = await request(app).patch('/tasks/task-1').send({ title: '  Renamed  ' });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ id: 'task-1', title: 'Renamed' });
    expect(response.body.data.createdAt).toBe(firstTask.createdAt);
  });

  it('updates completed', async () => {
    const response = await request(app).patch('/tasks/task-1').send({ completed: true });

    expect(response.status).toBe(200);
    expect(response.body.data.completed).toBe(true);
    expect(response.body.data.title).toBe(firstTask.title);
  });

  it('rejects an empty update', async () => {
    const response = await request(app).patch('/tasks/task-1').send({});

    expect(response.status).toBe(400);
  });

  it('returns 404 when updating an unknown id', async () => {
    const response = await request(app).patch('/tasks/does-not-exist').send({ completed: true });

    expect(response.status).toBe(404);
  });

  it('deletes a task and returns 204', async () => {
    const response = await request(app).delete('/tasks/task-1');

    expect(response.status).toBe(204);
    expect(readJson(dir, 'tasks.json')).toStrictEqual([]);
  });

  it('returns 404 when deleting an unknown id', async () => {
    const response = await request(app).delete('/tasks/does-not-exist');

    expect(response.status).toBe(404);
  });
});
