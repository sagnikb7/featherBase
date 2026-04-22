import mongoose from 'mongoose';
import config from '#config';
import lgr from '#logger';

const logger = lgr('mongo init');

const connectToDatabase = () => {
  const mongoURI = config.get('database').mongo;

  mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 30 * 1000,
  });

  const db = mongoose.connection;

  db.on('error', (err) => logger.error(`mongoDB connection error: ${err}`));
  db.once('open', () => logger.info('mongoDB connected'));
  return db;
};

export { connectToDatabase };
