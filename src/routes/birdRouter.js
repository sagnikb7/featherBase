import express from 'express';
import { getBirds } from '#controllers/birdController.js';

import validateReq from '#middlewares/apiValidator.js';
import { getBirdByIdValidator } from '#validators/birdValidator.js';

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/:id', validateReq(getBirdByIdValidator, 'params'), getBirds);

export default router;
