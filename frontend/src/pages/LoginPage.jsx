import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Swords, ArrowRight, Mail, Lock, MailWarning, Loader2 } from 'lucide-react';
import { authService } from '@/services/endpoints';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/Feedback';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setUnverified(false);
    setResendDone(false);
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      login(data.token, data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
      // The backend returns a 403 with "verify your email" when isVerified is false.
      if (/verify your email/i.test(err.message)) {
        setUnverified(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setResendDone(false);
    try {
      await authService.resendVerification(email);
      setResendDone(true);
    } catch {
      setResendDone(true);
    } finally {
      setResending(false);
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
          <h1 className="text-lg font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Sign in to your arena account.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
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
                <input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input pl-10" />
              </div>
            </div>
            {error && (
              <div className={`rounded-lg px-3 py-2 text-sm ${unverified ? 'bg-warning-500/10 text-warning-600 dark:text-warning-400' : 'bg-danger-500/10 text-danger-600 dark:text-danger-400'}`}>
                {unverified && <MailWarning className="mb-1 h-4 w-4" />}
                <p>{error}</p>
                {unverified && (
                  <div className="mt-2 border-t border-warning-500/20 pt-2">
                    {resendDone ? (
                      <p className="text-xs">A new link has been sent if an account exists. Check your inbox.</p>
                    ) : (
                      <button type="button" onClick={resend} disabled={resending} className="flex items-center gap-1.5 text-xs font-medium text-warning-600 hover:underline disabled:opacity-50 dark:text-warning-400">
                        {resending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                        Resend verification email
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Spinner /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-500 dark:text-ink-400">
            New here?{' '}
            <Link to="/signup" className="font-medium text-accent-600 dark:text-accent-400 hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
