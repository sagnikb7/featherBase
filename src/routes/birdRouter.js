import express from 'express';
import { getBirdsController, getAllBirdsController, getGroupsController } from '#controllers/birdController.js';

import validateReq from '#middlewares/apiValidator.js';
import { getBirdByIdValidator, getAllBirdsValidator } from '#validators/birdValidator.js';

 
const router = express.Router();

router.get('/', validateReq(getAllBirdsValidator, 'query'), getAllBirdsController);
router.get('/groups', getGroupsController);
router.get('/:id', validateReq(getBirdByIdValidator, 'params'), getBirdsController);

export default router;
