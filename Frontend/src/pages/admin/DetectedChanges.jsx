import { useEffect, useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatCard from '../../components/admin/AdminStatCard';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminActionButtons from '../../components/admin/AdminActionButtons';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import {
  Clock3, BadgeCheck, XCircle, FileClock, AlertCircle, ArrowRight,
} from 'lucide-react';
import { detectedChanges, approveChange, rejectChange } from '../../api/admin.api';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminStats } from '../../context/AdminStatsContext';

const DetectedChanges = () => {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {pendingCount, refreshPendingCount} = useAdminStats();

  const fetchChanges = async () => {
    try {
      setLoading(true);
      const { data } = await detectedChanges();
      setChanges(data.detectedChanges || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data || 'Failed to load changes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChanges();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveChange(id);
      setChanges(prev =>
        prev.map(change =>
          change._id === id ? { ...change, status: 'Approved' } : change
        )
      );
      refreshPendingCount()
    } catch (err) {
      console.error('Approve failed', err);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectChange(id);
      setChanges(prev =>
        prev.map(change =>
          change._id === id ? { ...change, status: 'Rejected' } : change
        )
      );
      refreshPendingCount()
    } catch (err) {
      console.error('Reject failed', err);
    }
  };

  // const pendingCount = changes.filter(c => c.status === 'Pending').length;
  const approvedCount = changes.filter(c => c.status === 'Approved').length;
  const rejectedCount = changes.filter(c => c.status === 'Rejected').length;

  const pendingChanges = changes.filter(c => c.status === 'Pending');

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AdminPageHeader
          eyebrow="Admin Dashboard"
          title="Detected changes"
          description="Review incoming edits from the monitoring service. Approve clean changes or reject noisy ones."
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
            message="All changes have been reviewed. The queue will refill when the monitoring service detects plan updates."
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
                  className="rounded-3xl border border-white/10 bg-[#262626] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#58c28d]/30"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-medium text-white">
                          {item.planId?.operator || 'Unknown'} plan
                        </h3>
                        <AdminStatusBadge status={item.status} />
                      </div>
                      <p className="mt-2 text-sm text-zinc-400">
                        <span className="text-zinc-300">{item.field}</span> changed from{' '}
                        <span className="text-white line-through decoration-zinc-600">
                          {item.field === 'Price' ? `₹${item.oldValue}` : item.oldValue}
                        </span>{' '}
                        <ArrowRight className="mx-1 inline h-3 w-3 text-[#58c28d]" />{' '}
                        <span className="text-[#58c28d] font-medium">
                          {item.field === 'Price' ? `₹${item.newValue}` : item.newValue}
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Detected {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <AdminActionButtons
                        onApprove={() => handleApprove(item._id)}
                        onReject={() => handleReject(item._id)}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.section>
    </>
  );
};

export default DetectedChanges;