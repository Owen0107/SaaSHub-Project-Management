import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, GitFork, BarChart3, Users, Settings, LogOut, ChevronLeft, FolderKanban } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProject } from '../../contexts/ProjectContext';
import { useState } from 'react';
import CreateProjectModal from '../common/CreateProjectModal';
import { Plus } from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/kanban', icon: KanbanSquare, label: 'Kanban Board' },
  { to: '/github', icon: GitFork, label: 'GitHub Activity' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { projects, currentProject, switchProject, fetchProjects } = useProject();
  const [collapsed, setCollapsed] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <FolderKanban size={24} />
        </div>
        {!collapsed && <span className="sidebar-logo-text">SaaSHub</span>}
        <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
          <ChevronLeft size={18} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'var(--transition-base)' }} />
        </button>
      </div>

      {/* Project Selector */}
      {!collapsed && currentProject && (
        <div className="sidebar-project" onClick={() => setShowProjectMenu(!showProjectMenu)}>
          <div className="sidebar-project-dot" style={{ background: currentProject.key === 'MOB' ? 'var(--primary)' : currentProject.key === 'API' ? 'var(--accent)' : 'var(--warning)' }} />
          <span>{currentProject.name}</span>
          {showProjectMenu && (
            <div className="sidebar-project-menu">
              {projects.map(p => (
                <div key={p._id} className={`sidebar-project-option ${p._id === currentProject._id ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); switchProject(p); setShowProjectMenu(false); }}>
                  <div className="sidebar-project-dot" style={{ background: p.key === 'MOB' ? 'var(--primary)' : p.key === 'API' ? 'var(--accent)' : 'var(--warning)' }} />
                  {p.name}
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
              <div className="sidebar-project-option" style={{ color: 'var(--primary)' }} onClick={(e) => { e.stopPropagation(); setShowCreateModal(true); setShowProjectMenu(false); }}>
                <Plus size={16} /> Tạo project mới
              </div>
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <CreateProjectModal 
          onClose={() => setShowCreateModal(false)} 
          onCreated={async (newProject) => {
            await fetchProjects();
            switchProject(newProject);
          }}
        />
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end={to === '/'} title={label}>
            <Icon size={20} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            <div className="avatar" style={{ background: user.avatar || 'var(--primary)' }}>
              {user.initials || user.name?.substring(0, 2).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user.name}</span>
                <span className="sidebar-user-role">{user.role}</span>
              </div>
            )}
          </div>
        )}
        <button className="sidebar-link" onClick={logout} title="Logout" aria-label="Logout">
          <LogOut size={20} />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
