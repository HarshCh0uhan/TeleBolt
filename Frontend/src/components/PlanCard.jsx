import { Link } from "react-router-dom";
import { Database, TrendingUp, ArrowRight, Check, Plus, Heart } from 'lucide-react';
import { useCompare, MAX_COMPARE } from "../context/CompareContext";
import { useAuth } from "../context/AuthContext";

const PlanCard = ({ plan }) => {
  const { isSelected, isFull, togglePlan } = useCompare();
  const { user, isFavoritePlan, toggleFavorite } = useAuth();

  const selected = isSelected(plan._id);
  const selectionFull = isFull && !selected;
  const favorite = isFavoritePlan(plan._id);

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-3xl border bg-[#1f1f1f] transition-all duration-300 hover:-translate-y-1 ${
        selected
          ? 'border-[#58c28d]/50 ring-1 ring-[#58c28d]/30'
          : 'border-white/10 hover:border-[#58c28d]/30'
      }`}
    >
      <Link
        to={`/plans/${plan._id}`}
      >
        {/* Hero Section */}
        <div className="border-b border-white/10 p-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex rounded-full bg-[#58c28d]/10 px-3 py-1 text-xs font-medium text-[#58c28d]">
                {plan.operator}
              </span>
              <h3 className="mt-4 text-4xl font-bold tracking-tight text-white">
                ₹{plan.price}
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                {plan.validityDays} Days Validity
              </p>
            </div>

            {/* Value Metric */}
            <div className="rounded-2xl border border-[#58c28d]/20 bg-[#58c28d]/10 px-3 py-2 text-center">
              <p className="text-[10px] uppercase tracking-wider text-zinc-400">Value</p>
              <p className="mt-1 text-sm font-semibold text-[#58c28d]">
                ₹{plan.costPerGB || "--"}/GB
              </p>
            </div>
          </div>
        </div>

        {/* Yearly Cost Block */}
        <div className="p-5 pb-0">
          <div className="rounded-2xl bg-[#262626] p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Estimated Yearly Cost
            </p>
            <p className="mt-2 text-xl font-bold text-white">
              ₹{plan.yearlyCost || "--"}<span className="text-sm font-normal text-zinc-500">/year</span>
            </p>
          </div>
        </div>

        {/* Benefits Breakdown – same data as old code, new row style */}
        <div className="p-5">
          <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
            Benefits
          </h4>

          <div className="space-y-2.5">
            {/* Data (Daily or Total) */}
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#262626]/50 px-3 py-2.5">
              <div className="flex items-center gap-2.5 text-zinc-400">
                <Database className="h-4 w-4 text-[#58c28d]" />
                <span className="text-xs">
                  {plan.dailyData ? "Daily Data" : "Total Data"}
                </span>
              </div>
              <span className="text-xs font-medium text-white">
                {plan.dailyData ? `${plan.dailyData} GB/day` : `${plan.totalData} GB`}
              </span>
            </div>

            {/* Yearly Data (was missing in new design) */}
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#262626]/50 px-3 py-2.5">
              <div className="flex items-center gap-2.5 text-zinc-400">
                <TrendingUp className="h-4 w-4 text-[#58c28d]" />
                <span className="text-xs">Yearly Data</span>
              </div>
              <span className="text-xs font-medium text-white">
                {plan.yearlyData ? `${plan.yearlyData} GB` : "--"}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Footer – compare selection */}
      <div className="mt-auto space-y-3 border-t border-white/10 p-5">
        {user ? (
          <button
            type="button"
            onClick={() => toggleFavorite(plan._id)}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-300 ${
              favorite
                ? 'border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/15'
                : 'border-white/10 bg-[#262626] text-zinc-300 hover:border-[#58c28d]/30 hover:text-white'
            }`}
          >
            <Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
            {favorite ? 'Saved Plan' : 'Save Plan'}
          </button>
        ) : (
          <Link
            to="/login"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#262626] px-4 py-3 text-sm font-semibold text-zinc-300 transition-all duration-300 hover:border-[#58c28d]/30 hover:text-white"
          >
            <Heart className="h-4 w-4" />
            Login to Save
          </Link>
        )}
        <button
          type="button"
          onClick={() => togglePlan(plan)}
          disabled={selectionFull}
          aria-pressed={selected}
          title={selectionFull ? `You can compare up to ${MAX_COMPARE} plans` : undefined}
          className={`group/btn flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
            selected
              ? 'border border-[#58c28d]/40 bg-[#58c28d]/15 text-[#dff6ea] hover:bg-[#58c28d]/25'
              : selectionFull
                ? 'cursor-not-allowed border border-white/10 bg-[#262626] text-zinc-500'
                : 'bg-[#58c28d] text-[#181818] hover:bg-[#6dd9a0]'
          }`}
        >
          {selected ? (
            <>
              <Check className="h-4 w-4" />
              Selected for Compare
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              {selectionFull ? `Compare list full (${MAX_COMPARE})` : 'Add to Compare'}
              {!selectionFull && (
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
              )}
            </>
          )}
        </button>
      </div>
    </article>
  );
};

export default PlanCard;
