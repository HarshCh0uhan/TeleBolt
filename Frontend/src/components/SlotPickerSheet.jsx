import { useEffect } from "react";
import { X } from "lucide-react";
import { useCompare } from "../context/CompareContext";

const SlotPickerSheet = () => {
  const { slotPicker, closeSlotPicker, slots, assignToSlot } = useCompare();

  useEffect(() => {
    if (!slotPicker) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeSlotPicker();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [slotPicker, closeSlotPicker]);

  if (!slotPicker) return null;

  const choose = (index) => {
    assignToSlot(slotPicker, index);
    closeSlotPicker();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:px-4"
      onClick={closeSlotPicker}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose a podium slot"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl border border-white/10 bg-[#1f1f1f] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl shadow-black/50 sm:rounded-3xl sm:pb-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="break-words text-lg font-semibold text-white">
              Add {slotPicker.operator} ₹{slotPicker.price} to the podium
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Pick a slot to replace. The podium re-orders itself by score.
            </p>
          </div>
          <button
            type="button"
            onClick={closeSlotPicker}
            aria-label="Close"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-[#262626] text-zinc-300 transition hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-2.5">
          {slots.map((slot, index) => (
            <button
              key={index}
              type="button"
              onClick={() => choose(index)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#262626] px-4 py-3.5 text-left transition hover:border-[#58c28d]/40"
            >
              <span className="shrink-0 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                Slot {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                {slot ? `${slot.operator} ₹${slot.price} · ${slot.validityDays}d` : "Empty"}
              </span>
              <span className="shrink-0 text-xs font-medium text-[#58c28d]">
                {slot ? "Replace" : "Place here"}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={closeSlotPicker}
          className="mt-4 w-full rounded-2xl border border-white/10 bg-[#262626] px-4 py-3 text-sm text-zinc-300 transition hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SlotPickerSheet;