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
  app.use(timeout('30s'));
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"], // Avoid 'unsafe-inline' unless absolutely necessary
          styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles if used
          imgSrc: [
            "'self'",
            'data:',
            'https://cdn.download.ams.birds.cornell.edu', // allow Cornell bird images
          ],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", 'https:', 'data:'],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false, // optional: if you get COEP-related errors
    }),
  );

  // body-parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
};

export default basicMiddleware;
