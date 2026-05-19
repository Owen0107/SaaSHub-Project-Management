import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';

const CreateTaskModal = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignee, setAssignee] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/users').then(res => setUsers(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onCreate({ title, description, priority, assignee: assignee || undefined });
    setLoading(false);
  };

  return (
    <div className="modal-overlay create-task-modal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex-between" style={{ marginBottom: 20 }}>
          <h3 className="modal-title">Tạo task mới</h3>
          <button className="btn-ghost" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="create-task-form">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tiêu đề *</label>
            <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Implement feature..." required autoFocus />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Mô tả</label>
            <textarea className="form-input" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Chi tiết task..." style={{ resize: 'vertical' }} />
          </div>
          <div className="create-task-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Ưu tiên</label>
              <select className="form-input" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Gán cho</label>
              <select className="form-input" value={assignee} onChange={e => setAssignee(e.target.value)}>
                <option value="">-- Chọn --</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-actions" style={{ marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !title}>
              {loading ? 'Đang tạo...' : 'Tạo task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
