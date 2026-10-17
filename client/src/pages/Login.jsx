import { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await (mode === 'login' ? login({ email: form.email, password: form.password }) : register(form));
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth">
      <div className="auth-intro">
        <div className="brand big">Fit<span>Track</span></div>
        <p>Log your lifts, sleep and meals. FitTrack turns them into a daily recovery score so you know when to push and when to rest.</p>
      </div>
      <form className="auth-card" onSubmit={submit}>
        <h1>{mode === 'login' ? 'Log in' : 'Create your account'}</h1>
        {mode === 'register' && (
          <label>Name<input value={form.name} onChange={set('name')} required autoComplete="name" /></label>
        )}
        <label>Email<input type="email" value={form.email} onChange={set('email')} required autoComplete="email" /></label>
        <label>Password<input type="password" value={form.password} onChange={set('password')} required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
        {error && <div className="error" role="alert">{error}</div>}
        <button className="btn" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
        <button type="button" className="link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
          {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Log in'}
        </button>
      </form>
    </div>
  );
}
