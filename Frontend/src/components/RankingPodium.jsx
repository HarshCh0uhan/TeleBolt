import React from "react";
import { Crown, Medal, Award, Minus, ChevronDown, Phone, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCompare } from "../context/CompareContext";
import ShareButton from "./ShareButton";

const SLOT_STYLES = {
  0: {
    icon: Crown,
    ring: "border-amber-300/50",
    glow: "shadow-[0_0_24px_rgba(251,191,36,0.12)]",
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
  const [expanded, setExpanded] = React.useState(false);

  const rechargesPerYear = plan.validityDays ? Math.ceil(365 / plan.validityDays) : null;
  const hasScore = typeof plan.score === "number";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: "easeOut" }}
      className={`relative flex flex-col overflow-hidden rounded-xl border bg-[#1f1f1f] ${style.ring} ${style.glow}`}
    >
      <div className="flex items-center gap-1.5 border-b border-white/10 p-2">
        <div className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${style.iconBg}`}>
          <Icon className={`h-2.5 w-2.5 ${style.iconColor}`} />
        </div>
        <span className="rounded-full bg-[#58c28d]/10 px-2 py-0.5 text-[10px] font-medium text-[#58c28d]">
          {plan.operator}
        </span>
        {hasScore && <span className="text-[9px] text-zinc-500">{Math.round(plan.score * 100)}</span>}
        <div className="ml-auto flex items-center gap-1">
          <ShareButton planId={plan._id} operator={plan.operator} price={plan.price} compact />
          <button
            type="button"
            onClick={() => onRemove(index)}
            aria-label={`Remove ${plan.operator} ₹${plan.price}`}
            className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-white/10 bg-[#262626] text-zinc-400 transition hover:border-red-400/40 hover:text-red-400"
          >
            <Minus className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="p-2">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold tracking-tight text-white">₹{plan.price}</span>
          <span className="text-[10px] text-zinc-400">{plan.validityDays} days</span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] sm:hidden">
          <span className="text-zinc-300">{plan.totalData ? `${plan.totalData} GB` : "—"}</span>
          <span className="text-[#58c28d]">{plan.costPerGB ? `₹${plan.costPerGB}/GB` : "—"}</span>
          <span className="text-zinc-300">{plan.yearlyCost ? `₹${plan.yearlyCost}/yr` : "—"}</span>
        </div>

        <div className="mt-2 hidden grid-cols-3 gap-1 sm:grid">
          <div className="rounded bg-[#262626] px-1.5 py-1">
            <p className="text-[8px] uppercase tracking-wider text-zinc-500">Data</p>
            <p className="mt-0.5 truncate text-[10px] font-semibold text-white">
              {plan.totalData ? `${plan.totalData} GB` : "—"}
            </p>
          </div>
          <div className="rounded bg-[#262626] px-1.5 py-1">
            <p className="text-[8px] uppercase tracking-wider text-zinc-500">₹/GB</p>
            <p className="mt-0.5 truncate text-[10px] font-semibold text-[#58c28d]">
              {plan.costPerGB ? `₹${plan.costPerGB}` : "—"}
            </p>
          </div>
          <div className="rounded bg-[#262626] px-1.5 py-1">
            <p className="text-[8px] uppercase tracking-wider text-zinc-500">Yearly</p>
            <p className="mt-0.5 truncate text-[10px] font-semibold text-white">
              {plan.yearlyCost ? `₹${plan.yearlyCost}` : "—"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-1.5 flex h-6 w-full items-center justify-center gap-1 rounded-md border border-white/10 bg-[#262626] text-[10px] font-medium text-zinc-400 transition hover:border-[#58c28d]/30 hover:text-white sm:mt-2 sm:h-7"
        >
          {expanded ? "Show less" : "Show more"}
          <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/10"
          >
            <div className="space-y-1 p-2.5">
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-[#262626]/50 px-2 py-1.5">
                <span className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                  <Phone className="h-3 w-3 text-[#58c28d]" /> Calls
                </span>
                <span className="text-[10px] font-medium text-white">
                  {plan.isUnlimitedCalls ? "Unlimited" : "Limited"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-[#262626]/50 px-2 py-1.5">
                <span className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                  <MessageSquare className="h-3 w-3 text-[#58c28d]" /> SMS
                </span>
                <span className="text-[10px] font-medium text-white">
                  {plan.isUnlimitedSMS ? "Unlimited" : plan.sms ? `${plan.sms}/day` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-[#262626]/50 px-2 py-1.5">
                <span className="text-[10px] text-zinc-400">Daily data</span>
                <span className="text-[10px] font-medium text-white">
                  {plan.dailyData ? `${plan.dailyData} GB/day` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-[#262626]/50 px-2 py-1.5">
                <span className="text-[10px] text-zinc-400">Yearly data</span>
                <span className="text-[10px] font-medium text-white">
                  {plan.yearlyData ? `${plan.yearlyData} GB` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-[#262626]/50 px-2 py-1.5">
                <span className="text-[10px] text-zinc-400">Recharges/yr</span>
                <span className="text-[10px] font-medium text-white">{rechargesPerYear ?? "—"}</span>
              </div>
              {plan.ottApps?.length > 0 && (
                <div className="rounded-lg border border-white/5 bg-[#262626]/50 px-2 py-1.5">
                  <span className="text-[10px] text-zinc-400">OTT</span>
                  <p className="mt-0.5 break-words text-[10px] font-medium text-white">
                    {plan.ottApps.join(", ")}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const EmptySlot = ({ index }) => (
  <div className="flex h-full min-h-[70px] flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-[#1f1f1f]/60 p-2 text-center transition-all duration-200 sm:min-h-[130px] sm:p-3">
    <p className="text-[9px] uppercase tracking-[0.24em] text-zinc-500">Slot {index + 1}</p>
    <p className="mt-0.5 text-[10px] leading-4 text-zinc-500 sm:mt-1">Drag a plan here</p>
  </div>
);

const RankingPodium = () => {
  const { slots, removeFromSlot } = useCompare();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {slots.map((plan, index) => (
          <div
            key={plan ? `slot-${index}-${plan._id}` : `empty-${index}`}
            data-podium-slot={index}
          >
            {plan ? (
              <SlotCard plan={plan} index={index} onRemove={removeFromSlot} />
            ) : (
              <EmptySlot index={index} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankingPodium;
