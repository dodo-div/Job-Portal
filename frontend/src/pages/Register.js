import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboards } from '../components/Layout';
import AuthForm, { PasswordField } from '../components/AuthForm';
import { Field } from '../components/ui';
import API, { errorMessage } from '../services/api';

export default function Register() {
  const [params, setParams] = useSearchParams();
  const role = params.get('role') === 'employer' ? 'employer' : 'seeker';
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    if (new TextEncoder().encode(fields.password).length > 72) {
      setError('Your password is too long. Use fewer characters and try again.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const { data } = await API.post('/auth/register', fields);
      login(data);
      navigate(dashboards[data.role], { replace: true });
    } catch (error) {
      setError(errorMessage(error, 'Could not create your account. Please try again.'));
    } finally {
      setBusy(false);
    }
  }

  return <AuthForm title="Create an account" description="Choose how you want to use JobPortal." prompt="Already have an account?"
    linkTo="/login" linkLabel="Sign in" error={error} busy={busy} onSubmit={submit}>
    <fieldset className="role-field">
      <legend>Account type</legend>
      <div className="role-options">
        {[['seeker', 'Job seeker'], ['employer', 'Employer']].map(([value, label]) => <label key={value}>
          <input name="role" type="radio" value={value} checked={role === value}
            onChange={() => setParams(value === 'employer' ? { role: value } : {}, { replace: true })} />{label}
        </label>)}
      </div>
    </fieldset>
    <Field label="Full name"><input name="name" autoComplete="name" maxLength={100} required /></Field>
    <Field label="Email address"><input name="email" type="email" autoComplete="email" maxLength={254} required /></Field>
    <PasswordField creating />
    {role === 'employer' && <Field label="Company name (optional)"><input name="companyName" autoComplete="organization" maxLength={150} /></Field>}
    <button className="button" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
  </AuthForm>;
}
