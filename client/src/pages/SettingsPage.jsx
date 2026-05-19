import { useState } from 'react';
import PageTransition from '../components/PageTransition';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { GitFork, Moon, Sun, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';
import './Settings.css';

const SettingsPage = () => {
  const { currentProject } = useProject();
  const { user } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

  const handleTheme = (mode) => {
    setTheme(mode);
    localStorage.setItem('theme', mode);
    document.documentElement.setAttribute('data-theme', mode);
    toast.success(`Theme: ${mode === 'light' ? 'Sáng' : mode === 'dark' ? 'Tối' : 'Hệ thống'}`);
  };

  return (
    <PageTransition className="page-container">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Cấu hình workspace và tùy chọn cá nhân</p>
      </div>

      {/* Project Info */}
      <div className="card settings-section">
        <h3 className="card-title" style={{ marginBottom: 16 }}>Thông tin Project</h3>
        <div className="settings-grid">
          <div className="form-group">
            <label className="form-label">Tên project</label>
            <input className="form-input" value={currentProject?.name || ''} readOnly />
          </div>
          <div className="form-group">
            <label className="form-label">Key</label>
            <input className="form-input" value={currentProject?.key || ''} readOnly />
          </div>
        </div>
        {currentProject?.description && (
          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <input className="form-input" value={currentProject.description} readOnly />
          </div>
        )}
      </div>

      {/* GitHub Connection */}
      <div className="card settings-section">
        <h3 className="card-title" style={{ marginBottom: 16 }}>
          <GitFork size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          GitHub Integration
        </h3>
        {currentProject?.github?.webhookConnected ? (
          <div className="settings-status settings-status-ok">
            <span>✅ Đã kết nối</span>
            <code>{currentProject.github.repoUrl}</code>
          </div>
        ) : (
          <div className="settings-status settings-status-warn">
            <span>⚠️ Chưa kết nối</span>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginTop: 8 }}>
              1. Mở GitHub repo → Settings → Webhooks<br/>
              2. Payload URL: <code>https://your-server.com/api/webhooks/github</code><br/>
              3. Content type: application/json<br/>
              4. Secret: sử dụng GITHUB_WEBHOOK_SECRET từ .env
            </p>
          </div>
        )}
      </div>

      {/* Theme */}
      <div className="card settings-section">
        <h3 className="card-title" style={{ marginBottom: 16 }}>Giao diện</h3>
        <div className="settings-theme-grid">
          {[
            { id: 'light', icon: Sun, label: 'Sáng' },
            { id: 'dark', icon: Moon, label: 'Tối' },
            { id: 'system', icon: Monitor, label: 'Hệ thống' },
          ].map(t => (
            <button key={t.id} className={`settings-theme-btn ${theme === t.id ? 'active' : ''}`} onClick={() => handleTheme(t.id)}>
              <t.icon size={22} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* User Info */}
      <div className="card settings-section">
        <h3 className="card-title" style={{ marginBottom: 16 }}>Tài khoản</h3>
        <div className="settings-grid">
          <div className="form-group">
            <label className="form-label">Tên</label>
            <input className="form-input" value={user?.name || ''} readOnly />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" value={user?.email || ''} readOnly />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SettingsPage;
