import React from "react";
import { Crown, Medal, Award, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { useCompare } from "../context/CompareContext";
import { Database, CalendarDays, Phone, MessageSquare, TrendingUp } from "lucide-react";

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

const SlotCard = ({ plan, index, onRemove, onDrop, isHover }) => {
  const style = SLOT_STYLES[index] || SLOT_STYLES[2];
  const Icon = style.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: "easeOut" }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(index);
      }}
      className={`relative flex flex-col overflow-hidden rounded-2xl border bg-[#1f1f1f] transition-all duration-200 ${style.ring} ${style.glow} ${
        isHover ? "ring-2 ring-[#58c28d]/60" : ""
      }`}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 border-b border-white/10 p-3">
        <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border ${style.iconBg}`}>
          <Icon className={`h-3.5 w-3.5 ${style.iconColor}`} />
        </div>
        <span className="rounded-full bg-[#58c28d]/10 px-2.5 py-0.5 text-xs font-medium text-[#58c28d]">
          {plan.operator}
        </span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          aria-label={`Remove ${plan.operator} ₹${plan.price} from comparison`}
          className="ml-auto grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-white/10 bg-[#262626] text-zinc-400 transition hover:border-red-400/40 hover:text-red-400"
        >
          <Minus className="h-3 w-3" />
        </button>
      </div>

      {/* Hero */}
      <div className="border-b border-white/10 p-4">
        <p className="text-[10px] uppercase tracking-wider text-zinc-500">
          {plan.category}
        </p>

        <p className="mt-2 break-words text-3xl font-bold tracking-tight text-white">
          ₹{plan.price}
        </p>

        <p className="mt-0.5 text-xs text-zinc-400">
          {plan.validityDays} days validity
        </p>
      </div>

      {/* Yearly Cost Block */}
      <div className="px-4 pt-4">
        <div className="rounded-2xl bg-[#262626] p-3">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">
            Estimated Yearly Cost
          </p>
          <p className="mt-1 break-words text-lg font-bold text-white">
            ₹{plan.yearlyCost || "—"}
            <span className="text-xs font-normal text-zinc-500">/year</span>
          </p>
        </div>
      </div>

      {/* Benefits Breakdown – same data as old code, new row style */}
      <div className="p-4">
        <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
          Benefits
        </h4>

        <div className="space-y-2.5">
          {/* Data (Daily or Total) */}
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#262626]/50 px-3 py-2.5">
            <div className="flex items-center gap-2.5 text-zinc-400">
              <Database className="h-4 w-4 shrink-0 text-[#58c28d]" />
              <span className="text-xs">
                {plan.dailyData ? "Daily Data" : "Total Data"}
              </span>
            </div>
            <span className="ml-2 shrink-0 text-xs font-medium text-white">
              {plan.dailyData ? `${plan.dailyData} GB/day` : `${plan.totalData} GB`}
            </span>
          </div>

          {/* Yearly Data (was missing in new design) */}
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#262626]/50 px-3 py-2.5">
            <div className="flex items-center gap-2.5 text-zinc-400">
              <TrendingUp className="h-4 w-4 shrink-0 text-[#58c28d]" />
              <span className="text-xs">Yearly Data</span>
            </div>
            <span className="ml-2 shrink-0 text-xs font-medium text-white">
              {plan.yearlyData ? `${plan.yearlyData} GB` : "--"}
            </span>
          </div>

          {/* Validity */}
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#262626]/50 px-3 py-2.5">
            <div className="flex items-center gap-2.5 text-zinc-400">
              <CalendarDays className="h-4 w-4 text-[#58c28d]" />
              <span className="text-xs">Validity</span>
            </div>
            <span className="text-xs font-medium text-white">{plan.validityDays} Days</span>
          </div>

          {/* Calls */}
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#262626]/50 px-3 py-2.5">
            <div className="flex items-center gap-2.5 text-zinc-400">
              <Phone className="h-4 w-4 text-[#58c28d]" />
              <span className="text-xs">Calls</span>
            </div>
            <span className="text-xs font-medium text-white">
              {plan.isUnlimitedCalls ? "Unlimited" : "Limited"}
            </span>
          </div>

          {/* SMS */}
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#262626]/50 px-3 py-2.5">
            <div className="flex items-center gap-2.5 text-zinc-400">
              <MessageSquare className="h-4 w-4 text-[#58c28d]" />
              <span className="text-xs">SMS</span>
            </div>
            <span className="text-xs font-medium text-white">
              {plan.isUnlimitedSMS
                ? "Unlimited"
                : plan.sms
                ? `${plan.sms}/day`
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const EmptySlot = ({ index, onDrop, isHover }) => (
  <div
    onDragOver={(e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    }}
    onDrop={(e) => {
      e.preventDefault();
      onDrop(index);
    }}
    className={`flex flex-col gap-4 rounded-2xl border border-dashed bg-[#1f1f1f]/60 p-4 text-center transition-all duration-200 ${
      isHover ? "border-[#58c28d]/60 ring-2 ring-[#58c28d]/40" : "border-white/15"
    }`}
  >
    <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
      Slot {index + 1}
    </p>
    <p className="mt-2 text-xs leading-5 text-zinc-500">
      Drag a plan here
    </p>
  </div>
);

const RankingPodium = () => {
  const { slots, removeFromSlot, assignToSlot, draggingPlan, setDraggingPlan } = useCompare();
  const [hoverIndex, setHoverIndex] = React.useState(null);

  const handleDrop = (index) => {
    if (draggingPlan) {
      assignToSlot(draggingPlan, index);
    }
    setDraggingPlan(null);
    setHoverIndex(null);
  };

  React.useEffect(() => {
    if (!draggingPlan) setHoverIndex(null);
  }, [draggingPlan]);

  return (
    <div className="mx-auto max-w-3xl">
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDragEnter={(e) => e.preventDefault()}
      >
        {slots.map((plan, index) =>
          plan ? (
            <div
              key={plan._id}
              onDragOver={() => setHoverIndex(index)}
              onDragLeave={() => setHoverIndex((cur) => (cur === index ? null : cur))}
            >
              <SlotCard
                plan={plan}
                index={index}
                onRemove={removeFromSlot}
                onDrop={handleDrop}
                isHover={hoverIndex === index}
              />
            </div>
          ) : (
            <div
              key={`empty-${index}`}
              onDragOver={() => setHoverIndex(index)}
              onDragLeave={() => setHoverIndex((cur) => (cur === index ? null : cur))}
            >
              <EmptySlot
                index={index}
                onDrop={handleDrop}
                isHover={hoverIndex === index}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default RankingPodium;