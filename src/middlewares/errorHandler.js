import { ERROR } from '#constants/error.js';
import { CONSTANTS } from '#constants/common.js';
import lgr from '#logger';

const logger = lgr('error mw');

const errorMiddleware = (app, debug) => {
  logger.info('🔧 Registering error handlers');

  app.use((_req, res) => {
    res.status(404).json({
      status: CONSTANTS.apiStatus.NOT_FOUND,
      error: { message: ERROR.common.NOT_FOUND },
    });
  });

  app.use((err, _req, res, _next) => {
    logger.error(`${err.message} \n${err.stack || ''}`);

    const errorResponse = { status: CONSTANTS.apiStatus.ERROR, error: { message: err.message } };
    if (debug) errorResponse.errorStack = err.stack;
    res.status(err.status || 500).json(errorResponse);
  });
};

export default errorMiddleware;
