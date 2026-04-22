import birdRoutes from './birdRouter.js';
import lgr from '#logger';

const logger = lgr('application route');

const routerBuilder = (app) => {
  logger.info('attaching routes');
  app.use('/v1.0/birds', birdRoutes);
};

export default routerBuilder;
