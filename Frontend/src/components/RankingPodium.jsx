import React from "react";
import { Crown, Medal, Award, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { useCompare } from "../context/CompareContext";
import { useCanDrag } from "../hooks/useCanDrag";

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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: "easeOut" }}
      className={`relative flex flex-col overflow-hidden rounded-2xl border bg-[#1f1f1f] ${style.ring} ${style.glow}`}
    >
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
          aria-label={`Remove ${plan.operator} ₹${plan.price}`}
          className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-[#262626] text-zinc-400 transition hover:border-red-400/40 hover:text-red-400 sm:h-6 sm:w-6"
        >
          <Minus className="h-3 w-3" />
        </button>
      </div>

      <div className="p-4">
        <p className="break-words text-3xl font-bold tracking-tight text-white">
          ₹{plan.price}
        </p>
        <p className="mt-0.5 text-xs text-zinc-400">
          {plan.validityDays} days validity
        </p>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <div className="rounded-lg bg-[#262626] px-2 py-2">
            <p className="text-[9px] uppercase tracking-wider text-zinc-500">
              Data
            </p>
            <p className="mt-0.5 text-xs font-semibold text-white">
              {plan.totalData ? `${plan.totalData} GB` : "—"}
            </p>
          </div>
          <div className="rounded-lg bg-[#262626] px-2 py-2">
            <p className="text-[9px] uppercase tracking-wider text-zinc-500">
              ₹/GB
            </p>
            <p className="mt-0.5 text-xs font-semibold text-[#58c28d]">
              {plan.costPerGB ? `₹${plan.costPerGB}` : "—"}
            </p>
          </div>
          <div className="rounded-lg bg-[#262626] px-2 py-2">
            <p className="text-[9px] uppercase tracking-wider text-zinc-500">
              Yearly
            </p>
            <p className="mt-0.5 text-xs font-semibold text-white">
              {plan.yearlyCost ? `₹${plan.yearlyCost}` : "—"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const EmptySlot = ({ index, isHover }) => {
  const canDrag = useCanDrag();

  return (
    <div
      className={`flex h-full min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed bg-[#1f1f1f]/60 p-4 text-center transition-all duration-200 ${
        isHover ? "border-[#58c28d]/60 ring-2 ring-[#58c28d]/40" : "border-white/15"
      }`}
    >
      <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
        Slot {index + 1}
      </p>
      <p className="mt-2 text-xs leading-5 text-zinc-500">
        {canDrag ? "Drag a plan here" : "Tap Add to Compare on any plan"}
      </p>
    </div>
  );
};

const RankingPodium = () => {
  const { slots, removeFromSlot, assignToSlot, draggingPlan, setDraggingPlan } = useCompare();
  const [hoverIndex, setHoverIndex] = React.useState(null);

  const handleDrop = (index) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggingPlan) assignToSlot(draggingPlan, index);
    setDraggingPlan(null);
    setHoverIndex(null);
  };

  const handleDragOver = (index) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    if (hoverIndex !== index) setHoverIndex(index);
  };

  const handleDragLeave = (index) => (e) => {
    e.preventDefault();
    if (hoverIndex === index) setHoverIndex(null);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 scrollbar-brand sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
        {slots.map((plan, index) => {
          const dropProps = {
            onDragOver: handleDragOver(index),
            onDragEnter: handleDragOver(index),
            onDragLeave: handleDragLeave(index),
            onDrop: handleDrop(index),
          };

          if (plan) {
            return (
              <div
                key={`slot-${index}-${plan._id}`}
                className="w-[82%] shrink-0 snap-center sm:w-auto sm:shrink"
                {...dropProps}
              >
                <SlotCard plan={plan} index={index} onRemove={removeFromSlot} />
              </div>
            );
          }

          return (
            <div
              key={`empty-${index}`}
              className="w-[82%] shrink-0 snap-center sm:w-auto sm:shrink"
              {...dropProps}
            >
              <EmptySlot index={index} isHover={hoverIndex === index} />
            </div>
          );
        })}
      </div>
      <p className="mt-1 text-center text-[11px] text-zinc-600 sm:hidden">Swipe to see all slots</p>
    </div>
  );
};

export default RankingPodium;