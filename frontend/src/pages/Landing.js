import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'employer') navigate('/employer/dashboard');
      else navigate('/seeker/dashboard');
    }
  }, [user]);

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#fafafa' }}>

      {/* Navbar */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '0 60px', height: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#1c1c2e', color: '#fff', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px' }}>J</div>
          <span style={{ fontWeight: '800', fontSize: '18px', color: '#1c1c2e' }}>JobPortal</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/jobs')}
            style={{ padding: '8px 20px', background: 'transparent', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#444' }}>
            Browse Jobs
          </button>
          <button onClick={() => navigate('/login')}
            style={{ padding: '8px 20px', background: 'transparent', border: '1px solid #1c1c2e', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#1c1c2e' }}>
            Login
          </button>
          <button onClick={() => navigate('/register')}
            style={{ padding: '8px 20px', background: '#ff6b35', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#fff' }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1c1c2e 0%, #2d2d44 100%)', padding: '100px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: '20px', padding: '6px 18px', marginBottom: '24px' }}>
          <span style={{ color: '#ff6b35', fontSize: '13px', fontWeight: '600', letterSpacing: '1px' }}>POWERED BY EXA AI</span>
        </div>
        <h1 style={{ color: '#fff', fontSize: '52px', fontWeight: '800', margin: '0 0 20px', lineHeight: '1.2' }}>
          Find Your Dream Job<br />
          <span style={{ color: '#ff6b35' }}>or Perfect Candidate</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px', margin: '0 0 40px', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto' }}>
          The smartest job portal with AI-powered candidate search. Connect seekers with employers seamlessly.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button onClick={() => navigate('/register')}
            style={{ padding: '16px 36px', background: '#ff6b35', border: 'none', borderRadius: '10px', cursor: 'pointer', color: '#fff', fontWeight: '700', fontSize: '16px', boxShadow: '0 8px 24px rgba(255,107,53,0.4)' }}>
            Get Started Free
          </button>
          <button onClick={() => navigate('/jobs')}
            style={{ padding: '16px 36px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', cursor: 'pointer', color: '#fff', fontWeight: '600', fontSize: '16px' }}>
            Browse Jobs
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', marginTop: '60px' }}>
          {[['1B+', 'Profiles Indexed'], ['500+', 'Companies'], ['10K+', 'Jobs Posted'], ['98%', 'Match Accuracy']].map(([num, label]) => (
            <div key={label}>
              <div style={{ color: '#ff6b35', fontSize: '28px', fontWeight: '800' }}>{num}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '80px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: '800', color: '#1c1c2e', marginBottom: '12px' }}>
          Everything You Need
        </h2>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '48px', fontSize: '16px' }}>
          Built for job seekers and employers alike
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {[
            { title: 'AI People Search', desc: 'Find exact candidates by role, skills, location using Exa AI with 1B+ indexed profiles.', color: '#ff6b35', icon: 'S' },
            { title: 'Smart Job Matching', desc: 'Search and filter jobs by title, location, salary and job type in real time.', color: '#1a73e8', icon: 'M' },
            { title: 'Easy Applications', desc: 'Upload resume and apply in one click. Track all your applications in one place.', color: '#0f9d58', icon: 'A' },
            { title: 'Employer Dashboard', desc: 'Post jobs, manage listings, view applicants and accept or reject with ease.', color: '#9c27b0', icon: 'D' },
            { title: 'Role Based Access', desc: 'Separate dashboards for seekers, employers and admins with JWT security.', color: '#f4b400', icon: 'R' },
            { title: 'Admin Control Panel', desc: 'Full platform oversight — manage users, jobs and monitor all activity.', color: '#e91e63', icon: 'C' },
          ].map((f) => (
            <div key={f.title} style={{ background: '#fff', borderRadius: '14px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `4px solid ${f.color}` }}>
              <div style={{ width: '44px', height: '44px', background: f.color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '18px', marginBottom: '16px' }}>
                {f.icon}
              </div>
              <h3 style={{ margin: '0 0 10px', color: '#1c1c2e', fontSize: '16px', fontWeight: '700' }}>{f.title}</h3>
              <p style={{ margin: 0, color: '#888', fontSize: '14px', lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: '#1c1c2e', padding: '80px 60px', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '36px', fontWeight: '800', margin: '0 0 16px' }}>
          Ready to Get Started?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', marginBottom: '36px' }}>
          Join thousands of seekers and employers already using JobPortal
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button onClick={() => navigate('/register')}
            style={{ padding: '14px 32px', background: '#ff6b35', border: 'none', borderRadius: '10px', cursor: 'pointer', color: '#fff', fontWeight: '700', fontSize: '15px' }}>
            Register as Job Seeker
          </button>
          <button onClick={() => navigate('/register')}
            style={{ padding: '14px 32px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', cursor: 'pointer', color: '#fff', fontWeight: '600', fontSize: '15px' }}>
            Register as Employer
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#111', padding: '24px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>2026 JobPortal. Built with MERN Stack + Exa AI.</span>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Browse Jobs', 'Login', 'Register'].map((link) => (
            <span key={link} onClick={() => navigate('/' + link.toLowerCase().replace(' ', ''))}
              style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', cursor: 'pointer' }}>
              {link}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;
