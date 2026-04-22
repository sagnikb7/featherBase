import express from 'express';
import helmet from 'helmet';
import timeout from 'connect-timeout';
import lgr from '#logger';

const logger = lgr('basic mw');

const basicMiddleware = (app) => {
  logger.info('adding basic middlewares');

  app.use(timeout('30s'));
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: [
            "'self'",
            'data:',
            'https://sagnikb7.github.io',
          ],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", 'https:', 'data:'],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
};

export default basicMiddleware;
