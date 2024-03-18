const validateReq = (schema, type = 'body') => async (req, res, next) => {
  let param;

  switch (type) {
    case 'body':
      param = req.body;
      break;
    case 'query':
      param = req.query;
      break;
    case 'params':
      param = req.params;
      break;
    default:
      throw new Error('Type not supported in [validateReq]');
  }

  const { error, value } = schema.validate(param);
  if (error) {
    return next({
      status: 400,
      message: `Invalid req params: ${error.details.map((detail) => detail.message).join(', ')}`,
    });
  }
  req.body = value;
  return next();
};

export default validateReq;
