import { useEffect, useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatCard from '../../components/admin/AdminStatCard';
import {
  Activity,
  BadgeIndianRupee,
  Layers3,
  Clock3,
  BellRing,
  ArrowRight,
  LayoutDashboard,
  Plus,
  UploadCloud,
  FileClock,
  Database,
  Timer,
  HardDrive,
  Sparkles,
  RotateCw,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { useAdminStats } from '../../context/AdminStatsContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPlans: '--',
    activePlans: '--',
    pendingChanges: '--',
    operators: '--',
  });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const {pendingCount} = useAdminStats()

  useEffect(() => {
    // TODO: fetch stats from backend
    // Example: const { data } = await getAdminStats();
    setTimeout(() => {
      setStats({
        totalPlans: 24,
        activePlans: 21,
        pendingChanges: 3,
        operators: 3,
      });
      setActivity([
        {
          title: 'Plan "Jio ₹299" updated',
          meta: '4 minutes ago',
          icon: BellRing,
          tone: 'success',
        },
        {
          title: 'CSV upload completed',
          meta: 'Today at 10:30 AM',
          icon: UploadCloud,
          tone: 'default',
        },
        {
          title: 'Price change approved (Airtel ₹349)',
          meta: 'Yesterday',
          icon: BadgeIndianRupee,
          tone: 'success',
        },
        {
          title: '3 changes pending review',
          meta: 'Detected by cron',
          icon: FileClock,
          tone: 'warning',
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const quickActions = [
    {
      label: 'Add new plan',
      to: '/admin/plans/create',
      icon: Plus,
      color: 'bg-[#58c28d]/10 text-[#58c28d]',
      description: 'Manually enter a new telecom plan',
    },
    {
      label: 'Import CSV',
      to: '/admin/upload-csv',
      icon: UploadCloud,
      color: 'bg-blue-500/10 text-blue-400',
      description: 'Bulk upload plans via CSV file',
    },
    {
      label: 'Review changes',
      to: '/admin/detected-changes',
      icon: FileClock,
      color: 'bg-yellow-500/10 text-yellow-400',
      description: 'Approve or reject detected updates',
    },
    {
      label: 'View plans',
      to: '/admin/plans',
      icon: Layers3,
      color: 'bg-purple-500/10 text-purple-400',
      description: 'Manage all plans in catalog',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <AdminPageHeader
          eyebrow="Admin Dashboard"
          title={`Welcome back, ${user?.username || 'Admin'}`}
          description="Monitor plans, review detected changes, and keep TeleBolt up to date."
          actions={
            <NavLink
              to="/admin/plans"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#58c28d]/25 bg-[#58c28d] px-4 py-2.5 text-sm font-medium text-[#181818] transition-all duration-300 hover:bg-[#6dd9a0]"
            >
              <Layers3 className="h-4 w-4" />
              Manage plans
            </NavLink>
          }
        />
      </motion.div>

      {/* Quick stats */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-3xl bg-[#262626] animate-pulse" />
            ))
          : [
              <AdminStatCard
                key="total"
                label="Total plans"
                value={stats.totalPlans}
                hint="All operators combined"
                icon={Layers3}
                tone="default"
              />,
              <AdminStatCard
                key="active"
                label="Active plans"
                value={stats.activePlans}
                hint={`${Math.round((stats.activePlans / stats.totalPlans) * 100) || 0}% of catalog`}
                icon={BadgeIndianRupee}
                tone="success"
              />,
              <AdminStatCard
                key="pending"
                label="Pending changes"
                value={pendingCount}
                hint="Needs manual review"
                icon={Clock3}
                tone="warning"
              />,
              <AdminStatCard
                key="operators"
                label="Operators"
                value={stats.operators}
                hint="Jio • Airtel • Vi"
                icon={LayoutDashboard}
                tone="default"
              />,
            ]}
      </motion.section>

      {/* Quick actions + System status */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-5 grid gap-4 lg:grid-cols-2"
      >
        {/* Quick actions */}
        <motion.div variants={item} className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Quick actions</div>
              <h3 className="mt-2 text-lg font-medium text-white">Shortcuts</h3>
            </div>
            <Sparkles className="h-5 w-5 text-[#58c28d]" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => (
              <NavLink
                key={action.label}
                to={action.to}
                className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#262626] p-4 transition-all duration-300 hover:border-[#58c28d]/30 hover:bg-[#2b2b2b] hover:-translate-y-0.5"
              >
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${action.color}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{action.label}</div>
                  <div className="mt-1 text-xs text-zinc-500">{action.description}</div>
                </div>
              </NavLink>
            ))}
          </div>
        </motion.div>

        {/* System status */}
        <motion.div variants={item} className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">System status</div>
              <h3 className="mt-2 text-lg font-medium text-white">Health check</h3>
            </div>
            <Database className="h-5 w-5 text-[#58c28d]" />
          </div>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#262626] px-4 py-3">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-[#58c28d]" />
                <span className="text-sm text-zinc-300">Database</span>
              </div>
              <span className="rounded-full bg-[#58c28d]/10 px-2.5 py-1 text-xs text-[#58c28d]">Connected</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#262626] px-4 py-3">
              <div className="flex items-center gap-3">
                <Timer className="h-4 w-4 text-[#58c28d]" />
                <span className="text-sm text-zinc-300">Cron scheduler</span>
              </div>
              <span className="rounded-full bg-[#58c28d]/10 px-2.5 py-1 text-xs text-[#58c28d]">Active</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#262626] px-4 py-3">
              <div className="flex items-center gap-3">
                <HardDrive className="h-4 w-4 text-[#58c28d]" />
                <span className="text-sm text-zinc-300">Backup</span>
              </div>
              <span className="rounded-full bg-yellow-400/10 px-2.5 py-1 text-xs text-yellow-400">
                Manual only
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#262626] px-4 py-3">
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-[#58c28d]" />
                <span className="text-sm text-zinc-300">Email service</span>
              </div>
              <span className="rounded-full bg-[#58c28d]/10 px-2.5 py-1 text-xs text-[#58c28d]">Online</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Recent activity + Chart placeholder */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.8fr]"
      >
        {/* Recent activity */}
        <motion.div variants={item} className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Recent activity</div>
              <h3 className="mt-2 text-lg font-medium text-white">Timeline</h3>
            </div>
            <Activity className="h-5 w-5 text-[#58c28d]" />
          </div>
          <div className="mt-5 space-y-3">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-2xl bg-[#262626] animate-pulse" />
                ))
              : activity.map((item, idx) => (
                  <div
                    key={idx}
                    className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-[#262626] p-4 transition-all duration-300 hover:border-[#58c28d]/30 hover:-translate-y-0.5"
                  >
                    <div
                      className={`mt-1 h-2.5 w-2.5 rounded-full ${
                        item.tone === 'success'
                          ? 'bg-[#58c28d]'
                          : item.tone === 'warning'
                          ? 'bg-yellow-400'
                          : 'bg-zinc-400'
                      } shadow-[0_0_0_4px_rgba(88,194,141,0.08)]`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-medium text-white">{item.title}</div>
                        <item.icon className="h-4 w-4 text-zinc-500" />
                      </div>
                      <div className="mt-1 text-sm text-zinc-400">{item.meta}</div>
                    </div>
                  </div>
                ))}
          </div>
        </motion.div>

        {/* Chart placeholder */}
        <motion.div variants={item} className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Analytics</div>
              <h3 className="mt-2 text-lg font-medium text-white">Plan trends</h3>
            </div>
            <Sparkles className="h-5 w-5 text-[#58c28d]" />
          </div>
          <div className="mt-5 flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#262626]">
            <Activity className="h-10 w-10 text-zinc-600" />
            <p className="mt-4 text-sm font-medium text-zinc-500">Price changes over time</p>
            <p className="mt-2 text-xs text-zinc-600">Charts will appear here</p>
            <button
              disabled
              className="mt-4 cursor-not-allowed rounded-xl border border-white/10 bg-[#1f1f1f] px-4 py-2 text-xs text-zinc-500"
            >
              Coming soon
            </button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Dashboard;