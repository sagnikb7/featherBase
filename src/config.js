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
    format: ['server', 'websocket', 'consumer'],
    default: 'server',
    env: 'MODE',
    arg: 'mode',
  },
  port: {
    doc: 'port of the service',
    format: Number,
    default: 8000,
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
    format: ['feather-base'],
    default: '',
    env: 'SERVICE_NAME',
    arg: 'service_name',
  },
  sentry: {
    dsn: {
      doc: 'sentry DSN',
      format: String,
      default: '',
      env: 'SENTRY_DSN',
      arg: 'sentry_dsn',
    },
    environment: {
      doc: 'sentry environment',
      format: String,
      default: '',
      env: 'SENTRY_ENVIRONMENT',
      arg: 'sentry_environment',
    },
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
  aes: {
    key: {
      doc: 'AES key',
      format: String,
      default: '',
      env: 'AES_KEY',
      arg: 'aes_key',
    },
    iv: {
      doc: 'AES IV',
      format: String,
      default: '',
      env: 'AES_IV',
      arg: 'aes_iv',
    },
  },
});

config.validate({ allowed: 'strict' });

export default config;
