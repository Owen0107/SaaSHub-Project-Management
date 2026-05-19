import { Router } from 'express';
import auth from '../middleware/auth.js';
import * as userController from '../controllers/userController.js';

const router = Router();
router.use(auth);

router.get('/', userController.getUsers);
router.get('/workload', userController.getWorkload);
router.get('/:id', userController.getUser);

export default router;
