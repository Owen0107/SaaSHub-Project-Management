import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import PageTransition from '../components/PageTransition';
import './Auth.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập email');
      return;
    }
    
    setIsLoading(true);
    try {
      await api.post('/auth/forgotpassword', { email });
      setIsSent(true);
      toast.success('Đã gửi email khôi phục mật khẩu!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsLoading(false);
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
            <h1>Quên mật khẩu</h1>
            <p>
              {isSent 
                ? 'Kiểm tra email của bạn để nhận hướng dẫn đặt lại mật khẩu.' 
                : 'Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.'}
            </p>
          </div>

          {!isSent ? (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading}>
                {isLoading ? 'Đang gửi...' : 'Gửi link khôi phục'}
              </button>
            </form>
          ) : (
            <div className="auth-success-message" style={{ textAlign: 'center', marginBottom: 24 }}>
              <p>Email đã được gửi đến <strong>{email}</strong>.</p>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)', marginTop: 8 }}>
                Vui lòng kiểm tra cả thư mục Spam nếu không tìm thấy.
              </p>
            </div>
          )}

          <p className="auth-switch">
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ArrowLeft size={16} /> Quay lại đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default ForgotPasswordPage;
