import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CreateProjectModal = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNameChange = (val) => {
    setName(val);
    // Auto-generate key from name (first 3 uppercase letters)
    if (!key || key === autoKey(name)) {
      setKey(autoKey(val));
    }
  };

  const autoKey = (val) => {
    return val
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .split(' ')
      .filter(Boolean)
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .substring(0, 4) || '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) return;

    setLoading(true);
    try {
      const { data } = await api.post('/projects', { name, key, description });
      toast.success(`Đã tạo project "${data.name}" thành công!`);
      onCreated?.(data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Tạo project thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2 className="modal-title">Tạo Project mới</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Tên project *</label>
              <input
                className="form-input"
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="VD: Mobile App v2"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Key *</label>
              <input
                className="form-input"
                value={key}
                onChange={e => setKey(e.target.value.toUpperCase())}
                placeholder="VD: MOB"
                maxLength={5}
                required
              />
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginTop: 4, display: 'block' }}>
                Key dùng làm tiền tố cho task ID (VD: MOB-001)
              </span>
            </div>
            <div className="form-group">
              <label className="form-label">Mô tả</label>
              <input
                className="form-input"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Mô tả ngắn về project"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !name.trim() || !key.trim()}>
              {loading ? 'Đang tạo...' : 'Tạo Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
