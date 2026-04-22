import convict from 'convict';

const config = convict({
  env: {
    doc: 'The application environment',
    format: ['production', 'development', 'test', 'local', 'ci'],
    default: 'development',
    env: 'NODE_ENV',
    arg: 'node_env',
  },
  mode: {
    doc: 'mode of the service',
    format: ['server'],
    default: 'server',
    env: 'MODE',
    arg: 'mode',
  },
  port: {
    doc: 'port of the service',
    format: Number,
    default: 8888,
    env: 'PORT',
    arg: 'port',
  },
  debug: {
    doc: 'show verbose logging',
    format: Boolean,
    default: false,
    env: 'DEBUG',
    arg: 'debug',
  },
  serviceName: {
    doc: 'set service name',
    format: ['feather-base', ''],
    default: '',
    env: 'SERVICE_NAME',
    arg: 'service_name',
  },
  database: {
    mongo: {
      doc: 'mongo connection string',
      format: String,
      default: '',
      env: 'MONGO_DB',
      arg: 'mongo_db',
    },
  },
});

config.validate({ allowed: 'strict' });

export default config;
