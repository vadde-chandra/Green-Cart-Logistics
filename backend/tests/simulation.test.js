const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Route = require('../models/Route');
const Order = require('../models/Order');

describe('Simulation API', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/greencart-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create test user
    testUser = new User({
      name: 'Test Manager',
      email: 'test@greencart.com',
      password: 'testpass123'
    });
    await testUser.save();

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@greencart.com',
        password: 'testpass123'
      });

    authToken = loginResponse.body.token;

    // Create test data
    await Driver.create([
      { name: 'Test Driver 1', shift_hours: 8, past_week_hours: [8, 8, 8, 8, 8, 6, 0] },
      { name: 'Test Driver 2', shift_hours: 10, past_week_hours: [10, 9, 8, 8, 9, 7, 0] }
    ]);

    await Route.create([
      { route_id: 1, distance: 5, traffic_level: 'Low', base_time: 30 },
      { route_id: 2, distance: 8, traffic_level: 'High', base_time: 45 }
    ]);

    await Order.create([
      { order_id: 1, value_rs: 500, route_id: 1, delivery_time: '01:00' },
      { order_id: 2, value_rs: 1500, route_id: 2, delivery_time: '01:30' }
    ]);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('POST /api/simulation/run', () => {
    it('should run simulation successfully with valid parameters', async () => {
      const response = await request(app)
        .post('/api/simulation/run')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          available_drivers: 2,
          start_time: '09:00',
          max_hours_per_day: 8
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total_profit');
      expect(response.body).toHaveProperty('efficiency_score');
      expect(response.body).toHaveProperty('on_time_deliveries');
      expect(response.body).toHaveProperty('late_deliveries');
      expect(response.body).toHaveProperty('fuel_cost_breakdown');
      expect(response.body.fuel_cost_breakdown).toHaveProperty('base_cost');
      expect(response.body.fuel_cost_breakdown).toHaveProperty('surcharge');
      expect(response.body.fuel_cost_breakdown).toHaveProperty('total');
    });

    it('should return error for invalid parameters', async () => {
      const response = await request(app)
        .post('/api/simulation/run')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          available_drivers: -1,
          start_time: '25:00',
          max_hours_per_day: 30
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Validation failed');
    });

    it('should return error when requesting more drivers than available', async () => {
      const response = await request(app)
        .post('/api/simulation/run')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          available_drivers: 10,
          start_time: '09:00',
          max_hours_per_day: 8
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('drivers available');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/simulation/run')
        .send({
          available_drivers: 1,
          start_time: '09:00',
          max_hours_per_day: 8
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/simulation/history', () => {
    it('should return simulation history', async () => {
      // First run a simulation
      await request(app)
        .post('/api/simulation/run')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          available_drivers: 1,
          start_time: '09:00',
          max_hours_per_day: 8
        });

      const response = await request(app)
        .get('/api/simulation/history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('results');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.results)).toBe(true);
    });
  });
});