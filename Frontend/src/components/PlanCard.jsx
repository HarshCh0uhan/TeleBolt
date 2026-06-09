

const PlanCard = ({plan, onTrack}) => {
  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-[#1f1f1f] transition-all duration-300 hover:border-[#58c28d]/30 hover:-translate-y-1">
      {/* Header */}
      <div className="border-b border-white/10 p-5">
        <div className="flex items-start justify-between">
          <div>
            {/* TODO: operator */}
            <span className="inline-flex rounded-full bg-[#58c28d]/10 px-3 py-1 text-xs font-medium text-[#58c28d]">
              {plan.operator}
            </span>

            <h3 className="mt-3 text-2xl font-bold text-white">
              ₹{plan.price}
            </h3>

            <p className="mt-1 text-sm text-zinc-400">
              {plan.validityDays} Days Validity
            </p>
          </div>

          {/* TODO: Best Value badge */}
          <div className="rounded-xl border border-[#58c28d]/20 bg-[#58c28d]/10 px-3 py-2 text-xs font-medium text-[#58c28d]">
            Popular
          </div>
        </div>
      </div>

      {/* Main Details */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-[#262626] p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              {plan.dailyData ? "Daily Data" : "Total Data"}
            </p>

            {/* TODO: dailyData */}
            <p className="mt-2 text-lg font-semibold text-white">
                {plan.dailyData
                ? `${plan.dailyData} GB/day`
                : `${plan.totalData} GB Total`}
            </p>
          </div>

          <div className="rounded-2xl bg-[#262626] p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              SMS
            </p>

            {/* TODO: sms */}
            <p className="mt-2 text-lg font-semibold text-white">
              {plan.sms || "N/A"}
            </p>
          </div>
        </div>

        {/* Calls */}
        <div className="mt-4 rounded-2xl bg-[#262626] p-4">
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            Calling
          </p>

          {/* TODO: isUnlimitedCalls */}
          <p className="mt-2 text-lg font-semibold text-white">
            {plan.isUnlimitedCalls
            ? "Unlimited Calls"
            : "No Calling Benefits"}
          </p>
        </div>

        {/* OTT */}
        <div className="mt-5">
          <p className="mb-3 text-xs uppercase tracking-wider text-zinc-500">
            OTT Benefits
          </p>

          <div className="flex flex-wrap gap-2">
            {/* TODO: map ottApps */}
              {(plan.ottApps.length) ? plan.ottApps.map((ott) => (
                <span
                key={ott}
                className="rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-300"
                >
                {ott}
                </span>
              )) : 
            <span className="text-sm text-zinc-500">
                No OTT Benefits
            </span>}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 p-5">
        <div className="flex gap-3">
          <button className="flex-1 rounded-2xl bg-[#58c28d] px-4 py-3 font-semibold text-black transition hover:brightness-110">
            Compare
          </button>

          {/* <button onClick={onTrack} className="rounded-2xl border border-white/10 px-4 py-3 text-white transition hover:border-[#58c28d]/30">
            Track
          </button> */}
        </div>

        {/* TODO:
            Handle navigation to plan details page
        */}

        {/* TODO:
            Handle compare selection
        */}

        {/* TODO:
            Show compare selected state
        */}
      </div>
    </article>
  );
}

export default PlanCard