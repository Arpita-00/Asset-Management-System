const request = require('supertest');
const app = require('../../server');
const { User } = require('../models');

describe('User loginCount & lastLoginAt Flow Tests', () => {
  let testUserEmail;
  let testUserPassword = 'Password@123';
  let testUser;

  beforeAll(async () => {
    // Generate a unique email to avoid conflicts
    testUserEmail = `testuser_${Date.now()}@example.com`;
  });

  afterAll(async () => {
    // Clean up the created test user
    if (testUser) {
      await User.destroy({ where: { id: testUser.id } });
    }
  });

  test('should register a new user with loginCount = 0', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'LoginCount',
        email: testUserEmail,
        password: testUserPassword,
        phone: '1234567890'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.data).toBeDefined();
    
    testUser = await User.findOne({ where: { email: testUserEmail } });
    expect(testUser).toBeDefined();
    expect(testUser.loginCount).toEqual(0);
    expect(testUser.lastLoginAt).toBeNull();
  });

  test('should record loginCount = 1 on first successful login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUserEmail,
        password: testUserPassword
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.loginCount).toEqual(1);
    expect(res.body.data.lastLoginAt).toBeDefined();

    // Verify database state
    await testUser.reload();
    expect(testUser.loginCount).toEqual(1);
    expect(testUser.lastLoginAt).not.toBeNull();
  });

  test('should record loginCount = 2 on second successful login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUserEmail,
        password: testUserPassword
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.loginCount).toEqual(2);

    // Verify database state
    await testUser.reload();
    expect(testUser.loginCount).toEqual(2);
  });

  test('should record loginCount = 3 on third successful login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUserEmail,
        password: testUserPassword
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.loginCount).toEqual(3);

    // Verify database state
    await testUser.reload();
    expect(testUser.loginCount).toEqual(3);
  });
});
