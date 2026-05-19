import { Router } from 'express';
import { body, query } from 'express-validator';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import * as taskController from '../controllers/taskController.js';

const router = Router();

router.use(auth);

const createValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 300 }),
  body('project').notEmpty().withMessage('Project is required'),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('status').optional().isIn(['backlog', 'in_progress', 'in_review', 'done']),
];

router.get('/', taskController.getTasks);
router.get('/stats', taskController.getTaskStats);
router.post('/', createValidation, validate, taskController.createTask);
router.put('/reorder', taskController.reorderTasks);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.post('/:id/restore', taskController.restoreTask);

export default router;
