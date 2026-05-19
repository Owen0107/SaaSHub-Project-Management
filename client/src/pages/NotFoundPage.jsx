import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-primary)', flexDirection: 'column', gap: 16, textAlign: 'center', padding: 24,
  }}>
    <div style={{ fontSize: '8rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1, letterSpacing: '-0.05em', opacity: 0.3 }}>404</div>
    <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800 }}>Trang không tồn tại</h1>
    <p style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.</p>
    <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
      <Link to="/" className="btn btn-primary"><Home size={18} /> Dashboard</Link>
      <button className="btn btn-secondary" onClick={() => window.history.back()}><ArrowLeft size={18} /> Quay lại</button>
    </div>
  </div>
);

export default NotFoundPage;
