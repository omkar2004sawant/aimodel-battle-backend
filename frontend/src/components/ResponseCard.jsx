import { useState } from 'react';
import { Check, Copy, Clock } from 'lucide-react';
import { Skeleton } from './Feedback';
import { cn } from '@/utils/format';

export function ResponseCard({ title, vendor, accent, content, latencyMs, loading, isWinner, isLoser, badge }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div
      className={cn(
        'card flex flex-col overflow-hidden transition-all duration-500',
        isWinner && 'ring-2 ring-success-500/50',
        isLoser && 'opacity-70',
      )}
    >
      <div className="flex items-center gap-3 border-b border-ink-200/60 px-4 py-3 dark:border-white/5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="text-xs text-ink-500 dark:text-ink-400">{vendor}</p>
        </div>
        {badge}
      </div>

      <div className="flex-1 overflow-auto p-4 scrollbar-thin">
        {loading ? (
          <div className="space-y-2.5">
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-10/12" />
            <Skeleton className="h-3 w-9/12" />
            <Skeleton className="h-3 w-10/12" />
            <Skeleton className="h-3 w-8/12" />
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-700 dark:text-ink-200">{content}</p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-ink-200/60 px-4 py-2.5 dark:border-white/5">
        <span className="flex items-center gap-1.5 text-xs text-ink-400">
          {latencyMs != null && !loading && (
            <>
              <Clock className="h-3 w-3" /> {latencyMs}ms
            </>
          )}
        </span>
        <button onClick={copy} disabled={loading || !content} className="btn-ghost h-8 px-2.5 text-xs">
          {copied ? <Check className="h-3.5 w-3.5 text-success-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
