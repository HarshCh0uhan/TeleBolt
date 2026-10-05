import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays, Mail, ShieldCheck, KeyRound, Save, Check, Loader2, Compass, BadgeCheck, Heart, Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getPlans } from "../api/plans.api";
import { getFavoritePlans, removeFavoritePlan } from "../api/auth.api";

const initialsOf = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (name.trim().charAt(0) || "?").toUpperCase();
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "—";

// Small reusable feedback line shared by both forms.
const Feedback = ({ message }) => {
  if (!message) return null;
  const success = message.type === "success";
  return (
    <p
      className={`flex items-center gap-1.5 text-sm ${
        success ? "text-[#58c28d]" : "text-red-400"
      }`}
    >
      {success ? <Check className="h-3.5 w-3.5" /> : null}
      {message.text}
    </p>
  );
};

const inputClass =
  "h-12 w-full rounded-2xl border border-white/10 bg-[#181818] px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-[#58c28d]/40 focus:ring-2 focus:ring-[#58c28d]/10";

const labelClass = "mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-zinc-400";

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [totalPlans, setTotalPlans] = useState(null);
  const [favoritePlans, setFavoritePlans] = useState([]);

  // Identity form
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [identitySaving, setIdentitySaving] = useState(false);
  const [identityMsg, setIdentityMsg] = useState(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  useEffect(() => {
    getPlans()
      .then(({ data }) => setTotalPlans(data?.plans?.length ?? 0))
      .catch(() => setTotalPlans(0));
    getFavoritePlans()
      .then(({ data }) => setFavoritePlans(data?.favorites || []))
      .catch(() => setFavoritePlans([]));
  }, []);

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

  const handleRemoveFavorite = async (planId) => {
    await removeFavoritePlan(planId);
    setFavoritePlans((plans) => plans.filter((plan) => plan._id !== planId));
  };

  return (
    <div className="min-h-screen bg-[#181818]">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#58c28d]">
            Account
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">My Profile</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Manage your account details and keep your login secure.
          </p>
        </div>

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
                    {user?.role === "admin" ? (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Admin
                      </>
                    ) : (
                      <>
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Member
                      </>
                    )}
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
                  <Mail className="h-3.5 w-3.5 text-zinc-500" />
                  {user?.email}
                </p>
                <p className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Member since {formatDate(user?.createdAt)}
                </p>
              </div>
            </div>

            <Link
              to="/"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#262626] px-5 py-3 text-sm font-medium text-zinc-300 transition-all duration-300 hover:border-[#58c28d]/30 hover:bg-[#58c28d]/10 hover:text-white"
            >
              <Compass className="h-4 w-4 text-[#58c28d]" />
              Browse plans
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#262626] p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500">Member since</p>
              <p className="mt-2 font-medium text-white">{formatDate(user?.createdAt)}</p>
            </div>
            <div className="rounded-2xl bg-[#262626] p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500">Account role</p>
              <p className="mt-2 font-medium capitalize text-white">{user?.role || "user"}</p>
            </div>
            <div className="rounded-2xl bg-[#262626] p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500">Plans on TeleBolt</p>
              <p className="mt-2 font-medium text-white">
                {totalPlans === null ? "…" : `${totalPlans} to explore`}
              </p>
            </div>
          </div>
        </section>

        {/* Forms */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Account details */}
          <section className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6 sm:p-8">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <KeyRound className="h-4.5 w-4.5 text-[#58c28d]" />
              Account details
            </h3>
            <p className="mt-1 text-sm text-zinc-500">Update your name and email address.</p>

            <form onSubmit={handleIdentitySubmit} className="mt-6 space-y-5">
              <div>
                <label htmlFor="profile-username" className={labelClass}>Username</label>
                <input
                  id="profile-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputClass}
                  placeholder="Your username"
                />
              </div>
              <div>
                <label htmlFor="profile-email" className={labelClass}>Email address</label>
                <input
                  id="profile-email"
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

          {/* Password */}
          <section className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6 sm:p-8">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <ShieldCheck className="h-4.5 w-4.5 text-[#58c28d]" />
              Change password
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Use a strong password with letters, numbers and symbols.
            </p>

            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-5">
              <div>
                <label htmlFor="profile-current-password" className={labelClass}>Current password</label>
                <input
                  id="profile-current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label htmlFor="profile-new-password" className={labelClass}>New password</label>
                <input
                  id="profile-new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label htmlFor="profile-confirm-password" className={labelClass}>Confirm new password</label>
                <input
                  id="profile-confirm-password"
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

        <section className="mt-8 rounded-3xl border border-white/10 bg-[#1f1f1f] p-6 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Heart className="h-4.5 w-4.5 text-[#58c28d]" />
                Saved plans
              </h3>
              <p className="mt-1 text-sm text-zinc-500">Plans you marked as favourites.</p>
            </div>
            <span className="text-sm text-zinc-500">{favoritePlans.length} saved</span>
          </div>

          {favoritePlans.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-[#262626] p-6 text-center">
              <p className="text-sm text-zinc-400">No saved plans yet.</p>
              <Link to="/" className="mt-3 inline-flex text-sm font-medium text-[#58c28d] hover:underline">
                Browse plans
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {favoritePlans.map((plan) => (
                <div key={plan._id} className="rounded-2xl border border-white/10 bg-[#262626] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="rounded-full bg-[#58c28d]/10 px-3 py-1 text-xs font-medium text-[#58c28d]">
                        {plan.operator}
                      </span>
                      <h4 className="mt-3 text-2xl font-bold text-white">₹{plan.price}</h4>
                      <p className="mt-1 text-sm text-zinc-400">{plan.validityDays} days • {plan.category}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFavorite(plan._id)}
                      className="rounded-xl border border-white/10 p-2 text-zinc-500 transition hover:border-red-400/30 hover:text-red-400"
                      title="Remove saved plan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Cost per GB</span>
                    <span className="font-medium text-[#58c28d]">₹{plan.costPerGB || "—"}/GB</span>
                  </div>
                  <Link
                    to={`/plans/${plan._id}`}
                    className="mt-4 flex w-full items-center justify-center rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-[#58c28d]/30 hover:text-white"
                  >
                    View details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Profile;
