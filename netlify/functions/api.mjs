import serverless from 'serverless-http';
import mongoose from 'mongoose';
import config from '../../src/config.js';
import app from '../../src/app.js';

const mongoURI = config.get('database').mongo;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000,
  });
};

const wrappedApp = serverless(app);

export const handler = async (event, context) => {
  await connectDB();
  return wrappedApp(event, context);
};
