import config from '#config';

const adminAuth = (req, res, next) => {
  const expected = config.get('adminToken');
  if (!expected) {
    return res.status(503).json({ success: false, message: 'Admin token not configured' });
  }

  // Accept token via Authorization: Bearer <token> or X-Admin-Token header
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const headerToken = req.headers['x-admin-token'];

  if (!bearerToken && !headerToken) {
    return res.status(401).json({ success: false, message: 'Missing admin token' });
  }

  if (bearerToken !== expected && headerToken !== expected) {
    return res.status(401).json({ success: false, message: 'Invalid admin token' });
  }

  return next();
};

export default adminAuth;
