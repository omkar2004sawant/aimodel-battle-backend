import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, MailWarning, ArrowRight, Swords } from 'lucide-react';
import { authService } from '@/services/endpoints';

const STATES = { verifying: 'verifying', success: 'success', error: 'error', expired: 'expired' };

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState(STATES.verifying);
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    if (!token) {
      setStatus(STATES.error);
      setMessage('No verification token was found in the link.');
      return;
    }
    authService
      .verifyEmail(token)
      .then((data) => {
        setStatus(STATES.success);
        setMessage(data.message || 'Your email has been verified. You can now sign in.');
      })
      .catch((err) => {
        const msg = err.message || '';
        if (msg.toLowerCase().includes('expired')) {
          setStatus(STATES.expired);
        } else {
          setStatus(STATES.error);
        }
        setMessage(msg || 'Verification failed.');
      });
  }, [token]);

  const resend = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;
    setResending(true);
    setResendDone(false);
    try {
      await authService.resendVerification(resendEmail);
      setResendDone(true);
    } catch {
      // backend responds generically — treat as success
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

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="card p-6 text-center">
          {status === STATES.verifying && (
            <>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-300">
                <Loader2 className="h-6 w-6 animate-spin" />
              </span>
              <h1 className="mt-4 text-lg font-semibold">Verifying your email…</h1>
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">Hang tight while we confirm your account.</p>
            </>
          )}

          {status === STATES.success && (
            <>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-success-500/15 text-success-600 dark:text-success-400">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-lg font-semibold">Email verified</h1>
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">{message}</p>
              <Link to="/login" className="btn-primary mt-6 w-full">
                Sign in <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}

          {status === STATES.error && (
            <>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-danger-500/15 text-danger-500">
                <XCircle className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-lg font-semibold">Verification failed</h1>
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">{message}</p>
              <Link to="/signup" className="btn-outline mt-6 w-full">
                Back to sign up
              </Link>
            </>
          )}

          {status === STATES.expired && (
            <>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-warning-500/15 text-warning-500">
                <MailWarning className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-lg font-semibold">Link expired</h1>
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
                Your verification link has expired. Enter your email to get a new one.
              </p>
              <form onSubmit={resend} className="mt-4 space-y-3 text-left">
                <input
                  type="email"
                  required
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input"
                />
                <button type="submit" disabled={resending} className="btn-primary w-full">
                  {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Resend verification link'}
                </button>
                {resendDone && (
                  <p className="rounded-lg bg-success-500/10 px-3 py-2 text-center text-sm text-success-600 dark:text-success-400">
                    If an account exists, a new link has been sent.
                  </p>
                )}
              </form>
              <Link to="/login" className="btn-outline mt-3 w-full">
                Back to sign in
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
