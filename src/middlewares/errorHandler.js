/* eslint-disable no-unused-vars */
import fs from 'fs';
// TODO
// import { ProfilingIntegration } from '@sentry/profiling-node';
import Sentry from '@sentry/node';
import { ERROR } from '#constants/error.js';
import { CONSTANTS } from '#constants/common.js';

import lgr from '#logger';
// import { printErrors } from '#utils/chalk.js';

const logger = lgr('error mw');

const data = fs.readFileSync('package.json', 'utf8');
const jsonData = JSON.parse(data);

const sentryOptions = (app) => ({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  release: jsonData.version,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }), // enable HTTP calls tracing
    new Sentry.Integrations.Express({ app }), // enable Express.js middleware tracing
    // new ProfilingIntegration(),
  ],
  tracesSampleRate: 0.75, // Performance Monitoring , Capture 100% of the transactions, reduce in production!
  profilesSampleRate: 0.75, // Set sampling rate for profiling - this is relative to tracesSampleRate
});

const errorMiddleware = (app, debug) => {
  logger.info('adding error middlewares');

  Sentry.init(sentryOptions(app));

  // not found middleware
  app.use((req, res, next) => {
    res.status(404).json(
      {
        status: CONSTANTS.apiStatus.NOT_FOUND,
        error: { message: ERROR.common.NOT_FOUND },
      },
    );
  });

  app.use(Sentry.Handlers.errorHandler());

  app.use((err, req, res, next) => {
    logger.error(`${err.message} \n${err.stack || ''}`);

    const errorResponse = { status: CONSTANTS.apiStatus.ERROR, error: { message: err.message } };
    if (debug) errorResponse.errorStack = err.stack;
    // if (err.statusMessage) errorResponse.status = err.statusMessage;
    res.status(err.status || 500).json(errorResponse);
  });
};

export default errorMiddleware;
