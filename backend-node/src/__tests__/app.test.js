const request = require('supertest');
const app = require('../../server');

describe('API Server Integration Tests', () => {
  test('should return actuator health status', async () => {
    const res = await request(app).get('/api/actuator/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('UP');
  });

  test('should return 404 for non-existent paths', async () => {
    const res = await request(app).get('/api/actuator/invalid-path');
    expect(res.statusCode).toEqual(404);
  });
});
