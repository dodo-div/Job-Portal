import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboards } from '../components/Layout';
import AuthForm, { PasswordField } from '../components/AuthForm';
import { Field } from '../components/ui';
import API, { errorMessage } from '../services/api';

export default function Login() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    setError('');
    setBusy(true);
    try {
      const { data } = await API.post('/auth/login', fields);
      login(data);
      const from = location.state?.from;
      navigate(typeof from === 'string' && /^\/(?!\/)/.test(from) ? from : dashboards[data.role], { replace: true });
    } catch (error) {
      setError(error.response?.status === 401 ? 'Invalid email or password.' : errorMessage(error, 'Could not sign in. Please try again.'));
    } finally {
      setBusy(false);
    }
  }

  return <AuthForm title="Sign in" description="Access your JobPortal account." prompt="New to JobPortal?"
    linkTo="/register" linkLabel="Create an account" error={error} busy={busy} onSubmit={submit}>
    <Field label="Email address"><input name="email" type="email" autoComplete="email" maxLength={254} required /></Field>
    <PasswordField />
    <button className="button" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
  </AuthForm>;
}
