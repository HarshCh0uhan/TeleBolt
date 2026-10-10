import React from "react";
import { useCompare } from "../context/CompareContext";
import FilterBar from "./FilterBar";
import FormatSelect from "./FormatSelect";
import { Crown, Medal, Award, Minus, ChevronUp } from "lucide-react";

const SLOT_ICONS = [Crown, Medal, Award];
const SLOT_COLORS = [
  "text-amber-300 border-amber-300/30 bg-amber-300/10",
  "text-zinc-200 border-zinc-300/30 bg-zinc-300/10",
  "text-orange-300 border-orange-400/30 bg-orange-400/10",
];

const DrawerSlot = ({ plan, index, onRemove, isHover }) => {
  const Icon = SLOT_ICONS[index] || SLOT_ICONS[2];
  const colorClass = SLOT_COLORS[index] || SLOT_COLORS[2];

  if (!plan) {
    return (
      <div
        className={`flex min-h-[92px] flex-col items-center justify-center rounded-2xl border border-dashed bg-[#1f1f1f]/60 p-3 text-center transition-all duration-200 ${
          isHover ? "border-[#58c28d]/60 ring-2 ring-[#58c28d]/40" : "border-white/15"
        }`}
      >
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Slot {index + 1}
        </p>
        <p className="mt-1 text-[11px] leading-4 text-zinc-500">
          Drag a plan here
        </p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col rounded-2xl border bg-[#1f1f1f] p-3 transition-all duration-200 ${
        isHover ? "border-[#58c28d]/60 ring-2 ring-[#58c28d]/40" : "border-white/10"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg border ${colorClass}`}>
          <Icon className="h-3 w-3" />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#58c28d]/10 px-2 py-0.5 text-[10px] font-medium text-[#58c28d]">
          {plan.operator}
        </span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          aria-label={`Remove ${plan.operator} ₹${plan.price}`}
          className="ml-auto grid h-6 w-6 shrink-0 place-items-center rounded-xl border border-white/10 bg-[#262626] text-zinc-400 transition hover:border-white/20 hover:text-white"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="mt-2 text-lg font-bold text-white">₹{plan.price}</p>
      <p className="text-[10px] text-zinc-400">{plan.validityDays} days</p>
    </div>
  );
};

const AdvancedDrawer = ({
  open,
  onClose,
  formats,
  format,
  onFormatChange,
  filters,
  onApplyFilters,
  onClearFilters,
}) => {
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
    <div
      className={`fixed left-0 right-0 top-16 z-40 border-b border-white/10 bg-[#181818]/98 backdrop-blur-md transition-transform duration-300 ${
        open ? "translate-y-0" : "-translate-y-[110%]"
      }`}
      aria-hidden={!open}
    >
      <div
        className="mx-auto max-w-7xl overflow-y-auto px-4 py-3 scrollbar-brand"
        style={{ maxHeight: "55vh" }}
      >
        <FilterBar
          filters={filters}
          onApply={onApplyFilters}
          onClear={onClearFilters}
          leadingSlot={
            <FormatSelect formats={formats} value={format} onChange={onFormatChange} />
          }
        />

        {/* Slots grid — centered inside the drawer */}
        <div className="mx-auto mt-3 grid max-w-3xl gap-3 sm:grid-cols-3">
          {slots.map((plan, index) => {
            const dropProps = {
              onDragOver: handleDragOver(index),
              onDragEnter: handleDragOver(index),
              onDragLeave: handleDragLeave(index),
              onDrop: handleDrop(index),
            };
            return (
              <div key={`drawer-slot-${index}`} {...dropProps}>
                <DrawerSlot
                  plan={plan}
                  index={index}
                  onRemove={removeFromSlot}
                  isHover={hoverIndex === index}
                />
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close panel"
        className={`absolute left-1/2 -bottom-4 grid h-8 w-8 -translate-x-1/2 place-items-center rounded-2xl border border-white/10 bg-[#1f1f1f] text-zinc-300 shadow-lg transition-all duration-300 hover:border-[#58c28d]/30 hover:text-white ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <ChevronUp className="h-4 w-4" />
      </button>
    </div>
  );
};

export default AdvancedDrawer;