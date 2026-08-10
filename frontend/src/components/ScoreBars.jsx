import { CRITERIA } from '@/utils/criteria';
import { cn } from '@/utils/format';

export function ScoreBars({ scores, label }) {
  return (
    <div className="space-y-2.5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
      {CRITERIA.map((c) => {
        const v = scores?.[c] ?? 0;
        const pct = (v / 10) * 100;
        return (
          <div key={c}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="capitalize text-ink-500 dark:text-ink-300">{c}</span>
              <span className="font-mono font-medium text-ink-700 dark:text-ink-200">{v}/10</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-white/5">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-700 ease-out',
                  v >= 8 ? 'bg-success-500' : v >= 6 ? 'bg-accent-500' : 'bg-warning-500',
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
