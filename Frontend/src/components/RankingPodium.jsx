import React from "react";
import { Crown, Medal, Award, Minus, X, ChevronDown, Phone, MessageSquare } from "lucide-react";
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

// On mobile the podium reads left-to-right as 2nd · 1st · 3rd, so the best plan sits
// in the centre column and the two runners-up flank it. The value is the real slot
// index in the CompareContext slots array (which is already sorted by score).
const MOBILE_VISUAL_ORDER = [1, 0, 2];

const compactData = (plan) => {
  if (plan.dailyData) return `${plan.dailyData}GB/d`;
  if (plan.totalData) return `${plan.totalData}GB`;
  return "—";
};

/* ─────────────────────────── MOBILE COMPACT CARD ─────────────────────────── */

const MobileSlotCard = ({ plan, index, onOpen, onRemove }) => {
  const style = SLOT_STYLES[index] || SLOT_STYLES[2];
  const Icon = style.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`relative min-h-[88px] overflow-hidden rounded-xl border bg-[#1f1f1f] ${style.ring} ${style.glow}`}
    >
      <button
        type="button"
        onClick={() => onOpen(plan)}
        aria-label={`Open ${plan.operator} ₹${plan.price} details`}
        className="block w-full p-2 text-left active:bg-[#262626]"
      >
        <div className="flex items-center justify-between">
          <div className={`grid h-5 w-5 place-items-center rounded-md border ${style.iconBg}`}>
            <Icon className={`h-2.5 w-2.5 ${style.iconColor}`} />
          </div>
          <div className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-wide text-[#58c28d]">
          {plan.operator}
        </p>
        <p className="mt-0.5 truncate text-lg font-bold leading-none text-white">₹{plan.price}</p>
        <p className="mt-1 truncate text-[9px] leading-none text-zinc-500">
          {plan.validityDays}d · {compactData(plan)}
        </p>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        aria-label={`Remove ${plan.operator} ₹${plan.price}`}
        className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-md text-zinc-500 active:text-red-400"
      >
        <X className="h-3 w-3" />
      </button>
    </motion.div>
  );
};

const MobileEmptySlot = () => (
  <div className="flex min-h-[88px] items-center justify-center rounded-xl border border-dashed border-white/15 bg-[#1f1f1f]/60">
    <span className="text-[10px] text-zinc-600">—</span>
  </div>
);

/* ───────────────────────── DETAILS BOTTOM SHEET ───────────────────────── */

const SheetRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-center justify-between rounded-lg border border-white/5 bg-[#262626]/60 px-3 py-2">
    <span className="flex items-center gap-2 text-xs text-zinc-400">
      {Icon ? <Icon className="h-3.5 w-3.5 text-[#58c28d]" /> : null}
      {label}
    </span>
    <span className="text-xs font-medium text-white">{value}</span>
  </div>
);

