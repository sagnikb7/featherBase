import mongoose from 'mongoose';
import config from '#config';
import lgr from '#logger';

const logger = lgr('mongo init');

const connectToDatabase = () => {
  const mongoURI = config.get('database').mongo;

  mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 30 * 1000, // Increase to 30 seconds or more
  });

  const db = mongoose.connection;

  // eslint-disable-next-line no-console
  db.on('error', console.error.bind(console, 'mongoDB connection error:'));
  db.once('open', () => logger.info('mongoDB connected'));
  return db;
};

// eslint-disable-next-line import/prefer-default-export
export { connectToDatabase };
