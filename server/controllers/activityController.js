import Activity from '../models/Activity.js';

export const getActivities = async (req, res, next) => {
  try {
    const { project, limit = 20, cursor, type } = req.query;
    const query = {};
    if (project) query.project = project;
    if (type) query.type = type;
    if (cursor) query._id = { $lt: cursor };

    const parsedLimit = Math.min(parseInt(limit) || 20, 50);
    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(parsedLimit + 1)
      .populate('user', 'name avatar initials');

    const hasMore = activities.length > parsedLimit;
    res.json({
      activities: activities.slice(0, parsedLimit),
      hasMore,
      nextCursor: hasMore ? activities[parsedLimit - 1]._id : null,
    });
  } catch (error) {
    next(error);
  }
};

export const getActivityStats = async (req, res, next) => {
  try {
    const { project } = req.query;
    const match = { type: 'commit' };
    if (project) match.project = project;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [dailyCommits, authorStats] = await Promise.all([
      Activity.aggregate([
        { $match: { ...match, createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Activity.aggregate([
        { $match: match },
        { $group: { _id: '$author', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({ dailyCommits, authorStats });
  } catch (error) {
    next(error);
  }
};
