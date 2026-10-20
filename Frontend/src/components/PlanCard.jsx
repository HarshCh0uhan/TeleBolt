import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Database, TrendingUp, Heart, Bell, BellRing, ExternalLink } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import StarRating from "./StarRating";
import ShareButton from "./ShareButton";
import { getAlertForPlan, toggleAlert } from "../api/notifications.api";
import { BSNL_CIRCLE_NOTE_SHORT } from "../utils/bsnlInfo";

const OPERATOR_HOME = {
  Jio: "https://www.jio.com/selfcare/plans/mobility/prepaid-plans-list/",
  Airtel: "https://www.airtel.in/recharge/prepaid/",
  VI: "https://www.myvi.in/prepaid/unlimited-calls-and-data-plans",
  BSNL: "https://bsnl.co.in/en/mobile/recharge",
};

const PlanCard = ({ plan }) => {
  const { user, isFavoritePlan, toggleFavorite } = useAuth();

  const [alerting, setAlerting] = useState(false);
  const [busy, setBusy] = useState(false);

  const favorite = isFavoritePlan(plan._id);
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

  const sourceUrl = plan.sourceUrl || OPERATOR_HOME[plan.operator] || "#";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1f1f1f] transition-all duration-300 hover:-translate-y-1 hover:border-[#58c28d]/30 sm:rounded-3xl">
      <Link to={`/plans/${plan._id}`}>
        <div className="border-b border-white/10 p-2.5 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="inline-flex max-w-full rounded-full bg-[#58c28d]/10 px-2 py-0.5 text-[10px] font-medium text-[#58c28d] sm:px-3 sm:py-1 sm:text-xs">
                {plan.operator}
              </span>
              {plan.ratingCount > 0 && (
                <div className="mt-1 hidden sm:mt-2 sm:block">
                  <StarRating value={plan.ratingAvg} showCount count={plan.ratingCount} />
                </div>
              )}
              <h3 className="mt-1.5 break-words text-xl font-bold tracking-tight text-white sm:mt-4 sm:text-4xl lg:text-5xl">
                ₹{plan.price}
              </h3>
              <p className="mt-0.5 text-[10px] text-zinc-400 sm:mt-1 sm:text-sm">
                {plan.validityDays} Days
                <span className="hidden sm:inline"> Validity</span>
              </p>
              {plan.operator === "BSNL" && (
                <p className="mt-0.5 text-[9px] text-zinc-500 sm:text-[11px]">
                  {BSNL_CIRCLE_NOTE_SHORT}
                </p>
              )}
            </div>

            <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
              <div className="rounded-2xl border border-[#58c28d]/20 bg-[#58c28d]/10 px-3 py-2 text-center">
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">Value</p>
                <p className="mt-1 text-sm font-semibold text-[#58c28d]">
                  ₹{plan.costPerGB || "--"}/GB
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-2.5 pb-0 sm:p-5 sm:pb-0">
          <div className="rounded-xl bg-[#262626] p-2 sm:rounded-2xl sm:p-4">
            <p className="text-[9px] uppercase tracking-wider text-zinc-500 sm:text-xs">
              Yearly Cost
            </p>
            <p className="mt-0.5 break-words text-sm font-bold text-white sm:mt-2 sm:text-xl">
              ₹{plan.yearlyCost || "--"}
              <span className="hidden text-sm font-normal text-zinc-500 sm:inline">/year</span>
            </p>
          </div>
        </div>

        <div className="p-2.5 sm:p-5">
          <div className="space-y-1 sm:space-y-2.5">
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-[#262626]/50 px-1.5 py-1 sm:rounded-xl sm:px-3 sm:py-2.5">
              <div className="flex min-w-0 items-center gap-1 text-zinc-400 sm:gap-2.5">
                <Database className="h-3 w-3 shrink-0 text-[#58c28d] sm:h-4 sm:w-4" />
                <span className="truncate text-[10px] sm:text-xs">
                  {plan.dailyData ? "Daily" : "Total"}
                </span>
              </div>
              <span className="ml-1 shrink-0 text-[10px] font-medium text-white sm:text-xs">
                {plan.dailyData ? `${plan.dailyData}GB` : `${plan.totalData}GB`}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-[#262626]/50 px-1.5 py-1 sm:hidden">
              <div className="flex items-center gap-1 text-zinc-400">
                <TrendingUp className="h-3 w-3 shrink-0 text-[#58c28d]" />
                <span className="text-[10px]">₹/GB</span>
              </div>
              <span className="ml-1 text-[10px] font-medium text-[#58c28d]">
                ₹{plan.costPerGB || "--"}
              </span>
            </div>
            <div className="hidden items-center justify-between rounded-xl border border-white/5 bg-[#262626]/50 px-3 py-2.5 sm:flex">
              <div className="flex items-center gap-2.5 text-zinc-400">
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

      <div className="mt-auto border-t border-white/10 p-2 sm:p-5">
        {/* Mobile: icon-only row */}
        <div className="flex items-center gap-1 sm:hidden">
          {user ? (
            <button
              type="button"
              onClick={() => toggleFavorite(plan._id)}
              aria-label={favorite ? "Unsave plan" : "Save plan"}
              className={`grid h-8 flex-1 place-items-center rounded-lg border transition ${
                favorite
                  ? "border-red-400/30 bg-red-500/10 text-red-300"
                  : "border-white/10 bg-[#262626] text-zinc-300"
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${favorite ? "fill-current" : ""}`} />
            </button>
          ) : (
            <Link
              to="/login"
              aria-label="Login to save"
              className="grid h-8 flex-1 place-items-center rounded-lg border border-white/10 bg-[#262626] text-zinc-300"
            >
              <Heart className="h-3.5 w-3.5" />
            </Link>
          )}
          {user && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAlertToggle();
              }}
              disabled={busy}
              aria-label={showAlerting ? "Stop alerting me" : "Alert me"}
              className={`grid h-8 flex-1 place-items-center rounded-lg border transition disabled:opacity-60 ${
                showAlerting
                  ? "border-[#58c28d]/40 bg-[#58c28d]/15 text-[#58c28d]"
                  : "border-white/10 bg-[#262626] text-zinc-400"
              }`}
            >
              {showAlerting ? <BellRing className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
            </button>
          )}
          <ShareButton
            planId={plan._id}
            operator={plan.operator}
            price={plan.price}
            compact
            className="!h-8 !w-8"
          />
        </div>

        {/* Desktop: stacked buttons with text */}
        <div className="hidden space-y-3 sm:block">
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
      </div>
    </article>
  );
};

export default PlanCard;
