import express from 'express';

// eslint-disable-next-line new-cap
const router = express.Router();

// const { getCompanyConfig, updateCompanyConfig } = require('@controllers/companyConfController');
// const { validateReq } = require('@middlewares/apiValidateMW');
// const { companyConfPatchValidator } = require('@validators/companyConfValidator');

router.get('/', (req, res, next) => {
  try {
    res.json({ result: ['OK'] });
  } catch (error) {
    next(error);
  }
});

export default router;
