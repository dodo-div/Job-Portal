import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'seeker', companyName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await API.post('/auth/register', form);
      login(data);
      if (data.role === 'employer') navigate('/employer/dashboard');
      else navigate('/seeker/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          Already have an account? <Link to="/login" style={{ color: '#ff6b35', fontWeight: '600', textDecoration: 'none' }}>Login</Link>
        </span>
      </nav>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '460px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ background: '#1c1c2e', color: '#fff', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px', margin: '0 auto 16px' }}>J</div>
              <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '800', color: '#1c1c2e' }}>Create Account</h2>
              <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>Join thousands of job seekers and employers</p>
            </div>

            {/* Role Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {[
                { value: 'seeker', label: 'Job Seeker', desc: 'Find your dream job', color: '#0f9d58' },
                { value: 'employer', label: 'Employer', desc: 'Hire top talent', color: '#ff6b35' },
              ].map((r) => (
                <div key={r.value} onClick={() => setForm({ ...form, role: r.value })}
                  style={{ padding: '14px', border: `2px solid ${form.role === r.value ? r.color : '#e0e0e0'}`, borderRadius: '10px', cursor: 'pointer', background: form.role === r.value ? r.color + '10' : '#fff', transition: 'all 0.2s' }}>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: form.role === r.value ? r.color : '#444', marginBottom: '2px' }}>{r.label}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{r.desc}</div>
                </div>
              ))}
            </div>

            {error && (
              <div style={{ padding: '12px 16px', background: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '8px', color: '#c62828', fontSize: '14px', marginBottom: '20px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Doe' },
                { label: 'Email Address', key: 'email', type: 'email', placeholder: 'john@example.com' },
                { label: 'Password', key: 'password', type: 'password', placeholder: 'Min 6 characters' },
              ].map((field) => (
                <div key={field.key} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '6px' }}>{field.label}</label>
                  <input type={field.type} placeholder={field.placeholder} value={form[field.key]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required />
                </div>
              ))}

              {form.role === 'employer' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '6px' }}>Company Name</label>
                  <input placeholder="TechCorp Inc." value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '13px', background: loading ? '#ccc' : '#ff6b35', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '700', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px' }}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <span style={{ fontSize: '13px', color: '#888' }}>Already have an account? </span>
              <Link to="/login" style={{ fontSize: '13px', color: '#ff6b35', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
