import { Crown, Medal, Award, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { useCompare } from "../context/CompareContext";

// Slot 1 -> crown, slot 2 -> silver, slot 3 -> bronze. Positional, regardless
// of what plan is currently in the slot.
const SLOT_STYLES = {
  0: {
    icon: Crown,
    ring: "border-amber-300/50",
    glow: "shadow-[0_0_36px_rgba(251,191,36,0.14)]",
    iconColor: "text-amber-300",
    iconBg: "border-amber-300/30 bg-amber-300/10",
  },
  1: {
    icon: Medal,
    ring: "border-zinc-300/40",
    glow: "",
    iconColor: "text-zinc-200",
    iconBg: "border-zinc-300/30 bg-zinc-300/10",
  },
  2: {
    icon: Award,
    ring: "border-orange-400/40",
    glow: "",
    iconColor: "text-orange-300",
    iconBg: "border-orange-400/30 bg-orange-400/10",
  },
};

const SlotCard = ({ plan, index, onRemove }) => {
  const style = SLOT_STYLES[index] || SLOT_STYLES[2];
  const Icon = style.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: "easeOut" }}
      className={`relative flex flex-col overflow-hidden rounded-2xl border bg-[#1f1f1f] ${style.ring} ${style.glow}`}
    >
      <div className="flex items-center gap-2 border-b border-white/10 p-3">
        <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border ${style.iconBg}`}>
          <Icon className={`h-3.5 w-3.5 ${style.iconColor}`} />
        </div>
        <span className="rounded-full bg-[#58c28d]/10 px-2.5 py-0.5 text-xs font-medium text-[#58c28d]">
          {plan.operator}
        </span>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-zinc-500">
          {plan.category}
        </span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          aria-label={`Remove ${plan.operator} ₹${plan.price} from comparison`}
          className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-white/10 bg-[#262626] text-zinc-400 transition hover:border-red-400/40 hover:text-red-400"
        >
          <Minus className="h-3 w-3" />
        </button>
      </div>

      <div className="p-3">
        <p className="break-words text-2xl font-bold tracking-tight text-white">
          ₹{plan.price}
        </p>
        <p className="mt-0.5 text-[11px] text-zinc-400">
          {plan.validityDays} days
        </p>

        <div className="mt-3 flex items-center justify-between rounded-xl bg-[#262626] px-3 py-2">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-zinc-500">Value</p>
            <p className="mt-0.5 text-sm font-semibold text-[#58c28d]">
              ₹{plan.costPerGB || "—"}/GB
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-wider text-zinc-500">Yearly</p>
            <p className="mt-0.5 text-sm font-semibold text-white">
              ₹{plan.yearlyCost || "—"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const EmptySlot = ({ index }) => (
  <div className="flex h-full min-h-[168px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[#1f1f1f]/60 p-4 text-center">
    <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
      Slot {index + 1}
    </p>
    <p className="mt-2 text-xs text-zinc-500">
      Hold a plan from below and drag it here to compare.
    </p>
  </div>
);

const RankingPodium = () => {
  const { slots, removeFromSlot } = useCompare();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {slots.map((plan, index) =>
        plan ? (
          <SlotCard key={`slot-${index}-${plan._id}`} plan={plan} index={index} onRemove={removeFromSlot} />
        ) : (
          <EmptySlot key={`empty-${index}`} index={index} />
        )
      )}
    </div>
  );
};

export default RankingPodium;