import { Link } from 'react-router-dom';

export const jobTypes = [
  ['full-time', 'Full time'], ['part-time', 'Part time'], ['internship', 'Internship'], ['contract', 'Contract'],
];

export const jobTypeLabel = value => jobTypes.find(([key]) => key === value)?.[1] || value;

const salaryFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const formatSalary = value => typeof value === 'number' ? salaryFormatter.format(value) + ' / year' : 'Salary unavailable';

export function formatDate(value) {
  const date = new Date(value || NaN);
  return Number.isNaN(date.valueOf()) ? '' : date.toLocaleDateString('en-IN', { dateStyle: 'medium' });
}

export function JobTypeOptions() {
  return jobTypes.map(([value, label]) => <option value={value} key={value}>{label}</option>);
}

export function JobCard({ job, heading: Heading = 'h2', compact = false }) {
  const posted = formatDate(job.createdAt);
  return <article className="surface listing">
    <div className="company-mark" aria-hidden="true">{job.companyName?.trim().slice(0, 2).toUpperCase() || 'JP'}</div>
    <div className="listing-body">
      <p className="company-name">{job.companyName}</p>
      <Heading className="listing-title"><Link to={'/jobs/' + job._id}>{job.title}</Link></Heading>
      <ul className="metadata"><li>{job.location}</li><li>{jobTypeLabel(job.jobType)}</li><li>{formatSalary(job.salary)}</li></ul>
      {!compact && !!job.skillsRequired?.length && <ul className="tags" aria-label="Required skills">
        {[...new Set(job.skillsRequired)].slice(0, 4).map(skill => <li key={skill}>{skill}</li>)}
      </ul>}
    </div>
    {posted && <time className="listing-date" dateTime={job.createdAt}>{posted}</time>}
  </article>;
}
