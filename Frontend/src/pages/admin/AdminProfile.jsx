import { useEffect, useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { Mail, ShieldCheck, KeyRound, Save, Check, Loader2, CalendarDays, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAuditLogs } from '../../api/admin.api';

const initialsOf = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (name.trim().charAt(0) || "?").toUpperCase();
};

const ACTION_LABELS = {
  create_plan: 'created a plan',
  update_plan: 'updated a plan',
  delete_plan: 'deleted a plan',
  approve_change: 'approved a detected change',
  reject_change: 'rejected a detected change',
  import_plans: 'imported plans via CSV',
  approve_submission: 'approved a plan submission',
  reject_submission: 'rejected a plan submission',
};

const Feedback = ({ message }) => {
  if (!message) return null;
  const success = message.type === "success";
  return (
    <p className={`flex items-center gap-1.5 text-sm ${success ? "text-[#58c28d]" : "text-red-400"}`}>
      {success ? <Check className="h-3.5 w-3.5" /> : null}
      {message.text}
    </p>
  );
};

const inputClass =
  "h-12 w-full rounded-2xl border border-white/10 bg-[#181818] px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-[#58c28d]/40 focus:ring-2 focus:ring-[#58c28d]/10";
const labelClass = "mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-zinc-400";

const AdminProfile = () => {
  const { user, updateUser } = useAuth();

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [identitySaving, setIdentitySaving] = useState(false);
  const [identityMsg, setIdentityMsg] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  const [activity, setActivity] = useState([]);

  useEffect(() => {
    if (!user?._id) return undefined;

    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await getAuditLogs({ actor: user._id, limit: 8 });
        if (!cancelled) setActivity(data.logs || []);
      } catch {
        if (!cancelled) setActivity([]);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user?._id]);

  const messageFromError = (err, fallback) =>
    typeof err?.response?.data === "string" ? err.response.data : fallback;

  const handleIdentitySubmit = async (e) => {
    e.preventDefault();
    setIdentitySaving(true);
    setIdentityMsg(null);
    try {
      await updateUser({ username, email });
      setIdentityMsg({ type: "success", text: "Profile updated successfully" });
    } catch (err) {
      setIdentityMsg({ type: "error", text: messageFromError(err, "Could not update profile.") });
    } finally {
      setIdentitySaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!newPassword) {
      setPasswordMsg({ type: "error", text: "Enter a new password." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    setPasswordSaving(true);
    try {
      await updateUser({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMsg({ type: "success", text: "Password changed successfully" });
    } catch (err) {
      setPasswordMsg({ type: "error", text: messageFromError(err, "Could not change password.") });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Admin Dashboard"
        title="Admin profile"
        description="Your identity card and credentials for the admin console."
      />

      {/* Identity card */}
      <section className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl border border-[#58c28d]/20 bg-[#58c28d]/10 text-3xl font-bold text-[#58c28d]">
              {initialsOf(user?.username)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold text-white">{user?.username}</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#58c28d]/20 bg-[#58c28d]/10 px-3 py-1 text-xs font-medium text-[#dff6ea]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Admin
                </span>
              </div>
              <p className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
                <Mail className="h-3.5 w-3.5 text-zinc-500" />
                {user?.email}
              </p>
              <p className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                <CalendarDays className="h-3.5 w-3.5" />
                Admin since{' '}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : '—'}
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-[#262626] px-5 py-4 text-center">
            <p className="text-xs uppercase tracking-wider text-zinc-500">Your audit actions</p>
            <p className="mt-2 text-2xl font-bold text-[#58c28d]">{activity.length}</p>
            <p className="text-[11px] text-zinc-600">latest events shown</p>
          </div>
        </div>
      </section>

      {/* Forms */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6 sm:p-8">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
            <KeyRound className="h-4.5 w-4.5 text-[#58c28d]" />
            Account details
          </h3>
          <p className="mt-1 text-sm text-zinc-500">Update your admin name and email address.</p>

          <form onSubmit={handleIdentitySubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="admin-profile-username" className={labelClass}>Username</label>
              <input
                id="admin-profile-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
                placeholder="Your username"
              />
            </div>
            <div>
              <label htmlFor="admin-profile-email" className={labelClass}>Email address</label>
              <input
                id="admin-profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>

            <Feedback message={identityMsg} />

            <button
              type="submit"
              disabled={identitySaving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#58c28d] px-5 py-3 text-sm font-semibold text-[#181818] transition-all duration-300 hover:bg-[#6dd9a0] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {identitySaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save changes
                </>
              )}
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6 sm:p-8">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
            <ShieldCheck className="h-4.5 w-4.5 text-[#58c28d]" />
            Change password
          </h3>
          <p className="mt-1 text-sm text-zinc-500">Use a strong password with letters, numbers and symbols.</p>

          <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="admin-profile-current" className={labelClass}>Current password</label>
              <input
                id="admin-profile-current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label htmlFor="admin-profile-new" className={labelClass}>New password</label>
              <input
                id="admin-profile-new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label htmlFor="admin-profile-confirm" className={labelClass}>Confirm new password</label>
              <input
                id="admin-profile-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>

            <Feedback message={passwordMsg} />

            <button
              type="submit"
              disabled={passwordSaving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#58c28d]/30 bg-[#58c28d]/10 px-5 py-3 text-sm font-medium text-[#dff6ea] transition-all duration-300 hover:bg-[#58c28d]/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {passwordSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </button>
          </form>
        </section>
      </div>

      {/* Recent activity */}
      <section className="mt-8 rounded-3xl border border-white/10 bg-[#1f1f1f] p-6 sm:p-8">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
          <Activity className="h-4 w-4 text-[#58c28d]" />
          Your recent actions
        </div>

        <div className="mt-5 space-y-2.5">
          {activity.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500">No actions recorded for this account yet.</p>
          ) : (
            activity.map((log) => (
              <div key={log._id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#262626]/60 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm text-zinc-300">{ACTION_LABELS[log.action] || log.action}</p>
                  {log.details && <p className="text-[11px] text-zinc-600">{log.details}</p>}
                </div>
                <p className="shrink-0 text-[11px] text-zinc-600">{new Date(log.createdAt).toLocaleString('en-IN')}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
};

export default AdminProfile;
