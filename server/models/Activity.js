import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['commit', 'pull_request', 'branch', 'task_update', 'comment'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  branch: String,
  sha: String,
  taskId: String,
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  metadata: {
    prNumber: Number,
    prStatus: String,
    prUrl: String,
    filesChanged: Number,
    additions: Number,
    deletions: Number,
  },
}, {
  timestamps: true,
});

activitySchema.index({ project: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
