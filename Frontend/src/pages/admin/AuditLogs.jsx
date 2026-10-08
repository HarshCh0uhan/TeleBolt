import { useEffect, useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { ShieldCheck, RefreshCw, ChevronDown, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAuditLogs } from '../../api/admin.api';

const ACTIONS = [
  { value: '', label: 'All actions' },
  { value: 'create_plan', label: 'Create plan' },
  { value: 'update_plan', label: 'Update plan' },
  { value: 'delete_plan', label: 'Delete plan' },
  { value: 'approve_change', label: 'Approve change' },
  { value: 'reject_change', label: 'Reject change' },
  { value: 'import_plans', label: 'Import CSV' },
  { value: 'approve_submission', label: 'Approve submission' },
  { value: 'reject_submission', label: 'Reject submission' },
  { value: 'approve_new_plan', label: 'Add new plan' },
  { value: 'run_plan_sync', label: 'Run plan sync' },
];

const ENTITIES = [
  { value: '', label: 'All entities' },
  { value: 'Plan', label: 'Plan' },
  { value: 'DetectedChange', label: 'Detected change' },
  { value: 'PlanSubmission', label: 'Plan submission' },
  { value: 'PlanSyncRun', label: 'Plan sync run' },
];

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

const PAGE_SIZE = 30;

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const fetchLogs = async (reset) => {
    try {
      setLoading(true);
      const params = {
        skip: reset ? 0 : logs.length,
        limit: PAGE_SIZE,
      };
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entity = entityFilter;

      const { data } = await getAuditLogs(params);
      setLogs((prev) => (reset ? data.logs : [...prev, ...data.logs]));
      setTotal(data.total);
      setHasMore(data.hasMore);
      setError(null);
    } catch (err) {
      setError(typeof err?.response?.data === 'string' ? err.response.data : 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionFilter, entityFilter]);

  const toneFor = (action) => {
    if (action.includes('approve') || action === 'create_plan') return 'bg-[#58c28d]';
    if (action.includes('reject') || action === 'delete_plan') return 'bg-red-400';
    return 'bg-zinc-400';
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <AdminPageHeader
          eyebrow="Admin Dashboard"
          title="Audit logs"
          description="A timestamped trail of every admin action — who did what, and when."
          actions={
            <button
              onClick={() => fetchLogs(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#262626] px-4 py-2.5 text-sm text-zinc-300 transition-all duration-300 hover:border-[#58c28d]/30 hover:bg-[#58c28d]/10 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          }
        />
      </motion.div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      {/* Filters */}
      <section className="mb-5 flex flex-wrap items-center gap-3 rounded-3xl border border-white/10 bg-[#1f1f1f] p-4">
        <div className="relative w-full sm:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-white/10 bg-[#262626] py-2.5 pl-4 pr-10 text-sm text-white outline-none transition-all duration-300 focus:border-[#58c28d]/40 sm:w-auto"
          >
            {ACTIONS.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        </div>
        <div className="relative w-full sm:w-auto">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-white/10 bg-[#262626] py-2.5 pl-4 pr-10 text-sm text-white outline-none transition-all duration-300 focus:border-[#58c28d]/40 sm:w-auto"
          >
            {ENTITIES.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        </div>
        <span className="ml-auto text-xs text-zinc-500">{total} events</span>
      </section>

      {/* Log list */}
      <section className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-5 sm:p-6">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
          <ShieldCheck className="h-4 w-4 text-[#58c28d]" />
          Activity trail
        </div>

        <div className="mt-5 space-y-3">
          {loading && logs.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-[#262626] animate-pulse" />
            ))
          ) : logs.length === 0 ? (
            <AdminEmptyState
              title="No audit events"
              message="Actions such as creating, updating or deleting plans will be recorded here."
            />
          ) : (
            logs.map((log) => (
              <div
                key={log._id}
                className="flex flex-wrap items-start gap-x-4 gap-y-2 rounded-2xl border border-white/10 bg-[#262626] p-4 transition-all duration-300 hover:border-[#58c28d]/30"
              >
                <div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${toneFor(log.action)}`} />
                <div className="min-w-[12rem] flex-1">
                  <p className="break-words text-sm text-zinc-300">
                    <span className="font-medium text-white">{log.actor?.email || log.actorEmail}</span>{' '}
                    {ACTION_LABELS[log.action] || log.action}
                  </p>
                  {log.details && <p className="mt-0.5 break-words text-xs text-zinc-500">{log.details}</p>}
                </div>
                <div className="flex w-full shrink-0 flex-wrap items-center gap-x-2 text-left sm:w-auto sm:flex-col sm:items-end sm:text-right">
                  <p className="text-xs text-zinc-500">{log.entity}</p>
                  <p className="text-[11px] text-zinc-600 sm:mt-0.5">{new Date(log.createdAt).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {hasMore && (
          <div className="mt-5 text-center">
            <button
              onClick={() => fetchLogs(false)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#262626] px-5 py-3 text-sm text-zinc-300 transition hover:border-[#58c28d]/30 hover:bg-[#58c28d]/10 hover:text-white disabled:opacity-60"
            >
              {loading ? <Activity className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-4 w-4" />}
              Load more
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export default AuditLogs;
