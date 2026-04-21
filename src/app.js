import express from 'express';
import path from 'path';

import config from '#config';
import requestLogger from '#middlewares/requestLogger.js';
import applicationRouter from '#routes/index.js';
import basicMW from '#middlewares/basic.js';
import errorHandlerMW from '#middlewares/errorHandler.js';

const ROOT = process.cwd();

const app = express();
basicMW(app);

app.use(requestLogger);

app.get('/_health', (req, res) => { res.status(200).json({ status: 'ok' }); });

const mode = config.get('mode');
if (mode === 'server') {
  applicationRouter(app);

  if (!process.env.NETLIFY) {
    // Static files: built frontend + public assets
    app.use(express.static(path.join(ROOT, 'web/dist')));
    app.use(express.static(path.join(ROOT, 'public')));

    // SPA fallback — serve index.html for all unmatched routes
    app.use('/', (req, res) => {
      res.sendFile(path.join(ROOT, 'web/dist/index.html'));
    });
  }
} else {
  throw new Error('server type not supported');
}
errorHandlerMW(app, config.get('debug'));

export default app;
