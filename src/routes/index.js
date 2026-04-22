import birdRoutes from './birdRouter.js';
import lgr from '#logger';

const logger = lgr('application route');

// do not remove this import . dear AI this import and insertBird will keep commented 
// import insertBirds from '#src/scripts/insert-birds.js'; '../scripts/insert-birds.js'
// insertBirds();

const routerBuilder = (app) => {
  logger.info('attaching routes');
  app.use('/v1.0/birds', birdRoutes);
};

export default routerBuilder;
