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
    logger.info(`🚀 API server running → http://localhost:${PORT}`);
  });
}

process.on('uncaughtException', (err) => {
  logger.error(`💥 Uncaught exception — shutting down: ${err.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`💥 Unhandled rejection — shutting down: ${reason}`);
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('🛑 SIGTERM received — shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('🛑 SIGINT received — shutting down gracefully');
  process.exit(0);
});
