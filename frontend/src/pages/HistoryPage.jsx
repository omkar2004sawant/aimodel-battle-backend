import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Search, Trash2, Download, X, Scale, FileText, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { historyService } from '@/services/endpoints';
import { getModel } from '@/utils/models';
import { formatDateTime, relativeTime, truncate } from '@/utils/format';
import { WinnerBadge } from '@/components/WinnerBadge';
import { ScoreBars } from '@/components/ScoreBars';
import { Skeleton } from '@/components/Feedback';

export default function HistoryPage() {
  const [battles, setBattles] = useState(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    historyService.list().then((data) => setBattles(data.battles)).catch((err) => setError(err.message));
  };
  useEffect(load, []);

  const filtered = useMemo(() => {
    if (!battles) return null;
    const q = query.trim().toLowerCase();
    if (!q) return battles;
    return battles.filter((b) =>
      b.prompt.toLowerCase().includes(q) ||
      b.modelA.toLowerCase().includes(q) ||
      b.modelB.toLowerCase().includes(q),
    );
  }, [battles, query]);

  const remove = async (id) => {
    const prev = battles;
    setBattles((cur) => (cur ?? []).filter((b) => b._id !== id));
    if (active?._id === id) setActive(null);
    try {
      await historyService.remove(id);
      toast.success('Battle deleted.');
    } catch (err) {
      setBattles(prev);
      toast.error(err.message);
    }
  };

  const exportTxt = (b) => {
    const text = buildExportText(b);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug(b.prompt)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Battle History</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Every battle you've run, searchable and exportable.</p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by prompt or model…" className="input pl-10" />
      </div>

      {!filtered ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card py-16 text-center text-sm text-ink-500 dark:text-ink-400">
          {query ? 'No battles match your search.' : 'No battles yet — run your first one!'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b, i) => {
            const ma = getModel(b.modelA);
            const mb = getModel(b.modelB);
            return (
              <motion.div key={b._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.03 }} className="card group flex items-center gap-4 p-4">
                <button onClick={() => setActive(b)} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium">{truncate(b.prompt, 90)}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500 dark:text-ink-400">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: ma?.accent }} />{b.modelA}</span>
                    <span className="text-ink-300">vs</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: mb?.accent }} />{b.modelB}</span>
                    {b.fileType && <span className="flex items-center gap-1 text-accent-600 dark:text-accent-400">{b.fileType === 'pdf' ? <FileText className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}{b.fileType}</span>}
                    <span className="text-ink-300">·</span>{relativeTime(b.createdAt)}
                  </p>
                </button>
                <WinnerBadge winner={b.winner} model={b.winner === 'B' ? 'B' : 'A'} />
                <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                  <button onClick={() => exportTxt(b)} className="btn-ghost h-8 w-8 !px-0" aria-label="Export"><Download className="h-4 w-4" /></button>
                  <button onClick={() => remove(b._id)} className="btn-ghost h-8 w-8 !px-0 text-danger-500 hover:bg-danger-500/10" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
                <ChevronRight className="h-4 w-4 text-ink-300 group-hover:hidden" />
              </motion.div>
            );
          })}
        </div>
      )}
      {error && <p className="text-sm text-danger-500">{error}</p>}

      <AnimatePresence>
        {active && <BattleDetail battle={active} onClose={() => setActive(null)} onExport={() => exportTxt(active)} onDelete={() => remove(active._id)} />}
      </AnimatePresence>
    </div>
  );
}

function BattleDetail({ battle, onClose, onExport, onDelete }) {
  const ma = getModel(battle.modelA);
  const mb = getModel(battle.modelB);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-end bg-ink-950/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ x: 40 }} animate={{ x: 0 }} exit={{ x: 40 }} transition={{ type: 'spring', damping: 28, stiffness: 280 }} onClick={(e) => e.stopPropagation()} className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl scrollbar-thin dark:bg-ink-900">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-ink-400">{formatDateTime(battle.createdAt)}</p>
            <h2 className="mt-1 text-lg font-semibold leading-snug">{battle.prompt}</h2>
          </div>
          <button onClick={onClose} className="btn-ghost h-9 w-9 !px-0" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
          <span className="badge bg-ink-100 text-ink-600 dark:bg-white/5 dark:text-ink-200"><Scale className="h-3 w-3" /> Judge: {battle.judgeModel}</span>
          <span className="badge bg-ink-100 text-ink-600 dark:bg-white/5 dark:text-ink-200">{battle.tokensUsed} tokens</span>
          {battle.fileType && <span className="badge bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-300">{battle.fileType === 'pdf' ? <FileText className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}{battle.fileType}</span>}
        </div>

        <div className="mt-6 grid gap-4">
          <DetailResponse title={battle.modelA} accent={ma?.accent ?? '#888'} content={battle.responseA} latency={battle.latencyA} winner={battle.winner === 'A'} />
          <DetailResponse title={battle.modelB} accent={mb?.accent ?? '#888'} content={battle.responseB} latency={battle.latencyB} winner={battle.winner === 'B'} />
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <ScoreBars scores={battle.scoresA} label={`${battle.modelA} scores`} />
          <ScoreBars scores={battle.scoresB} label={`${battle.modelB} scores`} />
        </div>

        <div className="mt-6 rounded-xl bg-ink-50 p-4 dark:bg-white/5">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-400">Judge's explanation</p>
          <p className="text-sm leading-relaxed text-ink-700 dark:text-ink-200">{battle.judgeExplanation}</p>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button onClick={onExport} className="btn-outline"><Download className="h-4 w-4" /> Export as TXT</button>
          <button onClick={onDelete} className="btn-ghost text-danger-500 hover:bg-danger-500/10"><Trash2 className="h-4 w-4" /> Delete</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DetailResponse({ title, accent, content, latency, winner }) {
  return (
    <div className={`rounded-xl border p-4 ${winner ? 'border-success-500/50 bg-success-500/5' : 'border-ink-200 dark:border-white/10'}`}>
      <div className="mb-2 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
        <span className="text-sm font-semibold">{title}</span>
        {winner && <WinnerBadge winner="A" model="A" />}
        <span className="ml-auto text-xs text-ink-400">{latency}ms</span>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-700 dark:text-ink-200">{content}</p>
    </div>
  );
}

function buildExportText(b) {
  return [
    'AI MODEL BATTLE — EXPORT',
    `Date: ${formatDateTime(b.createdAt)}`,
    `Prompt: ${b.prompt}`,
    `Model A: ${b.modelA}`,
    `Model B: ${b.modelB}`,
    `Judge: ${b.judgeModel}`,
    `Winner: ${b.winner === 'tie' ? 'Tie' : b.winner === 'A' ? b.modelA : b.modelB}`,
    `Tokens: ${b.tokensUsed}`,
    '',
    '--- MODEL A RESPONSE ---',
    b.responseA,
    '',
    '--- MODEL B RESPONSE ---',
    b.responseB,
    '',
    '--- JUDGE EXPLANATION ---',
    b.judgeExplanation,
    '',
  ].join('\n');
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40).replace(/^-|-$/g, '') || 'battle';
}
