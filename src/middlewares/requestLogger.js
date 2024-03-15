import { customAlphabet } from 'nanoid/non-secure';
import { CONSTANTS } from '#constants/common.js';
import lgr from '#logger';

const nanoid = customAlphabet(CONSTANTS.NANO_ID_CUSTOM_ALPHA, 8);
const logger = lgr('request-logger');

const METHODS_WITH_BODY = ['POST', 'PUT', 'PATCH'];
const ENABLE_REQ_HEADER_LOGGING = false;
const ENABLE_REQ_BODY_LOGGING = false;

const ENABLE_RES_HEADER_LOGGING = false;

const URLS_TO_IGNORE = ['/_health', '/_healthz', '/_readyz', '/swagger.json', '/grafana.json'];

const loggingMiddleware = (req, res, next) => {
  if (URLS_TO_IGNORE.includes(req.url)) return next();
  req.id = nanoid();
  const reqLog = {
    REQUEST_ID: req.id, TYPE: 'request', METHOD: req.method, URL: req.originalUrl, IP: req.ip,
  };
  if (ENABLE_REQ_HEADER_LOGGING) reqLog.HEADERS = req.headers;

  // Log request body (if applicable)
  if (ENABLE_REQ_BODY_LOGGING && METHODS_WITH_BODY.includes(req.method) && req.body) {
    const bodyLog = JSON.parse(JSON.stringify(req.body));
    if (req.body?.password) bodyLog.password = '*******';
    if (req.body?.username) bodyLog.username = '*******';

    reqLog.BODY = bodyLog;
  }

  logger.info(reqLog);

  // Log response status and headers DISABLE
  res.on('finish', () => {
    const resLog = { REQUEST_ID: req.id, TYPE: 'response', STATUS: res.statusCode };
    if (ENABLE_RES_HEADER_LOGGING) resLog.RES_HEADERS = res.getHeaders();
    logger.info(resLog);
  });

  return next();
};

export default loggingMiddleware;
