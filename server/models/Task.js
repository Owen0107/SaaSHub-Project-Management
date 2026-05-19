import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: 300,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 5000,
  },
  status: {
    type: String,
    enum: ['backlog', 'in_progress', 'in_review', 'done'],
    default: 'backlog',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  commits: [{
    sha: String,
    message: String,
    branch: String,
    author: String,
    timestamp: Date,
  }],
  pullRequest: {
    number: Number,
    status: {
      type: String,
      enum: ['draft', 'review_required', 'approved', 'merged', 'closed'],
    },
    url: String,
  },
  order: {
    type: Number,
    default: 0,
  },
  dueDate: Date,
  attachments: [{
    name: String,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  deletedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Default query scope: exclude soft-deleted tasks
taskSchema.pre(/^find/, function () {
  if (!this.getQuery().includeSoftDeleted) {
    this.where({ deletedAt: null });
  } else {
    delete this.getQuery().includeSoftDeleted;
  }
});

// Index for efficient queries
taskSchema.index({ project: 1, status: 1, order: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ deletedAt: 1 });

const Task = mongoose.model('Task', taskSchema);
export default Task;
