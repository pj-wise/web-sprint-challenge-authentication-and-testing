const request = require('supertest');
const server = require('../api/server.js');
const db = require('../database/dbConfig.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secrets = require('../config/secrets.js');

beforeEach(async () => {
  await db('users').truncate();
});

describe('auth-router.js', () => {

  describe('POST /register', () => {
    it('should return json with a 201 http status code', () => {
      return request(server).post('/api/auth/register')
        .send({ username: "steve", password: "123" })
        .then(res => {
          expect(res.type).toMatch(/json/i);
          expect(res.status).toEqual(201);
        });
    });

    it('it should return an obj with username and hashed password', async () => {
      const res = await request(server).post('/api/auth/register')
        .send({ username: "drolon", password: "123" });

      expect(res.body.username).toBe('drolon');
      expect(bcrypt.compareSync('123', res.body.password)).toBe(true);

    });
  });
  describe('POST /login', () => {
    it('should return json with a 200 http status code', () => {
      return request(server).post('/api/auth/register')
        .send({ username: "drolon", password: "123" })
        .then(r => {
          return request(server).post('/api/auth/login')
            .send({ username: "drolon", password: "123" })
            .then(res => {
              expect(res.type).toMatch(/json/i);
              expect(res.status).toEqual(200);
            })
        })
    });
    it('should return an object with a message and token', async () => {
      await request(server).post('/api/auth/register')
        .send({ username: "john", password: "123" });

      const res = await request(server).post('/api/auth/login')
        .send({ username: "john", password: "123" });

      expect(res.body.message).toBe('Welcome john!');
      expect(res.body.token);
    });
    it('should return a valid token with proper information', async () => {
      await request(server).post('/api/auth/register')
        .send({ username: "john", password: "123" });

      const res = await request(server).post('/api/auth/login')
        .send({ username: "john", password: "123" });

      jwt.verify(res.body.token, secrets.jwtSecret, (err, decodedToken) => {
        expect(decodedToken.username).toBe('john');
      })

    });
  });
})