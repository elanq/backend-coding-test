const port = 8010;

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

const app = require('./src/app')(db, logger);

db.serialize(() => {
  buildSchemas(db);

  app.listen(port, () => logger.info(`App started and listening on port ${port}`));
});
