import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboards } from '../components/Layout';
import { Badge, DataState, Notice, PageHeading, Stats } from '../components/ui';
import { formatDate, formatSalary } from '../components/jobs';
import useData from '../hooks/useData';
import API, { errorMessage } from '../services/api';
import { downloadBlob } from '../services/download';

const downloadErrors = {
  401: 'Your session has expired. Sign out and sign in again.',
  403: 'You do not have access to this resume.',
  404: 'This resume is no longer available.',
  429: 'Too many download attempts. Please try again later.',
};

export default function Applicants() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const load = useCallback(async signal => {
    const [job, applications] = await Promise.all([
      API.get('/jobs/' + jobId, { signal }), API.get('/applications/job/' + jobId, { signal }),
    ]);
    return { job: job.data, applications: applications.data };
  }, [jobId]);
  const resource = useData(load, 'Could not load applicants for this job.');
  const [feedback, setFeedback] = useState({});
  const [updating, setUpdating] = useState('');
  const [downloading, setDownloading] = useState('');
  const applications = resource.data?.applications || [];
  const job = resource.data?.job;
  const count = status => applications.filter(application => application.status === status).length;

  async function updateStatus(id, status) {
    setFeedback({});
    setUpdating(id);
    try {
      const { data } = await API.put('/applications/' + id + '/status', { status });
      resource.setData(previous => previous && ({
        ...previous, applications: previous.applications.map(item => item._id === id ? { ...item, status: data.status } : item),
      }));
      setFeedback({ tone: 'success', message: 'Application marked as ' + data.status + '.' });
    } catch (error) {
      setFeedback({ tone: 'error', message: errorMessage(error, 'Could not update the application status.') });
    } finally {
      setUpdating('');
    }
  }

  async function downloadResume(id) {
    setFeedback({});
    setDownloading(id);
    try {
      const { data } = await API.get('/applications/' + id + '/resume', { responseType: 'blob' });
      downloadBlob(data, 'resume.pdf');
    } catch (error) {
      setFeedback({ tone: 'error', message: downloadErrors[error.response?.status] || 'Could not download the resume.' });
    } finally {
      setDownloading('');
    }
  }

  return <section className="container page">
    <Link className="back-link" to={dashboards[user.role]}>{user.role === 'admin' ? 'Administration' : 'My jobs'}</Link>
    <PageHeading eyebrow="APPLICANT MANAGEMENT" title={job?.title || 'Applicants'}
      actions={job && <Link className="button button-secondary" to={'/jobs/' + jobId}>View job listing</Link>}>
      {job && [job.companyName, job.location, formatSalary(job.salary)].join(' · ')}
    </PageHeading>
    <Notice tone={feedback.tone}>{feedback.message}</Notice>
    <DataState {...resource} retry={resource.reload}>
      {resource.data && <>
        <Stats items={[[ 'Total applicants', applications.length ], ['Awaiting review', count('applied')], ['Shortlisted', count('shortlisted')], ['Rejected', count('rejected')]]} />
        <div className="section-bar"><h2>Applications</h2><Badge value={job.isOpen ? 'open' : 'closed'} /></div>
        <DataState empty={!applications.length} title="No applicants yet" heading="h3">
          {applications.length ? <div className="result-list">{applications.map(application => <article key={application._id} className="surface row-card applicant-card"
            aria-busy={updating === application._id || downloading === application._id}>
            <div className="record-details">
              <h3>{application.userId?.name || 'Unavailable applicant'}</h3>
              {application.userId?.email && <p className="muted">{application.userId.email}</p>}
              {application.appliedAt && <p className="record-date">Applied <time dateTime={application.appliedAt}>{formatDate(application.appliedAt)}</time></p>}
              {!!application.userId?.skills?.length && <ul className="tags">
                {[...new Set(application.userId.skills)].map(skill => <li key={skill}>{skill}</li>)}
              </ul>}
              {application.coverLetter && <details><summary>Cover letter</summary><p className="job-description">{application.coverLetter}</p></details>}
            </div>
            <div className="applicant-actions">
              <Badge value={application.status} />
              <div className="actions">
                {application.resume && <button className="button button-secondary" disabled={!!downloading}
                  onClick={() => downloadResume(application._id)} aria-label={'Download resume for ' + (application.userId?.name || 'applicant')}>
                  {downloading === application._id ? 'Downloading…' : 'Download resume'}</button>}
                <button className="button button-secondary" disabled={!!updating || application.status === 'shortlisted'}
                  onClick={() => updateStatus(application._id, 'shortlisted')} aria-label={'Shortlist ' + (application.userId?.name || 'applicant')}>Shortlist</button>
                <button className="button button-danger" disabled={!!updating || application.status === 'rejected'}
                  onClick={() => updateStatus(application._id, 'rejected')} aria-label={'Reject ' + (application.userId?.name || 'applicant')}>Reject</button>
              </div>
            </div>
          </article>)}</div> : <p className="muted">Share the job listing to invite applications.</p>}
        </DataState>
      </>}
    </DataState>
  </section>;
}
