import { Check, Minus } from 'lucide-react';
import { cn } from '@/utils/format';

export function WinnerBadge({ winner, model }) {
  if (winner === 'tie') {
    return (
      <span className="badge bg-ink-200 text-ink-600 dark:bg-white/10 dark:text-ink-200">
        <Minus className="h-3 w-3" /> Tie
      </span>
    );
  }
  const isWinner = winner === model;
  return (
    <span
      className={cn(
        'badge',
        isWinner
          ? 'bg-success-500/15 text-success-600 dark:text-success-400'
          : 'bg-ink-100 text-ink-500 dark:bg-white/5 dark:text-ink-400',
      )}
    >
      {isWinner ? <Check className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
      {isWinner ? 'Winner' : 'Runner-up'}
    </span>
  );
}
