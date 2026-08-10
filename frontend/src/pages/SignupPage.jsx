import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Swords, ArrowRight, Mail, Lock, User } from 'lucide-react';
import { authService } from '@/services/endpoints';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/Feedback';

export default function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) return setError('Passwords do not match.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const data = await authService.signup(name, email, password);
      login(data.token, data.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center bg-ink-50 px-4 dark:bg-ink-950">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-grid-faint [background-size:32px_32px] opacity-50" />
      <div className="pointer-events-none fixed -top-40 left-1/2 -z-10 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-accent-400/15 blur-3xl" />

      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink-900 dark:bg-accent-500 text-white dark:text-ink-950 shadow-glow">
            <Swords className="h-5 w-5" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">AI Model Battle</span>
        </Link>

        <div className="card p-6">
          <h1 className="text-lg font-semibold">Create your account</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Start battling AI models in seconds.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="name">Name (optional)</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="confirm">Confirm password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input id="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" className="input pl-10" />
              </div>
            </div>
            {error && <p className="rounded-lg bg-danger-500/10 px-3 py-2 text-sm text-danger-600 dark:text-danger-400">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Spinner /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-500 dark:text-ink-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-accent-600 dark:text-accent-400 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
