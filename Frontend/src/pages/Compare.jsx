import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Sparkles, Database, CalendarDays, Phone, MessageSquare, Check, X,
  TrendingDown, Star, Info, Plus, RefreshCw, AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { comparePlans } from '../api/plans.api';
import { useCompare, MIN_COMPARE, MAX_COMPARE } from '../context/CompareContext';

const Compare = () => {
  const { selectedPlans, selectedIds, selectedCount, removePlan, clearSelection } = useCompare();
  const navigate = useNavigate();

  // Freshly fetched plans, keyed by id. Until the request resolves we fall back to
  // the copies held in the selection, so the page renders instantly.
  const [fetchedPlans, setFetchedPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const enoughPlans = selectedIds.length >= MIN_COMPARE;

  const plansById = useMemo(
    () => new Map(fetchedPlans.map((plan) => [plan._id, plan])),
    [fetchedPlans]
  );

  // Selection order is authoritative for the comparison columns.
  const plans = useMemo(
    () => selectedPlans.map((plan) => plansById.get(plan._id) || plan),
    [selectedPlans, plansById]
  );

  // Fetch the authoritative comparison payload for the current selection.
  useEffect(() => {
    if (!enoughPlans) return undefined;

    let cancelled = false;

    const fetchComparison = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await comparePlans(selectedIds);
        if (cancelled) return;
        setFetchedPlans(data.comparePlans ?? []);
      } catch (err) {
        if (cancelled) return;
        // The selected plans already carry yearly figures, so the comparison
        // stays usable; we only surface that it could not be refreshed.
        setError(
          typeof err?.response?.data === 'string'
            ? err.response.data
            : err?.message || 'Could not refresh comparison data.'
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchComparison();

    return () => {
      cancelled = true;
    };
  }, [selectedIds, enoughPlans]);

  // ---- Derived comparison metrics -------------------------------------------
  const metrics = useMemo(() => {
    if (plans.length < MIN_COMPARE) return null;

    const perGb = plans.filter((plan) => Number(plan.costPerGB) > 0);
    const yearly = plans.filter((plan) => Number(plan.yearlyCost) > 0);

    const bestPerGb = perGb.length
      ? perGb.reduce((best, plan) => (plan.costPerGB < best.costPerGB ? plan : best))
      : null;

    const cheapest = yearly.length
      ? yearly.reduce((best, plan) => (plan.yearlyCost < best.yearlyCost ? plan : best))
      : null;

    // How many selected plans include each OTT app – used to flag exclusives.
    const ottCounts = new Map();
    plans.forEach((plan) => {
      (plan.ottApps || []).forEach((app) => {
        ottCounts.set(app, (ottCounts.get(app) || 0) + 1);
      });
    });

    return { bestPerGb, cheapest, ottCounts };
  }, [plans]);

  const handleClear = () => {
    clearSelection();
    navigate('/');
  };

  // ---------- EMPTY STATE (fewer than 2 plans selected) ----------
  if (plans.length < MIN_COMPARE) {
    return (
      <div className="min-h-screen bg-[#181818] text-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-md"
        >
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl border border-dashed border-white/10 bg-[#1f1f1f]">
            <Info className="h-9 w-9 text-zinc-500" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-white">Compare Plans</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {selectedCount === 0 ? (
              <>
                Select <span className="text-[#58c28d] font-medium">2 or 3 plans</span> from the home page
                using the <span className="text-[#58c28d] font-medium">Add to Compare</span> button to see
                them side-by-side here.
              </>
            ) : (
              <>
                You have <span className="text-[#58c28d] font-medium">{selectedCount} plan</span> selected.
                Add <span className="text-[#58c28d] font-medium">1 more</span> to start comparing.
              </>
            )}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 text-xs text-zinc-500">
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#262626] px-3 py-1.5">
              <Info className="h-3.5 w-3.5 text-[#58c28d]" />
              Min {MIN_COMPARE} plans required
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#262626] px-3 py-1.5">
              <Info className="h-3.5 w-3.5 text-[#58c28d]" />
              Max {MAX_COMPARE} plans allowed
            </div>
          </div>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#58c28d] px-6 py-3.5 text-sm font-semibold text-[#181818] transition hover:bg-[#6dd9a0]"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse Plans
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#181818]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-[#58c28d]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Plans
          </Link>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Plan Comparison</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Comparing {plans.length} of {MAX_COMPARE} plans side-by-side
              </p>
            </div>
            {/* Best Value Summary */}
            {metrics?.bestPerGb && (
              <div className="flex items-center gap-2 rounded-2xl border border-[#58c28d]/20 bg-[#58c28d]/10 px-4 py-2 text-sm">
                <Star className="h-4 w-4 text-[#58c28d]" />
                <span className="text-zinc-300">Best value:</span>
                <span className="font-semibold text-[#58c28d]">
                  {metrics.bestPerGb.operator} ₹{metrics.bestPerGb.price}
                </span>
                <span className="text-xs text-zinc-500">
                  (₹{metrics.bestPerGb.costPerGB}/GB)
                </span>
              </div>
            )}
          </div>

          {loading && (
            <p className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Refreshing comparison…
            </p>
          )}

          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-200">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error} Showing the last known values.</span>
            </div>
          )}
        </div>
      </header>

      {/* Plan Cards Grid */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className={`grid gap-6 ${plans.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
          <AnimatePresence>
            {plans.map((plan, index) => {
              const isBestValue = metrics?.bestPerGb?._id === plan._id;
              const isCheapest = metrics?.cheapest?._id === plan._id;

              // Difference against the cheapest option in this comparison.
              const yearlyDiff = metrics?.cheapest
                ? Number(plan.yearlyCost) - Number(metrics.cheapest.yearlyCost)
                : 0;

              // Exclusive = only this plan among the selected ones offers the app.
              const exclusiveOtts = (plan.ottApps || []).filter(
                (app) => metrics?.ottCounts?.get(app) === 1
              );

              return (
                <motion.div
                  key={plan._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`relative flex flex-col overflow-hidden rounded-3xl border bg-[#1f1f1f] transition-all duration-300 hover:-translate-y-1 ${
                    isBestValue
                      ? 'border-[#58c28d]/50 shadow-[0_0_30px_rgba(88,194,141,0.10)] ring-1 ring-[#58c28d]/20'
                      : 'border-white/10 hover:border-[#58c28d]/30'
                  }`}
                >
                  {/* Best Value Ribbon */}
                  {isBestValue && (
                    <div className="absolute -right-12 top-6 z-10 rotate-45 bg-[#58c28d] px-12 py-1 text-[11px] font-bold uppercase tracking-widest text-[#181818] shadow-lg">
                      Best Value
                    </div>
                  )}

                  {/* Card Number Badge (Plan 1 / Plan 2 / Plan 3) */}
                  <div className="absolute left-5 top-5 z-10 rounded-lg border border-white/10 bg-[#181818]/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500 backdrop-blur-sm">
                    Plan {index + 1}
                  </div>

                  {/* Remove from comparison */}
                  <button
                    type="button"
                    onClick={() => removePlan(plan._id)}
                    aria-label={`Remove ${plan.operator} ₹${plan.price} from comparison`}
                    title="Remove from comparison"
                    className="absolute right-5 top-5 z-20 grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-[#181818]/80 text-zinc-500 backdrop-blur-sm transition hover:border-red-400/30 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* Hero Section */}
                  <div className="border-b border-white/10 p-5 pt-14 sm:p-6 sm:pt-14">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="inline-flex rounded-full bg-[#58c28d]/10 px-3 py-1 text-xs font-medium text-[#58c28d]">
                          {plan.operator}
                        </span>
                        <h2 className="mt-4 text-5xl font-bold tracking-tight text-white">₹{plan.price}</h2>
                        <p className="mt-1 text-sm text-zinc-400">{plan.validityDays} Days Validity</p>
                      </div>

                      {/* Cost Per GB */}
                      <div className="rounded-2xl border border-[#58c28d]/20 bg-[#58c28d]/10 px-4 py-3 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-400">Value</p>
                        <p className="mt-1 text-lg font-semibold text-[#58c28d]">
                          ₹{plan.costPerGB || '—'}/GB
                        </p>
                      </div>
                    </div>

                    {/* Difference against the cheapest yearly cost */}
                    {yearlyDiff > 0 && (
                      <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-400/10 bg-red-500/5 px-3 py-2 text-xs">
                        <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                        <span className="text-zinc-400">
                          ₹{yearlyDiff.toLocaleString('en-IN')}/year more than the cheapest plan
                        </span>
                      </div>
                    )}
                    {isCheapest && (
                      <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#58c28d]/10 bg-[#58c28d]/5 px-3 py-2 text-xs">
                        <Check className="h-3.5 w-3.5 text-[#58c28d]" />
                        <span className="text-[#58c28d]">Cheapest yearly cost</span>
                      </div>
                    )}
                  </div>

                  {/* Yearly Cost */}
                  <div className="px-5 pt-5 sm:px-6">
                    <div className="rounded-2xl bg-[#262626] p-4">
                      <p className="text-xs uppercase tracking-wider text-zinc-500">Estimated Yearly Cost</p>
                      <p className="mt-2 text-2xl font-bold text-white">
                        ₹{plan.yearlyCost || '—'}
                        <span className="text-base font-normal text-zinc-500">/year</span>
                      </p>
                      <p className="mt-1.5 text-xs text-zinc-500">
                        {plan.yearlyData
                          ? `${plan.yearlyData} GB over the year`
                          : 'Yearly data not available'}
                      </p>
                      {isBestValue && (
                        <p className="mt-1 text-xs text-[#58c28d]">Lowest cost per GB</p>
                      )}
                    </div>
                  </div>

                  {/* Benefits Breakdown */}
                  <div className="p-5 sm:p-6">
                    <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
                      Benefits
                    </h3>
                    <div className="space-y-2.5">
                      {/* Data */}
                      <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#262626]/50 px-3 py-2.5">
                        <div className="flex items-center gap-2.5 text-zinc-400">
                          <Database className="h-4 w-4 text-[#58c28d]" />
                          <span className="text-xs">{plan.dailyData ? 'Daily Data' : 'Total Data'}</span>
                        </div>
                        <span className="text-xs font-medium text-white">
                          {plan.dailyData ? `${plan.dailyData} GB/day` : `${plan.totalData} GB`}
                        </span>
                      </div>

                      {/* Yearly Data */}
                      <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#262626]/50 px-3 py-2.5">
                        <div className="flex items-center gap-2.5 text-zinc-400">
                          <TrendingDown className="h-4 w-4 text-[#58c28d]" />
                          <span className="text-xs">Yearly Data</span>
                        </div>
                        <span className="text-xs font-medium text-white">
                          {plan.yearlyData ? `${plan.yearlyData} GB` : '—'}
                        </span>
                      </div>

                      {/* Validity */}
                      <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#262626]/50 px-3 py-2.5">
                        <div className="flex items-center gap-2.5 text-zinc-400">
                          <CalendarDays className="h-4 w-4 text-[#58c28d]" />
                          <span className="text-xs">Validity</span>
                        </div>
                        <span className="text-xs font-medium text-white">{plan.validityDays} Days</span>
                      </div>

                      {/* Calls */}
                      <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#262626]/50 px-3 py-2.5">
                        <div className="flex items-center gap-2.5 text-zinc-400">
                          <Phone className="h-4 w-4 text-[#58c28d]" />
                          <span className="text-xs">Calls</span>
                        </div>
                        <span className="text-xs font-medium text-white">
                          {plan.isUnlimitedCalls ? 'Unlimited' : 'Limited'}
                        </span>
                      </div>

                      {/* SMS */}
                      <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#262626]/50 px-3 py-2.5">
                        <div className="flex items-center gap-2.5 text-zinc-400">
                          <MessageSquare className="h-4 w-4 text-[#58c28d]" />
                          <span className="text-xs">SMS</span>
                        </div>
                        <span className="text-xs font-medium text-white">
                          {plan.isUnlimitedSMS
                            ? 'Unlimited'
                            : plan.sms
                              ? `${plan.sms}/day`
                              : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* OTT Apps */}
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 mt-auto">
                    <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
                      OTT Benefits
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {plan.ottApps?.length > 0 ? (
                        plan.ottApps.map((ott) => {
                          const isExclusive = exclusiveOtts.includes(ott);
                          return (
                            <span
                              key={ott}
                              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs transition-all ${
                                isExclusive
                                  ? 'border-[#58c28d]/30 bg-[#58c28d]/15 text-[#dff6ea] ring-1 ring-[#58c28d]/20'
                                  : 'border-[#58c28d]/20 bg-[#58c28d]/10 text-[#dff6ea]'
                              }`}
                            >
                              {isExclusive ? (
                                <Star className="h-3 w-3 text-[#58c28d]" />
                              ) : (
                                <Sparkles className="h-3 w-3" />
                              )}
                              {ott}
                              {isExclusive && (
                                <span className="text-[9px] text-[#58c28d] ml-0.5">EXCLUSIVE</span>
                              )}
                            </span>
                          );
                        })
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#262626] px-3 py-2 text-xs text-zinc-400">
                          <X className="h-3 w-3" />
                          No OTT Benefits
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer CTA */}
                  <div className="border-t border-white/10 p-5 sm:p-6">
                    <Link
                      to={`/plans/${plan._id}`}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#262626] px-4 py-3 text-sm font-medium text-zinc-300 transition-all duration-300 hover:border-[#58c28d]/30 hover:bg-[#58c28d]/10 hover:text-white"
                    >
                      View Full Details
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Bottom actions */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {plans.length < MAX_COMPARE && (
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#58c28d]/30 bg-[#58c28d]/10 px-5 py-3 text-sm font-medium text-[#dff6ea] transition hover:bg-[#58c28d]/20"
            >
              <Plus className="h-4 w-4" />
              Add another plan ({MAX_COMPARE - plans.length} slot
              {MAX_COMPARE - plans.length > 1 ? 's' : ''} left)
            </Link>
          )}

          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#262626] px-5 py-3 text-sm text-zinc-400 transition hover:border-red-400/30 hover:text-red-400"
          >
            <X className="h-4 w-4" />
            Clear comparison
          </button>
        </div>
      </main>
    </div>
  );
};

export default Compare;
