const path = require('path');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-ci';
process.env.SQLITE_STORAGE = path.resolve(__dirname, 'test.sqlite');

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const request = require('supertest');

const dbPath = process.env.SQLITE_STORAGE;
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const app = require('../src/app');
const { initDatabase, closeDatabase } = require('../src/db/init');

describe('Stravo API integration', () => {
  let token;
  let activityId;
  let segmentId;

  before(async () => {
    await initDatabase({ force: true });
  });

  after(async () => {
    await closeDatabase();
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  });

  it('health check includes database status', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.database, 'connected');
  });

  it('registers a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        identifier: 'test@example.com',
        password: 'password123',
      });

    assert.equal(res.status, 201);
    assert.ok(res.body.token);
    assert.equal(res.body.user.email, 'test@example.com');
    token = res.body.token;
  });

  it('rejects short passwords', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bad Password',
        identifier: 'short@example.com',
        password: 'short',
      });

    assert.equal(res.status, 400);
  });

  it('creates an activity from GPS points', async () => {
    const res = await request(app)
      .post('/api/activities')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test walk',
        points: [
          { latitude: 12.5657, longitude: 104.991, timestamp: '2026-01-01T10:00:00.000Z' },
          { latitude: 12.5667, longitude: 104.992, timestamp: '2026-01-01T10:05:00.000Z' },
          { latitude: 12.5677, longitude: 104.993, timestamp: '2026-01-01T10:10:00.000Z' },
        ],
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.title, 'Test walk');
    assert.ok(res.body.activitySegments?.length >= 1);
    activityId = res.body.id;
    segmentId = res.body.activitySegments[0].id;
  });

  it('scopes activity detail to owner', async () => {
    const other = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Other User',
        identifier: 'other@example.com',
        password: 'password123',
      });

    const res = await request(app)
      .get(`/api/activities/${activityId}`)
      .set('Authorization', `Bearer ${other.body.token}`);

    assert.equal(res.status, 404);
  });

  it('allows owner to fetch activity detail', async () => {
    const res = await request(app)
      .get(`/api/activities/${activityId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.id, activityId);
  });

  it('creates and updates segment feedback', async () => {
    const createRes = await request(app)
      .post(`/api/segments/${segmentId}/feedback`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isInteresting: true });

    assert.equal(createRes.status, 201);
    assert.equal(createRes.body.isInteresting, true);

    const updateRes = await request(app)
      .post(`/api/segments/${segmentId}/feedback`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isInteresting: false });

    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.updated, true);
    assert.equal(updateRes.body.isInteresting, false);
  });

  it('lists segments publicly', async () => {
    const res = await request(app).get('/api/segments');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 1);
  });
});
