import { useState, useEffect } from 'react';
import PageTransition from '../components/PageTransition';
import { useProject } from '../contexts/ProjectContext';
import { GitCommit, GitPullRequest, GitBranch, ExternalLink, GitFork, FolderPlus } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import Skeleton from '../components/common/Skeleton';
import CreateProjectModal from '../components/common/CreateProjectModal';
import api from '../services/api';
import './GitHub.css';

const GitHubPage = () => {
  const { currentProject, loading: projectLoading, fetchProjects } = useProject();
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);

  useEffect(() => {
    if (projectLoading) return;
    if (!currentProject) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      api.get(`/activities?project=${currentProject._id}&limit=30`),
      api.get(`/activities/stats?project=${currentProject._id}`),
    ]).then(([actRes, statRes]) => {
      setActivities(actRes.data.activities);
      setStats(statRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [currentProject, projectLoading]);

  const iconMap = { commit: GitCommit, pull_request: GitPullRequest, branch: GitBranch };
  const colorMap = { commit: '#00B894', pull_request: '#6C5CE7', branch: '#0984E3' };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading || projectLoading) {
    return (
      <div className="page-container">
        <div className="page-header"><Skeleton variant="title" /></div>
        <Skeleton variant="card" count={5} style={{ marginBottom: 12 }} />
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="page-container">
        <div className="page-header"><h1>GitHub Activity</h1></div>
        <EmptyState icon={FolderPlus} title="Chưa có project nào" description="Tạo project đầu tiên để theo dõi hoạt động GitHub." actionText="Tạo Project đầu tiên" onAction={() => setShowCreateProject(true)} />
        {showCreateProject && <CreateProjectModal onClose={() => setShowCreateProject(false)} onCreated={() => fetchProjects()} />}
      </div>
    );
  }

  if (!currentProject?.github?.webhookConnected) {
    return (
      <div className="page-container">
        <div className="page-header"><h1>GitHub Activity</h1></div>
        <EmptyState icon={GitFork} title="Chưa kết nối GitHub" description="Kết nối repository GitHub để tự động theo dõi commits, pull requests và cập nhật trạng thái task." actionText="Đi đến Settings" onAction={() => window.location.href = '/settings'} />
      </div>
    );
  }

  return (
    <PageTransition className="page-container">
      <div className="page-header">
        <h1>GitHub Activity</h1>
        <p>{currentProject?.name} — {currentProject?.github?.repoUrl}</p>
      </div>

      {/* Commit Stats */}
      {stats?.authorStats?.length > 0 && (
        <div className="github-stats">
          {stats.authorStats.slice(0, 5).map((a, i) => (
            <div key={i} className="github-stat-item">
              <span className="github-stat-name">{a._id}</span>
              <div className="github-stat-bar-wrap">
                <div className="github-stat-bar" style={{ width: `${(a.count / stats.authorStats[0].count) * 100}%` }} />
              </div>
              <span className="github-stat-count">{a.count} commits</span>
            </div>
          ))}
        </div>
      )}

      {/* Activity Feed */}
      <div className="github-feed">
        {activities.map(a => {
          const Icon = iconMap[a.type] || GitCommit;
          return (
            <div key={a._id} className="github-feed-item">
              <div className="github-feed-icon" style={{ background: `${colorMap[a.type]}15`, color: colorMap[a.type] }}>
                <Icon size={18} />
              </div>
              <div className="github-feed-content">
                <div className="github-feed-message">{a.message}</div>
                <div className="github-feed-meta">
                  <span className="github-feed-author">{a.author}</span>
                  <span className="github-feed-sep">•</span>
                  <span>{a.branch}</span>
                  {a.sha && <><span className="github-feed-sep">•</span><code className="github-feed-sha">{a.sha}</code></>}
                  <span className="github-feed-sep">•</span>
                  <span>{timeAgo(a.createdAt)}</span>
                </div>
              </div>
              {a.taskId && <span className="badge badge-primary">{a.taskId}</span>}
            </div>
          );
        })}
      </div>
    </PageTransition>
  );
};

export default GitHubPage;
