import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const SeekerDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/applications/myapplications');
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    applied:     { bg: '#fff3e0', color: '#e65100', label: 'Applied' },
    shortlisted: { bg: '#e8f5e9', color: '#2e7d32', label: 'Shortlisted' },
    rejected:    { bg: '#ffebee', color: '#c62828', label: 'Rejected' },
  };

  const stats = [
    { label: 'Total Applied', value: applications.length, color: '#1a73e8' },
    { label: 'Shortlisted', value: applications.filter(a => a.status === 'shortlisted').length, color: '#0f9d58' },
    { label: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, color: '#e53935' },
    { label: 'Pending', value: applications.filter(a => a.status === 'applied').length, color: '#ff6b35' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Navbar */}
      <nav style={{ background: '#1c1c2e', padding: '0 40px', height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ background: '#ff6b35', color: '#fff', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px' }}>J</div>
          <span style={{ fontWeight: '800', fontSize: '16px', color: '#fff' }}>JobPortal</span>
        </Link>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
            Welcome, <span style={{ color: '#ff6b35', fontWeight: '600' }}>{user?.name}</span>
          </span>

          <button onClick={() => navigate('/seeker/find-contacts')}
  style={{ padding: '8px 16px', background: '#6f42c1', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', fontWeight: '600' }}>
  Find Contacts
</button>
          <button onClick={() => navigate('/jobs')}
            style={{ padding: '7px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', cursor: 'pointer', color: '#fff', fontSize: '13px' }}>
            Browse Jobs
          </button>
          <button onClick={() => { logout(); navigate('/'); }}
            style={{ padding: '7px 16px', background: '#ff6b35', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#fff', fontSize: '13px', fontWeight: '600' }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ margin: '0 0 6px', fontSize: '26px', fontWeight: '800', color: '#1c1c2e' }}>My Dashboard</h1>
          <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>Track your job applications and career progress</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${s.color}`, textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Applications */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1c1c2e' }}>My Applications</h2>
            <button onClick={() => navigate('/jobs')}
              style={{ padding: '8px 18px', background: '#ff6b35', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#fff', fontSize: '13px', fontWeight: '600' }}>
              + Apply for Jobs
            </button>
          </div>

          {loading ? (
            [1,2,3].map((i) => (
              <div key={i} style={{ padding: '16px', border: '1px solid #f0f0f0', borderRadius: '10px', marginBottom: '10px' }}>
                <div style={{ height: '14px', background: '#f0f0f0', borderRadius: '4px', width: '50%', marginBottom: '8px' }} />
                <div style={{ height: '12px', background: '#f5f5f5', borderRadius: '4px', width: '30%' }} />
              </div>
            ))
          ) : applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>���</div>
              <h3 style={{ color: '#1c1c2e', marginBottom: '8px' }}>No applications yet</h3>
              <p style={{ color: '#888', marginBottom: '20px' }}>Start applying to jobs to track them here</p>
              <button onClick={() => navigate('/jobs')}
                style={{ padding: '10px 24px', background: '#ff6b35', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#fff', fontWeight: '600' }}>
                Browse Jobs
              </button>
            </div>
          ) : (
            applications.map((app) => (
              <div key={app._id} style={{ padding: '18px', border: '1px solid #f0f0f0', borderRadius: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${statusConfig[app.status]?.color}` }}>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700', color: '#1c1c2e' }}>
                    {app.jobId?.title}
                  </h4>
                  <p style={{ margin: '0 0 6px', color: '#666', fontSize: '13px' }}>
                    {app.jobId?.companyName} • {app.jobId?.location} •Rs.{app.jobId?.salary?.toLocaleString('en-IN')}
                  </p>
                  <p style={{ margin: 0, color: '#aaa', fontSize: '12px' }}>
                    Applied {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <span style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', background: statusConfig[app.status]?.bg, color: statusConfig[app.status]?.color, whiteSpace: 'nowrap' }}>
                  {statusConfig[app.status]?.label}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SeekerDashboard;
