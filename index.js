import { createServer } from 'http';
import config from '#config';
import lgr from '#logger';
// eslint-disable-next-line import/extensions
import { connectToDatabase } from '#utils/mongo.js';

import app from '#src/app.js';
// const socketServer = require('./socketServer');
// const { consume } = require('./consumer');

const logger = lgr('server');
const mode = config.get('mode');
const PORT = config.get('port');

if (mode === 'server') {
  connectToDatabase();
  //   connectProducer();

  const httpServer = createServer(app);
  httpServer.listen(PORT, () => {
    logger.info(`api server started at PORT:${PORT}`);
  });
}
// if (mode === 'websocket') {
//   const httpServer = createServer(app);
//   socketServer(httpServer);
//   httpServer.listen(PORT, () => { logger.info(`WS server started at PORT:${PORT}`); });
// }
// if (mode === 'consumer') {
//   startHealthCheckDaemon();
//   dbConnectionCheck();
//   consume();
//   connectProducer();
// }

process.on('uncaughtException', (err) => {
  logger.error(err);
  logger.info('uncaughtException : shutting down server');
  //   stopHealthCheckDaemon();
  process.exit(1);
});

process.on('unhandledRejection', () => {
  // console.log('Unhandled rejection at ', promise, `reason: ${err.message}`)
  process.exit(1);
});

function gracefulShutdown() {
  if (mode === 'consumer') {
    // stopHealthCheckDaemon();
  }
  logger.info('Shutting down');
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown());
process.on('SIGINT', () => gracefulShutdown());
