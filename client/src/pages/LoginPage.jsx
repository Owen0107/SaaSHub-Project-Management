import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layers, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition';
import './Auth.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || 'Đăng nhập thất bại';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="auth-page">
      <div className="auth-bg"></div>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <Layers size={28} />
            </div>
            <h1>Chào mừng trở lại</h1>
            <p>Đăng nhập vào SaaSHub để tiếp tục</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input id="email" type="email" className="form-input" placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="password" style={{ marginBottom: 0 }}>Mật khẩu</label>
                <Link to="/forgot-password" style={{ fontSize: 'var(--font-sm)', color: 'var(--primary)' }}>Quên mật khẩu?</Link>
              </div>
              <div className="auth-password-wrapper" style={{ marginTop: 8 }}>
                <input id="password" type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Nhập mật khẩu" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
                <button type="button" className="auth-password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="auth-switch">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>

          <div className="auth-demo">
            <p>Demo: <code>nva@saashub.com</code> / <code>password123</code></p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default LoginPage;
