import { Swords, Moon, Sun, LogOut, LayoutDashboard, History, Settings } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/format';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/battle', label: 'New Battle', icon: Swords },
  { to: '/history', label: 'History', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function AppLayout({ children }) {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-grid-faint [background-size:32px_32px] opacity-60" />
      <div className="pointer-events-none fixed -top-40 left-1/2 -z-10 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-accent-400/10 blur-3xl" />

      <header className="sticky top-0 z-40 border-b border-ink-200/60 backdrop-blur-xl bg-white/60 dark:border-white/5 dark:bg-ink-950/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink-900 dark:bg-accent-500 text-white dark:text-ink-950 shadow-glow">
              <Swords className="h-5 w-5" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">AI Model Battle</span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                    active
                      ? 'bg-ink-900 text-white dark:bg-accent-500 dark:text-ink-950'
                      : 'text-ink-500 hover:text-ink-900 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/5 dark:hover:text-white',
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button onClick={toggle} className="btn-ghost h-9 w-9 !px-0" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="hidden text-right sm:block">
              <p className="text-xs text-ink-500 dark:text-ink-400">Signed in</p>
              <p className="max-w-[14rem] truncate text-sm font-medium">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="btn-ghost h-9 w-9 !px-0"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto px-4 pb-2 md:hidden">
          {NAV.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition',
                  active
                    ? 'bg-ink-900 text-white dark:bg-accent-500 dark:text-ink-950'
                    : 'text-ink-500 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/5',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>

      <footer className="mx-auto max-w-7xl px-4 pb-10 pt-4 text-center text-xs text-ink-400 sm:px-6">
        AI Model Battle — MERN edition.
      </footer>
    </div>
  );
}
