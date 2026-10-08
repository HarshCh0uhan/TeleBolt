import { useNavigate } from "react-router-dom";
import { X, ArrowRight, Scale } from "lucide-react";
import { useCompare, MIN_COMPARE, MAX_COMPARE } from "../context/CompareContext";

const CompareBar = () => {
  const { selectedPlans, selectedCount, canCompare, removePlan, clearSelection, notice } =
    useCompare();
  const navigate = useNavigate();

  // Nothing selected yet – keep the page unobstructed.
  if (selectedCount === 0) return null;

  const remaining = MIN_COMPARE - selectedCount;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#1a1a1a]/95 backdrop-blur-md"
      // Keep clear of the iOS home indicator.
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto max-w-7xl px-4 py-3 sm:py-4">
        {/* Transient feedback, e.g. when the 3-plan limit is reached */}
        {notice && (
          <div
            role="status"
            className="mb-2 rounded-2xl border border-[#58c28d]/30 bg-[#58c28d]/10 px-4 py-2 text-xs text-[#dff6ea] sm:mb-3"
          >
            {notice}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left Section */}
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-base font-semibold text-white sm:text-lg">
              <Scale className="h-4 w-4 shrink-0 text-[#58c28d] sm:h-4.5 sm:w-4.5" />
              Compare Plans
            </h3>

            <p className="text-xs text-zinc-400 sm:text-sm">
              {canCompare
                ? `${selectedCount} of ${MAX_COMPARE} plans selected`
                : `${selectedCount} of ${MAX_COMPARE} selected — add ${remaining} more to compare`}
            </p>
          </div>

          {/*
            Selected Plans Preview
            One compact row that scrolls sideways on small screens instead of
            wrapping into a tall stack that would cover the page.
          */}
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0">
            {selectedPlans.map((plan) => (
              <div
                key={plan._id}
                className="flex shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-[#262626] px-3 py-2 sm:gap-3 sm:px-4 sm:py-3"
              >
                <div className="min-w-0">
                  <p className="whitespace-nowrap text-sm font-medium text-white">
                    {plan.operator} ₹{plan.price}
                  </p>

                  <p className="whitespace-nowrap text-xs text-zinc-500">
                    {plan.dailyData ? `${plan.dailyData} GB/day` : `${plan.totalData} GB`} •{' '}
                    {plan.validityDays} Days
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removePlan(plan._id)}
                  className="shrink-0 text-zinc-500 transition hover:text-red-400"
                  aria-label={`Remove ${plan.operator} ₹${plan.price} from comparison`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            {/* Hints for the empty slots until the minimum is reached */}
            {Array.from({ length: Math.max(0, MIN_COMPARE - selectedCount) }).map((_, index) => (
              <div
                key={`slot-${index}`}
                className="hidden shrink-0 items-center rounded-2xl border border-dashed border-white/10 px-4 py-3 text-xs text-zinc-600 sm:flex"
              >
                Select 1 more plan
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={clearSelection}
              className="shrink-0 rounded-2xl border border-white/10 bg-[#262626] px-4 py-3 text-sm text-zinc-400 transition hover:border-red-400/30 hover:text-red-400"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => navigate("/compare")}
              disabled={!canCompare}
              title={canCompare ? undefined : `Select at least ${MIN_COMPARE} plans to compare`}
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold transition sm:px-6 lg:w-auto ${
                canCompare
                  ? 'bg-[#58c28d] text-[#181818] hover:bg-[#6dd9a0]'
                  : 'cursor-not-allowed border border-white/10 bg-[#262626] text-zinc-500'
              }`}
            >
              Compare Now
              {canCompare && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareBar;
