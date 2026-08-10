import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swords, ArrowRight, Scale, FileText, Trophy, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const FEATURES = [
  { icon: Scale, title: 'Side-by-side AI battles', body: 'Send one prompt to two models and watch both answers render in real time.' },
  { icon: Trophy, title: 'An impartial AI judge', body: 'A third model scores both responses on accuracy, completeness, clarity, and creativity.' },
  { icon: FileText, title: 'PDF & image analysis', body: 'Upload a document or image — both models analyze the same content, then get judged.' },
  { icon: Sparkles, title: 'Battle history & stats', body: 'Every battle is saved. Track win rates, your most accurate model, and total tokens used.' },
];

export default function LandingPage() {
  const { user } = useAuth();
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-50 dark:bg-ink-950">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-grid-faint [background-size:32px_32px] opacity-50" />
      <div className="pointer-events-none fixed -top-40 left-1/2 -z-10 h-96 w-[70rem] -translate-x-1/2 rounded-full bg-accent-400/15 blur-3xl" />

      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink-900 dark:bg-accent-500 text-white dark:text-ink-950 shadow-glow">
            <Swords className="h-5 w-5" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">AI Model Battle</span>
        </div>
        <Link to={user ? '/dashboard' : '/login'} className="btn-primary">
          {user ? 'Open app' : 'Sign in'} <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 text-center sm:px-6 sm:pt-24">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="badge mb-5 bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-300">
            <Sparkles className="h-3 w-3" /> Two models enter. One wins.
          </span>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
            The arena where AI models{' '}
            <span className="bg-gradient-to-r from-accent-500 to-accent-300 bg-clip-text text-transparent">
              compete head-to-head
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-ink-500 dark:text-ink-300 sm:text-lg">
            Enter a prompt, pick two models, and let an AI judge score them on accuracy,
            completeness, clarity, and creativity. Upload PDFs or images for multimodal battles.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to={user ? '/dashboard' : '/signup'} className="btn-primary">
              {user ? 'Go to dashboard' : 'Start battling'} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="btn-outline">Sign in</Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-4 text-left sm:grid-cols-2"
        >
          {['GPT-OSS 120B', 'Nemotron 3 Super'].map((name, i) => (
            <div key={name} className="card p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-accent-500" />
                <span className="text-sm font-semibold">{name}</span>
                {i === 0 && (
                  <span className="badge ml-auto bg-success-500/15 text-success-600 dark:text-success-400">
                    <Trophy className="h-3 w-3" /> Winner
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <div className="h-2.5 w-11/12 rounded-full bg-ink-100 dark:bg-white/5" />
                <div className="h-2.5 w-10/12 rounded-full bg-ink-100 dark:bg-white/5" />
                <div className="h-2.5 w-9/12 rounded-full bg-ink-100 dark:bg-white/5" />
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="card p-5"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-300">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-ink-200/60 py-8 text-center text-xs text-ink-400 dark:border-white/5">
        AI Model Battle — MERN edition.
      </footer>
    </div>
  );
}
