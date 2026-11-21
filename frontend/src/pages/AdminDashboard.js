import { useCallback, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Badge, DataState, Notice, PageHeading, Stats } from '../components/ui';
import { formatDate, formatSalary } from '../components/jobs';
import useData from '../hooks/useData';
import API, { errorMessage } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';

const views = { stats: 'Overview', users: 'Users', jobs: 'Jobs' };
const columns = {
  users: ['Name', 'Email', 'Role', 'Joined', 'Actions'],
  jobs: ['Job title', 'Company', 'Location', 'Salary', 'Status', 'Actions'],
};

function AdminTable({ view, rows, renderRow }) {
  const headers = columns[view];
  return <div className="surface table-region">
    <table role="table" aria-label={views[view]}>
      <thead><tr role="row">{headers.map(label => <th key={label} role="columnheader" scope="col">{label}</th>)}</tr></thead>
      <tbody>{rows.map(row => {
        const [heading, ...cells] = renderRow(row);
        return <tr role="row" key={row._id}>
          <th role="rowheader" scope="row">{heading}</th>
          {cells.map((value, index) => <td key={headers[index + 1]} role="cell">
            <span className="cell-label" aria-hidden="true">{headers[index + 1]}</span><div>{value}</div>
          </td>)}
        </tr>;
      })}</tbody>
    </table>
  </div>;
}

export default function AdminDashboard() {
  const [params] = useSearchParams();
  const selected = params.get('view');
  const view = ['users', 'jobs'].includes(selected) ? selected : 'stats';
  const load = useCallback(signal => API.get('/admin/' + view, { signal }).then(response => response.data), [view]);
  const resource = useData(load, 'Could not load this administration view.');
  const [feedback, setFeedback] = useState({});
  const [deleting, setDeleting] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const navigation = useRef(null);
  const data = resource.data;
  const rows = Array.isArray(data) ? data : [];

  async function remove({ item, type }) {
    const isUser = type === 'users';
    setPendingDelete(null);
    setFeedback({});
    setDeleting(item._id);
    try {
      await API.delete('/admin/' + type + '/' + item._id);
      resource.reload();
      setFeedback({ tone: 'success', message: isUser ? 'User deleted.' : 'Job deleted.' });
      navigation.current?.querySelector('[aria-current="page"]')?.focus();
    } catch (error) {
      setFeedback({ tone: 'error', message: errorMessage(error, 'Could not delete this record.') });
    } finally {
      setDeleting('');
    }
  }

  function deleteButton(item, type) {
    const label = type === 'users' ? item.name : item.title;
    return <button className="button button-danger" disabled={!!deleting} onClick={() => setPendingDelete({ item, type, label })}
      aria-label={'Delete ' + (type === 'users' ? 'user ' : 'job ') + label}>{deleting === item._id ? 'Deleting…' : 'Delete'}</button>;
  }

  function renderRow(item) {
    if (view === 'users') return [item.name, item.email, <Badge value={item.role} />, formatDate(item.createdAt),
      item.role === 'admin' ? 'Protected' : deleteButton(item, 'users')];
    return [<Link to={'/jobs/' + item._id}>{item.title}</Link>, item.companyName, item.location, formatSalary(item.salary),
      <Badge value={item.isOpen ? 'open' : 'closed'} />,
      <div className="actions"><Link className="inline-action" to={'/employer/applicants/' + item._id}>Applicants</Link>{deleteButton(item, 'jobs')}</div>];
  }

  return <section className="container page">
    <PageHeading eyebrow="ADMIN WORKSPACE" title="Administration">Review platform activity and manage registered users and job listings.</PageHeading>
    <nav className="view-tabs" aria-label="Administration views" ref={navigation}>
      {Object.entries(views).map(([key, label]) => <Link key={key} to={key === 'stats' ? '/admin/dashboard' : '?view=' + key}
        aria-current={view === key ? 'page' : undefined} onClick={() => setFeedback({})}>{label}</Link>)}
    </nav>
    <Notice tone={feedback.tone}>{feedback.message}</Notice>
    <DataState {...resource} retry={resource.reload} empty={view !== 'stats' && !rows.length}
      title={view === 'users' ? 'No registered users' : 'No job listings'}>
      {data && view === 'stats' && <Stats items={[
        ['Total users', data.totalUsers], ['Job seekers', data.totalSeekers], ['Employers', data.totalEmployers],
        ['Total jobs', data.totalJobs], ['Open jobs', data.openJobs], ['Applications', data.totalApplications],
      ]} />}
      {view !== 'stats' && !!rows.length && <AdminTable view={view} rows={rows} renderRow={renderRow} />}
    </DataState>
    {pendingDelete && <ConfirmDialog title={pendingDelete.type === 'users' ? 'Delete user?' : 'Delete job?'}
      onCancel={() => setPendingDelete(null)} onConfirm={() => remove(pendingDelete)}>
      “{pendingDelete.label}” and associated records will be deleted.
    </ConfirmDialog>}
  </section>;
}
