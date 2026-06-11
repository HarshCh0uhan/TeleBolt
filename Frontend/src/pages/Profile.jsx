import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const {user} = useAuth();

  return (
    <div className="min-h-screen bg-[#181818]">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">
            My Profile
          </h1>

          <p className="mt-2 text-zinc-400">
            Manage your account and saved plans.
          </p>
        </div>

        {/* User Info */}
        <section className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#58c28d]/10 text-2xl font-bold text-[#58c28d]">
              H
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white">
                {user.username}
              </h2>

              <p className="text-zinc-400">
                {user.email}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#262626] p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Username
              </p>

              <p className="mt-2 font-medium text-white">
                {user.username}
              </p>
            </div>

            <div className="rounded-2xl bg-[#262626] p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Email
              </p>

              <p className="mt-2 font-medium text-white">
                {user.email}
              </p>
            </div>

            <div className="rounded-2xl bg-[#262626] p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Saved Plans
              </p>

              <p className="mt-2 font-medium text-white">
                0
              </p>
            </div>
          </div>

          {/* Future Features */}
          <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-4">
            <h3 className="font-medium text-white">
              Upcoming Features
            </h3>

            <ul className="mt-3 space-y-2 text-sm text-zinc-500">
              <li>• Update Username</li>
              <li>• Update Email</li>
              <li>• Change Password</li>
              <li>• Manage Saved Plans</li>
              <li>• Plan Alerts & Notifications</li>
            </ul>
          </div>
        </section>

        {/* Saved Plans */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-[#1f1f1f] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">
              Saved Plans
            </h2>

            <span className="rounded-full bg-[#58c28d]/10 px-3 py-1 text-xs font-medium text-[#58c28d]">
              Coming Soon
            </span>
          </div>

          <div className="mt-6 flex h-56 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#262626]">
            <div className="text-center">
              <p className="font-medium text-zinc-400">
                No Saved Plans Yet
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Save plans from the Plan Card or Plan Details page to access them here.
              </p>
            </div>
          </div>
        </section>

        {/* Account Activity */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-[#1f1f1f] p-6">
          <h2 className="text-2xl font-semibold text-white">
            Account Overview
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#262626] p-5">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Member Since
              </p>

              <p className="mt-2 text-lg font-semibold text-white">
                {new Date(user.updatedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="rounded-2xl bg-[#262626] p-5">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Favourite Operator
              </p>

              <p className="mt-2 text-lg font-semibold text-white">
                —
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;