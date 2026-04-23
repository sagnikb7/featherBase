import express from 'express';
import helmet from 'helmet';
import timeout from 'connect-timeout';
import lgr from '#logger';
import { CONSTANTS } from '#constants/common.js';

const logger = lgr('basic mw');

const basicMiddleware = (app) => {
  logger.info('🔧 Registering core middlewares');

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
            CONSTANTS.cdn.HOST_URL,
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
