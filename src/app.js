import express from 'express';

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
if (mode === 'server') applicationRouter(app);
else throw new Error('server type not supported');
errorHandlerMW(app, config.get('debug'));

export default app;
