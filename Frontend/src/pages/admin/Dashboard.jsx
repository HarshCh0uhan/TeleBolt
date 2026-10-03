import { useEffect, useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatCard from '../../components/admin/AdminStatCard';
import {
  Activity,
  BadgeIndianRupee,
  Layers3,
  Clock3,
  Plus,
  UploadCloud,
  FileClock,
  Database,
  Timer,
  HardDrive,
  Sparkles,
  RotateCw,
  Send,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { useAdminStats } from '../../context/AdminStatsContext';
import { getAdminStats } from '../../api/admin.api';

const ACTION_META = {
  create_plan: { label: 'created a plan', tone: 'success' },
  update_plan: { label: 'updated a plan', tone: 'default' },
  delete_plan: { label: 'deleted a plan', tone: 'danger' },
  approve_change: { label: 'approved a detected change', tone: 'success' },
  reject_change: { label: 'rejected a detected change', tone: 'danger' },
  import_plans: { label: 'imported plans via CSV', tone: 'default' },
  approve_submission: { label: 'approved a plan submission', tone: 'success' },
  reject_submission: { label: 'rejected a plan submission', tone: 'danger' },
};

const Dashboard = () => {
  const { user } = useAuth();
  const { pendingCount, refreshPendingCount } = useAdminStats();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data } = await getAdminStats();
        if (cancelled) return;
        setStats(data.stats);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(typeof err?.response?.data === 'string' ? err.response.data : 'Could not load stats.');
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const refresh = async () => {
    try {
      const { data } = await getAdminStats();
      setStats(data.stats);
      setError(null);
    } catch {
      // keep last known values
    }
    await refreshPendingCount();
  };

  const s = stats || {};
  const operatorMax = Math.max(...(s.operators || []).map((op) => op.count), 1);

  const quickActions = [
    { label: 'Add new plan', to: '/admin/plans/create', icon: Plus, color: 'bg-[#58c28d]/10 text-[#58c28d]', description: 'Manually enter a new telecom plan' },
    { label: 'Import CSV', to: '/admin/upload-csv', icon: UploadCloud, color: 'bg-blue-500/10 text-blue-400', description: 'Bulk upload plans via CSV file' },
    { label: 'Detected changes', to: '/admin/detected-changes', icon: FileClock, color: 'bg-yellow-500/10 text-yellow-400', description: 'Approve or reject price and validity updates' },
    { label: 'Pending reviews', to: '/admin/pending-reviews', icon: ShieldCheck, color: 'bg-purple-500/10 text-purple-400', description: 'Community plan submissions awaiting review' },
    { label: 'View plans', to: '/admin/plans', icon: Layers3, color: 'bg-[#58c28d]/10 text-[#58c28d]', description: 'Manage all plans in the catalog' },
    { label: 'Audit logs', to: '/admin/audit-logs', icon: Activity, color: 'bg-zinc-500/10 text-zinc-400', description: 'See every admin action with timestamps' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
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
          description="Monitor plans, review changes and submissions, and keep TeleBolt up to date."
          actions={
            <button
              onClick={refresh}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#262626] px-4 py-2.5 text-sm text-zinc-300 transition-all duration-300 hover:border-[#58c28d]/30 hover:bg-[#58c28d]/10 hover:text-white"
            >
              <RotateCw className="h-4 w-4" />
              Refresh
            </button>
          }
        />
      </motion.div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Quick stats */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {!stats
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-3xl bg-[#262626] animate-pulse" />
            ))
          : [
              <AdminStatCard key="total" label="Total plans" value={s.totalPlans ?? 0} hint="All operators combined" icon={Layers3} tone="default" />,
              <AdminStatCard key="active" label="Active plans" value={s.activePlans ?? 0} hint={`${s.inactivePlans ?? 0} inactive`} icon={BadgeIndianRupee} tone="success" />,
              <AdminStatCard key="pending" label="Pending reviews" value={pendingCount} hint="Detected changes + submissions" icon={Clock3} tone="warning" />,
              <AdminStatCard key="submissions" label="Submissions" value={(s.submissions?.pending || 0) + (s.submissions?.approved || 0) + (s.submissions?.rejected || 0)} hint={`${s.submissions?.approved || 0} approved so far`} icon={Send} tone="default" />,
            ]}
      </motion.section>

      {/* Quick actions + System status */}
      <motion.div variants={container} initial="hidden" animate="show" className="mt-5 grid gap-4 lg:grid-cols-2">
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
              <span className="rounded-full bg-[#58c28d]/10 px-2.5 py-1 text-xs text-[#58c28d]">
                {stats ? 'Connected' : 'Connecting…'}
              </span>
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
                <span className="text-sm text-zinc-300">Price history entries</span>
              </div>
              <span className="rounded-full bg-[#58c28d]/10 px-2.5 py-1 text-xs text-[#58c28d]">
                {stats ? s.priceHistoryCount : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#262626] px-4 py-3">
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-[#58c28d]" />
                <span className="text-sm text-zinc-300">Registered users</span>
              </div>
              <span className="rounded-full bg-[#58c28d]/10 px-2.5 py-1 text-xs text-[#58c28d]">
                {stats ? s.usersCount : '—'}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Recent activity + operator distribution */}
      <motion.div variants={container} initial="hidden" animate="show" className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        {/* Recent activity */}
        <motion.div variants={item} className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Recent activity</div>
              <h3 className="mt-2 text-lg font-medium text-white">Audit timeline</h3>
            </div>
            <Activity className="h-5 w-5 text-[#58c28d]" />
          </div>
          <div className="mt-5 space-y-3">
            {!stats
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-2xl bg-[#262626] animate-pulse" />
                ))
              : (s.recentAudit || []).map((log) => {
                  const meta = ACTION_META[log.action] || { label: log.action, tone: 'default' };
                  return (
                    <div
                      key={log._id}
                      className="flex items-start gap-4 rounded-2xl border border-white/10 bg-[#262626] p-4 transition-all duration-300 hover:border-[#58c28d]/30"
                    >
                      <div
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                          meta.tone === 'success'
                            ? 'bg-[#58c28d]'
                            : meta.tone === 'danger'
                            ? 'bg-red-400'
                            : 'bg-zinc-400'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-white">
                          {log.actor?.email || log.actorEmail} <span className="font-normal text-zinc-400">{meta.label}</span>
                        </div>
                        <div className="mt-1 truncate text-xs text-zinc-500">{log.details}</div>
                        <div className="mt-0.5 text-xs text-zinc-600">
                          {new Date(log.createdAt).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  );
                })}
            {(s.recentAudit || []).length === 0 && stats && (
              <p className="py-6 text-center text-sm text-zinc-500">No admin activity yet.</p>
            )}
          </div>
        </motion.div>

        {/* Operator distribution */}
        <motion.div variants={item} className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Catalog</div>
              <h3 className="mt-2 text-lg font-medium text-white">Plans by operator</h3>
            </div>
            <Sparkles className="h-5 w-5 text-[#58c28d]" />
          </div>
          <div className="mt-6 space-y-4">
            {!stats
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-8 rounded-xl bg-[#262626] animate-pulse" />
                ))
              : (s.operators || []).map((op) => (
                  <div key={op._id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-300">{op._id}</span>
                      <span className="text-zinc-500">{op.count} plans</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#262626]">
                      <div
                        className="h-full rounded-full bg-[#58c28d]/70 transition-all duration-700"
                        style={{ width: `${(op.count / operatorMax) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            {(s.operators || []).length === 0 && stats && (
              <p className="py-6 text-center text-sm text-zinc-500">No plans in the catalog yet.</p>
            )}
          </div>

          {/* Detected changes mini summary */}
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
            <div className="rounded-2xl bg-[#262626] p-3 text-center">
              <Clock3 className="mx-auto h-4 w-4 text-yellow-400" />
              <p className="mt-2 text-lg font-semibold text-white">{s.detectedChanges?.pending ?? '—'}</p>
              <p className="text-[11px] text-zinc-500">Pending</p>
            </div>
            <div className="rounded-2xl bg-[#262626] p-3 text-center">
              <CheckCircle2 className="mx-auto h-4 w-4 text-[#58c28d]" />
              <p className="mt-2 text-lg font-semibold text-white">{s.detectedChanges?.approved ?? '—'}</p>
              <p className="text-[11px] text-zinc-500">Approved</p>
            </div>
            <div className="rounded-2xl bg-[#262626] p-3 text-center">
              <XCircle className="mx-auto h-4 w-4 text-red-400" />
              <p className="mt-2 text-lg font-semibold text-white">{s.detectedChanges?.rejected ?? '—'}</p>
              <p className="text-[11px] text-zinc-500">Rejected</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Dashboard;
