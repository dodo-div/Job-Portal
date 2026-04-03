import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [message, setMessage] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchJobs();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/admin/stats');
      setStats(data);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/admin/users');
      setUsers(data);
    } catch (err) { console.error(err); }
  };

  const fetchJobs = async () => {
    try {
      const { data } = await API.get('/admin/jobs');
      setJobs(data);
    } catch (err) { console.error(err); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await API.delete('/admin/users/' + id);
      setMessage('User deleted successfully');
      fetchUsers();
      fetchStats();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error deleting user');
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await API.delete('/admin/jobs/' + id);
      setMessage('Job deleted successfully');
      fetchJobs();
      fetchStats();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error deleting job');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, color: '#1a73e8', bg: '#e8f0fe' },
    { label: 'Job Seekers', value: stats.totalSeekers, color: '#0f9d58', bg: '#e6f4ea' },
    { label: 'Employers', value: stats.totalEmployers, color: '#f4b400', bg: '#fef9e0' },
    { label: 'Total Jobs', value: stats.totalJobs, color: '#e91e63', bg: '#fce4ec' },
    { label: 'Open Jobs', value: stats.openJobs, color: '#9c27b0', bg: '#f3e5f5' },
    { label: 'Applications', value: stats.totalApplications, color: '#ff6b35', bg: '#fff3e0' },
  ] : [];

  const tabs = ['overview', 'users', 'jobs'];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Navbar */}
      <nav style={{ background: '#1c1c2e', padding: '0 40px', height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#ff6b35', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', fontSize: '13px', letterSpacing: '1px' }}>ADMIN</div>
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>Job Portal Control Panel</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
            Logged in as <span style={{ color: '#ff6b35' }}>{user?.name}</span>
          </span>
          <button onClick={handleLogout}
            style={{ padding: '7px 18px', background: '#ff6b35', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#fff', fontWeight: '600', fontSize: '13px' }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Message */}
        {message && (
          <div style={{ padding: '12px 18px', background: '#e6f4ea', border: '1px solid #a8d5b5', borderRadius: '8px', color: '#2e7d32', marginBottom: '20px', fontSize: '14px' }}>
            {message}
            <span onClick={() => setMessage('')} style={{ float: 'right', cursor: 'pointer' }}>x</span>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: '#fff', padding: '6px', borderRadius: '10px', width: 'fit-content', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: '8px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', textTransform: 'capitalize', background: activeTab === tab ? '#1c1c2e' : 'transparent', color: activeTab === tab ? '#fff' : '#666', transition: 'all 0.2s' }}>
              {tab === 'overview' ? 'Overview' : tab === 'users' ? `Users (${users.length})` : `Jobs (${jobs.length})`}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <h2 style={{ color: '#1c1c2e', marginBottom: '20px', fontSize: '22px' }}>Platform Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
              {statCards.map((card) => (
                <div key={card.label} style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${card.color}` }}>
                  <div style={{ fontSize: '36px', fontWeight: '800', color: card.color, marginBottom: '8px' }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>{card.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Users */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 16px', color: '#1c1c2e' }}>Recent Users</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                    {['Name', 'Email', 'Role', 'Joined'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '13px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 5).map((u) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500', color: '#1c1c2e' }}>{u.name}</td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>{u.email}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: u.role === 'employer' ? '#fff3e0' : u.role === 'admin' ? '#fce4ec' : '#e8f5e9', color: u.role === 'employer' ? '#e65100' : u.role === 'admin' ? '#c62828' : '#2e7d32' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#999' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ margin: '0 0 20px', color: '#1c1c2e' }}>All Users ({users.length})</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  {['Name', 'Email', 'Role', 'Joined', 'Action'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '13px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500', color: '#1c1c2e' }}>{u.name}</td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>{u.email}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: u.role === 'employer' ? '#fff3e0' : u.role === 'admin' ? '#fce4ec' : '#e8f5e9', color: u.role === 'employer' ? '#e65100' : u.role === 'admin' ? '#c62828' : '#2e7d32' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', color: '#999' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px' }}>
                      {u.role !== 'admin' && (
                        <button onClick={() => handleDeleteUser(u._id)}
                          style={{ padding: '5px 14px', background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ margin: '0 0 20px', color: '#1c1c2e' }}>All Jobs ({jobs.length})</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  {['Title', 'Company', 'Location', 'Salary', 'Status', 'Action'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '13px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500', color: '#1c1c2e' }}>{job.title}</td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>{job.companyName}</td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>{job.location}</td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>Rs.{job.salary}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: job.isOpen ? '#e8f5e9' : '#ffebee', color: job.isOpen ? '#2e7d32' : '#c62828' }}>
                        {job.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button onClick={() => handleDeleteJob(job._id)}
                        style={{ padding: '5px 14px', background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
