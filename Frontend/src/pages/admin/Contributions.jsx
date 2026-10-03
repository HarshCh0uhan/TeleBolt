import { useEffect, useMemo, useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatCard from '../../components/admin/AdminStatCard';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { Clock3, BadgeCheck, XCircle, Send, Check, X, Users, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSubmissions, approveSubmission, rejectSubmission } from '../../api/admin.api';
import { useAdminStats } from '../../context/AdminStatsContext';

const TABS = ['All', 'Pending', 'Approved', 'Rejected'];

const Contributions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [busyId, setBusyId] = useState(null);
  const { refreshPendingCount } = useAdminStats();

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data } = await getSubmissions();
      setSubmissions(data.submissions || []);
      setError(null);
    } catch (err) {
      setError(typeof err?.response?.data === 'string' ? err.response.data : 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await getSubmissions();
        if (cancelled) return;
        setSubmissions(data.submissions || []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(typeof err?.response?.data === 'string' ? err.response.data : 'Failed to load submissions');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const counts = useMemo(() => {
    const c = { Pending: 0, Approved: 0, Rejected: 0 };
    submissions.forEach((sub) => { c[sub.status] = (c[sub.status] || 0) + 1; });
    return c;
  }, [submissions]);

  const contributors = useMemo(() => {
    const map = new Map();
    submissions.forEach((sub) => {
      const key = sub.submittedBy?._id || 'unknown';
      const entry = map.get(key) || {
        name: sub.submittedBy?.username || 'Unknown user',
        email: sub.submittedBy?.email || '—',
        total: 0,
        approved: 0,
      };
      entry.total += 1;
      if (sub.status === 'Approved') entry.approved += 1;
      map.set(key, entry);
    });
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [submissions]);

  const visible = activeTab === 'All' ? submissions : submissions.filter((s) => s.status === activeTab);

  const handleAction = async (id, action) => {
    setBusyId(id);
    try {
      await action();
      await fetchSubmissions();
      await refreshPendingCount();
    } catch (err) {
      console.error('Action failed', err);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <AdminPageHeader
          eyebrow="Admin Dashboard"
          title="Contributions"
          description="Community plan submissions and the people who contribute them."
          actions={
            <button
              onClick={fetchSubmissions}
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

      {/* Stats */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <AdminStatCard label="Total submissions" value={submissions.length} hint="All time" icon={Send} tone="default" />
        <AdminStatCard label="Pending" value={counts.Pending} hint="Awaiting review" icon={Clock3} tone="warning" />
        <AdminStatCard label="Approved" value={counts.Approved} hint="Turned into plans" icon={BadgeCheck} tone="success" />
        <AdminStatCard label="Rejected" value={counts.Rejected} hint="Reviewed and declined" icon={XCircle} tone="danger" />
      </motion.section>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Submissions list */}
        <section className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-all duration-300 ${
                  activeTab === tab
                    ? 'border border-[#58c28d]/30 bg-[#58c28d]/15 text-[#dff6ea]'
                    : 'border border-white/10 bg-[#262626] text-zinc-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 rounded-3xl bg-[#262626] animate-pulse" />
              ))
            ) : visible.length === 0 ? (
              <AdminEmptyState
                title={activeTab === 'All' ? 'No submissions yet' : `No ${activeTab.toLowerCase()} submissions`}
                message="Submissions appear here once users suggest plans from the Suggest a Plan page."
              />
            ) : (
              <AnimatePresence>
                {visible.map((sub) => (
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
                          <span className="rounded-full bg-[#58c28d]/10 px-3 py-1 text-xs font-medium text-[#58c28d]">{sub.operator}</span>
                          <h3 className="text-base font-medium text-white">₹{sub.price}</h3>
                          <span className="text-sm text-zinc-400">• {sub.validityDays} days • {sub.category}</span>
                          <AdminStatusBadge status={sub.status} />
                        </div>
                        <p className="mt-2 text-sm text-zinc-400">
                          {sub.dailyData ? `${sub.dailyData} GB/day` : `${sub.totalData} GB total`}
                          {sub.ottApps?.length > 0 && <span className="text-zinc-500"> • {sub.ottApps.join(', ')}</span>}
                        </p>
                        <p className="mt-1 text-xs text-zinc-600">
                          By {sub.submittedBy?.email || 'user'} • {new Date(sub.createdAt).toLocaleString('en-IN')}
                          {sub.reviewedBy?.email && ` • reviewed by ${sub.reviewedBy.email}`}
                        </p>
                      </div>

                      {sub.status === 'Pending' && (
                        <div className="flex items-center gap-3">
                          <button
                            disabled={busyId === sub._id}
                            onClick={() => handleAction(sub._id, () => approveSubmission(sub._id))}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#58c28d]/25 bg-[#58c28d] px-4 py-2 text-xs font-semibold text-[#181818] transition hover:bg-[#6dd9a0] disabled:opacity-60"
                          >
                            <Check className="h-3.5 w-3.5" /> Approve & create plan
                          </button>
                          <button
                            disabled={busyId === sub._id}
                            onClick={() => handleAction(sub._id, () => rejectSubmission(sub._id))}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#181818] px-4 py-2 text-xs font-medium text-zinc-300 transition hover:border-red-400/30 hover:text-red-400 disabled:opacity-60"
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </section>

        {/* Contributors summary */}
        <section className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
            <Users className="h-4 w-4 text-[#58c28d]" />
            Contributors
          </div>

          <div className="mt-5 space-y-3">
            {contributors.length === 0 && !loading && (
              <p className="py-6 text-center text-sm text-zinc-500">No contributors yet.</p>
            )}
            {contributors.map((contributor) => (
              <div
                key={contributor.email}
                className="rounded-2xl border border-white/10 bg-[#262626] p-4 transition-all duration-300 hover:border-[#58c28d]/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-white">{contributor.name}</div>
                    <div className="truncate text-xs text-zinc-500">{contributor.email}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold text-[#58c28d]">{contributor.total} submitted</div>
                    <div className="text-xs text-zinc-500">{contributor.approved} approved</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default Contributions;
