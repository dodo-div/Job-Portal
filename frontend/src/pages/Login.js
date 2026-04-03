import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await API.post('/auth/login', form);
      login(data);
      if (data.role === 'employer') navigate('/employer/dashboard');
      else if (data.role === 'admin') navigate('/admin/dashboard');
      else navigate('/seeker/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: "'Segoe UI', sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/* Navbar */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '0 40px', height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ background: '#1c1c2e', color: '#fff', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px' }}>J</div>
          <span style={{ fontWeight: '800', fontSize: '16px', color: '#1c1c2e' }}>JobPortal</span>
        </Link>
        <span style={{ fontSize: '14px', color: '#888' }}>
          Don't have an account? <Link to="/register" style={{ color: '#ff6b35', fontWeight: '600', textDecoration: 'none' }}>Register</Link>
        </span>
      </nav>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Card */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ background: '#1c1c2e', color: '#fff', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px', margin: '0 auto 16px' }}>J</div>
              <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '800', color: '#1c1c2e' }}>Welcome back</h2>
              <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>Sign in to your JobPortal account</p>
            </div>

            {error && (
              <div style={{ padding: '12px 16px', background: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '8px', color: '#c62828', fontSize: '14px', marginBottom: '20px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '6px' }}>Email Address</label>
                <input type="email" placeholder="john@example.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1c1c2e' }} required />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '6px' }}>Password</label>
                <input type="password" placeholder="Enter your password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1c1c2e' }} required />
              </div>
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '13px', background: loading ? '#ccc' : '#ff6b35', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '700', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <span style={{ fontSize: '13px', color: '#888' }}>Don't have an account? </span>
              <Link to="/register" style={{ fontSize: '13px', color: '#ff6b35', fontWeight: '600', textDecoration: 'none' }}>Create one</Link>
            </div>
          </div>

          {/* Demo accounts */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', marginTop: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>Demo Accounts</p>
            {[
              { role: 'Seeker', email: 'john@example.com', color: '#0f9d58' },
              { role: 'Employer', email: 'jane@example.com', color: '#ff6b35' },
              { role: 'Admin', email: 'admin@jobportal.com', color: '#e91e63' },
            ].map((acc) => (
              <div key={acc.role} onClick={() => setForm({ email: acc.email, password: '123456' })}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', marginBottom: '6px', background: '#f9f9f9' }}>
                <span style={{ fontSize: '13px', color: '#444' }}>{acc.email}</span>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: acc.color + '20', color: acc.color, fontWeight: '600' }}>{acc.role}</span>
              </div>
            ))}
            <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#bbb', textAlign: 'center' }}>Click any account to autofill</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
