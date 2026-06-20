import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import StatCard from "../../components/admin/StatCard";
import Badge from "../../components/admin/Badge";

// TODO: replace with real shape from your stats endpoint
const initialStats = {
  totalPlans: 0,
  activePlans: 0,
  pendingChanges: 0,
  csvUploads: 0,
};

const Dashboard = () => {
  const [stats, setStats] = useState(initialStats);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // TODO: fetch dashboard stats + recent activity
    // const { data } = await getAdminStats()
    // setStats(data.stats)
    // setRecentActivity(data.recentActivity)
  }, []);

  const activeRatio =
    stats.totalPlans > 0 ? (stats.activePlans / stats.totalPlans) * 100 : 0;

  return (
    <AdminLayout
      title="Overview"
      description="Manage plans, detected changes, and platform data."
    >
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Plans"
          value={stats.totalPlans}
          accent={100}
        />
        <StatCard
          label="Active Plans"
          value={stats.activePlans}
          valueClassName="text-[#58c28d]"
          accent={activeRatio}
        />
        <StatCard
          label="Pending Changes"
          value={stats.pendingChanges}
          valueClassName="text-yellow-400"
          accent={null}
        />
        <StatCard label="CSV Uploads" value={stats.csvUploads} accent={null} />
      </div>

      {/* Quick Actions */}
      <section className="mt-10">
        <h2 className="mb-5 text-lg font-semibold text-white">
          Quick actions
        </h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              to: "/admin/plans",
              title: "Manage plans",
              desc: "View, edit and delete recharge plans.",
            },
            {
              to: "/admin/plans/create",
              title: "Create plan",
              desc: "Add a new telecom recharge plan.",
            },
            {
              to: "/admin/detected",
              title: "Detected changes",
              desc: "Review scraped plan changes.",
            },
            {
              to: "/admin/upload-csv",
              title: "Upload CSV",
              desc: "Bulk import recharge plans.",
            },
          ].map(({ to, title, desc }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-3xl border border-white/10 bg-[#1f1f1f] p-6 transition hover:border-[#58c28d]/30"
            >
              <h3 className="text-base font-semibold text-white transition group-hover:text-[#58c28d]">
                {title}
              </h3>
              <p className="mt-2 text-sm text-zinc-500">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="mt-10 rounded-3xl border border-white/10 bg-[#1f1f1f] p-6">
        <h2 className="text-lg font-semibold text-white">Recent activity</h2>

        <div className="mt-6 space-y-3">
          {recentActivity.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500">
              Nothing's happened yet. Activity will show up here as plans get
              added or updated.
            </p>
          ) : (
            recentActivity.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between rounded-2xl border border-white/10 p-4"
              >
                <div>
                  <p className="font-medium text-white">{item.message}</p>
                  <p className="mt-1 text-sm text-zinc-500">{item.timeAgo}</p>
                </div>
                {item.tag && <Badge tone={item.tone}>{item.tag}</Badge>}
              </div>
            ))
          )}
        </div>
      </section>
    </AdminLayout>
  );
};

export default Dashboard;