import crypto from 'crypto';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';

// Verify GitHub webhook signature (HMAC-SHA256)
export const verifySignature = (req, res, next) => {
  const sig = req.headers['x-hub-signature-256'];
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret) return next(); // Skip in dev if no secret set

  if (!sig) {
    return res.status(401).json({ error: 'Missing webhook signature' });
  }

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(digest))) {
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }
  next();
};

// POST /api/webhooks/github
export const handleGithubWebhook = async (req, res, next) => {
  try {
    const event = req.headers['x-github-event'];
    const payload = req.body;

    if (event === 'push') {
      const commits = payload.commits || [];
      for (const commit of commits) {
        // Parse task ID from commit message (e.g., #TASK-091 or #MOB-003)
        const taskMatch = commit.message.match(/#([A-Z]+-\d+)/i);

        if (taskMatch) {
          const taskId = taskMatch[1].toUpperCase();
          const task = await Task.findOne({ taskId });

          if (task) {
            task.commits.push({
              sha: commit.id?.substring(0, 7),
              message: commit.message,
              branch: payload.ref?.replace('refs/heads/', ''),
              author: commit.author?.name || commit.author?.username,
              timestamp: new Date(commit.timestamp),
            });

            // Auto status update
            if (task.status === 'backlog') {
              task.status = 'in_progress';
            }
            await task.save();
          }
        }

        // Log activity
        await Activity.create({
          type: 'commit',
          message: commit.message,
          author: commit.author?.name || commit.author?.username || 'Unknown',
          branch: payload.ref?.replace('refs/heads/', ''),
          sha: commit.id?.substring(0, 7),
          taskId: taskMatch ? taskMatch[1].toUpperCase() : null,
          project: payload.repository?.id, // Will need mapping
        });
      }
    }

    if (event === 'pull_request') {
      const pr = payload.pull_request;
      const taskMatch = pr.title.match(/#([A-Z]+-\d+)/i);

      if (taskMatch) {
        const taskId = taskMatch[1].toUpperCase();
        const task = await Task.findOne({ taskId });
        if (task) {
          const statusMap = {
            opened: 'review_required',
            closed: pr.merged ? 'merged' : 'closed',
            review_requested: 'review_required',
          };
          task.pullRequest = {
            number: pr.number,
            status: statusMap[payload.action] || pr.state,
            url: pr.html_url,
          };
          if (pr.merged) {
            task.status = 'done';
            task.progress = 100;
          } else if (payload.action === 'opened') {
            task.status = 'in_review';
          }
          await task.save();
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};
