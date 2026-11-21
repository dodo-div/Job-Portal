import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataState, Field, Notice, PageHeading } from './ui';
import { formatDate } from './jobs';
import API, { errorMessage } from '../services/api';
import { downloadBlob } from '../services/download';

const filters = [['skills', 'Skills'], ['location', 'Location'], ['company', 'Company']];

function csvCell(value) {
  const text = String(value ?? '');
  const safe = /^\s*[=+@-]|^[\t\r\n]/.test(text) ? "'" + text : text;
  return '"' + safe.replaceAll('"', '""') + '"';
}

export default function PeopleSearch({ contacts = false, allowed = true }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({});
  const queryInput = useRef(null);
  const examples = contacts ? ['Recruiter in Mumbai', 'Hiring manager at a software company'] :
    ['Backend engineer in Bengaluru', 'Product designer with fintech experience'];
  const title = contacts ? 'Find contacts' : 'Find candidates';

  async function search(event) {
    event.preventDefault();
    if (loading) return;
    const form = new FormData(event.currentTarget);
    const phrase = [query.trim(), form.get('skills').trim(), form.get('location').trim(),
      form.get('company').trim() && 'at ' + form.get('company').trim()].filter(Boolean).join(' ');
    if (!query.trim() || phrase.length > 500) {
      setFeedback({ tone: 'error', message: 'Enter a search query and keep the query and filters within 500 characters.' });
      return;
    }
    setLoading(true);
    setResults(null);
    setFeedback({});
    try {
      const { data } = await API.post('/exa/search-people', { query: phrase, numResults: 10 });
      setResults(data);
    } catch (error) {
      const unavailable = error.response?.status === 503;
      setFeedback({ tone: unavailable ? 'info' : 'error', message: unavailable
        ? 'People search is currently unavailable. If this continues, ask your administrator to check the Exa integration.'
        : errorMessage(error, 'Could not search profiles. Please try again.') });
    } finally {
      setLoading(false);
    }
  }

  function exportResults() {
    const rows = [['Name', 'URL', 'Date'], ...results.map(result => [result.title, result.url, result.publishedDate])];
    downloadBlob(new Blob([rows.map(row => row.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'results.csv');
  }

  return <section className="container page">
    <PageHeading eyebrow="PEOPLE SEARCH" title={title} actions={allowed && <Link className="button button-secondary"
      to={contacts ? '/employer/find-candidates' : '/employer/find-contacts'}>{contacts ? 'Find candidates' : 'Find contacts'}</Link>}>
      {contacts ? 'Look up recruiters, hiring managers, and company contacts.' : 'Search public professional profiles by role, location, and skills.'}
    </PageHeading>
    {!allowed ? <div className="surface state">
      <h2>Contact search is unavailable for job seeker accounts</h2>
      <p className="muted">This search is available to employer and administrator accounts. You can still browse roles and track your applications.</p>
      <Link className="button button-secondary" to="/jobs">Browse jobs</Link>
    </div> : <>
      <form className="surface padded form-stack people-form" onSubmit={search} aria-label={title} aria-busy={loading}>
        <div className="people-query">
          <Field label="Search query"><input ref={queryInput} name="query" value={query} onChange={event => setQuery(event.target.value)}
            placeholder={examples[0]} maxLength={500} required /></Field>
          <button className="button" disabled={loading}>{loading ? 'Searching…' : 'Search profiles'}</button>
        </div>
        <div className="form-grid people-filters">
          {filters.map(([name, label]) => <Field key={name} label={label + ' (optional)'}><input name={name} maxLength={150} /></Field>)}
        </div>
        <div className="example-list"><span>Try a search</span>{examples.map(example => <button key={example} type="button"
          className="button button-secondary" onClick={() => { setQuery(example); queryInput.current?.focus(); }}>{example}</button>)}</div>
      </form>
      <Notice tone={feedback.tone}>{feedback.message}</Notice>
      <DataState loading={loading} empty={results?.length === 0} title="No profiles found">
        {results?.length === 0 && <p className="muted">Try a broader search or remove a filter.</p>}
        {!!results?.length && <>
          <div className="section-bar"><h2 aria-live="polite">{results.length} {results.length === 1 ? 'profile' : 'profiles'} found</h2>
            <button className="button button-secondary" onClick={exportResults}>Export CSV</button></div>
          <div className="result-list">{results.map((result, index) => <article className="surface row-card" key={result.id || result.url + index}>
            <div><h3>{result.title?.trim() || 'Professional profile'}</h3>
              <p className="muted record-date">{result.publishedDate && 'Updated ' + formatDate(result.publishedDate)}</p></div>
            <a className="button button-secondary" href={result.url} target="_blank" rel="noreferrer">View profile<span className="sr-only"> (opens in a new tab)</span></a>
          </article>)}</div>
        </>}
      </DataState>
    </>}
  </section>;
}
