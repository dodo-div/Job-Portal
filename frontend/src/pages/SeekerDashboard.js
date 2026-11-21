import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Badge, DataState, PageHeading, Stats } from '../components/ui';
import { formatDate, formatSalary } from '../components/jobs';
import useData from '../hooks/useData';
import API from '../services/api';

const loadApplications = signal => API.get('/applications/myapplications', { signal }).then(response => response.data);

export default function SeekerDashboard() {
  const { user } = useAuth();
  const applications = useData(loadApplications, 'Could not load your applications.');
  const items = applications.data || [];
  const count = status => items.filter(application => application.status === status).length;

  return <section className="container page">
    <PageHeading eyebrow="JOB SEEKER WORKSPACE" title="My applications"
      actions={<Link className="button" to="/jobs">Browse jobs</Link>}>
      {user.name ? 'Signed in as ' + user.name + '.' : 'Track your applications and review their status.'}
    </PageHeading>
    {applications.data && <Stats items={[
      ['Total applications', items.length], ['Awaiting review', count('applied')], ['Shortlisted', count('shortlisted')], ['Rejected', count('rejected')],
    ]} />}
    <div className="section-bar"><h2>Application history</h2></div>
    <DataState {...applications} retry={applications.reload} empty={!items.length} title="No applications yet" heading="h3">
      {items.length ? <div className="result-list">{items.map(application => {
        const job = application.jobId;
        return <article key={application._id} className="surface row-card">
          <div>
            <h3>{job?._id ? <Link to={'/jobs/' + job._id}>{job.title}</Link> : 'Unavailable listing'}</h3>
            {job && <ul className="metadata"><li>{job.companyName}</li><li>{job.location}</li><li>{formatSalary(job.salary)}</li></ul>}
            {application.appliedAt && <p className="record-date">Applied <time dateTime={application.appliedAt}>{formatDate(application.appliedAt)}</time></p>}
          </div>
          <Badge value={application.status} />
        </article>;
      })}</div> : <><p className="muted">Your submitted applications will appear here.</p><Link className="button button-secondary" to="/jobs">Find a role</Link></>}
    </DataState>
  </section>;
}
