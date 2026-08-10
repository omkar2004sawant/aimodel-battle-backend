import { Loader2 } from 'lucide-react';

export function Spinner({ className }) {
  return <Loader2 className={`h-4 w-4 animate-spin ${className ?? ''}`} />;
}

export function FullPageSpinner() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink-50 dark:bg-ink-950">
      <div className="flex flex-col items-center gap-3 text-ink-500">
        <Loader2 className="h-7 w-7 animate-spin text-accent-500" />
        <p className="text-sm">Loading…</p>
      </div>
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={`skeleton ${className ?? ''}`} />;
}
