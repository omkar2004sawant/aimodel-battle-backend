import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swords, Trophy, Target, Coins, ArrowRight, BarChart3 } from 'lucide-react';
import { battleService, historyService } from '@/services/endpoints';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/Feedback';
import { getModel } from '@/utils/models';
import { relativeTime, truncate } from '@/utils/format';
import { WinnerBadge } from '@/components/WinnerBadge';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [battles, setBattles] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([battleService.stats(), historyService.list()])
      .then(([s, h]) => {
        setStats(s);
        setBattles(h.battles);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}.
          </p>
        </div>
        <Link to="/battle" className="btn-primary">
          <Swords className="h-4 w-4" /> New Battle
        </Link>
      </div>

      {!stats ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={BarChart3} label="Total Battles" value={stats.total} delay={0} />
          <StatCard icon={Trophy} label="Decided Win Rate" value={`${stats.winRate}%`} delay={0.05} />
          <StatCard icon={Target} label="Most Accurate AI" value={truncate(stats.mostAccurate, 18)} delay={0.1} />
          <StatCard icon={Coins} label="Tokens Used" value={stats.tokens.toLocaleString()} delay={0.15} />
        </div>
      )}

      {stats?.demoMode && (
        <div className="card flex items-center gap-3 p-4 text-sm text-warning-600 dark:text-warning-400">
          <Target className="h-4 w-4 shrink-0" />
          <span>Demo mode active — add an OpenAI API key in <code>backend/.env</code> to get real model responses.</span>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Recent Battles</h2>
          <Link to="/history" className="text-sm text-accent-600 hover:underline dark:text-accent-400">View all</Link>
        </div>

        {!battles ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
        ) : battles.length === 0 ? (
          <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-300">
              <Swords className="h-6 w-6" />
            </span>
            <p className="text-sm font-medium">No battles yet</p>
            <p className="max-w-sm text-sm text-ink-500 dark:text-ink-400">
              Start your first battle — pick two models, enter a prompt, and let the judge decide.
            </p>
            <Link to="/battle" className="btn-primary mt-1">Start battling <ArrowRight className="h-4 w-4" /></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {battles.slice(0, 6).map((b, i) => {
              const ma = getModel(b.modelA);
              const mb = getModel(b.modelB);
              return (
                <motion.div key={b._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.04 }}>
                  <Link to="/history" className="card flex items-center gap-4 p-4 transition hover:shadow-glow">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{truncate(b.prompt, 80)}</p>
                      <p className="mt-1 flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: ma?.accent }} />{b.modelA}</span>
                        <span className="text-ink-300">vs</span>
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: mb?.accent }} />{b.modelB}</span>
                        <span className="text-ink-300">·</span>{relativeTime(b.createdAt)}
                      </p>
                    </div>
                    <WinnerBadge winner={b.winner} model={b.winner === 'B' ? 'B' : 'A'} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
        {error && <p className="mt-3 text-sm text-danger-500">Couldn't load battles: {error}</p>}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }} className="card p-5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-300">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-4 text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
    </motion.div>
  );
}
