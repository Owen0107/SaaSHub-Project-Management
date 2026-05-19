import { useState, useEffect } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, TrendingUp, TrendingDown, FolderPlus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Skeleton from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import CreateProjectModal from '../components/common/CreateProjectModal';
import api from '../services/api';
import PageTransition from '../components/PageTransition';
import './Dashboard.css';

const COLORS = ['#6C5CE7', '#00CEC9', '#FDCB6E', '#00B894'];

const DashboardPage = () => {
  const { currentProject, loading: projectLoading, fetchProjects } = useProject();
  const [stats, setStats] = useState(null);
  const [burndown, setBurndown] = useState(null);
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
      api.get(`/projects/${currentProject._id}/stats`),
      api.get(`/projects/${currentProject._id}/burndown`),
    ]).then(([statsRes, burnRes]) => {
      setStats(statsRes.data);
      setBurndown(burnRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [currentProject, projectLoading]);

  if (loading || projectLoading) {
    return (
      <div className="page-container">
        <div className="page-header"><Skeleton variant="title" /></div>
        <div className="stats-grid">
          {[1,2,3,4].map(i => <Skeleton key={i} variant="stat" />)}
        </div>
        <div className="grid-2">
          <Skeleton variant="card" height={350} />
          <Skeleton variant="card" height={350} />
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Chào mừng bạn đến với SaaSHub</p>
        </div>
        <EmptyState
          icon={FolderPlus}
          title="Chưa có project nào"
          description="Tạo project đầu tiên để bắt đầu quản lý công việc của bạn."
          actionText="Tạo Project đầu tiên"
          onAction={() => setShowCreateProject(true)}
        />
        {showCreateProject && (
          <CreateProjectModal
            onClose={() => setShowCreateProject(false)}
            onCreated={() => fetchProjects()}
          />
        )}
      </div>
    );
  }

  const statCards = [
    { label: 'Tổng Tasks', value: stats?.total || 0, icon: ListTodo, color: '#6C5CE7', bg: 'rgba(108,92,231,0.1)' },
    { label: 'Hoàn thành', value: stats?.completed || 0, icon: CheckCircle2, color: '#00B894', bg: 'rgba(0,184,148,0.1)', trend: stats?.completionRate ? `${stats.completionRate}%` : null },
    { label: 'Đang thực hiện', value: stats?.inProgress || 0, icon: Clock, color: '#0984E3', bg: 'rgba(9,132,227,0.1)' },
    { label: 'Quá hạn', value: stats?.overdue || 0, icon: AlertTriangle, color: '#FF6B6B', bg: 'rgba(255,107,107,0.1)' },
  ];

  const pieData = stats ? [
    { name: 'Backlog', value: stats.byStatus.backlog },
    { name: 'In Progress', value: stats.byStatus.in_progress },
    { name: 'In Review', value: stats.byStatus.in_review },
    { name: 'Done', value: stats.byStatus.done },
  ].filter(d => d.value > 0) : [];

  return (
    <PageTransition className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>{currentProject?.name} — {currentProject?.currentSprint?.name || 'Sprint hiện tại'}</p>
      </div>

      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
              <s.icon size={24} />
            </div>
            <div className="stat-info">
              <h3 style={{ color: s.color }}>{s.value}</h3>
              <p>{s.label}</p>
            </div>
            {s.trend && <span className="stat-trend" style={{ color: '#00B894' }}><TrendingUp size={14} /> {s.trend}</span>}
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Sprint Burndown</h3>
            <span className="badge badge-primary">{burndown?.sprint?.name}</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={burndown?.data || []}>
              <defs>
                <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C5CE7" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }} />
              <Area type="monotone" dataKey="ideal" stroke="#A29BFE" strokeDasharray="6 4" strokeWidth={2} fill="none" name="Kế hoạch" />
              <Area type="monotone" dataKey="actual" stroke="#6C5CE7" strokeWidth={2.5} fill="url(#burnGrad)" name="Thực tế" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Phân bố trạng thái</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PageTransition>
  );
};

export default DashboardPage;
