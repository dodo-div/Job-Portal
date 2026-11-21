import { useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DataState, Field, PageHeading } from '../components/ui';
import { JobCard, JobTypeOptions } from '../components/jobs';
import useData from '../hooks/useData';
import API from '../services/api';

export default function Jobs() {
  const [params, setParams] = useSearchParams();
  const filterKey = params.toString();
  const search = params.get('search') || '';
  const location = params.get('location') || '';
  const jobType = params.get('jobType') || '';
  const salary = params.get('salary') || '';
  const load = useCallback(signal => API.get('/jobs', { signal, params: { search, location, jobType, salary } }).then(response => response.data), [search, location, jobType, salary]);
  const jobs = useData(load, 'Could not load job listings.');

  function submit(event) {
    event.preventDefault();
    const fields = new URLSearchParams();
    for (const [name, value] of new FormData(event.currentTarget)) {
      if (value.trim()) fields.set(name, value.trim());
    }
    setParams(fields);
  }

  return <section className="container page">
    <PageHeading title="Browse jobs">Search open roles by title, location, work type, and salary.</PageHeading>
    <form key={filterKey} className="surface search-form" aria-label="Filter jobs" onSubmit={submit}>
      <Field label="Job title"><input name="search" defaultValue={search} placeholder="e.g. Product designer" maxLength={150} /></Field>
      <Field label="Location"><input name="location" defaultValue={location} placeholder="e.g. Pune" maxLength={150} /></Field>
      <Field label="Work type"><select name="jobType" defaultValue={jobType}><option value="">All work types</option><JobTypeOptions /></select></Field>
      <Field label="Min. annual salary (₹)"><input type="number" name="salary" min="0" step="any" defaultValue={salary} placeholder="Any" /></Field>
      <button className="button" type="submit">Search jobs</button>
    </form>
    <div className="section-bar">
      <p role="status">{jobs.data && <strong>{jobs.data.length} {jobs.data.length === 1 ? 'open role' : 'open roles'}</strong>}</p>
      {filterKey && <Link to="/jobs">Clear filters</Link>}
    </div>
    <DataState {...jobs} retry={jobs.reload} empty={!jobs.data?.length} title="No open roles found">
      {jobs.data?.length ? <div className="result-list">{jobs.data.map(job => <JobCard key={job._id} job={job} />)}</div>
        : <p className="muted">Try a different job title or change your filters.</p>}
    </DataState>
  </section>;
}
