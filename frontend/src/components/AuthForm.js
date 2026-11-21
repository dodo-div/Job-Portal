import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { Field, Notice } from './ui';

export function PasswordField({ creating = false }) {
  const inputId = useId();
  const [visible, setVisible] = useState(false);
  return <Field label="Password" help={creating ? 'Use at least 6 characters.' : undefined}
    action={<button type="button" className="inline-action" aria-controls={inputId} onClick={() => setVisible(value => !value)}>
      {visible ? 'Hide password' : 'Show password'}
    </button>}>
    <input id={inputId} name="password" type={visible ? 'text' : 'password'}
      autoComplete={creating ? 'new-password' : 'current-password'} minLength={creating ? 6 : undefined} required />
  </Field>;
}

export default function AuthForm({ title, description, prompt, linkTo, linkLabel, error, busy, onSubmit, children }) {
  return <section className="container auth-page">
    <div className="surface auth-card">
      <h1>{title}</h1>
      <p className="muted">{description}</p>
      <Notice>{error}</Notice>
      <form className="form-stack" aria-busy={busy} onSubmit={onSubmit}>{children}</form>
      <p className="auth-switch">{prompt} <Link to={linkTo}>{linkLabel}</Link></p>
    </div>
  </section>;
}
