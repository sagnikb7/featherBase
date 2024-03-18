import express from 'express';
import { getBirds } from '#controllers/birdController.js';

// eslint-disable-next-line new-cap
const router = express.Router();

// const { validateReq } = require('@middlewares/apiValidateMW');
// const { companyConfPatchValidator } = require('@validators/companyConfValidator');

router.get('/:id', getBirds);

export default router;
