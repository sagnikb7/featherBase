const ERROR = {};

ERROR.common = { NOT_FOUND: 'resource not found' };

// httpStatus is defined in common constants : PS the comments are for reference
// BAD_REQUEST: 400,
// UNAUTHORIZED: 401,
// FORBIDDEN: 403,
// NOT_FOUND: 404,
// NOT_ALLOWED: 405,
// SERVER_ERROR: 500,

ERROR.modelSpecific = {
  VENDOR_NOT_EXISTS: {
    errorMsg: 'vendor not found / deactivated',
    httpStatus: 'BAD_REQUEST',
  },
  VENDOR_NOT_ALLOWED: {
    errorMsg: 'This vendor is not allowed',
    httpStatus: 'BAD_REQUEST',
  },
  COMPANY_CONFIG_NOT_EXISTS: {
    errorMsg: 'org vendor config not found',
    httpStatus: 'BAD_REQUEST',
  },
  PAYMENT_ALREADY_EXISTS: {
    errorMsg: 'payment with similar orderId is pending',
    httpStatus: 'BAD_REQUEST',
  },
  PAYMENT_NOT_EXISTS: {
    errorMsg: 'payment does not exist',
    httpStatus: 'BAD_REQUEST',
  },
  ESSENTIAL_FILTER_MISSING: {
    errorMsg: 'paymentId / orderIds in query missing',
    httpStatus: 'BAD_REQUEST',
  },
};

// eslint-disable-next-line import/prefer-default-export
export { ERROR };
