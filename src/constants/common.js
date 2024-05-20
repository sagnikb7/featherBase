const CONSTANTS = {
  httpStatus: {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    FOUND: 302,
    TEMP_REDIRECT: 307,
    REDIRECT: 308,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    NOT_ALLOWED: 405,
    SERVER_ERROR: 500,
  },
  NANO_ID_CUSTOM_ALPHA: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  NANO_ID_CUSTOM_ALPHA_LOWER: '0123456789abcdefghijklmnopqrstuvwxyz',

  apiStatus: {
    SUCCESS: true,
    ERROR: false,
    NOT_FOUND: false,
  },

  table: {
    VENDORS: 'vendors',
  },
};

// eslint-disable-next-line import/prefer-default-export
export { CONSTANTS };
