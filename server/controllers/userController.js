import User from '../models/User.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';

// GET /api/users
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-__v');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// GET /api/users/workload — Team workload stats
export const getWorkload = async (req, res, next) => {
  try {
    const { project } = req.query;

    let users;
    if (project) {
      const proj = await Project.findById(project);
      if (!proj) {
        return res.status(404).json({ error: 'Project not found' });
      }
      const memberIds = proj.members.map(m => m.user);
      users = await User.find({ _id: { $in: memberIds } }).select('name email role avatar initials');
    } else {
      users = await User.find().select('name email role avatar initials');
    }

    const workloadData = await Promise.all(
      users.map(async (user) => {
        const filter = {
          assignee: user._id,
          deletedAt: null,
          status: { $ne: 'done' },
        };
        if (project) filter.project = project;

        const [activeTasks, completedTasks] = await Promise.all([
          Task.countDocuments(filter),
          Task.countDocuments({
            assignee: user._id,
            deletedAt: null,
            status: 'done',
            ...(project ? { project } : {}),
          }),
        ]);

        return {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            initials: user.initials,
          },
          activeTasks,
          completedTasks,
          totalTasks: activeTasks + completedTasks,
        };
      })
    );

    res.json(workloadData);
  } catch (error) {
    next(error);
  }
};
