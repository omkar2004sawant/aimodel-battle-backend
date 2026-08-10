import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Lock, LogOut, Mail, Loader2, KeyRound } from 'lucide-react';
import { userService } from '@/services/endpoints';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await userService.updateProfile(name);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error('New password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match.');
    setSavingPassword(true);
    try {
      await userService.updatePassword(currentPassword, newPassword);
      toast.success('Password updated.');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const doLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Manage your profile, password, and session.</p>
      </div>

      <section className="card p-6">
        <div className="flex items-center gap-2 text-sm font-semibold"><User className="h-4 w-4 text-accent-500" /> Profile</div>
        <form onSubmit={saveProfile} className="mt-4 space-y-4">
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="input" />
          </div>
          <div>
            <p className="label">Email</p>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input value={user?.email ?? ''} disabled className="input pl-10 opacity-70" />
            </div>
          </div>
          <div>
            <p className="label">User ID</p>
            <div className="flex items-center gap-2 rounded-xl border border-ink-200 px-3 py-2.5 dark:border-white/10">
              <KeyRound className="h-4 w-4 text-ink-400" />
              <code className="truncate text-xs text-ink-500 dark:text-ink-400">{user?.id}</code>
            </div>
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary">{savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save profile'}</button>
        </form>
      </section>

      <section className="card p-6">
        <div className="flex items-center gap-2 text-sm font-semibold"><Lock className="h-4 w-4 text-accent-500" /> Change Password</div>
        <form onSubmit={changePassword} className="mt-4 space-y-4">
          <div>
            <label className="label" htmlFor="cur">Current password</label>
            <input id="cur" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="label" htmlFor="new">New password</label>
            <input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="conf">Confirm new password</label>
            <input id="conf" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input" />
          </div>
          <button type="submit" disabled={savingPassword} className="btn-primary">{savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update password'}</button>
        </form>
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">Sign out</p>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">End your session on this device.</p>
          </div>
          <button onClick={doLogout} className="btn-outline text-danger-500 hover:bg-danger-500/10"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </section>
    </div>
  );
}
