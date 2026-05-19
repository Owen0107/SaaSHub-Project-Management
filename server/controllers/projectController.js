import Project from '../models/Project.js';
import Task from '../models/Task.js';

// GET /api/projects
export const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      'members.user': req.user.id,
    }).populate('members.user', 'name email role avatar initials');

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// GET /api/projects/:id
export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members.user', 'name email role avatar initials');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// POST /api/projects
export const createProject = async (req, res, next) => {
  try {
    const { name, description, key } = req.body;

    const project = await Project.create({
      name,
      description,
      key: key.toUpperCase(),
      createdBy: req.user.id,
      members: [{ user: req.user.id, role: 'owner' }],
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// GET /api/projects/:id/stats
export const getProjectStats = async (req, res, next) => {
  try {
    const projectId = req.params.id;

    const [taskStats, recentTasks] = await Promise.all([
      Task.aggregate([
        { $match: { project: (await import('mongoose')).default.Types.ObjectId.createFromHexString(projectId), deletedAt: null } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Task.find({ project: projectId, deletedAt: null })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate('assignee', 'name initials avatar'),
    ]);

    const statusCounts = { backlog: 0, in_progress: 0, in_review: 0, done: 0 };
    taskStats.forEach(s => { statusCounts[s._id] = s.count; });
    const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    const overdue = await Task.countDocuments({
      project: projectId,
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
      completionRate: total > 0 ? Math.round((statusCounts.done / total) * 100) : 0,
      recentTasks,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/projects/:id/burndown
export const getBurndown = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Generate burndown data based on task completion dates
    const tasks = await Task.find({
      project: req.params.id,
      deletedAt: null,
    }).sort({ updatedAt: 1 });

    const totalTasks = tasks.length;

    // Generate 14-day burndown (current sprint simulation)
    const days = 14;
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    const burndownData = [];
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      // Ideal line
      const idealRemaining = Math.round(totalTasks * (1 - i / days));

      // Actual: count tasks completed by this date
      const completedByDate = tasks.filter(
        t => t.status === 'done' && t.updatedAt <= date
      ).length;
      const actualRemaining = totalTasks - completedByDate;

      burndownData.push({
        date: dateStr,
        day: `Day ${i}`,
        ideal: idealRemaining,
        actual: i <= Math.floor(days * 0.8) ? actualRemaining : undefined,
      });
    }

    res.json({
      sprint: project.currentSprint || { name: 'Sprint 14' },
      totalTasks,
      data: burndownData,
    });
  } catch (error) {
    next(error);
  }
};

import User from '../models/User.js';
import { sendEmail } from '../services/emailService.js';

// POST /api/projects/:id/invite
export const inviteMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found. They must register first.' });
    }

    const isMember = project.members.some(m => m.user.toString() === user._id.toString());
    if (isMember) {
      return res.status(400).json({ error: 'User is already a member of this project.' });
    }

    project.members.push({ user: user._id, role: role || 'member' });
    await project.save();

    const inviteUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}`;
    const message = `Bạn vừa được mời tham gia dự án "${project.name}" trên SaaSHub với vai trò ${role || 'member'}.\n\nVui lòng đăng nhập để xem chi tiết:\n${inviteUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: `Lời mời tham gia dự án: ${project.name}`,
        message,
      });
    } catch (err) {
      console.error('Failed to send invite email', err);
      // Still succeed the invitation even if email fails
    }

    res.status(200).json({ message: 'Đã mời thành viên thành công', member: { user: user._id, role: role || 'member' } });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/projects/:id/members/:userId
export const removeMember = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userIdToRemove = req.params.userId;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if the current user is the owner (creator) of the project
    const isOwner = project.createdBy.toString() === req.user.id;
    // Or check if they are leaving themselves
    const isSelfLeaving = req.user.id === userIdToRemove;

    if (!isOwner && !isSelfLeaving) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa thành viên khỏi dự án này.' });
    }

    // Check if trying to remove the owner/creator
    if (project.createdBy.toString() === userIdToRemove) {
      return res.status(400).json({ error: 'Không thể xóa chủ sở hữu khỏi dự án.' });
    }

    // Filter out the member
    project.members = project.members.filter(m => m.user.toString() !== userIdToRemove);
    await project.save();

    res.status(200).json({ message: 'Đã xóa thành viên khỏi dự án thành công.' });
  } catch (error) {
    next(error);
  }
};

