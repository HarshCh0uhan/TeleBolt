import { Link, useParams } from "react-router-dom";
import { getSinglePlan } from "../api/plans.api";
import { useEffect, useState } from "react";
import PriceHistoryChart from "./PriceHistoryChart";
import { Heart, Bell, BellRing, ExternalLink } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ReviewSection from "./ReviewSection";
import ShareButton from "./ShareButton";
import { getAlertForPlan, toggleAlert } from "../api/notifications.api";
import { BSNL_CIRCLE_NOTE_LONG } from "../utils/bsnlInfo";

const OPERATOR_HOME = {
  Jio: "https://www.jio.com/selfcare/plans/mobility/prepaid-plans-list/",
  Airtel: "https://www.airtel.in/recharge/prepaid/",
  VI: "https://www.myvi.in/prepaid/unlimited-calls-and-data-plans",
  BSNL: "https://bsnl.co.in/en/mobile/recharge",
};

const PlanDetails = () => {
  const [plan, setPlan] = useState(null)
  const [alerting, setAlerting] = useState(false)
  const [alertBusy, setAlertBusy] = useState(false)
  const { planid } = useParams();
  const { user, isFavoritePlan, toggleFavorite } = useAuth();

  useEffect(() => {
    let cancelled = false;
    getSinglePlan(planid)
      .then(({ data }) => {
        if (!cancelled) setPlan(data.plan);
      })
      .catch((err) => {
        console.error(err?.response?.data);
      });
    return () => {
      cancelled = true;
    };
  }, [planid]);

  useEffect(() => {
    if (!user || !plan?._id) return undefined;
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
  }, [user, plan?._id]);

  const handleAlertToggle = async () => {
    if (!user || !plan || alertBusy) return;
    setAlertBusy(true);
    try {
      const { data } = await toggleAlert(plan._id);
      setAlerting(Boolean(data.isActive));
    } catch {
      // Silent.
    } finally {
      setAlertBusy(false);
    }
  };

  // Derived: guest or missing plan is never alerting.
  const showAlerting = Boolean(user) && Boolean(plan) && alerting;

  if (!plan) {
    return (
      <div className="min-h-[60vh] bg-[#181818] flex items-center justify-center px-4 py-16 text-center text-white sm:py-0">
        Plan not found
      </div>
    );
  }

  const sourceUrl = plan.sourceUrl || OPERATOR_HOME[plan.operator] || "#";

  return (
    <div className="min-h-screen bg-[#181818]">
      <div className="border-b border-white/10 bg-[#1f1f1f]">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
          <Link
            to="/"
            className="text-sm text-zinc-500 transition hover:text-[#58c28d]"
          >
            ← Back to Plans
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-5 sm:p-8">
          <div className="min-w-0">
            <span className="inline-flex max-w-full rounded-full bg-[#58c28d]/10 px-3 py-1 text-xs font-medium text-[#58c28d]">
              {plan.operator}
            </span>

            <h1 className="mt-4 break-words text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              ₹{plan.price}
            </h1>

            <p className="mt-2 text-zinc-400">
              {plan.validityDays} Days Validity
            </p>

            {plan.operator === "BSNL" && (
              <p className="mt-2 text-xs text-zinc-500">
                {BSNL_CIRCLE_NOTE_LONG}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {user ? (
                <button
                  type="button"
                  onClick={() => toggleFavorite(plan._id)}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
                    isFavoritePlan(plan._id)
                      ? "border-red-400/30 bg-red-500/10 text-red-300"
                      : "border-white/10 bg-[#262626] text-zinc-300 hover:border-[#58c28d]/30 hover:text-white"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isFavoritePlan(plan._id) ? "fill-current" : ""}`} />
                  {isFavoritePlan(plan._id) ? "Saved Plan" : "Save Plan"}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#262626] px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-[#58c28d]/30 hover:text-white"
                >
                  <Heart className="h-4 w-4" />
                  Login to Save
                </Link>
              )}

              {user && (
                <button
                  type="button"
                  onClick={handleAlertToggle}
                  disabled={alertBusy}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition disabled:opacity-60 ${
                    showAlerting
                      ? "border-[#58c28d]/40 bg-[#58c28d]/15 text-[#dff6ea]"
                      : "border-white/10 bg-[#262626] text-zinc-300 hover:border-[#58c28d]/30 hover:text-white"
                  }`}
                >
                  {showAlerting ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                  {showAlerting ? "Alerting you" : "Alert me"}
                </button>
              )}

              <ShareButton planId={plan._id} operator={plan.operator} price={plan.price} />

              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#262626] px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-[#58c28d]/30 hover:text-white"
              >
                <ExternalLink className="h-4 w-4" />
                View on {plan.operator}
              </a>
            </div>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="mb-5 text-xl font-semibold text-white sm:text-2xl">
            Current Benefits
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-[#1f1f1f] p-4 sm:p-5">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Daily Data
              </p>
              <p className="mt-3 text-lg font-semibold text-white">
                {plan.dailyData ? plan.dailyData + " GB/day" : "N/A"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#1f1f1f] p-4 sm:p-5">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                SMS
              </p>
              <p className="mt-3 text-lg font-semibold text-white">
                {plan.sms ? `${plan.sms}/day` : plan.isUnlimitedSMS ? "Unlimited" : 'N/A'}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#1f1f1f] p-4 sm:p-5">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Calling
              </p>
              <p className="mt-3 text-lg font-semibold text-white">
                {plan.isUnlimitedCalls ? "Unlimited" : "No"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#1f1f1f] p-4 sm:p-5">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                OTT
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {plan.ottApps.length ? plan.ottApps.map((ott) => (
                  <span key={ott} className="max-w-full break-words rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-300">
                    {ott}
                  </span>
                )) :
                  <span className="rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-300">
                    N/A
                  </span>}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-[#1f1f1f] p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            Yearly Normalization
          </h2>

          <p className="mt-2 text-zinc-400">
            TeleBolt estimates what you would spend and receive over a full
            year if you continuously recharge this plan.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="rounded-2xl bg-[#262626] p-4 sm:p-5">
              <p className="text-sm text-zinc-500">Recharges Needed</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {Math.ceil(365/plan.validityDays)}
              </p>
            </div>

            <div className="rounded-2xl bg-[#262626] p-4 sm:p-5">
              <p className="text-sm text-zinc-500">Total Yearly Cost</p>
              <p className="mt-2 break-words text-2xl font-bold text-[#58c28d]">
                ₹{plan.yearlyCost}
              </p>
            </div>

            <div className="rounded-2xl bg-[#262626] p-4 sm:p-5">
              <p className="text-sm text-zinc-500">Total Yearly Data</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {plan.yearlyData} GB
              </p>
            </div>

            <div className="rounded-2xl bg-[#262626] p-4 sm:p-5">
              <p className="text-sm text-zinc-500">Cost / GB</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {plan.costPerGB ? `₹${plan.costPerGB}` : "N/A"}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-[#1f1f1f] p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">Price History</h2>
          <p className="mt-2 text-zinc-400">
            Track how this plan's price has changed over time.
          </p>

          <div className="mt-6">
            <PriceHistoryChart planId={plan?._id} />
          </div>
        </section>

        <ReviewSection planId={plan._id} />
      </div>
    </div>
  );
};

export default PlanDetails;
