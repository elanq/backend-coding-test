/* eslint-disable global-require */
const express = require('express');

const app = express();

const port = 8010;

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

const winston = require('winston');
const buildSchemas = require('./src/schemas');

const timestampFormat = () => (new Date()).toLocaleDateString();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new (winston.transports.Console)({
      timestamp: timestampFormat,
      colorize: true,
      level: 'info',
    }),
    new (winston.transports.File)({
      filename: 'error.log',
      level: 'error',
    }),
  ],
});

db.serialize(() => {
  buildSchemas(db);

  const app = require('./src/app')(db);

  app.listen(port, () => logger.info(`App started and listening on port ${port}`));
});
