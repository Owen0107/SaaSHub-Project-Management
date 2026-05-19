import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import RefreshToken from '../models/RefreshToken.js';

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    Activity.deleteMany({}),
    RefreshToken.deleteMany({}),
  ]);

  // --- Users (password hashed via model pre-save hook) ---
  const users = await User.create([
    { name: 'Nguyen Van A', email: 'nva@saashub.com', password: 'password123', role: 'Tech Lead', avatar: '#E74C3C' },
    { name: 'Pham Thi B', email: 'ptb@saashub.com', password: 'password123', role: 'Frontend Dev', avatar: '#3498DB' },
    { name: 'Le Anh C', email: 'lac@saashub.com', password: 'password123', role: 'UX Designer', avatar: '#2ECC71' },
    { name: 'Mai Quoc D', email: 'mqd@saashub.com', password: 'password123', role: 'Backend Dev', avatar: '#9B59B6' },
    { name: 'Tran Huu E', email: 'the@saashub.com', password: 'password123', role: 'Product Manager', avatar: '#F39C12' },
  ]);
  console.log(`✅ Created ${users.length} users`);

  // --- Projects ---
  const allMembers = users.map(u => ({ user: u._id, role: 'member' }));
  allMembers[0].role = 'owner';

  const projects = await Project.create([
    {
      name: 'Mobile App v2', description: 'Redesign and rebuild the mobile application', key: 'MOB',
      members: allMembers, createdBy: users[0]._id,
      github: { repoUrl: 'https://github.com/saashub/mobile-app-v2', webhookConnected: true },
      currentSprint: { name: 'Sprint 14', startDate: new Date('2026-05-01'), endDate: new Date('2026-05-14'), goal: 'Complete auth flow and dashboard' },
    },
    {
      name: 'API Integration', description: 'Third-party API integration layer', key: 'API',
      members: [allMembers[0], allMembers[3], allMembers[4]], createdBy: users[0]._id,
      github: { repoUrl: 'https://github.com/saashub/api-integration', webhookConnected: true },
      currentSprint: { name: 'Sprint 8', startDate: new Date('2026-05-05'), endDate: new Date('2026-05-19'), goal: 'Payment gateway integration' },
    },
    {
      name: 'Design System', description: 'Shared component library and design tokens', key: 'DSN',
      members: [allMembers[0], allMembers[1], allMembers[2]], createdBy: users[0]._id,
      github: { repoUrl: 'https://github.com/saashub/design-system', webhookConnected: false },
    },
  ]);
  console.log(`✅ Created ${projects.length} projects`);

  // --- Tasks ---
  const statuses = ['backlog', 'in_progress', 'in_review', 'done'];
  const priorities = ['low', 'medium', 'high'];
  const taskTemplates = [
    // MOB project tasks
    { title: 'Implement OAuth2 login', desc: 'Add Google and GitHub OAuth2 authentication flow' },
    { title: 'Build user dashboard', desc: 'Create main dashboard with stats cards and charts' },
    { title: 'Design onboarding screens', desc: 'Create 4 onboarding screens with illustrations' },
    { title: 'Setup push notifications', desc: 'Integrate Firebase Cloud Messaging for push notifications' },
    { title: 'Build profile settings page', desc: 'User profile edit with avatar upload' },
    { title: 'Implement dark mode toggle', desc: 'Add dark/light theme switching with system preference detection' },
    { title: 'Create task list component', desc: 'Reusable task list with filtering and sorting' },
    { title: 'Build real-time chat', desc: 'WebSocket-based team chat feature' },
    { title: 'Optimize app performance', desc: 'Reduce bundle size and improve load times' },
    { title: 'Add biometric authentication', desc: 'Fingerprint and Face ID support' },
    { title: 'Build notification center', desc: 'In-app notification feed with read/unread states' },
    { title: 'Implement file upload', desc: 'Support image and document upload with preview' },
    { title: 'Create search functionality', desc: 'Global search across tasks, projects, and users' },
    { title: 'Build activity feed', desc: 'Real-time activity log for project updates' },
    { title: 'Setup CI/CD pipeline', desc: 'GitHub Actions for automated testing and deployment' },
    { title: 'Write unit tests', desc: 'Jest tests for core business logic' },
    { title: 'Implement data export', desc: 'Export reports as CSV and PDF' },
    { title: 'Build Kanban board', desc: 'Drag-and-drop task board with column management' },
    { title: 'Add sprint planning', desc: 'Sprint creation, task assignment, and velocity tracking' },
    { title: 'Implement webhooks', desc: 'GitHub webhook integration for auto status updates' },
    { title: 'Create analytics dashboard', desc: 'Charts for sprint velocity and team performance' },
    { title: 'Build team management', desc: 'Invite, remove, and manage team member roles' },
    { title: 'Setup error monitoring', desc: 'Sentry integration for error tracking' },
    { title: 'Implement caching layer', desc: 'Redis caching for frequently accessed data' },
    { title: 'Build API documentation', desc: 'Swagger/OpenAPI docs for all endpoints' },
    { title: 'Create landing page', desc: 'Marketing landing page with feature showcase' },
    { title: 'Add role-based access', desc: 'Permission system based on user roles' },
    { title: 'Implement audit logging', desc: 'Track all user actions for compliance' },
    { title: 'Build email templates', desc: 'Transactional email templates for notifications' },
    { title: 'Setup load testing', desc: 'Artillery or k6 load tests for API endpoints' },
  ];

  const tasks = [];
  let taskCounter = 0;

  for (const project of projects) {
    const numTasks = project.key === 'MOB' ? 50 : project.key === 'API' ? 45 : 33;
    for (let i = 0; i < numTasks; i++) {
      taskCounter++;
      const template = taskTemplates[i % taskTemplates.length];
      const status = statuses[Math.floor(Math.random() * 4)];
      const assignee = users[Math.floor(Math.random() * users.length)];
      const daysOffset = Math.floor(Math.random() * 30) - 10;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + daysOffset);

      tasks.push({
        taskId: `${project.key}-${String(i + 1).padStart(3, '0')}`,
        title: template.title,
        description: template.desc,
        status,
        priority: priorities[Math.floor(Math.random() * 3)],
        assignee: assignee._id,
        project: project._id,
        progress: status === 'done' ? 100 : status === 'in_review' ? 80 : status === 'in_progress' ? Math.floor(Math.random() * 60) + 20 : 0,
        order: i,
        dueDate,
        commits: status !== 'backlog' ? [{
          sha: Math.random().toString(36).substring(2, 9),
          message: `${['feat', 'fix', 'refactor', 'chore'][Math.floor(Math.random() * 4)]}: ${template.title.toLowerCase()} #${project.key}-${String(i + 1).padStart(3, '0')}`,
          branch: ['main', 'develop', `feature/${project.key.toLowerCase()}-${i + 1}`][Math.floor(Math.random() * 3)],
          author: assignee.name,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        }] : [],
      });
    }
  }

  await Task.insertMany(tasks);
  console.log(`✅ Created ${tasks.length} tasks`);

  // --- Activities ---
  const activityTypes = ['commit', 'pull_request', 'branch'];
  const activities = [];

  for (let i = 0; i < 60; i++) {
    const type = activityTypes[Math.floor(Math.random() * 3)];
    const user = users[Math.floor(Math.random() * users.length)];
    const project = projects[Math.floor(Math.random() * projects.length)];

    activities.push({
      type,
      message: type === 'commit'
        ? `${['feat', 'fix', 'refactor'][Math.floor(Math.random() * 3)]}: ${taskTemplates[Math.floor(Math.random() * taskTemplates.length)].title.toLowerCase()}`
        : type === 'pull_request'
          ? `PR #${Math.floor(Math.random() * 200)}: ${taskTemplates[Math.floor(Math.random() * taskTemplates.length)].title}`
          : `Created branch feature/${project.key.toLowerCase()}-${Math.floor(Math.random() * 50)}`,
      author: user.name,
      branch: ['main', 'develop', 'feature/auth', 'feature/dashboard', 'hotfix/login'][Math.floor(Math.random() * 5)],
      sha: Math.random().toString(36).substring(2, 9),
      project: project._id,
      user: user._id,
      createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
    });
  }

  await Activity.insertMany(activities);
  console.log(`✅ Created ${activities.length} activities`);

  console.log('\n🎉 Seed completed!');
  console.log('📧 Login credentials:');
  users.forEach(u => console.log(`   ${u.email} / password123`));

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
