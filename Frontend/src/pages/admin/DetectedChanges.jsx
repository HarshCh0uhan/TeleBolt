import { useEffect, useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatCard from '../../components/admin/AdminStatCard';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import DetectedChangeCard from '../../components/admin/DetectedChangeCard';
import AdminModal from '../../components/admin/AdminModal';
import {
  Clock3, BadgeCheck, XCircle, FileClock, AlertCircle, RefreshCw, Loader2, Play, Check, X,
} from 'lucide-react';
import {
  detectedChanges, approveChange, rejectChange, runPlanSync, getPlanSyncRuns,
  approveAllNewPlans, rejectPendingChanges,
} from '../../api/admin.api';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminStats } from '../../context/AdminStatsContext';

const RUN_TONES = {
  Success: 'border-[#58c28d]/30 bg-[#58c28d]/10 text-[#58c28d]',
  Partial: 'border-yellow-400/30 bg-yellow-400/10 text-yellow-300',
  Skipped: 'border-white/15 bg-white/5 text-zinc-300',
  Failed: 'border-red-400/30 bg-red-500/10 text-red-400',
};

const DetectedChanges = () => {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [lastRun, setLastRun] = useState(null);
  const [syncRunning, setSyncRunning] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(null);
  const [confirmBulk, setConfirmBulk] = useState(null);
  const { pendingCount, refreshPendingCount } = useAdminStats();

  const fetchChanges = async () => {
    try {
      setLoading(true);
      const { data } = await detectedChanges();
      setChanges(data.detectedChanges || []);
      setError(null);
    } catch (err) {
      setError(typeof err.response?.data === 'string' ? err.response.data : 'Failed to load changes');
    } finally {
      setLoading(false);
    }
  };

  const fetchRuns = async () => {
    try {
      const { data } = await getPlanSyncRuns({ limit: 1 });
      setLastRun(data.runs?.[0] || null);
    } catch {
      // The sync panel simply stays empty if history cannot be read.
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [changesRes, runsRes] = await Promise.all([
          detectedChanges(),
          getPlanSyncRuns({ limit: 1 }),
        ]);
        if (cancelled) return;
        setChanges(changesRes.data.detectedChanges || []);
        setLastRun(runsRes.data.runs?.[0] || null);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(typeof err.response?.data === 'string' ? err.response.data : 'Failed to load changes');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleApprove = async (id) => {
    setBusyId(id);
    setActionError(null);
    try {
      await approveChange(id);
      setChanges((prev) => prev.map((change) => (change._id === id ? { ...change, status: 'Approved' } : change)));
      await refreshPendingCount();
    } catch (err) {
      setActionError(typeof err?.response?.data === 'string' ? err.response.data : 'Could not approve this change');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id) => {
    setBusyId(id);
    setActionError(null);
    try {
      await rejectChange(id);
      setChanges((prev) => prev.map((change) => (change._id === id ? { ...change, status: 'Rejected' } : change)));
      await refreshPendingCount();
    } catch (err) {
      setActionError(typeof err?.response?.data === 'string' ? err.response.data : 'Could not reject this change');
    } finally {
      setBusyId(null);
    }
  };

  const handleRunSync = async () => {
    setSyncRunning(true);
    setSyncMessage(null);
    try {
      const { data } = await runPlanSync();
      setSyncMessage(data.message || 'Plan sync finished');
      await Promise.all([fetchChanges(), fetchRuns(), refreshPendingCount()]);
    } catch (err) {
      setSyncMessage(typeof err?.response?.data === 'string' ? err.response.data : 'Plan sync failed');
    } finally {
      setSyncRunning(false);
    }
  };

  const runBulk = async (kind) => {
    setConfirmBulk(null);
    setBulkBusy(kind);
    setActionError(null);
    try {
      const { data } = kind === 'approve' ? await approveAllNewPlans({}) : await rejectPendingChanges({});
      setSyncMessage(data.message || 'Done');
      await Promise.all([fetchChanges(), refreshPendingCount()]);
    } catch (err) {
      setActionError(typeof err?.response?.data === 'string' ? err.response.data : 'Bulk action failed');
    } finally {
      setBulkBusy(null);
    }
  };

  const approvedCount = changes.filter((c) => c.status === 'Approved').length;
  const rejectedCount = changes.filter((c) => c.status === 'Rejected').length;
  const pendingChanges = changes.filter((c) => c.status === 'Pending');
  const pendingNewPlans = pendingChanges.filter((c) => c.field === 'NewPlan').length;
  const pendingFieldChanges = pendingChanges.length - pendingNewPlans;

  return (
    <>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <AdminPageHeader
          eyebrow="Admin Dashboard"
          title="Detected changes"
          description="Everything the daily Vi and BSNL sync found, plus manual edits – approve to apply, reject to ignore."
        />
      </motion.div>

      {/* Dynamic stats */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        <AdminStatCard label="Pending" value={pendingCount} hint="Awaiting your decision" icon={Clock3} tone="warning" />
        <AdminStatCard label="Approved" value={approvedCount} hint="Merged into catalog" icon={BadgeCheck} tone="success" />
        <AdminStatCard label="Rejected" value={rejectedCount} hint="Kept out of live list" icon={XCircle} tone="danger" />
      </motion.section>

      {/* Plan sync panel */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="mt-5 rounded-3xl border border-white/10 bg-[#1f1f1f] p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
            <RefreshCw className="h-4 w-4 text-[#58c28d]" />
            Plan sync
          </div>
          <button
            type="button"
            onClick={handleRunSync}
            disabled={syncRunning}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#58c28d]/25 bg-[#58c28d]/10 px-4 py-2.5 text-sm font-medium text-[#dff6ea] transition-all duration-300 hover:bg-[#58c28d]/20 disabled:opacity-60"
          >
            {syncRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {syncRunning ? 'Running sync…' : 'Run sync now'}
          </button>
        </div>

        {syncMessage && (
          <p className="mt-3 rounded-2xl border border-white/10 bg-[#262626] px-4 py-2 text-xs text-zinc-300">
            {syncMessage}
          </p>
        )}

        {lastRun ? (
          <div className="mt-4">
            <p className="text-xs text-zinc-500">
              Last run {new Date(lastRun.createdAt).toLocaleString('en-IN')} • {lastRun.trigger} •{' '}
              {lastRun.totals?.fetched ?? 0} plans read • {lastRun.totals?.newPlans ?? 0} new •{' '}
              {lastRun.totals?.changes ?? 0} changes
            </p>
            <div className="mt-3 space-y-2">
              {(lastRun.sources || []).map((source) => (
                <div
                  key={source.source}
                  className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-[#262626] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{source.source}</span>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] ${RUN_TONES[source.status] || RUN_TONES.Skipped}`}>
                        {source.status}
                      </span>
                    </div>
                    {source.message && <p className="mt-1 text-xs text-zinc-500">{source.message}</p>}
                  </div>
                  <p className="shrink-0 text-xs text-zinc-400">
                    {source.fetched} read • {source.newPlans} new • {source.changes} changes •{' '}
                    {source.unchanged} unchanged
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-xs text-zinc-500">
            No sync has run yet. The daily job runs at 03:00 IST, or trigger one now.
          </p>
        )}
      </motion.section>

      {/* Review queue */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="mt-5 rounded-3xl border border-white/10 bg-[#1f1f1f] p-5"
      >
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
          <FileClock className="h-4 w-4 text-[#58c28d]" />
          Review queue {pendingChanges.length > 0 && `(${pendingChanges.length})`}
        </div>

        {/* Bulk actions: the first sync can leave dozens of proposals */}
        {pendingChanges.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {pendingNewPlans > 0 && (
              <button
                type="button"
                onClick={() => setConfirmBulk('approve')}
                disabled={bulkBusy !== null}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#58c28d]/25 bg-[#58c28d] px-4 py-2.5 text-sm font-semibold text-[#181818] transition hover:bg-[#6dd9a0] disabled:opacity-60"
              >
                {bulkBusy === 'approve' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Add all {pendingNewPlans} new plans
              </button>
            )}
            {pendingFieldChanges > 0 && (
              <button
                type="button"
                onClick={() => setConfirmBulk('reject')}
                disabled={bulkBusy !== null}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#262626] px-4 py-2.5 text-sm text-zinc-300 transition hover:border-red-400/30 hover:text-red-400 disabled:opacity-60"
              >
                {bulkBusy === 'reject' ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                Reject all {pendingFieldChanges} pending changes
              </button>
            )}
          </div>
        )}

        {actionError && (
          <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-xs text-red-400">
            {actionError}
          </p>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="mt-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-3xl bg-[#262626] animate-pulse" />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="mt-5 rounded-3xl border border-red-400/20 bg-red-500/10 p-6 text-center">
            <AlertCircle className="mx-auto h-6 w-6 text-red-400" />
            <p className="mt-3 text-sm text-red-400">{error}</p>
            <button
              onClick={fetchChanges}
              className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs text-red-400 transition hover:bg-red-500/20"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state – based on pending */}
        {!loading && !error && pendingChanges.length === 0 && (
          <AdminEmptyState
            title="No pending changes"
            message="All changes have been reviewed. The queue refills when the daily sync finds new plans or price and validity updates."
          />
        )}

        {/* Pending changes list */}
        {!loading && !error && pendingChanges.length > 0 && (
          <div className="mt-5 space-y-3">
            <AnimatePresence>
              {pendingChanges.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                >
                  <DetectedChangeCard
                    change={item}
                    busy={busyId === item._id}
                    onApprove={() => handleApprove(item._id)}
                    onReject={() => handleReject(item._id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.section>

      <AdminModal
        isOpen={confirmBulk !== null}
        title={confirmBulk === 'approve' ? `Add ${pendingNewPlans} new plans?` : `Reject ${pendingFieldChanges} pending changes?`}
        message={
          confirmBulk === 'approve'
            ? 'Every pending new plan is added to the live catalogue. You can still edit or delete any of them afterwards.'
            : 'These price, validity, data and SMS proposals are discarded without touching the catalogue. This cannot be undone.'
        }
        confirmLabel={confirmBulk === 'approve' ? 'Add all' : 'Reject all'}
        cancelLabel="Cancel"
        onConfirm={() => runBulk(confirmBulk)}
        onCancel={() => setConfirmBulk(null)}
      />
    </>
  );
};

export default DetectedChanges;
