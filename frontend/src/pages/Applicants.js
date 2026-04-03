import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { jobId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobAndApplicants();
  }, []);

  const fetchJobAndApplicants = async () => {
    try {
      setLoading(true);
      const [jobRes, appRes] = await Promise.all([
        API.get('/jobs/' + jobId),
        API.get('/applications/job/' + jobId),
      ]);
      setJob(jobRes.data);
      setApplicants(appRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (appId, status) => {
    try {
      await API.put('/applications/' + appId + '/status', { status });
      setMessage('Status updated to ' + status);
      fetchJobAndApplicants();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error updating status');
    }
  };

  const statusConfig = {
    applied:     { bg: '#fff3e0', color: '#e65100', label: 'Applied' },
    shortlisted: { bg: '#e8f5e9', color: '#2e7d32', label: 'Shortlisted' },
    rejected:    { bg: '#ffebee', color: '#c62828', label: 'Rejected' },
  };

  const stats = [
    { label: 'Total', value: applicants.length, color: '#1a73e8' },
    { label: 'Shortlisted', value: applicants.filter(a => a.status === 'shortlisted').length, color: '#0f9d58' },
    { label: 'Rejected', value: applicants.filter(a => a.status === 'rejected').length, color: '#e53935' },
    { label: 'Pending', value: applicants.filter(a => a.status === 'applied').length, color: '#ff6b35' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Navbar */}
      <nav style={{ background: '#1c1c2e', padding: '0 40px', height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ background: '#ff6b35', color: '#fff', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px' }}>J</div>
          <span style={{ fontWeight: '800', fontSize: '16px', color: '#fff' }}>JobPortal</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => navigate('/employer/dashboard')}
            style={{ padding: '7px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', cursor: 'pointer', color: '#fff', fontSize: '13px' }}>
            Dashboard
          </button>
          <button onClick={() => { logout(); navigate('/'); }}
            style={{ padding: '7px 16px', background: '#ff6b35', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#fff', fontSize: '13px', fontWeight: '600' }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Job Info */}
        {job && (
          <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: '4px solid #ff6b35' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: '800', color: '#1c1c2e' }}>{job.title}</h1>
                <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
                  {job.companyName} â€¢ {job.location} â€¢ Rs.{job.salary?.toLocaleString()}/yr
                </p>
              </div>
              <span style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', background: job.isOpen ? '#e8f5e9' : '#ffebee', color: job.isOpen ? '#2e7d32' : '#c62828' }}>
                {job.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: '#fff', borderRadius: '12px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${s.color}`, textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div style={{ padding: '12px 16px', background: '#e8f5e9', border: '1px solid #a8d5b5', borderRadius: '8px', color: '#2e7d32', marginBottom: '20px', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
            {message}
            <span onClick={() => setMessage('')} style={{ cursor: 'pointer' }}>x</span>
          </div>
        )}

        {/* Applicants */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '700', color: '#1c1c2e' }}>
            Applicants ({applicants.length})
          </h2>

          {loading ? (
            [1,2,3].map((i) => (
              <div key={i} style={{ padding: '16px', border: '1px solid #f0f0f0', borderRadius: '10px', marginBottom: '10px' }}>
                <div style={{ height: '14px', background: '#f0f0f0', borderRadius: '4px', width: '30%', marginBottom: '8px' }} />
                <div style={{ height: '12px', background: '#f5f5f5', borderRadius: '4px', width: '50%' }} />
              </div>
            ))
          ) : applicants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', color: '#ddd' }}>í±¤</div>
              <h3 style={{ color: '#1c1c2e', marginBottom: '8px' }}>No applicants yet</h3>
              <p style={{ color: '#888' }}>Share the job to get more applicants</p>
            </div>
          ) : (
            applicants.map((app) => (
              <div key={app._id} style={{ padding: '20px', border: '1px solid #f0f0f0', borderRadius: '12px', marginBottom: '12px', borderLeft: `4px solid ${statusConfig[app.status]?.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1c1c2e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px' }}>
                        {app.userId?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1c1c2e' }}>{app.userId?.name}</h4>
                        <p style={{ margin: 0, color: '#888', fontSize: '13px' }}>{app.userId?.email}</p>
                      </div>
                    </div>

                    {app.userId?.skills?.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '10px 0' }}>
                        {app.userId.skills.map((skill) => (
                          <span key={skill} style={{ padding: '3px 10px', background: '#f0f0f0', borderRadius: '20px', fontSize: '12px', color: '#555' }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#aaa', marginTop: '8px' }}>
                      <span>Applied {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {app.resume && (
                        <a href={'http://localhost:5000/uploads/' + app.resume} target="_blank" rel="noreferrer"
                          style={{ color: '#1a73e8', textDecoration: 'none', fontWeight: '500' }}>
                          View Resume
                        </a>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                    <span style={{ padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: statusConfig[app.status]?.bg, color: statusConfig[app.status]?.color }}>
                      {statusConfig[app.status]?.label}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleStatus(app._id, 'shortlisted')}
                        disabled={app.status === 'shortlisted'}
                        style={{ padding: '6px 14px', background: app.status === 'shortlisted' ? '#f0f0f0' : '#e8f5e9', color: app.status === 'shortlisted' ? '#aaa' : '#2e7d32', border: 'none', borderRadius: '8px', cursor: app.status === 'shortlisted' ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600' }}>
                        Shortlist
                      </button>
                      <button onClick={() => handleStatus(app._id, 'rejected')}
                        disabled={app.status === 'rejected'}
                        style={{ padding: '6px 14px', background: app.status === 'rejected' ? '#f0f0f0' : '#ffebee', color: app.status === 'rejected' ? '#aaa' : '#c62828', border: 'none', borderRadius: '8px', cursor: app.status === 'rejected' ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600' }}>
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Applicants;
