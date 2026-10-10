import { Link } from "react-router-dom";
import { Crown, Medal, Award, Check, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useCompare, MAX_COMPARE } from "../context/CompareContext";

// Rank 1 gets the crown, 2 the silver medal, 3 the bronze award.
const RANK_STYLES = {
  1: {
    icon: Crown,
    ring: "border-amber-300/50",
    glow: "shadow-[0_0_44px_rgba(251,191,36,0.16)]",
    iconColor: "text-amber-300",
    iconBg: "border-amber-300/30 bg-amber-300/10",
  },
  2: {
    icon: Medal,
    ring: "border-zinc-300/40",
    glow: "",
    iconColor: "text-zinc-200",
    iconBg: "border-zinc-300/30 bg-zinc-300/10",
  },
  3: {
    icon: Award,
    ring: "border-orange-400/40",
    glow: "",
    iconColor: "text-orange-300",
    iconBg: "border-orange-400/30 bg-orange-400/10",
  },
};

const RankingPodium = ({ plans = [] }) => {
  const { isSelected, isFull, togglePlan } = useCompare();

  if (plans.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan, index) => {
        const style = RANK_STYLES[index + 1] || RANK_STYLES[3];
        const Icon = style.icon;
        const selected = isSelected(plan._id);
        const selectionFull = isFull && !selected;

        return (
          <motion.div
            key={plan._id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.12, ease: "easeOut" }}
            className={`relative flex flex-col overflow-hidden rounded-3xl border bg-[#1f1f1f] transition-all duration-300 hover:-translate-y-1 ${style.ring} ${style.glow}`}
          >
            {/* Header — icon inline with operator so no top padding is wasted */}
            <div className="border-b border-white/10 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl border ${style.iconBg}`}>
                  <Icon className={`h-4 w-4 ${style.iconColor}`} />
                </div>
                <span className="rounded-full bg-[#58c28d]/10 px-2.5 py-0.5 text-xs font-medium text-[#58c28d]">
                  {plan.operator}
                </span>
                <span className="ml-auto text-[10px] uppercase tracking-wider text-zinc-500">
                  {plan.category}
                </span>
              </div>

              <p className="mt-3 break-words text-3xl font-bold tracking-tight text-white sm:text-4xl">
                ₹{plan.price}
              </p>
              <p className="mt-0.5 text-xs text-zinc-400">
                {plan.validityDays} days validity
              </p>
            </div>

            {/* Value + yearly cost on one compact row */}
            <div className="px-4 py-3 sm:px-5">
              <div className="flex items-center justify-between rounded-2xl bg-[#262626] px-4 py-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500">Value</p>
                  <p className="mt-0.5 text-sm font-semibold text-[#58c28d]">
                    ₹{plan.costPerGB || "—"}/GB
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500">Yearly</p>
                  <p className="mt-0.5 text-sm font-semibold text-white">
                    ₹{plan.yearlyCost || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto border-t border-white/10 p-4 sm:p-5">
              <div className="flex gap-2">
                <Link
                  to={`/plans/${plan._id}`}
                  className="flex flex-1 items-center justify-center rounded-2xl border border-white/10 bg-[#262626] px-4 py-2.5 text-xs font-medium text-zinc-300 transition hover:border-[#58c28d]/30 hover:text-white"
                >
                  Details
                </Link>
                <button
                  type="button"
                  onClick={() => togglePlan(plan)}
                  disabled={selectionFull}
                  title={selectionFull ? `You can compare up to ${MAX_COMPARE} plans` : undefined}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-semibold transition ${
                    selected
                      ? "border border-[#58c28d]/40 bg-[#58c28d]/15 text-[#dff6ea]"
                      : selectionFull
                      ? "cursor-not-allowed border border-white/10 bg-[#262626] text-zinc-500"
                      : "bg-[#58c28d] text-[#181818] hover:bg-[#6dd9a0]"
                  }`}
                >
                  {selected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  {selected ? "Added" : "Compare"}
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default RankingPodium;