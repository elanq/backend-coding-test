const express = require('express');

const app = express();

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

const rideModel = require('./model/ride');

module.exports = (db, logger) => {
  app.get('/health', (req, res) => res.send('Healthy'));

  app.post('/rides', jsonParser, (req, res) => {
    const startLatitude = Number(req.body.start_lat);
    const startLongitude = Number(req.body.start_long);
    const endLatitude = Number(req.body.end_lat);
    const endLongitude = Number(req.body.end_long);
    const riderName = req.body.rider_name;
    const driverName = req.body.driver_name;
    const driverVehicle = req.body.driver_vehicle;

    if (startLatitude < -90 || startLatitude > 90
        || startLongitude < -180 || startLongitude > 180) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      });
    }

    if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      });
    }

    if (typeof riderName !== 'string' || riderName.length < 1) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      });
    }

    if (typeof driverName !== 'string' || driverName.length < 1) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Driver name must be a non empty string',
      });
    }

    if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Driver vehicle must be a non empty string',
      });
    }

    const values = [
      req.body.start_lat,
      req.body.start_long,
      req.body.end_lat,
      req.body.end_long,
      req.body.rider_name,
      req.body.driver_name,
      req.body.driver_vehicle,
    ];

    db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, function insertCallback(err) {
      if (err) {
        return res.send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }

      return db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, (errSelect, rows) => {
        if (errSelect) {
          return res.send({
            error_code: 'SERVER_ERROR',
            message: 'Unknown error',
          });
        }

        return res.send(rows);
      });
    });

    return null;
  });

  app.get('/rides', async (req, res) => {
    const offset = req.query.offset || 0;

    const limit = req.query.limit || 10;

    try {
      const data = await rideModel.listRides(db, offset, limit);

      if (data.length === 0) {
        logger.error('Could not find any rides', { path: '/rides' });

        return res.status(404).send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        });
      }

      logger.info('OK', { path: '/rides' });

      return res.send(data);
    } catch (err) {
      logger.error('Unknown error', { path: '/rides', error: err.message });

      return res.status(500).send({
        error_code: 'SERVER_ERROR',
        message: 'Unknown error',
      });
    }
  });

  app.get('/rides/:id', async (req, res) => {
    const rideID = req.params.id;

    try {
      const rows = await rideModel.getRideByID(db, rideID);

      if (rows.length === 0) {
        logger.error('Could not find any rides', { path: '/rides', error: 'RIDES_NOT_FOUND_ERROR' });

        return res.status(404).send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        });
      }

      logger.info('OK', { path: '/rides' });

      return res.send(rows);
    } catch (err) {
      logger.error('Unknown error', { path: '/rides', error: err.message });

      return res.status(500).send({
        error_code: 'SERVER_ERROR',
        message: 'Unknown error',
      });
    }
  });

  return app;
};
