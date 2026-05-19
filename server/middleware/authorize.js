import Task from '../models/Task.js';
import Project from '../models/Project.js';

/**
 * Authorization middleware — checks ownership or role.
 * Usage: authorize('owner', 'Tech Lead')
 * This means: the user must be the resource owner OR have role 'Tech Lead'
 */
export const authorizeTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const isAssignee = task.assignee && task.assignee.toString() === req.user.id;
    const isLead = req.user.role === 'Tech Lead';
    const isManager = req.user.role === 'Product Manager';

    if (!isAssignee && !isLead && !isManager) {
      return res.status(403).json({ error: 'Không có quyền thực hiện hành động này' });
    }

    req.task = task;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user is a member of the project
 */
export const authorizeProject = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.project || req.query.project;
    if (!projectId) return next();

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isMember = project.members.some(m => m.user.toString() === req.user.id);
    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this project' });
    }

    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
};
