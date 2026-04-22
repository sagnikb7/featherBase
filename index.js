import { createServer } from 'http';
import config from '#config';
import lgr from '#logger';
import { connectToDatabase } from '#utils/mongo.js';

import app from '#src/app.js';

const logger = lgr('server');
const mode = config.get('mode');
const PORT = config.get('port');

if (mode === 'server') {
  connectToDatabase();

  const httpServer = createServer(app);
  httpServer.listen(PORT, () => {
    logger.info(`API server [STARTED] at PORT:${PORT}`);
  });
}

process.on('uncaughtException', (err) => {
  logger.error(err);
  logger.info('uncaughtException : shutting down server');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`unhandledRejection: ${reason}`);
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Shutting down');
  process.exit(0);
});
