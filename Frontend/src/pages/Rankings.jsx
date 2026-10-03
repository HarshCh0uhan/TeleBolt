import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Star, Check, Plus, CalendarDays, Database, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { getRankings } from '../api/plans.api';
import { useCompare, MAX_COMPARE } from '../context/CompareContext';

const OPERATORS = ['All', 'Jio', 'Airtel', 'VI'];
const CATEGORIES = ['All', 'Daily', 'Non-Daily'];

const medalClasses = {
  1: 'border-[#58c28d]/50 bg-[#58c28d]/10 text-[#58c28d]',
  2: 'border-zinc-400/40 bg-zinc-400/10 text-zinc-300',
  3: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
};

const medalLabels = { 1: '1st', 2: '2nd', 3: '3rd' };

const Rankings = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [operator, setOperator] = useState('All');
  const [category, setCategory] = useState('All');
  const { isSelected, isFull, togglePlan } = useCompare();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (operator !== 'All') params.operator = operator;
        if (category !== 'All') params.category = category;

        const { data } = await getRankings(params);
        if (cancelled) return;
        setRankings(data.rankings || []);
      } catch (err) {
        if (cancelled) return;
        setError(typeof err?.response?.data === 'string' ? err.response.data : 'Could not load rankings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [operator, category]);

  const podium = rankings.slice(0, 3);
  const rest = rankings.slice(3);

  const FilterChip = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition-all duration-300 ${
        active
          ? 'border-[#58c28d]/30 bg-[#58c28d]/15 text-[#dff6ea]'
          : 'border-white/10 bg-[#262626] text-zinc-400 hover:border-[#58c28d]/30 hover:text-white'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#181818]">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#58c28d]">Value leaderboard</p>
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight text-white">
              <Trophy className="h-7 w-7 text-[#58c28d]" />
              Rankings
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Every active plan sorted by its real cost per GB — the cheapest data wins.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {OPERATORS.map((op) => (
              <FilterChip key={op} active={operator === op} onClick={() => setOperator(op)}>
                {op}
              </FilterChip>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Category</span>
          {CATEGORIES.map((cat) => (
            <FilterChip key={cat} active={category === cat} onClick={() => setCategory(cat)}>
              {cat}
            </FilterChip>
          ))}
          {loading && <RefreshCw className="ml-2 h-4 w-4 animate-spin text-[#58c28d]" />}
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && rankings.length === 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-56 rounded-3xl bg-[#262626] animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && rankings.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-white/10 bg-[#1f1f1f] p-12 text-center">
            <Trophy className="mx-auto h-10 w-10 text-zinc-600" />
            <p className="mt-4 font-medium text-zinc-400">No ranked plans for this filter</p>
            <p className="mt-2 text-sm text-zinc-500">Try a different operator or category.</p>
          </div>
        )}

        {/* Podium */}
        {podium.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-8 grid gap-4 sm:grid-cols-3"
          >
            {podium.map((plan) => {
              const selected = isSelected(plan._id);
              const selectionFull = isFull && !selected;
              return (
                <div
                  key={plan._id}
                  className={`flex flex-col rounded-3xl border bg-[#1f1f1f] p-6 transition-all duration-300 hover:-translate-y-1 ${
                    plan.rank === 1 ? 'border-[#58c28d]/50 ring-1 ring-[#58c28d]/20' : 'border-white/10 hover:border-[#58c28d]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`rounded-xl border px-3 py-1 text-xs font-bold uppercase tracking-wider ${medalClasses[plan.rank] || medalClasses[3]}`}>
                      {medalLabels[plan.rank]}
                    </span>
                    <span className="rounded-full bg-[#58c28d]/10 px-3 py-1 text-xs font-medium text-[#58c28d]">
                      {plan.operator}
                    </span>
                  </div>

                  <div className="mt-5">
                    <p className="text-4xl font-bold tracking-tight text-white">₹{plan.price}</p>
                    <p className="mt-1 text-sm text-zinc-400">{plan.validityDays} days • {plan.category}</p>
                  </div>

                  <div className="mt-5 rounded-2xl bg-[#262626] p-4">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">Cost per GB</p>
                    <p className="mt-1 text-xl font-bold text-[#58c28d]">₹{plan.costPerGB}/GB</p>
                    <p className="mt-1 text-xs text-zinc-500">₹{plan.yearlyCost || '—'}/year</p>
                  </div>

                  <div className="mt-auto flex items-center gap-3 pt-5">
                    <Link
                      to={`/plans/${plan._id}`}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#262626] px-4 py-2.5 text-xs font-medium text-zinc-300 transition hover:border-[#58c28d]/30 hover:text-white"
                    >
                      Details
                    </Link>
                    <button
                      type="button"
                      onClick={() => togglePlan(plan)}
                      disabled={selectionFull}
                      title={selectionFull ? `You can compare up to ${MAX_COMPARE} plans` : undefined}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold transition ${
                        selected
                          ? 'border border-[#58c28d]/40 bg-[#58c28d]/15 text-[#dff6ea]'
                          : selectionFull
                          ? 'cursor-not-allowed border border-white/10 bg-[#262626] text-zinc-500'
                          : 'bg-[#58c28d] text-[#181818] hover:bg-[#6dd9a0]'
                      }`}
                    >
                      {selected ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Added
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" /> Compare
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Full list */}
        {rest.length > 0 && (
          <div className="mt-8 space-y-3">
            <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              Positions 4 – {rankings.length}
            </p>
            {rest.map((plan) => {
              const selected = isSelected(plan._id);
              const selectionFull = isFull && !selected;
              return (
                <div
                  key={plan._id}
                  className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#1f1f1f] p-4 transition-all duration-300 hover:border-[#58c28d]/30 sm:flex-row sm:items-center"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-[#262626] text-sm font-bold text-zinc-400">
                    #{plan.rank}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#58c28d]/10 px-3 py-0.5 text-xs font-medium text-[#58c28d]">{plan.operator}</span>
                      <span className="text-lg font-bold text-white">₹{plan.price}</span>
                      <span className="text-xs text-zinc-500">{plan.category}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                      <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5 text-[#58c28d]" />{plan.validityDays} days</span>
                      <span className="flex items-center gap-1"><Database className="h-3.5 w-3.5 text-[#58c28d]" />{plan.yearlyData ? `${plan.yearlyData} GB/yr` : '—'}</span>
                      <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-[#58c28d]" />₹{plan.costPerGB}/GB</span>
                      {plan.ottApps?.length > 0 && <span className="text-zinc-500">• {plan.ottApps.join(', ')}</span>}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500">Yearly</p>
                      <p className="text-sm font-semibold text-white">₹{plan.yearlyCost || '—'}</p>
                    </div>
                    <Link
                      to={`/plans/${plan._id}`}
                      className="rounded-xl border border-white/10 bg-[#262626] px-3.5 py-2 text-xs font-medium text-zinc-300 transition hover:border-[#58c28d]/30 hover:text-white"
                    >
                      Details
                    </Link>
                    <button
                      type="button"
                      onClick={() => togglePlan(plan)}
                      disabled={selectionFull}
                      title={selectionFull ? `You can compare up to ${MAX_COMPARE} plans` : undefined}
                      className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                        selected
                          ? 'border border-[#58c28d]/40 bg-[#58c28d]/15 text-[#dff6ea]'
                          : selectionFull
                          ? 'cursor-not-allowed border border-white/10 bg-[#262626] text-zinc-500'
                          : 'bg-[#58c28d] text-[#181818] hover:bg-[#6dd9a0]'
                      }`}
                    >
                      {selected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      {selected ? 'Added' : 'Compare'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rankings;
