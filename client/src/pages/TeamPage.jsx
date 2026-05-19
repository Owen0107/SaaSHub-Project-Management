import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { useConfirm } from '../components/common/ConfirmDialog';
import { Users, UserMinus, Mail, FolderPlus } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import Skeleton from '../components/common/Skeleton';
import InviteMemberModal from '../components/Team/InviteMemberModal';
import CreateProjectModal from '../components/common/CreateProjectModal';
import api from '../services/api';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition';
import './Team.css';

const TeamPage = () => {
  const { currentProject, loading: projectLoading, fetchProjects } = useProject();
  const { user } = useAuth();
  const confirm = useConfirm();
  const [workload, setWorkload] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);

  const handleKickMember = async (userId, userName) => {
    const confirmed = await confirm({
      title: 'Xác nhận xóa thành viên',
      message: `Bạn có chắc chắn muốn xóa thành viên "${userName}" khỏi dự án này không?`,
    });

    if (!confirmed) return;

    try {
      await api.delete(`/projects/${currentProject._id}/members/${userId}`);
      toast.success(`Đã xóa thành viên "${userName}" khỏi dự án.`);
      fetchWorkload();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xóa thành viên thất bại');
    }
  };

  const fetchWorkload = () => {
    if (!currentProject) return;
    setLoading(true);
    api.get(`/users/workload?project=${currentProject._id}`)
      .then(res => setWorkload(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (projectLoading) return;
    if (!currentProject) {
      setLoading(false);
      return;
    }
    fetchWorkload();
  }, [currentProject, projectLoading]);

  const getWorkloadLevel = (active) => {
    if (active >= 10) return { label: 'Quá tải', color: 'var(--danger)', bg: 'var(--danger-bg)' };
    if (active >= 6) return { label: 'Nhiều', color: '#E17055', bg: 'var(--warning-bg)' };
    if (active >= 3) return { label: 'Vừa', color: 'var(--success)', bg: 'var(--success-bg)' };
    return { label: 'Ít', color: 'var(--info)', bg: 'var(--info-bg)' };
  };

  if (loading || projectLoading) {
    return (
      <div className="page-container">
        <div className="page-header"><Skeleton variant="title" /></div>
        <div className="grid-3">{[1,2,3].map(i => <Skeleton key={i} variant="card" height={200} />)}</div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="page-container">
        <div className="page-header"><h1>Team</h1></div>
        <EmptyState icon={FolderPlus} title="Chưa có project nào" description="Tạo project đầu tiên để quản lý thành viên." actionText="Tạo Project đầu tiên" onAction={() => setShowCreateProject(true)} />
        {showCreateProject && <CreateProjectModal onClose={() => setShowCreateProject(false)} onCreated={() => fetchProjects()} />}
      </div>
    );
  }

  if (workload.length === 0) {
    return (
      <div className="page-container">
        <div className="page-header"><h1>Team</h1></div>
        <EmptyState icon={Users} title="Chưa có thành viên" description="Mời thành viên vào workspace để bắt đầu quản lý team." actionText="Mời thành viên" onAction={() => setShowInviteModal(true)} />
        {showInviteModal && <InviteMemberModal onClose={() => setShowInviteModal(false)} onInvite={fetchWorkload} projectId={currentProject._id} />}
      </div>
    );
  }

  return (
    <PageTransition className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Team</h1><p>{currentProject?.name} — {workload.length} thành viên</p></div>
        <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}>
          <Mail size={18} /> Mời thành viên
        </button>
      </div>

      {showInviteModal && <InviteMemberModal onClose={() => setShowInviteModal(false)} onInvite={fetchWorkload} projectId={currentProject._id} />}

      <div className="team-grid">
        {workload.map((w, index) => {
          const level = getWorkloadLevel(w.activeTasks);
          return (
            <motion.div 
              key={w.user.id} 
              className="team-card card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="team-card-top" style={{ position: 'relative' }}>
                <div className="avatar avatar-lg" style={{ background: w.user.avatar }}>{w.user.initials}</div>
                <div className="team-card-info">
                  <h3>{w.user.name}</h3>
                  <span className="team-card-role">{w.user.role}</span>
                </div>
                {currentProject?.createdBy === user?._id && w.user.id !== user?._id && (
                  <button 
                    className="btn btn-ghost" 
                    style={{ position: 'absolute', right: 0, top: 0, padding: 6, color: 'var(--danger)' }} 
                    title="Xóa khỏi dự án"
                    onClick={(e) => { e.stopPropagation(); handleKickMember(w.user.id, w.user.name); }}
                  >
                    <UserMinus size={18} />
                  </button>
                )}
              </div>
              <div className="team-card-stats">
                <div className="team-card-stat">
                  <span className="team-card-stat-value" style={{ color: level.color }}>{w.activeTasks}</span>
                  <span className="team-card-stat-label">Đang làm</span>
                </div>
                <div className="team-card-stat">
                  <span className="team-card-stat-value" style={{ color: 'var(--success)' }}>{w.completedTasks}</span>
                  <span className="team-card-stat-label">Hoàn thành</span>
                </div>
                <div className="team-card-stat">
                  <span className="team-card-stat-value">{w.totalTasks}</span>
                  <span className="team-card-stat-label">Tổng</span>
                </div>
              </div>
              <div className="team-card-workload">
                <div className="flex-between" style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>Workload</span>
                  <span className="badge" style={{ background: level.bg, color: level.color }}>{level.label}</span>
                </div>
                <div className="team-card-bar-wrap">
                  <div className="team-card-bar" style={{ width: `${Math.min((w.activeTasks / 12) * 100, 100)}%`, background: level.color }} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </PageTransition>
  );
};

export default TeamPage;
