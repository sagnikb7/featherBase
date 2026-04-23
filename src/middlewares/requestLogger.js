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
    REQ_ID: req.id, TYPE: 'req', METHOD: req.method, URL: req.originalUrl, IP: req.ip,
  };
  if (ENABLE_REQ_HEADER_LOGGING) reqLog.HEADERS = req.headers;

  // Log request body (if applicable)
  if (ENABLE_REQ_BODY_LOGGING && METHODS_WITH_BODY.includes(req.method) && req.body) {
    const bodyLog = JSON.parse(JSON.stringify(req.body));
    if (req.body?.password) bodyLog.password = '*******';
    if (req.body?.username) bodyLog.username = '*******';

    reqLog.BODY = bodyLog;
  }

  logger.info({ ...reqLog, message: `→ ${req.method} ${req.originalUrl}` });

  res.on('finish', () => {
    const status = res.statusCode;
    const emoji = status >= 500 ? '💥' : status >= 400 ? '⚠️' : '✅';
    const resLog = { REQ_ID: req.id, TYPE: 'res', STATUS: status };
    if (ENABLE_RES_HEADER_LOGGING) resLog.RES_HEADERS = res.getHeaders();
    logger.info({ ...resLog, message: `${emoji} ${status} ← ${req.method} ${req.originalUrl}` });
  });

  return next();
};

export default loggingMiddleware;
