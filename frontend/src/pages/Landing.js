import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboards } from '../components/Layout';
import { DataState, Field } from '../components/ui';
import { JobCard, jobTypes } from '../components/jobs';
import useData from '../hooks/useData';
import API from '../services/api';

const loadRecentJobs = signal => API.get('/jobs', { signal, params: { limit: 3 } }).then(response => response.data);

function RecentJobs() {
  const jobs = useData(loadRecentJobs, 'Could not load recent jobs.');
  return <section className="container landing-section" aria-labelledby="recent-jobs">
    <div className="section-bar landing-section-heading">
      <h2 id="recent-jobs">Recently posted jobs</h2>
      <Link className="button button-secondary" to="/jobs">Browse all jobs <span aria-hidden="true">→</span></Link>
    </div>
    <DataState {...jobs} retry={jobs.reload} empty={!jobs.data?.length} title="No open roles yet" heading="h3">
      {jobs.data?.length ? <div className="recent-grid">{jobs.data.map(job => <JobCard key={job._id} job={job} heading="h3" compact />)}</div>
        : <p className="muted">New listings will appear here when employers publish them.</p>}
    </DataState>
  </section>;
}

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (user) return <Navigate to={dashboards[user.role]} replace />;

  function search(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(event.currentTarget)) {
      if (value.trim()) params.set(key, value.trim());
    }
    const filters = params.toString();
    navigate(filters ? '/jobs?' + filters : '/jobs');
  }

  return <>
    <section className="landing-hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <h1>Find work.<br /> <span>Hire with purpose.</span></h1>
          <p className="hero-description">Find your next role, track every application, and connect with the people you want on your team.</p>
          <form className="hero-search" onSubmit={search} aria-label="Search jobs">
            <Field label="Job title"><input name="search" placeholder="e.g. Designer" maxLength={150} /></Field>
            <Field label="Location"><input name="location" placeholder="e.g. Pune" maxLength={150} /></Field>
            <button className="button" type="submit">Search jobs</button>
          </form>
          <p className="hero-employer">Hiring? <Link to="/register?role=employer">Create an employer account</Link></p>
        </div>
        <img className="hero-photo" src={process.env.PUBLIC_URL + '/recruitment-hero.jpg'} alt="Two people in a hiring conversation across an office desk" width="1100" height="1100" fetchPriority="high" />
      </div>
    </section>
    <RecentJobs />
    <section className="container landing-section" aria-labelledby="work-types">
      <h2 id="work-types">Browse by work type</h2>
      <div className="work-types">
        {jobTypes.map(([type, label]) => <Link className="surface work-type" key={type} to={'/jobs?jobType=' + type}>
          {label}<span aria-hidden="true">↗</span>
        </Link>)}
      </div>
    </section>
    <section className="container landing-section audience-grid" aria-label="Account options">
      <article className="surface audience-card">
        <p className="eyebrow">FOR JOB SEEKERS</p>
        <h2>Keep track of every application.</h2>
        <p>Apply with your PDF resume and follow your progress in one place.</p>
        <Link className="button button-secondary" to="/register">Create a seeker account</Link>
      </article>
      <article className="surface audience-card">
        <p className="eyebrow">FOR HIRING TEAMS</p>
        <h2>Manage your hiring in one place.</h2>
        <p>Post jobs, review resumes, and shortlist candidates from your employer dashboard.</p>
        <Link className="button button-secondary" to="/register?role=employer">Create an employer account</Link>
      </article>
    </section>
  </>;
}
