import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, json } = format;

const loggerMap = {};

const jsonFormat = combine(
  timestamp(),
  json(),
  printf(({ timestamp: ts, level, message, file, meta }) => JSON.stringify({
    time: ts, level, msg: message, meta, file,
  })),
);

const loggerManager = (file) => {
  if (loggerMap[file]) {
    return loggerMap[file];
  }
  loggerMap[file] = createLogger({
    level: 'info',
    format: jsonFormat,
    transports: [new transports.Console()],
    defaultMeta: { file },
  });
  return loggerMap[file];
};

export default loggerManager;
