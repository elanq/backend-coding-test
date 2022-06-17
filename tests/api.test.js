const request = require('supertest');

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

const chai = require('chai');

const should = chai.should();

const app = require('../src/app')(db, require('winston'));

const buildSchemas = require('../src/schemas');

describe('API tests', () => {
  afterEach(() => {
    db.run('DELETE FROM Rides');
  });

  before((done) => {
    db.serialize((err) => {
      if (err) {
        return done(err);
      }

      buildSchemas(db);

      return done();
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
      start_lat: 80, start_long: 100, end_lat: 81, end_long: 101, rider_name: 'Sugiharto', driver_name: 'Sugeng', driver_vehicle: 'Motorcycle',
    };

    describe('validations', () => {
      const validationCases = [
        {
          name: 'should validate invalid start latitude and longitude value',
          body: {
            start_lat: -91, start_long: 100, end_lat: 81, end_long: 101, rider_name: 'Sugiharto', driver_name: 'Sugeng', driver_vehicle: 'Motorcycle',
          },
          expectedErrorCode: 'VALIDATION_ERROR',
          expectedMessage: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
        },
        {
          name: 'should validate invalid end latitude and longitude value',
          body: {
            start_lat: 80, start_long: 100, end_lat: -91, end_long: 101, rider_name: 'Sugiharto', driver_name: 'Sugeng', driver_vehicle: 'Motorcycle',
          },
          expectedErrorCode: 'VALIDATION_ERROR',
          expectedMessage: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
        },
        {
          name: 'should validate invalid riderName',
          body: {
            start_lat: 80, start_long: 100, end_lat: 81, end_long: 101, driver_name: 'Sugeng', driver_vehicle: 'Motorcycle',
          },
          expectedErrorCode: 'VALIDATION_ERROR',
          expectedMessage: 'Rider name must be a non empty string',
        },
        {
          name: 'should validate invalid driverName',
          body: {
            start_lat: 80, start_long: 100, end_lat: 81, end_long: 101, rider_name: 'Sugiharto', driver_vehicle: 'Motorcycle',
          },
          expectedErrorCode: 'VALIDATION_ERROR',
          expectedMessage: 'Driver name must be a non empty string',
        },
        {
          name: 'should validate invalid driverVehicle',
          body: {
            start_lat: 80, start_long: 100, end_lat: 81, end_long: 101, rider_name: 'Sugiharto', driver_name: 'Sugeng',
          },
          expectedErrorCode: 'VALIDATION_ERROR',
          expectedMessage: 'Driver vehicle must be a non empty string',
        },
      ];

      validationCases.forEach((element) => {
        it(element.name, (done) => {
          request(app)
            .post('/rides')
            .send(element.body)
            .expect('Content-Type', /json/)
            .expect((res) => {
              should.equal(res.body.error_code, element.expectedErrorCode);
              should.equal(res.body.message, element.expectedMessage);
            })
            .expect(200, done);
        });
      });
    });

    it('should perform ride creation', (done) => {
      request(app)
        .post('/rides')
        .send(requestBody)
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });

  describe('GET /rides', () => {
    describe('when endpoint return results', () => {
      before(() => {
        const values = [
          10,
          90,
          81,
          101,
          'Sugiharto',
          'Sugeng',
          'Motorcycle',
        ];
        db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values);
      });

      it('should return list of rides', (done) => {
        request(app)
          .get('/rides')
          .expect('Content-Type', /json/)
          .expect((res) => {
            should.exist(res.body);
            should.equal(res.body.length, 1);
          })
          .expect(200, done);
      });
    });

    describe('when endpoint return zero results', () => {
      const expectedErrorCode = 'RIDES_NOT_FOUND_ERROR';
      const expectedMessage = 'Could not find any rides';

      it('should return expected error message', (done) => {
        request(app)
          .get('/rides')
          .expect('Content-Type', /json/)
          .expect((res) => {
            should.equal(res.body.error_code, expectedErrorCode);
            should.equal(res.body.message, expectedMessage);
          })
          .expect(404, done);
      });
    });

    describe('when endpoint experiences query issue', () => {
      const expectedErrorCode = 'SERVER_ERROR';
      const expectedMessage = 'Unknown error';

      it('should return expected error message', (done) => {
        request(app)
          .get('/rides?offset=fdsfd&limit=fmdf')
          .expect('Content-Type', /json/)
          .expect((res) => {
            should.equal(res.body.error_code, expectedErrorCode);
            should.equal(res.body.message, expectedMessage);
          })
          .expect(500, done);
      });
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
