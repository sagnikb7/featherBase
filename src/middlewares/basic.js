import express from 'express';
import helmet from 'helmet';
import Sentry from '@sentry/node';
import timeout from 'connect-timeout';

import lgr from '#logger';

const logger = lgr('basic mw');

const basicMiddleware = (app) => {
  logger.info('adding sentry tracing,req handlers');
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
  logger.info('adding basic middlewares');
  // basic safety
  app.use(timeout('10s'));
  app.use(helmet());

  // body-parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
};

export default basicMiddleware;
