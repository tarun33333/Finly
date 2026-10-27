import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { User } from '../src/models/User';
import { Transaction } from '../src/models/Transaction';
import { Category } from '../src/models/Category';

let userAToken: string;
let userARefreshToken: string;
let userAId: string;
let userBToken: string;
let categoryId: string;
let createdTxnId: string;

beforeAll(async () => {
  await connectDatabase();
  // Clear any existing test users
  await User.deleteMany({ email: { $in: ['test_usera@finly.app', 'test_userb@finly.app'] } });
});

afterAll(async () => {
  await User.deleteMany({ email: { $in: ['test_usera@finly.app', 'test_userb@finly.app'] } });
  await disconnectDatabase();
});

describe('Finly Backend API Tests', () => {
  describe('Health Endpoint', () => {
    it('GET /api/v1/health should return 200 and healthy database status', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.database.status).toBe('connected');
    });
  });

  describe('Authentication Flow', () => {
    it('POST /api/v1/auth/register should create user and return tokens', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Test User A',
        email: 'test_usera@finly.app',
        password: 'Password123!',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.email).toBe('test_usera@finly.app');

      userAToken = res.body.data.accessToken;
      userARefreshToken = res.body.data.refreshToken;
      userAId = res.body.data.user._id;
    });

    it('POST /api/v1/auth/register should reject duplicate email', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Duplicate',
        email: 'test_usera@finly.app',
        password: 'Password123!',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/login should authenticate with valid credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'test_usera@finly.app',
        password: 'Password123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('POST /api/v1/auth/login should fail with invalid password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'test_usera@finly.app',
        password: 'WrongPassword123!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/refresh should rotate refresh token', async () => {
      const res = await request(app).post('/api/v1/auth/refresh').send({
        refreshToken: userARefreshToken,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.refreshToken).not.toBe(userARefreshToken);

      userAToken = res.body.data.accessToken;
      userARefreshToken = res.body.data.refreshToken;
    });

    it('Create User B for isolation testing', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Test User B',
        email: 'test_userb@finly.app',
        password: 'Password123!',
      });

      expect(res.status).toBe(201);
      userBToken = res.body.data.accessToken;
    });
  });

  describe('Categories & Transactions', () => {
    it('GET /api/v1/categories should return seeded categories without any duplicate names', async () => {
      const res = await request(app)
        .get('/api/v1/categories')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      const foodCat = res.body.data.find((c: any) => c.name === 'Food & Dining');
      expect(foodCat).toBeDefined();
      categoryId = foodCat._id;

      // Verify ZERO duplicate category names exist in the response
      const names = res.body.data.map((c: any) => `${c.type}:${c.name.toLowerCase()}`);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('POST /api/v1/transactions should create an expense in INR', async () => {
      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          type: 'expense',
          amount: 350.5,
          categoryId,
          merchant: 'Swiggy Biryani',
          description: 'Dinner with friends',
          transactionDate: new Date().toISOString(),
          paymentMethod: 'UPI',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.amount).toBe(350.5);
      expect(res.body.data.amountInPaise).toBe(35050);
      createdTxnId = res.body.data._id;
    });

    it('POST /api/v1/transactions duplicate detection should return warning', async () => {
      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          type: 'expense',
          amount: 350.5,
          categoryId,
          merchant: 'Swiggy Biryani',
          description: 'Dinner with friends',
          transactionDate: new Date().toISOString(),
          paymentMethod: 'UPI',
        });

      expect(res.status).toBe(200);
      expect(res.body.isDuplicateWarning).toBe(true);
    });

    it('Security Isolation: User B cannot access User A transaction', async () => {
      const res = await request(app)
        .get(`/api/v1/transactions/${createdTxnId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
    });

    it('Security Isolation: User B cannot delete User A transaction', async () => {
      const res = await request(app)
        .delete(`/api/v1/transactions/${createdTxnId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
    });

    it('GET /api/v1/transactions/summary calculates accurate totals', async () => {
      const res = await request(app)
        .get('/api/v1/transactions/summary')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.periodExpense).toBe(350.5);
      expect(res.body.data.currency).toBe('INR');
    });

    it('GET /api/v1/exports/transactions.csv generates valid CSV', async () => {
      const res = await request(app)
        .get('/api/v1/exports/transactions.csv')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('Swiggy Biryani');
    });
  });
});

