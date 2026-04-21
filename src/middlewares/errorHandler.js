/* eslint-disable no-unused-vars */
import * as Sentry from '@sentry/node';
import { ERROR } from '#constants/error.js';
import { CONSTANTS } from '#constants/common.js';

import lgr from '#logger';

const logger = lgr('error mw');

const errorMiddleware = (app, debug) => {
  logger.info('adding error middlewares');

  // Sentry.init(sentryOptions(app));

  // not found middleware
  app.use((req, res, next) => {
    res.status(404).json(
      {
        status: CONSTANTS.apiStatus.NOT_FOUND,
        error: { message: ERROR.common.NOT_FOUND },
      },
    );
  });

  // app.use(Sentry.Handlers.errorHandler());

  app.use((err, req, res, next) => {
    logger.error(`${err.message} \n${err.stack || ''}`);

    const errorResponse = { status: CONSTANTS.apiStatus.ERROR, error: { message: err.message } };
    if (debug) errorResponse.errorStack = err.stack;
    // if (err.statusMessage) errorResponse.status = err.statusMessage;
    res.status(err.status || 500).json(errorResponse);
  });
};

export default errorMiddleware;
