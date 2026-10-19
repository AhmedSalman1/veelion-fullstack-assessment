const request = require('supertest');

const app = require('../src/app');
const { useTempDataDir, writeJson, readJson, cleanup } = require('./helpers');

const existingEntry = {
  id: 'activity-1',
  action: 'created',
  info: 'task-1',
  when: '2026-01-01T00:00:00.000Z',
};

let dir;

beforeEach(() => {
  dir = useTempDataDir();
  writeJson(dir, 'activity.json', [existingEntry]);
});

afterEach(() => {
  cleanup(dir);
});

describe('activity', () => {
  it('returns a raw array', async () => {
    const response = await request(app).get('/activity');

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual([existingEntry]);
  });

  it('creates an entry and persists it', async () => {
    const response = await request(app)
      .post('/activity')
      .send({ action: 'updated', info: 'task-1' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ action: 'updated', info: 'task-1' });
    expect(typeof response.body.id).toBe('string');
    expect(readJson(dir, 'activity.json')).toHaveLength(2);
  });

  it('allows action and info to be omitted', async () => {
    const response = await request(app).post('/activity').send({});

    expect(response.status).toBe(201);
  });

  it('includes a newly created entry in a follow-up GET', async () => {
    const created = await request(app).post('/activity').send({ action: 'created' });

    const list = await request(app).get('/activity');

    expect(list.body.some((entry) => entry.id === created.body.id)).toBe(true);
  });

  it('rejects a non-object body', async () => {
    const response = await request(app).post('/activity').send([1, 2]);

    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe('Body must be a JSON object.');
  });

  it('rejects non-string fields', async () => {
    const response = await request(app).post('/activity').send({ action: 42 });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe('"action" must be a string.');
  });

  it('rejects fields longer than the limit', async () => {
    const longAction = await request(app)
      .post('/activity')
      .send({ action: 'a'.repeat(201) });
    const longInfo = await request(app)
      .post('/activity')
      .send({ info: 'i'.repeat(1001) });

    expect(longAction.status).toBe(400);
    expect(longInfo.status).toBe(400);
  });

  it('does not write an entry when validation fails', async () => {
    await request(app).post('/activity').send({ action: 42 });

    expect(readJson(dir, 'activity.json')).toHaveLength(1);
  });
});
