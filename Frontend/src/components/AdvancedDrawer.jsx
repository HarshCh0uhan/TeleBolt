import { useCompare } from "../context/CompareContext";
import FilterBar from "./FilterBar";
import FormatSelect from "./FormatSelect";
import { Crown, Medal, Award, Minus } from "lucide-react";

const SLOT_ICONS = [Crown, Medal, Award];
const SLOT_COLORS = [
  "text-amber-300 border-amber-300/30 bg-amber-300/10",
  "text-zinc-200 border-zinc-300/30 bg-zinc-300/10",
  "text-orange-300 border-orange-400/30 bg-orange-400/10",
];

const DrawerSlot = ({ plan, index, onRemove }) => {
  const Icon = SLOT_ICONS[index] || SLOT_ICONS[2];
  const colorClass = SLOT_COLORS[index] || SLOT_COLORS[2];

  if (!plan) {
    return (
      <div className="flex min-h-[92px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[#1f1f1f]/60 p-3 text-center">
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
    <div className="flex flex-col rounded-2xl border border-white/10 bg-[#1f1f1f] p-3">
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
  formats,
  format,
  onFormatChange,
  filters,
  onApplyFilters,
  onClearFilters,
}) => {
  const { slots, removeFromSlot } = useCompare();

  return (
    <div
      className={`fixed left-0 right-0 top-16 z-40 border-b border-white/10 bg-[#181818]/98 backdrop-blur-md transition-transform duration-300 ${
        open ? "translate-y-0" : "-translate-y-full"
      }`}
      aria-hidden={!open}
    >
      <div className="mx-auto max-w-7xl overflow-y-auto px-4 py-4 scrollbar-brand" style={{ maxHeight: "55vh" }}>
        <FilterBar
          filters={filters}
          onApply={onApplyFilters}
          onClear={onClearFilters}
          leadingSlot={
            <FormatSelect formats={formats} value={format} onChange={onFormatChange} />
          }
        />

        {/* Comparison slots */}
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-zinc-500">
            Compare
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {slots.map((plan, index) => (
              <DrawerSlot
                key={`drawer-slot-${index}`}
                plan={plan}
                index={index}
                onRemove={removeFromSlot}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDrawer;