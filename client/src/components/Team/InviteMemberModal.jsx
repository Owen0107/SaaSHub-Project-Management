import { useState } from 'react';
import { X, Mail } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const InviteMemberModal = ({ onClose, onInvite, projectId }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Developer');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập email');
      return;
    }

    setIsLoading(true);
    try {
      await api.post(`/projects/${projectId}/invite`, { email, role });
      toast.success('Đã gửi lời mời thành viên thành công!');
      onInvite();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ marginBottom: 16 }}>
          <h2 className="modal-title" style={{ fontSize: 'var(--font-lg)', fontWeight: 700, margin: 0 }}>Mời thành viên</h2>
          <button className="modal-close" onClick={onClose} aria-label="Đóng"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body" style={{ margin: 0 }}>
          <p style={{ marginBottom: 20, color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', lineHeight: 1.5 }}>
            Người dùng cần phải đăng ký tài khoản trước bằng email này. Nếu email chưa được đăng ký, lời mời sẽ thất bại.
          </p>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email thành viên</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                className="form-input"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                autoFocus
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="role">Vai trò trong dự án</label>
            <select
              id="role"
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isLoading}
              style={{ background: 'var(--bg-primary)' }}
            >
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div className="modal-footer" style={{ paddingBottom: 0 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Đang gửi...' : 'Gửi lời mời'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;
