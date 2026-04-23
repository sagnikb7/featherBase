import { createLogger, format, transports } from 'winston';
import config from '#config';

const { combine, timestamp, printf, colorize } = format;

const isProd = config.get('env') === 'production';
const logLevel = config.get('debug') ? 'debug' : 'info';

const prettyFormat = combine(
  timestamp({ format: 'HH:mm:ss' }),
  colorize({ level: true }),
  printf(({ timestamp: ts, level, message, file, meta }) => {
    const fileTag = file ? ` \x1b[2m(${file})\x1b[0m` : '';
    const metaPart = meta !== undefined ? ` \x1b[2m${JSON.stringify(meta)}\x1b[0m` : '';
    return `\x1b[2m[${ts}]\x1b[0m ${level}${fileTag} ${message ?? ''}${metaPart}`;
  }),
);

const jsonFormat = combine(
  timestamp(),
  printf(({ timestamp: ts, level, message, file, meta }) => {
    const entry = { time: ts, level, msg: message, file };
    if (meta !== undefined) entry.meta = meta;
    return JSON.stringify(entry);
  }),
);

const loggerMap = {};

const loggerManager = (file) => {
  if (loggerMap[file]) return loggerMap[file];

  loggerMap[file] = createLogger({
    level: logLevel,
    format: isProd ? jsonFormat : prettyFormat,
    transports: [new transports.Console()],
    defaultMeta: { file },
  });

  return loggerMap[file];
};

export default loggerManager;