const PodiumDetailsSheet = ({ plan, onClose }) => {
  if (!plan) return null;
  const rechargesPerYear = plan.validityDays ? Math.ceil(365 / plan.validityDays) : null;

  return (
    <div className="fixed inset-0 z-[100] sm:hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 300 }}
        className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[#1f1f1f] px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 shadow-2xl"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />

        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-block rounded-full bg-[#58c28d]/10 px-2 py-0.5 text-[10px] font-medium text-[#58c28d]">
              {plan.operator}
            </span>
            <p className="mt-1 text-2xl font-bold tracking-tight text-white">₹{plan.price}</p>
            <p className="text-xs text-zinc-400">{plan.validityDays} days validity</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-[#262626] text-zinc-400 transition hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <SheetRow
            icon={Phone}
            label="Calls"
            value={plan.isUnlimitedCalls ? "Unlimited" : "Limited"}
          />
          <SheetRow
            icon={MessageSquare}
            label="SMS"
            value={plan.isUnlimitedSMS ? "Unlimited" : plan.sms ? `${plan.sms}/day` : "—"}
          />
          <SheetRow label="Daily data" value={plan.dailyData ? `${plan.dailyData} GB/day` : "—"} />
          <SheetRow label="Total data" value={plan.totalData ? `${plan.totalData} GB` : "—"} />
          <SheetRow label="Yearly data" value={plan.yearlyData ? `${plan.yearlyData} GB` : "—"} />
          <SheetRow label="₹/GB" value={plan.costPerGB ? `₹${plan.costPerGB}` : "—"} />
          <SheetRow label="Yearly cost" value={plan.yearlyCost ? `₹${plan.yearlyCost}` : "—"} />
          <SheetRow label="Recharges/yr" value={rechargesPerYear ?? "—"} />
          {plan.ottApps?.length > 0 ? (
            <SheetRow label="OTT" value={plan.ottApps.join(", ")} />
          ) : null}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <a
            href={`/plans/${plan._id}`}
            className="flex-1 rounded-xl bg-[#58c28d] px-4 py-2.5 text-center text-sm font-semibold text-[#181818] transition hover:brightness-110"
          >
            Open full page
          </a>
          <ShareButton planId={plan._id} operator={plan.operator} price={plan.price} compact />
        </div>
      </motion.div>
    </div>
  );
};

/* ──────────────────────── DESKTOP CARD (unchanged) ─────────────────────── */

const DesktopSlotCard = ({ plan, index, onRemove }) => {
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

        <div className="mt-2 grid grid-cols-3 gap-1">
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
          className="mt-2 flex h-7 w-full items-center justify-center gap-1 rounded-md border border-white/10 bg-[#262626] text-[10px] font-medium text-zinc-400 transition hover:border-[#58c28d]/30 hover:text-white"
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

const DesktopEmptySlot = ({ index }) => (
  <div className="flex h-full min-h-[70px] flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-[#1f1f1f]/60 p-2 text-center transition-all duration-200 sm:min-h-[130px] sm:p-3">
    <p className="text-[9px] uppercase tracking-[0.24em] text-zinc-500">Slot {index + 1}</p>
    <p className="mt-0.5 text-[10px] leading-4 text-zinc-500 sm:mt-1">Drag a plan here</p>
  </div>
);

/* ───────────────────────────── MAIN COMPONENT ───────────────────────────── */

const RankingPodium = () => {
  const { slots, removeFromSlot } = useCompare();
  const [sheetPlan, setSheetPlan] = React.useState(null);

  const handleRemove = (index) => {
    const removed = slots[index];
    removeFromSlot(index);
    if (sheetPlan && removed && sheetPlan._id === removed._id) setSheetPlan(null);
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* MOBILE — stepped 3-up, 1st place in the centre and raised */}
      <div className="grid grid-cols-3 items-end gap-1.5 sm:hidden">
        {MOBILE_VISUAL_ORDER.map((slotIdx, visualIdx) => {
          const plan = slots[slotIdx];
          const isCenter = visualIdx === 1;
          return (
            <div
              key={plan?._id || `mobile-empty-${slotIdx}`}
              data-podium-slot={slotIdx}
              className={isCenter ? "-translate-y-3" : ""}
            >
              {plan ? (
                <MobileSlotCard
                  plan={plan}
                  index={slotIdx}
                  onOpen={setSheetPlan}
                  onRemove={handleRemove}
                />
              ) : (
                <MobileEmptySlot />
              )}
            </div>
          );
        })}
      </div>

      {/* TABLET / DESKTOP — unchanged behaviour */}
      <div className="hidden sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {slots.map((plan, index) => (
          <div
            key={plan ? `slot-${index}-${plan._id}` : `desktop-empty-${index}`}
            data-podium-slot={index}
          >
            {plan ? (
              <DesktopSlotCard plan={plan} index={index} onRemove={removeFromSlot} />
            ) : (
              <DesktopEmptySlot index={index} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {sheetPlan && (
          <PodiumDetailsSheet plan={sheetPlan} onClose={() => setSheetPlan(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default RankingPodium;
