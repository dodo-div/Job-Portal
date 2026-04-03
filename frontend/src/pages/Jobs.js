import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/jobs?search=' + search + '&location=' + location + '&jobType=' + jobType);
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const jobTypeColors = {
    'full-time': { bg: '#e8f5e9', color: '#2e7d32' },
    'part-time': { bg: '#e3f2fd', color: '#1565c0' },
    'internship': { bg: '#fff3e0', color: '#e65100' },
    'contract': { bg: '#f3e5f5', color: '#6a1b9a' },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Navbar */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '0 40px', height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ background: '#1c1c2e', color: '#fff', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px' }}>J</div>
          <span style={{ fontWeight: '800', fontSize: '16px', color: '#1c1c2e' }}>JobPortal</span>
        </Link>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {user ? (
            <>
              <button onClick={() => navigate(user.role === 'employer' ? '/employer/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/seeker/dashboard')}
                style={{ padding: '7px 16px', background: '#f5f7fa', border: '1px solid #e0e0e0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#444' }}>
                Dashboard
              </button>
              <button onClick={() => { logout(); navigate('/'); }}
                style={{ padding: '7px 16px', background: '#ff6b35', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#fff' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ padding: '7px 16px', background: 'transparent', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#444', textDecoration: 'none' }}>Login</Link>
              <Link to="/register" style={{ padding: '7px 16px', background: '#ff6b35', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#fff', textDecoration: 'none' }}>Register</Link>
            </>
          )}
        </div>
      </nav>

      {/* Search Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1c1c2e, #2d2d44)', padding: '48px 40px', textAlign: 'center' }}>
        <h1 style={{ color: '#fff', fontSize: '32px', fontWeight: '800', margin: '0 0 8px' }}>
          Find Your Next <span style={{ color: '#ff6b35' }}>Opportunity</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', margin: '0 0 28px' }}>
          {jobs.length} jobs available right now
        </p>
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', gap: '8px', background: '#fff', padding: '6px', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
            placeholder="Job title or keyword..."
            style={{ flex: 1, padding: '11px 14px', border: 'none', outline: 'none', fontSize: '14px', borderRadius: '8px' }} />
          <input value={location} onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
            placeholder="Location..."
            style={{ flex: 1, padding: '11px 14px', border: 'none', borderLeft: '1px solid #eee', outline: 'none', fontSize: '14px' }} />
          <select value={jobType} onChange={(e) => setJobType(e.target.value)}
            style={{ padding: '11px 14px', border: 'none', borderLeft: '1px solid #eee', outline: 'none', fontSize: '14px', color: '#666', background: 'transparent' }}>
            <option value="">All Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
          </select>
          <button onClick={fetchJobs}
            style={{ padding: '11px 24px', background: '#ff6b35', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#fff', fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap' }}>
            Search
          </button>
        </div>
      </div>

      {/* Jobs List */}
      <div style={{ maxWidth: '800px', margin: '32px auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            Showing <strong>{jobs.length}</strong> jobs
          </p>
        </div>

        {loading ? (
          [1,2,3].map((i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ height: '16px', background: '#f0f0f0', borderRadius: '4px', width: '40%', marginBottom: '10px' }} />
              <div style={{ height: '13px', background: '#f5f5f5', borderRadius: '4px', width: '60%' }} />
            </div>
          ))
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>í²¼</div>
            <h3 style={{ color: '#1c1c2e' }}>No jobs found</h3>
            <p style={{ color: '#888' }}>Try different keywords or clear filters</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job._id} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '14px', padding: '22px 24px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderLeft: '4px solid #ff6b35' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#1c1c2e' }}>{job.title}</h3>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: jobTypeColors[job.jobType]?.bg || '#f5f5f5', color: jobTypeColors[job.jobType]?.color || '#666' }}>
                      {job.jobType}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 10px', color: '#666', fontSize: '14px' }}>
                    {job.companyName} &nbsp;â€¢&nbsp; {job.location}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#888' }}>
                    <span>Rs. {job.salary?.toLocaleString()}/yr</span>
                    {job.skillsRequired?.length > 0 && (
                      <span>{job.skillsRequired.slice(0, 3).join(', ')}</span>
                    )}
                  </div>
                </div>
                <button onClick={() => navigate('/jobs/' + job._id)}
                  style={{ padding: '9px 20px', background: '#1c1c2e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap', marginLeft: '16px' }}>
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Jobs;
