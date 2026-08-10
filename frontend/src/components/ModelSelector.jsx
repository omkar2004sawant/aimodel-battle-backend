import { Check } from 'lucide-react';
import { cn } from '@/utils/format';

export function ModelSelector({ models, value, onChange, label, exclude }) {
  const available = models.filter((m) => m.id !== exclude);
  return (
    <div>
      <p className="label">{label}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {available.map((m) => {
          const active = m.id === value;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              className={cn(
                'group flex items-start gap-3 rounded-xl border p-3 text-left transition',
                active
                  ? 'border-accent-400 bg-accent-50 dark:bg-accent-500/10 shadow-glow'
                  : 'border-ink-200 hover:border-ink-300 dark:border-white/10 dark:hover:border-white/20',
              )}
            >
              <span className="mt-0.5 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: m.accent }} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold">{m.name}</span>
                  <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-ink-500 dark:bg-white/5 dark:text-ink-400">
                    {m.vendor}
                  </span>
                </span>
                <span className="mt-0.5 block text-xs text-ink-500 dark:text-ink-400">{m.description}</span>
              </span>
              {active && <Check className="mt-0.5 h-4 w-4 text-accent-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
