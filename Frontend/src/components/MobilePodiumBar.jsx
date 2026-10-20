import { X, Plus } from "lucide-react";
import { PODIUM_SIZE, useCompare } from "../context/CompareContext";

const MobilePodiumBar = ({ visible, onView }) => {
  const { slots, removeFromSlot, filledCount, draggingPlan } = useCompare();

  const isDragActive = Boolean(draggingPlan);
  const showBar = (visible || isDragActive) && (filledCount > 0 || isDragActive);

  if (!showBar) return null;

  return (
    <div
      data-mobile-podium-drop="true"
      className={`fixed inset-x-0 bottom-0 z-40 border-t px-3 pb-[calc(0.625rem+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-md transition-colors duration-200 lg:hidden ${
        isDragActive
          ? "border-[#58c28d]/60 bg-[#58c28d]/20"
          : "border-white/10 bg-[#1f1f1f]/95"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto [scrollbar-width:none]">
          {isDragActive && filledCount === 0 ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-[#dff6ea]">
              <Plus className="h-3.5 w-3.5" />
              Drop here to add to podium
            </span>
          ) : (
            slots.map((plan, index) =>
              plan ? (
                <span
                  key={plan._id}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#58c28d]/25 bg-[#58c28d]/10 py-1 pl-2.5 pr-1 text-xs font-medium text-[#dff6ea]"
                >
                  {plan.operator} ₹{plan.price}
                  <button
                    type="button"
                    onClick={() => removeFromSlot(index)}
                    aria-label={`Remove ${plan.operator} ₹${plan.price}`}
                    className="grid h-6 w-6 place-items-center rounded-lg text-zinc-300 transition hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null
            )
          )}
        </div>
        <button
          type="button"
          onClick={onView}
          className="shrink-0 rounded-xl bg-[#58c28d] px-3.5 py-2 text-xs font-semibold text-[#181818] transition hover:brightness-110"
        >
          View podium {filledCount}/{PODIUM_SIZE}
        </button>
      </div>
    </div>
  );
};

export default MobilePodiumBar;
