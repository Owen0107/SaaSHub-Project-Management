import Task from '../models/Task.js';
import Project from '../models/Project.js';

// GET /api/tasks?project=xxx&cursor=xxx&limit=20&status=xxx&assignee=xxx
export const getTasks = async (req, res, next) => {
  try {
    const { project, cursor, limit = 50, status, assignee, sort } = req.query;
    const query = {};

    if (project) query.project = project;
    if (status) query.status = status;
    if (assignee) query.assignee = assignee;
    if (cursor) query._id = { $gt: cursor };

    const parsedLimit = Math.min(parseInt(limit) || 50, 100);

    let taskQuery = Task.find(query)
      .populate('assignee', 'name email role avatar initials')
      .limit(parsedLimit + 1);

    if (sort === 'priority') {
      taskQuery = taskQuery.sort({ priority: -1, order: 1 });
    } else if (sort === 'dueDate') {
      taskQuery = taskQuery.sort({ dueDate: 1, order: 1 });
    } else {
      taskQuery = taskQuery.sort({ order: 1, createdAt: -1 });
    }

    const tasks = await taskQuery;
    const hasMore = tasks.length > parsedLimit;

    res.json({
      tasks: tasks.slice(0, parsedLimit),
      hasMore,
      nextCursor: hasMore ? tasks[parsedLimit - 1]._id : null,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, assignee, project, dueDate } = req.body;

    // Generate task ID
    const count = await Task.countDocuments({ project });
    const proj = await Project.findById(project);
    const prefix = proj ? proj.key : 'TASK';
    const taskId = `${prefix}-${String(count + 1).padStart(3, '0')}`;

    const task = await Task.create({
      taskId,
      title,
      description,
      status: status || 'backlog',
      priority: priority || 'medium',
      assignee,
      project,
      dueDate,
      order: count,
    });

    const populated = await task.populate('assignee', 'name email role avatar initials');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/:id
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('assignee', 'name email role avatar initials');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/reorder
export const reorderTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body; // [{ id, status, order }]

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Tasks array is required' });
    }

    const bulkOps = tasks.map(t => ({
      updateOne: {
        filter: { _id: t.id },
        update: { status: t.status, order: t.order },
      },
    }));

    await Task.bulkWrite(bulkOps);

    res.json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id (soft delete)
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Authorization check
    const isAssignee = task.assignee && task.assignee.toString() === req.user.id;
    const isLead = req.user.role === 'Tech Lead';
    const isManager = req.user.role === 'Product Manager';

    if (!isAssignee && !isLead && !isManager) {
      return res.status(403).json({ error: 'Không có quyền thực hiện hành động này' });
    }

    // Soft delete
    task.deletedAt = new Date();
    await task.save();

    res.json({ message: 'Task deleted', taskId: task.taskId, undoAvailable: true });
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks/:id/restore (undo delete)
export const restoreTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      includeSoftDeleted: true,
      deletedAt: { $ne: null },
    });

    if (!task) {
      // Try without the soft-delete filter
      const found = await Task.findById(req.params.id).setOptions({ includeSoftDeleted: true });
      if (!found) return res.status(404).json({ error: 'Task not found' });

      found.deletedAt = null;
      await found.save();
      return res.json(found);
    }

    task.deletedAt = null;
    await task.save();
    res.json(task);
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/stats?project=xxx
export const getTaskStats = async (req, res, next) => {
  try {
    const { project } = req.query;
    const match = project ? { project: project } : {};

    const stats = await Task.aggregate([
      { $match: { ...match, deletedAt: null } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts = { backlog: 0, in_progress: 0, in_review: 0, done: 0 };
    stats.forEach(s => { statusCounts[s._id] = s.count; });

    const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
    const overdue = await Task.countDocuments({
      ...match,
      deletedAt: null,
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' },
    });

    res.json({
      total,
      completed: statusCounts.done,
      inProgress: statusCounts.in_progress + statusCounts.in_review,
      overdue,
      byStatus: statusCounts,
    });
  } catch (error) {
    next(error);
  }
};
