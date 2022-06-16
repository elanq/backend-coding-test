const request = require('supertest');
const { loggers } = require('winston');

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db, require('winston'));

const buildSchemas = require('../src/schemas');

describe('API tests', () => {
  before((done) => {
    db.serialize((err) => {
      if (err) {
        return done(err);
      }

      buildSchemas(db);

      done();
    });
  });

  describe('GET /health', () => {
    it('should return health', (done) => {
      request(app)
        .get('/health')
        .expect('Content-Type', /text/)
        .expect(200, done);
    });
  });

  describe('POST /rides', () => {
    const requestBody = {
      start_lat: 80,
      start_long: 100,
      end_lat: 81,
      end_long: 101,
      rider_name: 'Sugiharto',
      driver_name: 'Sugeng',
      driver_vehicle: 'Motorcycle',
    };

    it('should perform ride creation', (done) => {
      request(app)
        .post('/rides')
        .send(requestBody)
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });

  describe('GET /rides', () => {
    it('should return list of rides', (done) => {
      request(app)
        .get('/rides')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });

  describe('GET /rides/:id', () => {
    it('should return detail of ride', (done) => {
      request(app)
        .get('/rides/1')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });
});
