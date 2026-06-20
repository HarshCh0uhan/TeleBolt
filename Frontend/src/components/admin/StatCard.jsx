// `accent` is the signature touch: a thin bar whose width implies proportion
// (e.g. activePlans/totalPlans), instead of a generic icon-in-a-circle.
// Pass accent={null} to hide it (e.g. for counts with no natural denominator).
const StatCard = ({ label, value, valueClassName = "text-white", accent }) => (
  <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6">
    <p className="text-sm text-zinc-500">{label}</p>
    <h2 className={`mt-3 text-3xl font-bold ${valueClassName}`}>{value}</h2>

    {accent !== null && accent !== undefined && (
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-[#58c28d]"
          style={{ width: `${Math.min(100, Math.max(0, accent))}%` }}
        />
      </div>
    )}
  </div>
);

export default StatCard;