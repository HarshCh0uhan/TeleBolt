import { Link, useParams } from "react-router-dom";
import mockPlans from "../data/mockPlans";
import { getSinglePlan } from "../api/plans.api";
import { useEffect, useState } from "react";

const PlanDetails = () => {
  const [plan, setPlan] = useState(null)
  const { planid } = useParams();
  

  const fetchPlan = async () => {
    try {
      const {data} = await getSinglePlan(planid);
      setPlan(data.plan)    
    } catch (err) {
      console.error(err?.response?.data?.err);
    }
  }

  useEffect(() => {
    fetchPlan()
  }, [])

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center text-white">
        Plan not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818]">
      {/* Breadcrumb */}
      <div className="border-b border-white/10 bg-[#1f1f1f]">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link
            to="/"
            className="text-sm text-zinc-500 transition hover:text-[#58c28d]"
          >
            ← Back to Plans
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Hero Section */}
        <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-[#58c28d]/10 px-3 py-1 text-xs font-medium text-[#58c28d]">
                {plan.operator}
              </span>

              <h1 className="mt-4 text-5xl font-bold text-white">
                ₹{plan.price}
              </h1>

              <p className="mt-2 text-zinc-400">
                {plan.validityDays} Days Validity
              </p>
            </div>

            {/* Value Metrics */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* <div className="rounded-2xl border border-white/10 bg-[#262626] p-4">
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  Yearly Cost
                </p>

                <p className="mt-2 text-xl font-semibold text-[#58c28d]">
                  ₹{plan.yearlyCost}
                </p>
              </div> */}
              <div className="rounded-2xl border border-white/10 bg-[#262626] p-4">
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  Total Data
                </p>

                <p className="mt-2 text-xl font-semibold text-[#58c28d]">
                  {plan.totalData}
                </p>
              </div>

              {/* <div className="rounded-2xl border border-white/10 bg-[#262626] p-4">
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  Yearly Data
                </p>

                <p className="mt-2 text-xl font-semibold text-white">
                  {plan.yearlyData} GB
                </p>
              </div> */}

              <div className="rounded-2xl border border-white/10 bg-[#262626] p-4">
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  Cost / GB
                </p>

                <p className="mt-2 text-xl font-semibold text-white">
                  ₹{plan.costPerGB}/GB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Benefits */}
        <section className="mt-8">
          <h2 className="mb-5 text-2xl font-semibold text-white">
            Current Benefits
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-[#1f1f1f] p-5">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Daily Data
              </p>

              <p className="mt-3 text-lg font-semibold text-white">
                {plan.dailyData ? plan.dailyData + " GB/day" : "N/A"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#1f1f1f] p-5">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                SMS
              </p>

              <p className="mt-3 text-lg font-semibold text-white">
                {plan.sms}/day
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#1f1f1f] p-5">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Calling
              </p>

              <p className="mt-3 text-lg font-semibold text-white">
                {plan.isUnlimitedCalls ? "Unlimited" : "No"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#1f1f1f] p-5">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                OTT
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                  {plan.ottApps.length ? plan.ottApps.map((ott) => (
                    <span key={ott} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-300">
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

        {/* Yearly Normalization */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-[#1f1f1f] p-6">
          <h2 className="text-2xl font-semibold text-white">
            Yearly Normalization
          </h2>

          <p className="mt-2 text-zinc-400">
            TeleBolt estimates what you would spend and receive over a full
            year if you continuously recharge this plan.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-[#262626] p-5">
              <p className="text-sm text-zinc-500">
                Recharges Needed
              </p>

              <p className="mt-2 text-2xl font-bold text-white">
                {Math.ceil(365/plan.validityDays)}
              </p>
            </div>

            <div className="rounded-2xl bg-[#262626] p-5">
              <p className="text-sm text-zinc-500">
                Total Yearly Cost
              </p>

              <p className="mt-2 text-2xl font-bold text-[#58c28d]">
                ₹{plan.yearlyCost}
              </p>
            </div>

            <div className="rounded-2xl bg-[#262626] p-5">
              <p className="text-sm text-zinc-500">
                Total Yearly Data
              </p>

              <p className="mt-2 text-2xl font-bold text-white">
                {plan.yearlyData} GB
              </p>
            </div>
          </div>

          {/* TODO:
              Use backend yearlyCost
              Use backend yearlyData
              Show recharge multiplier calculation
          */}
        </section>

        {/* Price History */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-[#1f1f1f] p-6">
          <h2 className="text-2xl font-semibold text-white">
            Price History
          </h2>

          <div className="mt-6 flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#262626]">
            <div className="text-center">
              <p className="font-medium text-zinc-400">
                Price Trend Chart
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Future sparkline / chart goes here
              </p>
            </div>
          </div>

          {/* TODO:
              Fetch price history
              Add sparkline chart
              Add expandable history table
          */}
        </section>

        {/* Detected Changes */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-[#1f1f1f] p-6">
          <h2 className="text-2xl font-semibold text-white">
            Detected Changes
          </h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">
                    Price Change
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    ₹279 → ₹299
                  </p>
                </div>

                <span className="rounded-full bg-[#58c28d]/10 px-3 py-1 text-xs font-medium text-[#58c28d]">
                  Approved
                </span>
              </div>
            </div>
          </div>

          {/* TODO:
              Load detected changes
          */}
        </section>
      </div>
    </div>
  );
};

export default PlanDetails;