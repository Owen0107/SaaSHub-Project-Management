import { Router } from 'express';
import { body } from 'express-validator';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import * as projectController from '../controllers/projectController.js';

const router = Router();
router.use(auth);

router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProject);
router.get('/:id/stats', projectController.getProjectStats);
router.get('/:id/burndown', projectController.getBurndown);

router.post('/', [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('key').trim().notEmpty().isLength({ min: 2, max: 6 }).withMessage('Key must be 2-6 chars'),
], validate, projectController.createProject);

router.post('/:id/invite', [
  body('email').isEmail().withMessage('Invalid email'),
  body('role').optional().isIn(['owner', 'admin', 'member']).withMessage('Invalid role'),
], validate, projectController.inviteMember);

router.delete('/:id/members/:userId', projectController.removeMember);

export default router;
