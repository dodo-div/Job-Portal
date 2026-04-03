import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const JobDetail = () => {
  const [job, setJob] = useState(null);
  const [message, setMessage] = useState('');
  const [resume, setResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchJob(); }, []);

  const fetchJob = async () => {
    try {
      const { data } = await API.get('/jobs/' + id);
      setJob(data);
    } catch (err) { console.error(err); }
  };

  const handleApply = async () => {
    if (!user) return navigate('/login');
    try {
      setUploading(true);
      if (resume) {
        const formData = new FormData();
        formData.append('resume', resume);
        await API.post('/upload/resume', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      await API.post('/applications/' + id);
      setMessage('Applied successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error applying');
    } finally { setUploading(false); }
  };

  if (!job) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>;

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '20px' }}>
      <button onClick={() => navigate('/jobs')} style={{ marginBottom: '20px', padding: '8px 16px', cursor: 'pointer' }}>
        Back to Jobs
      </button>
      <h2>{job.title}</h2>
      <p><strong>Company:</strong> {job.companyName}</p>
      <p><strong>Location:</strong> {job.location}</p>
      <p><strong>Salary:</strong> {job.salary}</p>
      <p><strong>Type:</strong> {job.jobType}</p>
      <p><strong>Skills:</strong> {job.skillsRequired?.join(', ')}</p>
      <p><strong>Description:</strong> {job.description}</p>

      {message && (
        <p style={{ color: message.includes('success') ? 'green' : 'red', fontWeight: 'bold' }}>
          {message}
        </p>
      )}

      {user?.role === 'seeker' && (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h4>Apply for this job</h4>
          <input type="file" accept=".pdf" onChange={(e) => setResume(e.target.files[0])} style={{ marginBottom: '10px' }} />
          <br />
          <button onClick={handleApply} disabled={uploading}
            style={{ padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
            {uploading ? 'Applying...' : 'Upload Resume & Apply'}
          </button>
        </div>
      )}

      {!user && <p>Please <a href="/login">login</a> as a seeker to apply.</p>}
    </div>
  );
};

export default JobDetail;
