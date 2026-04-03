import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const EmployerDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', salary: '', location: '', companyName: '', jobType: 'full-time', skillsRequired: '' });
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchMyJobs(); }, []);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/jobs/employer/myjobs');
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      await API.post('/jobs', { ...form, skillsRequired: form.skillsRequired.split(',').map(s => s.trim()) });
      setMessage('Job posted successfully!');
      setForm({ title: '', description: '', salary: '', location: '', companyName: '', jobType: 'full-time', skillsRequired: '' });
      setShowForm(false);
      fetchMyJobs();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error posting job');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await API.delete('/jobs/' + id);
      fetchMyJobs();
    } catch (err) { console.error(err); }
  };

  const jobTypeColors = {
    'full-time':  { bg: '#e8f5e9', color: '#2e7d32' },
    'part-time':  { bg: '#e3f2fd', color: '#1565c0' },
    'internship': { bg: '#fff3e0', color: '#e65100' },
    'contract':   { bg: '#f3e5f5', color: '#6a1b9a' },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Navbar */}
      <nav style={{ background: '#1c1c2e', padding: '0 40px', height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ background: '#ff6b35', color: '#fff', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px' }}>J</div>
          <span style={{ fontWeight: '800', fontSize: '16px', color: '#fff' }}>JobPortal</span>
        </Link>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
            <span style={{ color: '#ff6b35', fontWeight: '600' }}>{user?.name}</span> • {user?.companyName}
          </span>
          <button onClick={() => navigate('/employer/find-candidates')}
            style={{ padding: '7px 16px', background: 'rgba(111,66,193,0.3)', border: '1px solid rgba(111,66,193,0.5)', borderRadius: '8px', cursor: 'pointer', color: '#c9a9ff', fontSize: '13px', fontWeight: '600' }}>
            Find Candidates
          </button>
          <button onClick={() => { logout(); navigate('/'); }}
            style={{ padding: '7px 16px', background: '#ff6b35', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#fff', fontSize: '13px', fontWeight: '600' }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: '800', color: '#1c1c2e' }}>Employer Dashboard</h1>
            <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>Manage your job listings and find top talent</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            style={{ padding: '10px 22px', background: '#ff6b35', border: 'none', borderRadius: '10px', cursor: 'pointer', color: '#fff', fontWeight: '700', fontSize: '14px' }}>
            {showForm ? 'Cancel' : '+ Post New Job'}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Total Jobs', value: jobs.length, color: '#1a73e8' },
            { label: 'Open Jobs', value: jobs.filter(j => j.isOpen).length, color: '#0f9d58' },
            { label: 'Closed Jobs', value: jobs.filter(j => !j.isOpen).length, color: '#e53935' },
          ].map((s) => (
            <div key={s.label} style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${s.color}`, textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div style={{ padding: '12px 16px', background: '#e8f5e9', border: '1px solid #a8d5b5', borderRadius: '8px', color: '#2e7d32', marginBottom: '20px', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
            {message}
            <span onClick={() => setMessage('')} style={{ cursor: 'pointer', color: '#888' }}>x</span>
          </div>
        )}

        {/* Post Job Form */}
        {showForm && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '28px', border: '2px solid #ff6b35' }}>
            <h3 style={{ margin: '0 0 20px', color: '#1c1c2e', fontSize: '18px', fontWeight: '700' }}>Post a New Job</h3>
            <form onSubmit={handlePost}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                {[
                  { label: 'Job Title', key: 'title', placeholder: 'e.g. Backend Developer' },
                  { label: 'Company Name', key: 'companyName', placeholder: 'e.g. TechCorp' },
                  { label: 'Location', key: 'location', placeholder: 'e.g. Mumbai' },
                  { label: 'Salary (per year)', key: 'salary', placeholder: 'e.g. 500000', type: 'number' },
                ].map((f) => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '6px' }}>{f.label}</label>
                    <input type={f.type || 'text'} placeholder={f.placeholder} value={form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '6px' }}>Job Type</label>
                <select value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })}
                  style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '6px' }}>Skills Required (comma separated)</label>
                <input placeholder="e.g. React, Node.js, MongoDB" value={form.skillsRequired}
                  onChange={(e) => setForm({ ...form, skillsRequired: e.target.value })}
                  style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '6px' }}>Description</label>
                <textarea placeholder="Describe the role, responsibilities..." value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', minHeight: '100px', resize: 'vertical' }} required />
              </div>
              <button type="submit"
                style={{ padding: '12px 28px', background: '#ff6b35', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#fff', fontWeight: '700', fontSize: '14px' }}>
                Post Job
              </button>
            </form>
          </div>
        )}

        {/* Jobs List */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '700', color: '#1c1c2e' }}>My Posted Jobs</h2>
          {loading ? (
            [1,2].map((i) => (
              <div key={i} style={{ padding: '16px', border: '1px solid #f0f0f0', borderRadius: '10px', marginBottom: '10px' }}>
                <div style={{ height: '14px', background: '#f0f0f0', borderRadius: '4px', width: '40%', marginBottom: '8px' }} />
                <div style={{ height: '12px', background: '#f5f5f5', borderRadius: '4px', width: '25%' }} />
              </div>
            ))
          ) : jobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#888', marginBottom: '16px' }}>No jobs posted yet</p>
              <button onClick={() => setShowForm(true)}
                style={{ padding: '10px 24px', background: '#ff6b35', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#fff', fontWeight: '600' }}>
                Post Your First Job
              </button>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job._id} style={{ padding: '18px', border: '1px solid #f0f0f0', borderRadius: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${job.isOpen ? '#0f9d58' : '#e53935'}` }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1c1c2e' }}>{job.title}</h4>
                    <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: jobTypeColors[job.jobType]?.bg, color: jobTypeColors[job.jobType]?.color }}>
                      {job.jobType}
                    </span>
                    <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: job.isOpen ? '#e8f5e9' : '#ffebee', color: job.isOpen ? '#2e7d32' : '#c62828' }}>
                      {job.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#888', fontSize: '13px' }}>
                    {job.location} • Rs.{job.salary?.toLocaleString()}/yr
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => navigate('/employer/applicants/' + job._id)}
                    style={{ padding: '7px 14px', background: '#e8f0fe', color: '#1a73e8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                    Applicants
                  </button>
                  <button onClick={() => handleDelete(job._id)}
                    style={{ padding: '7px 14px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
