import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#181818]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#1f1f1f]">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-bold text-white">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-zinc-400">
            Manage plans, detected changes, and platform data.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6">
            <p className="text-sm text-zinc-500">
              Total Plans
            </p>

            <h2 className="mt-3 text-3xl font-bold text-white">
              120
            </h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6">
            <p className="text-sm text-zinc-500">
              Active Plans
            </p>

            <h2 className="mt-3 text-3xl font-bold text-[#58c28d]">
              108
            </h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6">
            <p className="text-sm text-zinc-500">
              Pending Changes
            </p>

            <h2 className="mt-3 text-3xl font-bold text-yellow-400">
              12
            </h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6">
            <p className="text-sm text-zinc-500">
              CSV Uploads
            </p>

            <h2 className="mt-3 text-3xl font-bold text-white">
              8
            </h2>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="mt-8">
          <h2 className="mb-5 text-2xl font-semibold text-white">
            Quick Actions
          </h2>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Link
              to="/admin/plans"
              className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6 transition hover:border-[#58c28d]/30"
            >
              <h3 className="text-lg font-semibold text-white">
                Manage Plans
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                View, edit and delete recharge plans.
              </p>
            </Link>

            <Link
              to="/admin/plans/create"
              className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6 transition hover:border-[#58c28d]/30"
            >
              <h3 className="text-lg font-semibold text-white">
                Create Plan
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                Add a new telecom recharge plan.
              </p>
            </Link>

            <Link
              to="/admin/detected"
              className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6 transition hover:border-[#58c28d]/30"
            >
              <h3 className="text-lg font-semibold text-white">
                Detected Changes
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                Review scraped plan changes.
              </p>
            </Link>

            <Link
              to="/admin/upload-csv"
              className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6 transition hover:border-[#58c28d]/30"
            >
              <h3 className="text-lg font-semibold text-white">
                Upload CSV
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                Bulk import recharge plans.
              </p>
            </Link>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-[#1f1f1f] p-6">
          <h2 className="text-2xl font-semibold text-white">
            Recent Activity
          </h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 p-4">
              <p className="font-medium text-white">
                New Jio Plan Added
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                2 hours ago
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 p-4">
              <p className="font-medium text-white">
                Airtel Plan Updated
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Yesterday
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 p-4">
              <p className="font-medium text-white">
                CSV Import Completed
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                3 days ago
              </p>
            </div>
          </div>
        </section>

        {/* Future Analytics */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-[#1f1f1f] p-6">
          <h2 className="text-2xl font-semibold text-white">
            Platform Analytics
          </h2>

          <div className="mt-6 flex h-72 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#262626]">
            <div className="text-center">
              <p className="font-medium text-zinc-400">
                Analytics Dashboard
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Plan trends, operator insights, uploads, and user activity will appear here.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;