import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Database, TrendingUp, ArrowRight, ArrowLeftRight, Check, Plus, Heart, Bell, BellRing, ExternalLink } from "lucide-react";
import { useCompare } from "../context/CompareContext";
import { useAuth } from "../context/AuthContext";
import StarRating from "./StarRating";
import ShareButton from "./ShareButton";
import { getAlertForPlan, toggleAlert } from "../api/notifications.api";

const OPERATOR_HOME = {
  Jio: "https://www.jio.com/selfcare/plans/mobility/prepaid-plans-list/",
  Airtel: "https://www.airtel.in/recharge/prepaid/",
  VI: "https://www.myvi.in/prepaid/unlimited-calls-and-data-plans",
  BSNL: "https://bsnl.co.in/en/mobile/recharge",
};

const PlanCard = ({ plan }) => {
  const { isSelected, isFull, togglePlan, openSlotPicker } = useCompare();
  const { user, isFavoritePlan, toggleFavorite } = useAuth();

  const [alerting, setAlerting] = useState(false);
  const [busy, setBusy] = useState(false);

  const selected = isSelected(plan._id);
  const favorite = isFavoritePlan(plan._id);
  // Derived: a guest is never alerting, regardless of what `alerting` holds.
  const showAlerting = Boolean(user) && alerting;

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    getAlertForPlan(plan._id)
      .then(({ data }) => {
        if (!cancelled) setAlerting(Boolean(data.alert));
      })
      .catch(() => {
        if (!cancelled) setAlerting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, plan._id]);

  const handleAlertToggle = async () => {
    if (!user || busy) return;
    setBusy(true);
    try {
      const { data } = await toggleAlert(plan._id);
      setAlerting(Boolean(data.isActive));
    } catch {
      // Silent — the button state simply does not change.
    } finally {
      setBusy(false);
    }
  };

  const handleCompareClick = () => {
    if (selected || !isFull) togglePlan(plan);
    else openSlotPicker(plan);
  };

  const sourceUrl = plan.sourceUrl || OPERATOR_HOME[plan.operator] || "#";

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-3xl border bg-[#1f1f1f] transition-all duration-300 hover:-translate-y-1 ${
        selected
          ? "border-[#58c28d]/50 ring-1 ring-[#58c28d]/30"
          : "border-white/10 hover:border-[#58c28d]/30"
      }`}
    >
      <Link to={`/plans/${plan._id}`}>
        <div className="border-b border-white/10 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="inline-flex max-w-full rounded-full bg-[#58c28d]/10 px-3 py-1 text-xs font-medium text-[#58c28d]">
                {plan.operator}
              </span>
              {plan.ratingCount > 0 && (
                <div className="mt-2">
                  <StarRating value={plan.ratingAvg} showCount count={plan.ratingCount} />
                </div>
              )}
              <h3 className="mt-4 break-words text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                ₹{plan.price}
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                {plan.validityDays} Days Validity
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <div className="rounded-2xl border border-[#58c28d]/20 bg-[#58c28d]/10 px-3 py-2 text-center">
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">Value</p>
                <p className="mt-1 break-words text-sm font-semibold text-[#58c28d]">
                  ₹{plan.costPerGB || "--"}/GB
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {user && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAlertToggle();
                    }}
                    disabled={busy}
                    aria-label={showAlerting ? "Stop alerting me" : "Alert me on changes"}
                    title={showAlerting ? "Alerting you on changes" : "Alert me on changes"}
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition ${
                      showAlerting
                        ? "border-[#58c28d]/40 bg-[#58c28d]/15 text-[#58c28d]"
                        : "border-white/10 bg-[#262626] text-zinc-400 hover:border-[#58c28d]/30 hover:text-white"
                    } disabled:opacity-60`}
                  >
                    {showAlerting ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                  </button>
                )}
                <ShareButton planId={plan._id} operator={plan.operator} price={plan.price} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 pb-0 sm:p-5 sm:pb-0">
          <div className="rounded-2xl bg-[#262626] p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Estimated Yearly Cost
            </p>
            <p className="mt-2 break-words text-xl font-bold text-white">
              ₹{plan.yearlyCost || "--"}
              <span className="text-sm font-normal text-zinc-500">/year</span>
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
            Benefits
          </h4>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#262626]/50 px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2.5 text-zinc-400">
                <Database className="h-4 w-4 shrink-0 text-[#58c28d]" />
                <span className="text-xs">
                  {plan.dailyData ? "Daily Data" : "Total Data"}
                </span>
              </div>
              <span className="ml-2 shrink-0 text-xs font-medium text-white">
                {plan.dailyData ? `${plan.dailyData} GB/day` : `${plan.totalData} GB`}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#262626]/50 px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2.5 text-zinc-400">
                <TrendingUp className="h-4 w-4 shrink-0 text-[#58c28d]" />
                <span className="text-xs">Yearly Data</span>
              </div>
              <span className="ml-2 shrink-0 text-xs font-medium text-white">
                {plan.yearlyData ? `${plan.yearlyData} GB` : "--"}
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div className="mt-auto space-y-3 border-t border-white/10 p-4 sm:p-5">
        {user ? (
          <button
            type="button"
            onClick={() => toggleFavorite(plan._id)}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-300 ${
              favorite
                ? "border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/15"
                : "border-white/10 bg-[#262626] text-zinc-300 hover:border-[#58c28d]/30 hover:text-white"
            }`}
          >
            <Heart className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} />
            {favorite ? "Saved Plan" : "Save Plan"}
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
          onClick={handleCompareClick}
          aria-pressed={selected}
          className={`group/btn flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
            selected
              ? "border border-[#58c28d]/40 bg-[#58c28d]/15 text-[#dff6ea] hover:bg-[#58c28d]/25"
              : isFull
                ? "border border-[#58c28d]/30 bg-[#58c28d]/10 text-[#dff6ea] hover:bg-[#58c28d]/20"
                : "bg-[#58c28d] text-[#181818] hover:bg-[#6dd9a0]"
          }`}
        >
          {selected ? (
            <>
              <Check className="h-4 w-4" />
              Selected for Compare
            </>
          ) : isFull ? (
            <>
              <ArrowLeftRight className="h-4 w-4" />
              Swap into Podium
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add to Compare
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
            </>
          )}
        </button>

        <a
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#262626] px-4 py-3 text-xs font-medium text-zinc-400 transition-all duration-300 hover:border-[#58c28d]/30 hover:text-white"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View on {plan.operator}
        </a>
      </div>
    </article>
  );
};

export default PlanCard;
