import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import config from '#config';
import requestLogger from '#middlewares/requestLogger.js';
import applicationRouter from '#routes/index.js';

// import lgr from '#logger';
// const logger = lgr('app');

// inject middlewares
import basicMW from '#middlewares/basic.js';
// else if (serverType === 'webhook') webhookRouter(app);

import errorHandlerMW from '#middlewares/errorHandler.js';

const app = express();
basicMW(app);

app.use(requestLogger);

// health routes
app.get('/_health', (req, res) => { res.status(200).send('ok'); });

const mode = config.get('mode');
if (mode === 'server') {
  applicationRouter(app);

  //   Front end setup
  const dir = path.dirname(fileURLToPath(import.meta.url));
  app.use(express.static(path.join(dir, '../web/dist/')));
  app.use(express.static(path.join(dir, '../public')));
  app.use('/', (req, res) => {
    res.contentType('text/html');
    res.sendFile(path.join(dir, '../web/dist/index.html'));
  });
} else {
  throw new Error('server type not supported');
}
errorHandlerMW(app, config.get('debug'));

export default app;
