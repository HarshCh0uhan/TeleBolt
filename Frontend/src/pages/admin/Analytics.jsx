import { useEffect, useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatCard from '../../components/admin/AdminStatCard';
import { Layers3, BadgeIndianRupee, History, Users, Clock3, BarChart3, RotateCw, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAdminStats } from '../../api/admin.api';
import { useAdminStats } from '../../context/AdminStatsContext';

const ACTION_LABELS = {
  create_plan: 'created a plan',
  update_plan: 'updated a plan',
  delete_plan: 'deleted a plan',
  approve_change: 'approved a detected change',
  reject_change: 'rejected a detected change',
  import_plans: 'imported plans via CSV',
  approve_submission: 'approved a plan submission',
  reject_submission: 'rejected a plan submission',
  approve_new_plan: 'added a new plan from a sync proposal',
  run_plan_sync: 'ran the plan sync',
};

const Bar = ({ label, value, max }) => (
  <div>
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-300">{label}</span>
      <span className="text-zinc-500">{value}</span>
    </div>
    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#262626]">
      <div
        className="h-full rounded-full bg-[#58c28d]/70 transition-all duration-700"
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  </div>
);

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const { pendingCount } = useAdminStats();

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
        setError(typeof err?.response?.data === 'string' ? err.response.data : 'Could not load analytics.');
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
  };

  const s = stats || {};
  const operatorMax = Math.max(...(s.operators || []).map((op) => op.count), 1);
  const categoryMax = Math.max(...(s.categories || []).map((c) => c.count), 1);
  const activePercent = s.totalPlans ? Math.round((s.activePlans / s.totalPlans) * 100) : 0;
  const submissionsTotal =
    (s.submissions?.pending || 0) + (s.submissions?.approved || 0) + (s.submissions?.rejected || 0);

  return (
    <>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <AdminPageHeader
          eyebrow="Admin Dashboard"
          title="Analytics"
          description="Live numbers behind the catalog, change history and the community."
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
        <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {!stats
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-3xl bg-[#262626] animate-pulse" />
            ))
          : [
              <AdminStatCard key="total" label="Total plans" value={s.totalPlans ?? 0} hint="Catalog size" icon={Layers3} tone="default" />,
              <AdminStatCard key="active" label="Active rate" value={`${activePercent}%`} hint={`${s.activePlans ?? 0} of ${s.totalPlans ?? 0} active`} icon={BadgeIndianRupee} tone="success" />,
              <AdminStatCard key="history" label="Price history" value={s.priceHistoryCount ?? 0} hint="Recorded price changes" icon={History} tone="default" />,
              <AdminStatCard key="pending" label="Pending reviews" value={pendingCount} hint="Awaiting a decision" icon={Clock3} tone="warning" />,
            ]}
      </motion.section>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {/* Operator distribution */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-5 sm:p-6"
        >
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
            <BarChart3 className="h-4 w-4 text-[#58c28d]" />
            Plans by operator
          </div>
          <div className="mt-6 space-y-4">
            {!stats
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-8 rounded-xl bg-[#262626] animate-pulse" />
                ))
              : (s.operators || []).map((op) => (
                  <Bar key={op._id} label={op._id} value={op.count} max={operatorMax} />
                ))}
            {(s.operators || []).length === 0 && stats && (
              <p className="py-6 text-center text-sm text-zinc-500">No plans yet.</p>
            )}
          </div>
        </motion.section>

        {/* Category distribution */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-5 sm:p-6"
        >
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
            <BarChart3 className="h-4 w-4 text-[#58c28d]" />
            Plans by category
          </div>
          <div className="mt-6 space-y-4">
            {!stats
              ? Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-8 rounded-xl bg-[#262626] animate-pulse" />
                ))
              : (s.categories || []).map((cat) => (
                  <Bar key={cat._id} label={cat._id} value={cat.count} max={categoryMax} />
                ))}
            {(s.categories || []).length === 0 && stats && (
              <p className="py-6 text-center text-sm text-zinc-500">No plans yet.</p>
            )}
          </div>
        </motion.section>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {/* Community */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-5 sm:p-6"
        >
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
            <Users className="h-4 w-4 text-[#58c28d]" />
            Community
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#262626] p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500">Submissions</p>
              <p className="mt-2 text-2xl font-bold text-white">{submissionsTotal}</p>
            </div>
            <div className="rounded-2xl bg-[#262626] p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500">Registered users</p>
              <p className="mt-2 text-2xl font-bold text-white">{s.usersCount ?? '—'}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-[#262626] p-3 text-center">
              <p className="text-lg font-semibold text-yellow-400">{s.submissions?.pending ?? '—'}</p>
              <p className="text-[11px] text-zinc-500">Pending</p>
            </div>
            <div className="rounded-2xl bg-[#262626] p-3 text-center">
              <p className="text-lg font-semibold text-[#58c28d]">{s.submissions?.approved ?? '—'}</p>
              <p className="text-[11px] text-zinc-500">Approved</p>
            </div>
            <div className="rounded-2xl bg-[#262626] p-3 text-center">
              <p className="text-lg font-semibold text-red-400">{s.submissions?.rejected ?? '—'}</p>
              <p className="text-[11px] text-zinc-500">Rejected</p>
            </div>
          </div>
        </motion.section>

        {/* Recent activity */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-5 sm:p-6"
        >
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
            <Activity className="h-4 w-4 text-[#58c28d]" />
            Latest admin activity
          </div>
          <div className="mt-5 space-y-2.5">
            {!stats
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-[#262626] animate-pulse" />
                ))
              : (s.recentAudit || []).slice(0, 6).map((log) => (
                  <div key={log._id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#262626]/60 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-zinc-300">
                        {log.actor?.email || log.actorEmail}{' '}
                        <span className="text-zinc-500">{ACTION_LABELS[log.action] || log.action}</span>
                      </p>
                      <p className="text-[11px] text-zinc-600">{new Date(log.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
            {(s.recentAudit || []).length === 0 && stats && (
              <p className="py-6 text-center text-sm text-zinc-500">No activity recorded yet.</p>
            )}
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default Analytics;
