import { cloneElement, useId } from 'react';

export function PageHeading({ eyebrow, title, children, actions }) {
  return <header className="page-heading">
    <div>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {children && <p className="muted">{children}</p>}
    </div>
    {actions && <div className="actions">{actions}</div>}
  </header>;
}

export function Field({ label, help, error, action, children }) {
  const id = useId();
  const inputId = children.props.id || id;
  const describedBy = [children.props['aria-describedby'], help && id + '-help', error && id + '-error'].filter(Boolean).join(' ');
  return <div className="field">
    <div className="field-label"><label htmlFor={inputId}>{label}</label>{action}</div>
    {cloneElement(children, { id: inputId, 'aria-describedby': describedBy || undefined, 'aria-invalid': error ? true : children.props['aria-invalid'] })}
    {help && <small id={id + '-help'}>{help}</small>}
    {error && <small id={id + '-error'} className="field-error" role="alert">{error}</small>}
  </div>;
}

export function Notice({ tone = 'error', children }) {
  return children ? <div className={'notice notice-' + tone} role={tone === 'error' ? 'alert' : 'status'}>{children}</div> : null;
}

export function DataState({ loading, error, retry, empty, title, heading: Heading = 'h2', children }) {
  if (loading) return <div className="surface state state-loading" role="status">Loading…</div>;
  if (error) return <div className="surface state"><Notice>{error}</Notice>{retry && <button className="button button-secondary" onClick={retry}>Try again</button>}</div>;
  if (empty) return <div className="surface state"><Heading>{title}</Heading>{children}</div>;
  return children;
}

const statuses = {
  applied: ['Applied', 'indigo'], shortlisted: ['Shortlisted', 'green'], rejected: ['Rejected', 'red'],
  open: ['Open', 'green'], closed: ['Closed', 'neutral'], seeker: ['Job seeker', 'indigo'],
  employer: ['Employer', 'neutral'], admin: ['Administrator', 'neutral'],
};

export function Badge({ value }) {
  const [label, tone] = statuses[value] || [value, 'neutral'];
  return <span className={'badge badge-' + tone}>{label}</span>;
}

export function Stats({ items }) {
  return <dl className="stats">{items.map(([label, value]) => <div key={label} className="surface stat">
    <dt>{label}</dt><dd>{value}</dd>
  </div>)}</dl>;
}

