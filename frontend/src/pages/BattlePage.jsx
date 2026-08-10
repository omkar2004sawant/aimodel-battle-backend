import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Swords, Upload, X, FileText, Image as ImageIcon, Scale, Loader2, Sparkles } from 'lucide-react';
import { MODELS, JUDGE_MODELS, getModel } from '@/utils/models';
import { battleService } from '@/services/endpoints';
import { ModelSelector } from '@/components/ModelSelector';
import { ResponseCard } from '@/components/ResponseCard';
import { ScoreBars } from '@/components/ScoreBars';
import { WinnerBadge } from '@/components/WinnerBadge';

export default function BattlePage() {
  const [prompt, setPrompt] = useState('');
  const [modelA, setModelA] = useState(MODELS[0].id);
  const [modelB, setModelB] = useState(MODELS[1].id);
  const [judge, setJudge] = useState(JUDGE_MODELS[0].id);
  const [file, setFile] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | running | done
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const ma = getModel(modelA);
  const mb = getModel(modelB);
  const canStart = prompt.trim() && modelA !== modelB && !loading;

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const isPdf = f.type === 'application/pdf';
    const isImage = f.type.startsWith('image/');
    if (!isPdf && !isImage) return toast.error('Only PDF or image files are supported.');
    if (f.size > 8 * 1024 * 1024) return toast.error('File must be under 8MB.');
    setFile(f);
  };

  const start = async () => {
    if (!canStart) return;
    setLoading(true);
    setPhase('running');
    setResult(null);

    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('modelA', modelA);
    formData.append('modelB', modelB);
    formData.append('judgeModel', judge);
    if (file) formData.append('file', file);

    try {
      const data = await battleService.create(formData);
      setResult(data.battle);
      setPhase('done');
      if (data.demoMode) toast.info('Demo mode — add an OpenAI key for live responses.');
      else toast.success('Battle complete!');
    } catch (err) {
      toast.error(err.message);
      setPhase('idle');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPhase('idle');
    setResult(null);
    setPrompt('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Battle</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Pick two models, enter a prompt, and let the judge decide.</p>
      </div>

      <div className="card p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <ModelSelector models={MODELS} value={modelA} onChange={setModelA} label="Model A" exclude={modelB} />
          <ModelSelector models={MODELS} value={modelB} onChange={setModelB} label="Model B" exclude={modelA} />
        </div>

        <div className="mt-6">
          <label className="label" htmlFor="prompt">Prompt</label>
          <textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} placeholder="Explain quantum entanglement to a curious 12-year-old…" className="input resize-none" />
        </div>

        <div className="mt-4">
          <p className="label">Attach a file (optional)</p>
          <input ref={fileInputRef} type="file" accept="application/pdf,image/*" onChange={onPickFile} className="hidden" />
          {file ? (
            <div className="flex items-center gap-3 rounded-xl border border-ink-200 bg-ink-50 p-3 dark:border-white/10 dark:bg-white/5">
              {file.type === 'application/pdf' ? <FileText className="h-5 w-5 text-danger-500" /> : <ImageIcon className="h-5 w-5 text-accent-500" />}
              <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
              <button onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="btn-ghost h-8 w-8 !px-0" aria-label="Remove file"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <button onClick={() => fileInputRef.current?.click()} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ink-300 px-4 py-6 text-sm text-ink-500 transition hover:border-accent-400 hover:text-accent-600 disabled:opacity-50 dark:border-white/15 dark:text-ink-400">
              <Upload className="h-4 w-4" /> Upload PDF or image
            </button>
          )}
        </div>

        <div className="mt-6">
          <ModelSelector models={JUDGE_MODELS} value={judge} onChange={setJudge} label="Judge Model" />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button onClick={start} disabled={!canStart} className="btn-primary">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />} Start Battle
          </button>
          {phase === 'done' && <button onClick={reset} className="btn-outline">New Battle</button>}
          {modelA === modelB && <span className="text-xs text-warning-500">Pick two different models.</span>}
        </div>
      </div>

      {phase === 'running' && (
        <div className="card flex items-center justify-center gap-3 py-12">
          <Loader2 className="h-5 w-5 animate-spin text-accent-500" />
          <span className="text-sm font-medium">Running battle — generating responses and judging…</span>
        </div>
      )}

      <AnimatePresence>
        {phase === 'done' && result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ResponseCard title={result.modelA} vendor={ma?.vendor} accent={ma?.accent} content={result.responseA} latencyMs={result.latencyA} isWinner={result.winner === 'A'} isLoser={result.winner === 'B'} badge={<WinnerBadge winner={result.winner} model="A" />} />
              <ResponseCard title={result.modelB} vendor={mb?.vendor} accent={mb?.accent} content={result.responseB} latencyMs={result.latencyB} isWinner={result.winner === 'B'} isLoser={result.winner === 'A'} badge={<WinnerBadge winner={result.winner} model="B" />} />
            </div>

            <div className="card overflow-hidden">
              <div className="flex items-center gap-3 border-b border-ink-200/60 px-5 py-4 dark:border-white/5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-300"><Scale className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm font-semibold">Judge's Verdict</p>
                  <p className="text-xs text-ink-500 dark:text-ink-400">{result.judgeModel} · {result.tokensUsed} tokens</p>
                </div>
                <div className="ml-auto">
                  <span className="badge bg-success-500/15 text-success-600 dark:text-success-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    {result.winner === 'tie' ? "It's a tie" : `${result.winner === 'A' ? result.modelA : result.modelB} wins`}
                  </span>
                </div>
              </div>

              <div className="grid gap-6 p-5 lg:grid-cols-2">
                <ScoreBars scores={result.scoresA} label={`${result.modelA} scores`} />
                <ScoreBars scores={result.scoresB} label={`${result.modelB} scores`} />
              </div>

              <div className="border-t border-ink-200/60 px-5 py-4 dark:border-white/5">
                <p className="mb-1.5 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink-400"><Sparkles className="h-3.5 w-3.5" /> Explanation</p>
                <p className="text-sm leading-relaxed text-ink-700 dark:text-ink-200">{result.judgeExplanation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
