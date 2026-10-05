import { useEffect, useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import DetectedChangeCard from '../../components/admin/DetectedChangeCard';
import {
  Clock3, FileClock, Send, Check, X, RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  detectedChanges, approveChange, rejectChange,
  getSubmissions, approveSubmission, rejectSubmission,
} from '../../api/admin.api';
import { useAdminStats } from '../../context/AdminStatsContext';

const PendingReviews = () => {
  const [changes, setChanges] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const { refreshPendingCount } = useAdminStats();

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [changesRes, subsRes] = await Promise.all([
        detectedChanges(),
        getSubmissions({ status: 'Pending' }),
      ]);
      setChanges((changesRes.data.detectedChanges || []).filter((c) => c.status === 'Pending'));
      setSubmissions(subsRes.data.submissions || []);
      setError(null);
    } catch (err) {
      setError(typeof err?.response?.data === 'string' ? err.response.data : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [changesRes, subsRes] = await Promise.all([
          detectedChanges(),
          getSubmissions({ status: 'Pending' }),
        ]);
        if (cancelled) return;
        setChanges((changesRes.data.detectedChanges || []).filter((c) => c.status === 'Pending'));
        setSubmissions(subsRes.data.submissions || []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(typeof err?.response?.data === 'string' ? err.response.data : 'Failed to load reviews');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const runAction = async (id, action) => {
    setBusyId(id);
    try {
      await action();
      await fetchAll();
      await refreshPendingCount();
    } catch (err) {
      console.error('Review action failed', err);
    } finally {
      setBusyId(null);
    }
  };

  const totalPending = changes.length + submissions.length;

  return (
    <>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <AdminPageHeader
          eyebrow="Admin Dashboard"
          title="Pending reviews"
          description="One queue for everything that needs your decision before it touches the live catalog."
          actions={
            <button
              onClick={fetchAll}
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

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-3xl bg-[#262626] animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Detected plan changes */}
          <section className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-5 sm:p-6">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              <FileClock className="h-4 w-4 text-[#58c28d]" />
              Detected plan changes {changes.length > 0 && `(${changes.length})`}
            </div>

            {changes.length === 0 ? (
              <AdminEmptyState
                title="No pending detected changes"
                message="New plans, price and validity updates found by the daily Vi and BSNL sync will appear here."
              />
            ) : (
              <div className="mt-5 space-y-3">
                <AnimatePresence>
                  {changes.map((item) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <DetectedChangeCard
                        change={item}
                        busy={busyId === item._id}
                        onApprove={() => runAction(item._id, () => approveChange(item._id))}
                        onReject={() => runAction(item._id, () => rejectChange(item._id))}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>

          {/* Plan submissions */}
          <section className="mt-5 rounded-3xl border border-white/10 bg-[#1f1f1f] p-5 sm:p-6">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              <Send className="h-4 w-4 text-[#58c28d]" />
              Community plan submissions {submissions.length > 0 && `(${submissions.length})`}
            </div>

            {submissions.length === 0 ? (
              <AdminEmptyState
                title="No pending submissions"
                message="When users suggest new plans they will land here for your approval."
              />
            ) : (
              <div className="mt-5 space-y-3">
                <AnimatePresence>
                  {submissions.map((sub) => (
                    <motion.div
                      key={sub._id}
                      layout
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="rounded-3xl border border-white/10 bg-[#262626] p-4 transition-all duration-300 hover:border-[#58c28d]/30"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#58c28d]/10 px-3 py-1 text-xs font-medium text-[#58c28d]">
                              {sub.operator}
                            </span>
                            <h3 className="text-base font-medium text-white">₹{sub.price}</h3>
                            <span className="text-sm text-zinc-400">• {sub.validityDays} days • {sub.category}</span>
                          </div>
                          <p className="mt-2 text-sm text-zinc-400">
                            {sub.dailyData ? `${sub.dailyData} GB/day` : `${sub.totalData} GB total`}
                            {sub.ottApps?.length > 0 && (
                              <span className="text-zinc-500"> • {sub.ottApps.join(', ')}</span>
                            )}
                          </p>
                          {sub.note && <p className="mt-1 text-xs text-zinc-500">"{sub.note}"</p>}
                          <p className="mt-1 text-xs text-zinc-600">
                            By {sub.submittedBy?.email || 'user'} • {new Date(sub.createdAt).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            disabled={busyId === sub._id}
                            onClick={() => runAction(sub._id, () => approveSubmission(sub._id))}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#58c28d]/25 bg-[#58c28d] px-4 py-2 text-xs font-semibold text-[#181818] transition hover:bg-[#6dd9a0] disabled:opacity-60"
                          >
                            <Check className="h-3.5 w-3.5" /> Approve & create plan
                          </button>
                          <button
                            disabled={busyId === sub._id}
                            onClick={() => runAction(sub._id, () => rejectSubmission(sub._id))}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#181818] px-4 py-2 text-xs font-medium text-zinc-300 transition hover:border-red-400/30 hover:text-red-400 disabled:opacity-60"
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>
        </>
      )}

      {!loading && !error && totalPending === 0 && (
        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-zinc-500">
          <Clock3 className="h-4 w-4 text-[#58c28d]" />
          All caught up — nothing is waiting for review.
        </p>
      )}
    </>
  );
};

export default PendingReviews;
