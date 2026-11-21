import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, DataState, Notice, PageHeading, Stats } from '../components/ui';
import { formatSalary, jobTypeLabel } from '../components/jobs';
import JobForm from '../components/JobForm';
import ConfirmDialog from '../components/ConfirmDialog';
import useData from '../hooks/useData';
import API, { errorMessage } from '../services/api';

const loadJobs = signal => API.get('/jobs/employer/myjobs', { signal }).then(response => response.data);

export default function EmployerDashboard() {
  const jobs = useData(loadJobs, 'Could not load your posted jobs.');
  const [editor, setEditor] = useState(null);
  const [saveError, setSaveError] = useState('');
  const [busy, setBusy] = useState('');
  const [feedback, setFeedback] = useState({});
  const [pendingDelete, setPendingDelete] = useState(null);
  const editorTrigger = useRef(null);
  const postedHeading = useRef(null);
  const items = jobs.data || [];
  const open = items.filter(job => job.isOpen).length;

  useEffect(() => {
    if (!editor && !busy && editorTrigger.current) {
      editorTrigger.current.focus();
      editorTrigger.current = null;
    }
  }, [busy, editor]);

  function openEditor(event, job = {}) {
    editorTrigger.current = event.currentTarget;
    setEditor(job);
    setSaveError('');
    setFeedback({});
  }

  async function save(fields) {
    const id = editor._id;
    setBusy('save');
    setSaveError('');
    try {
      const { data } = id ? await API.put('/jobs/' + id, fields) : await API.post('/jobs', fields);
      if (jobs.data) {
        jobs.setData(current => id ? current.map(job => job._id === id ? data : job) : [data, ...current]);
      } else {
        jobs.reload();
      }
      setEditor(null);
      setFeedback({ tone: 'success', message: id ? 'Job updated.' : 'Job posted.' });
    } catch (error) {
      setSaveError(errorMessage(error, id ? 'Could not update this job.' : 'Could not post this job.'));
    } finally {
      setBusy('');
    }
  }

  async function remove(job) {
    setPendingDelete(null);
    setFeedback({});
    setBusy(job._id);
    try {
      await API.delete('/jobs/' + job._id);
      jobs.setData(current => current.filter(item => item._id !== job._id));
      setFeedback({ tone: 'success', message: 'Job deleted.' });
      postedHeading.current?.focus();
    } catch (error) {
      setFeedback({ tone: 'error', message: errorMessage(error, 'Could not delete this job.') });
    } finally {
      setBusy('');
    }
  }

  return <section className="container page">
    <PageHeading eyebrow="EMPLOYER WORKSPACE" title="My jobs" actions={<>
      <Link className="button button-secondary" to="/employer/find-candidates">Find candidates</Link>
      <button className="button" onClick={event => openEditor(event)} disabled={!!busy || !!editor}>Post a job</button>
    </>}>Post openings and manage applications for your jobs.</PageHeading>
    <Notice tone={feedback.tone}>{feedback.message}</Notice>
    {editor && <JobForm job={editor} busy={busy === 'save'} error={saveError} onSave={save} onCancel={() => setEditor(null)} />}
    {jobs.data && <Stats items={[[ 'Total jobs', items.length ], ['Open', open], ['Closed', items.length - open]]} />}
    <div className="section-bar"><h2 ref={postedHeading} tabIndex={-1}>Posted jobs</h2></div>
    <DataState {...jobs} retry={jobs.reload} empty={!items.length} title="You haven’t posted a job yet" heading="h3">
      {items.length ? <div className="result-list">{items.map(job => <article className="surface row-card" key={job._id}>
        <div>
          <h3><Link to={'/jobs/' + job._id}>{job.title}</Link></h3>
          <ul className="metadata"><li>{job.companyName}</li><li>{job.location}</li><li>{jobTypeLabel(job.jobType)}</li><li>{formatSalary(job.salary)}</li></ul>
        </div>
        <div className="job-actions actions">
          <Badge value={job.isOpen ? 'open' : 'closed'} />
          <Link className="button button-secondary" to={'/employer/applicants/' + job._id}>View applicants</Link>
          <button className="button button-secondary" onClick={event => openEditor(event, job)} disabled={!!busy || !!editor}
            aria-label={'Edit job ' + job.title}>Edit</button>
          <button className="button button-danger" onClick={() => setPendingDelete(job)} disabled={!!busy || !!editor}
            aria-label={'Delete job ' + job.title}>{busy === job._id ? 'Deleting…' : 'Delete'}</button>
        </div>
      </article>)}</div> : <p className="muted">Post an opening to start receiving applications.</p>}
    </DataState>
    {pendingDelete && <ConfirmDialog title="Delete job?" onCancel={() => setPendingDelete(null)} onConfirm={() => remove(pendingDelete)}>
      “{pendingDelete.title}” and its applications will be deleted.
    </ConfirmDialog>}
  </section>;
}
