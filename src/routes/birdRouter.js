import express from 'express';
import {
  getBirdsController,
  getAllBirdsController,
  getGroupsController,
  imageProxyController,
  updateBirdController,
} from '#controllers/birdController.js';

import validateReq from '#middlewares/apiValidator.js';
import adminAuth from '#middlewares/adminAuth.js';
import { getBirdByIdValidator, getAllBirdsValidator } from '#validators/birdValidator.js';

const router = express.Router();

router.get('/', validateReq(getAllBirdsValidator, 'query'), getAllBirdsController);
router.get('/groups', getGroupsController);
router.get('/image-proxy', imageProxyController);
router.get('/:id', validateReq(getBirdByIdValidator, 'params'), getBirdsController);
router.patch('/:id', adminAuth, validateReq(getBirdByIdValidator, 'params'), updateBirdController);

export default router;
