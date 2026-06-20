import { Link } from "react-router-dom";

const PlanCard = ({ plan }) => {
  return (
    
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-[#1f1f1f] transition-all duration-300 hover:-translate-y-1 hover:border-[#58c28d]/30">
      <Link
        to={`/plans/${plan._id}`}
        className="rounded-2xl border border-white/10 px-4 py-3 text-white transition hover:border-[#58c28d]/30"
      >
        {/* Header */}
        <div className="border-b border-white/10 p-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex rounded-full bg-[#58c28d]/10 px-3 py-1 text-xs font-medium text-[#58c28d]">
                {plan.operator}
              </span>

              <h3 className="mt-3 text-3xl font-bold text-white">
                ₹{plan.price}
              </h3>

              <p className="mt-1 text-sm text-zinc-400">
                {plan.validityDays} Days Validity
              </p>
            </div>

            {/* Cost Per GB */}
            <div className="rounded-xl border border-[#58c28d]/20 bg-[#58c28d]/10 px-3 py-2 text-center">
              <p className="text-[10px] uppercase tracking-wider text-zinc-400">
                Value
              </p>

              <p className="text-sm font-semibold text-[#58c28d]">
                ₹{plan.costPerGB || "--"}/GB
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-5 p-5">
          {/* Yearly Price */}
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Estimated Yearly Cost
            </p>

            <p className="mt-2 text-xl font-semibold text-zinc-200">
              ₹{plan.yearlyCost || "--"}/year
            </p>
          </div>

          {/* Data */}
          <div className="rounded-2xl bg-[#262626] p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              {plan.dailyData ? "Daily Data" : "Total Data"}
            </p>

            <p className="mt-2 text-lg font-semibold text-white">
              {plan.dailyData
                ? `${plan.dailyData} GB/day`
                : `${plan.totalData} GB Total`}
            </p>
          </div>

          {/* Total Yearly Data */}
          <div className="rounded-2xl bg-[#262626] p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Yearly Data
            </p>

            <p className="mt-2 text-lg font-semibold text-white">
              {plan.yearlyData
                ? `${plan.yearlyData} GB`
                : "--"}
            </p>
          </div>
        </div>
      </Link>
      {/* Footer */}
      <div className="border-t border-white/10 p-5">
        <div className="flex gap-3">
          <button className="flex-1 rounded-2xl bg-[#58c28d] px-4 py-3 font-semibold text-black transition hover:brightness-110">
            Add to Compare
          </button>
        </div>
      </div>
    </article>
  );
};

export default PlanCard;