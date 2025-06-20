/* eslint-disable max-len */
/* eslint-disable no-shadow */
import { createLogger, format, transports } from 'winston';

const {
  combine, timestamp, printf, json,
} = format;

const loggerMap = {};

// Define the custom format
const jsonFormat = combine(
  timestamp(),
  json(),
  printf(({
    timestamp, level, message, file, meta,
  }) => JSON.stringify({
    time: timestamp, level, msg: message, meta, file,
  })),
);

const loggerManager = (file) => {
  if (loggerMap[file]) {
    return loggerMap.file;
  }
  loggerMap[file] = createLogger({
    // silent: !DEBUG,
    level: 'info',
    format: jsonFormat,
    transports: [
      // new transports.File({ filename: 'error.log', level: 'error' }),
      new transports.Console(),
    ],
    defaultMeta: { file },
  });
  return loggerMap[file];
};

export default loggerManager;
