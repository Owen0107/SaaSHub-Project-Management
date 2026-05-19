import { Router } from 'express';
import auth from '../middleware/auth.js';
import * as activityController from '../controllers/activityController.js';

const router = Router();
router.use(auth);

router.get('/', activityController.getActivities);
router.get('/stats', activityController.getActivityStats);

export default router;
