import { useCallback, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Badge, DataState, Field, Notice, PageHeading } from '../components/ui';
import { formatDate, formatSalary, jobTypeLabel } from '../components/jobs';
import useData from '../hooks/useData';
import API, { errorMessage } from '../services/api';

const MAX_RESUME_BYTES = 5 * 1024 * 1024;

function ApplicationForm({ jobId }) {
  const [submission, setSubmission] = useState({});
  const [busy, setBusy] = useState(false);
  const [resume, setResume] = useState(null);
  const fileInput = useRef(null);
  const fileError = resume && (!/\.pdf$/i.test(resume.name) || (resume.type && resume.type !== 'application/pdf'))
    ? 'Choose a PDF resume.'
    : resume && (resume.size === 0 || resume.size > MAX_RESUME_BYTES) ? 'Choose a non-empty PDF up to 5 MB.' : '';

  function clearResume() {
    fileInput.current.value = '';
    fileInput.current.focus();
    setResume(null);
    setSubmission({});
  }

  async function apply(event) {
    event.preventDefault();
    if (busy) return;
    if (fileError) return fileInput.current.focus();
    const coverLetter = event.currentTarget.elements.coverLetter.value;
    setSubmission({});
    setBusy(true);
    try {
      if (resume) {
        const body = new FormData();
        body.append('resume', resume);
        await API.post('/upload/resume', body);
      }
      await API.post('/applications/' + jobId, { coverLetter });
      setSubmission({ tone: 'success', message: 'Application submitted.' });
    } catch (error) {
      if (error.response?.status === 409) {
        setSubmission({ tone: 'info', message: 'You have already applied to this role.' });
      } else {
        setSubmission({ tone: 'error', message: errorMessage(error, 'Could not submit your application.') });
      }
    } finally {
      setBusy(false);
    }
  }

  return <>
    <Notice tone={submission.tone}>{submission.message}</Notice>
    {['success', 'info'].includes(submission.tone) ? <Link className="button button-secondary" to="/seeker/dashboard">View your applications</Link> :
      <form onSubmit={apply} className="form-stack" aria-busy={busy}>
        <Field label="Resume" error={fileError} help="PDF up to 5 MB. Leave blank to use your previously uploaded resume.">
          <input ref={fileInput} name="resume" type="file" accept=".pdf,application/pdf" disabled={busy}
            onChange={event => { setResume(event.target.files[0] || null); setSubmission({}); }} />
        </Field>
        {resume && <div className="resume-selection">
          <span role="status">{fileError ? '' : 'Selected: ' + resume.name}</span>
          <button type="button" className="inline-action" onClick={clearResume} disabled={busy}>Remove file</button>
        </div>}
        <Field label="Cover letter (optional)"><textarea name="coverLetter" rows={4} maxLength={5000} disabled={busy} /></Field>
        <button className="button" disabled={busy}>{busy ? 'Submitting…' : 'Submit application'}</button>
      </form>}
  </>;
}

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const load = useCallback(signal => API.get('/jobs/' + id, { signal }).then(response => response.data), [id]);
  const resource = useData(load, 'Could not load this role.');
  const job = resource.data;

  return <section className="container page">
    <Link className="back-link" to="/jobs">Browse jobs</Link>
    <DataState {...resource} retry={resource.reload}>
      {job && <>
        <PageHeading eyebrow={job.companyName} title={job.title} actions={<Badge value={job.isOpen ? 'open' : 'closed'} />}>
          {job.location} · {jobTypeLabel(job.jobType)}
        </PageHeading>
        <div className="detail-grid">
          <article className="surface padded">
            <ul className="metadata detail-metadata"><li>{formatSalary(job.salary)}</li>{job.createdAt && <li>Posted {formatDate(job.createdAt)}</li>}</ul>
            <h2>About the role</h2>
            <p className="job-description">{job.description}</p>
            {!!job.skillsRequired?.length && <><h2>Required skills</h2><ul className="tags">
              {[...new Set(job.skillsRequired)].map(skill => <li key={skill}>{skill}</li>)}
            </ul></>}
          </article>
          <aside className="surface padded apply-panel">
            <h2>Apply for this role</h2>
            {!job.isOpen ? <p className="muted">This role is closed to applications.</p>
              : !user ? <><p className="muted">Sign in with a job seeker account to apply.</p><Link className="button" to="/login" state={{ from: location.pathname }}>Sign in to apply</Link></>
              : user.role !== 'seeker' ? <p className="muted">Applications are available to job seeker accounts.</p>
              : <ApplicationForm key={id} jobId={id} />}
          </aside>
        </div>
      </>}
    </DataState>
  </section>;
}
