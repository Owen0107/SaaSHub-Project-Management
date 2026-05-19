import { useState, useEffect } from 'react';
import PageTransition from '../components/PageTransition';
import { useProject } from '../contexts/ProjectContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Skeleton from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import CreateProjectModal from '../components/common/CreateProjectModal';
import api from '../services/api';
import { BarChart3, FolderPlus } from 'lucide-react';

const COLORS = ['#6C5CE7', '#00CEC9', '#0984E3', '#E17055', '#00B894', '#FDCB6E'];

const ReportsPage = () => {
  const { currentProject, loading: projectLoading, fetchProjects } = useProject();
  const [stats, setStats] = useState(null);
  const [workload, setWorkload] = useState([]);
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
      api.get(`/users/workload?project=${currentProject._id}`),
    ]).then(([s, w]) => {
      setStats(s.data);
      setWorkload(w.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [currentProject, projectLoading]);

  if (loading || projectLoading) {
    return (
      <div className="page-container">
        <div className="page-header"><Skeleton variant="title" /></div>
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
        <div className="page-header"><h1>Reports</h1></div>
        <EmptyState icon={FolderPlus} title="Chưa có project nào" description="Tạo project đầu tiên để xem báo cáo và phân tích." actionText="Tạo Project đầu tiên" onAction={() => setShowCreateProject(true)} />
        {showCreateProject && <CreateProjectModal onClose={() => setShowCreateProject(false)} onCreated={() => fetchProjects()} />}
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="page-container">
        <div className="page-header"><h1>Reports</h1></div>
        <EmptyState icon={BarChart3} title="Chưa có dữ liệu" description="Chưa có dữ liệu sprint nào. Tạo sprint và tasks để bắt đầu tracking." />
      </div>
    );
  }

  const velocityData = [
    { name: 'Sprint 10', planned: 35, completed: 30 },
    { name: 'Sprint 11', planned: 40, completed: 38 },
    { name: 'Sprint 12', planned: 38, completed: 32 },
    { name: 'Sprint 13', planned: 42, completed: 40 },
    { name: 'Sprint 14', planned: 45, completed: stats.completed },
  ];

  const teamData = workload.map(w => ({
    name: w.user.name.split(' ').pop(),
    active: w.activeTasks,
    completed: w.completedTasks,
  }));

  const statusData = [
    { name: 'Backlog', value: stats.byStatus.backlog },
    { name: 'In Progress', value: stats.byStatus.in_progress },
    { name: 'In Review', value: stats.byStatus.in_review },
    { name: 'Done', value: stats.byStatus.done },
  ].filter(d => d.value > 0);

  return (
    <PageTransition className="page-container">
      <div className="page-header">
        <h1>Reports</h1>
        <p>{currentProject?.name} — Phân tích & Báo cáo</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Sprint Velocity</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10 }} />
              <Bar dataKey="planned" fill="#A29BFE" radius={[4,4,0,0]} name="Kế hoạch" />
              <Bar dataKey="completed" fill="#6C5CE7" radius={[4,4,0,0]} name="Hoàn thành" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Team Performance</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={60} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10 }} />
              <Bar dataKey="active" fill="#FDCB6E" radius={[0,4,4,0]} name="Đang làm" stackId="a" />
              <Bar dataKey="completed" fill="#00B894" radius={[0,4,4,0]} name="Hoàn thành" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Phân bố trạng thái</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} innerRadius={60} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Tổng quan</h3></div>
          <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Tổng tasks', value: stats.total, color: 'var(--primary)' },
              { label: 'Tỷ lệ hoàn thành', value: `${stats.completionRate}%`, color: 'var(--success)' },
              { label: 'Đang thực hiện', value: stats.inProgress, color: 'var(--info)' },
              { label: 'Quá hạn', value: stats.overdue, color: 'var(--danger)' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ReportsPage;
