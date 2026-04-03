import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const FindCandidates = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [company, setCompany] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searched, setSearched] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const buildQuery = () => {
    let q = query;
    if (skills) q += ' ' + skills;
    if (location) q += ' ' + location;
    if (company) q += ' at ' + company;
    return q.trim();
  };

  const handleSearch = async () => {
    if (!query.trim()) return setMessage('Please enter a role or title');
    try {
      setLoading(true);
      setMessage('');
      setResults([]);
      setSearched(true);
      const { data } = await API.post('/exa/search-people', { query: buildQuery(), numResults: 10 });
      setResults(data);
      if (data.length === 0) setMessage('No results found. Try a different query.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csv = [['Name', 'URL', 'Date'], ...results.map((r) => [r.title || '', r.url || '', r.publishedDate || ''])].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'candidates.csv';
    a.click();
  };

  const examples = ['VP of Growth at Zomato', 'Head of Engineering at Razorpay', 'Backend engineer Bangalore', 'React developer India', 'Data scientist Mumbai', 'FinTech founders Series A'];

  const getInitials = (title) => {
    if (!title) return '?';
    const words = title.split(' ');
    return words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : words[0][0].toUpperCase();
  };

  const avatarColors = ['#ff6b35', '#00b4d8', '#06d6a0', '#ffd166', '#ef476f', '#118ab2'];

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Top bar */}
      <div style={{ background: '#1c1c2e', padding: '14px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>ÌæØ</span>
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '17px' }}>TalentRadar</span>
          <span style={{ background: '#ff6b35', color: '#fff', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', letterSpacing: '1px' }}>PRO</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Powered by Exa AI</span>
          <button onClick={() => navigate('/employer/dashboard')}
            style={{ padding: '7px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', color: '#fff', fontSize: '13px' }}>
            Dashboard
          </button>
          <button onClick={() => { logout(); navigate('/login'); }}
            style={{ padding: '7px 16px', background: '#ff6b35', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#fff', fontSize: '13px', fontWeight: '600' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1c1c2e 0%, #2d2d44 100%)', padding: '60px 48px', textAlign: 'center' }}>
        <p style={{ color: '#ff6b35', fontWeight: '600', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
          Smart Candidate Discovery
        </p>
        <h1 style={{ color: '#fff', fontSize: '42px', fontWeight: '800', margin: '0 0 14px', lineHeight: '1.2' }}>
          Find <span style={{ color: '#ff6b35' }}>Exactly</span> Who You Need
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '16px', margin: '0 0 40px' }}>
          Search across 1B+ profiles. Get precise matches by role, skills, location and company.
        </p>

        {/* Stats row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginBottom: '40px' }}>
          {[['1B+', 'Profiles'], ['10x', 'Faster'], ['98%', 'Accuracy']].map(([num, label]) => (
            <div key={label}>
              <div style={{ color: '#ff6b35', fontSize: '24px', fontWeight: '800' }}>{num}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Main Search */}
        <div style={{ maxWidth: '700px', margin: '0 auto', background: '#fff', borderRadius: '14px', padding: '6px', display: 'flex', gap: '6px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. VP of Growth at Zomato, Backend engineer payments..."
            style={{ flex: 1, padding: '14px 18px', border: 'none', outline: 'none', fontSize: '15px', borderRadius: '10px', color: '#1c1c2e' }} />
          <button onClick={handleSearch} disabled={loading}
            style={{ padding: '14px 28px', background: loading ? '#ccc' : '#ff6b35', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer', color: '#fff', fontWeight: '700', fontSize: '15px', whiteSpace: 'nowrap' }}>
            {loading ? 'Searching...' : 'Find Talent'}
          </button>
        </div>
      </div>

      {/* Filters + Results */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Filter row */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { icon: '‚ö°', value: skills, setter: setSkills, placeholder: 'Skills (React, Python...)' },
            { icon: 'Ì≥ç', value: location, setter: setLocation, placeholder: 'Location (Bangalore...)' },
            { icon: 'Ìø¢', value: company, setter: setCompany, placeholder: 'Company (Razorpay...)' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e8e8e8', borderRadius: '8px', padding: '0 12px', flex: 1, minWidth: '180px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <span style={{ marginRight: '8px', fontSize: '14px' }}>{f.icon}</span>
              <input value={f.value} onChange={(e) => f.setter(e.target.value)}
                placeholder={f.placeholder}
                style={{ border: 'none', outline: 'none', padding: '11px 0', fontSize: '13px', color: '#333', width: '100%', background: 'transparent' }} />
            </div>
          ))}
          <button onClick={handleSearch} disabled={loading}
            style={{ padding: '11px 20px', background: '#1c1c2e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
            Apply Filters
          </button>
        </div>

        {/* Example tags */}
        <div style={{ marginBottom: '28px' }}>
          <span style={{ color: '#999', fontSize: '13px', marginRight: '10px' }}>Try:</span>
          {examples.map((ex) => (
            <span key={ex} onClick={() => setQuery(ex)}
              style={{ display: 'inline-block', margin: '4px', padding: '5px 14px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', color: '#444', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              {ex}
            </span>
          ))}
        </div>

        {/* Error */}
        {message && (
          <div style={{ padding: '14px 18px', background: '#fff3e0', border: '1px solid #ffcc80', borderRadius: '8px', color: '#e65100', marginBottom: '20px', fontSize: '14px' }}>
            ‚ö†Ô∏è {message}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div>
            {[1,2,3,4].map((i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '12px', padding: '20px', marginBottom: '12px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f0f0f0' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: '14px', background: '#f0f0f0', borderRadius: '4px', marginBottom: '8px', width: '55%' }} />
                  <div style={{ height: '12px', background: '#f5f5f5', borderRadius: '4px', width: '35%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontWeight: '700', fontSize: '16px', color: '#1c1c2e' }}>{results.length} candidates found</span>
                <span style={{ color: '#999', fontSize: '14px', marginLeft: '8px' }}>for "{query}"</span>
              </div>
              <button onClick={handleExport}
                style={{ padding: '8px 18px', background: '#06d6a0', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#fff', fontWeight: '600', fontSize: '13px' }}>
                Export CSV
              </button>
            </div>

            {results.map((result, index) => (
              <div key={index} style={{ background: '#fff', border: '1px solid #f0f0f0', padding: '18px 22px', marginBottom: '10px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderLeft: `4px solid ${avatarColors[index % avatarColors.length]}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: avatarColors[index % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', color: '#fff', flexShrink: 0 }}>
                    {getInitials(result.title)}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#1c1c2e', fontWeight: '600' }}>
                      {result.title || 'Unknown'}
                    </h4>
                    <a href={result.url} target="_blank" rel="noreferrer"
                      style={{ color: '#ff6b35', fontSize: '13px', textDecoration: 'none' }}>
                      {result.url?.replace('https://www.', '').replace('https://', '').substring(0, 55)}
                    </a>
                    {result.publishedDate && (
                      <p style={{ color: '#bbb', fontSize: '12px', margin: '3px 0 0' }}>
                        Updated {new Date(result.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
                <a href={result.url} target="_blank" rel="noreferrer"
                  style={{ padding: '9px 20px', background: '#1c1c2e', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                  View Profile ‚Üí
                </a>
              </div>
            ))}
          </>
        )}

        {/* Empty state */}
        {!loading && searched && results.length === 0 && !message && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>ÌæØ</div>
            <h3 style={{ color: '#1c1c2e', marginBottom: '8px' }}>No results found</h3>
            <p style={{ color: '#999' }}>Try different keywords or remove some filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindCandidates;
