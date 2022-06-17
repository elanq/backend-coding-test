const express = require('express');

const app = express();

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

const rideModel = require('./model/ride');

module.exports = (db, logger) => {
  app.get('/health', (req, res) => res.send('Healthy'));

  app.post('/rides', jsonParser, async (req, res) => {
    const ride = rideModel.newRide(req.body);

    const validation = rideModel.validateRideData(ride);
    if (validation != null) {
      return res.send(validation);
    }

    try {
      const lastID = await rideModel.insertNewRide(db, ride);
      const rows = await rideModel.getRideByID(db, lastID);

      logger.info(
        'OK',
        { path: '/rides', method: 'POST' },
      );
      return res.send(rows);
    } catch (err) {
      logger.error(
        'error while performing insert ride',
        { path: '/rides', method: 'POST', error: err.message },
      );
      return res.status(500).send({
        error_code: 'SERVER_ERROR',
        message: 'Unknown error',
      });
    }
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
