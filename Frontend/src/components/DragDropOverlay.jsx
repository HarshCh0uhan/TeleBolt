import { useCompare } from "../context/CompareContext";

/**
 * Fixed drop target that appears at the top of the viewport the moment a card
 * starts being dragged, and disappears when the drag ends. Renders on every
 * screen size, so the user always has an obvious, reachable place to drop a
 * card without scrolling back up to the podium.
 *
 * Every slot div carries `data-podium-slot={index}` — that is the attribute
 * DraggablePlanCard's drop lookup uses to find the target.
 */
const DragDropOverlay = () => {
  const { draggingPlan, slots } = useCompare();

  if (!draggingPlan) return null;

  return (
    <div className="fixed inset-x-0 top-16 z-[80] border-b border-[#58c28d]/40 bg-[#1f1f1f]/95 px-2 py-2 shadow-2xl backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center gap-2">
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-[#58c28d]">
          Drop:
        </span>
        <div className="grid flex-1 grid-cols-3 gap-1.5">
          {slots.map((plan, index) => (
            <div
              key={`drop-slot-${index}`}
              data-podium-slot={index}
              className="flex min-h-[52px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#58c28d]/60 bg-[#58c28d]/10 px-1 py-1.5 text-center"
            >
              <p className="text-[9px] uppercase tracking-wider text-[#58c28d]">
                Slot {index + 1}
              </p>
              <p className="mt-0.5 truncate text-[9px] font-medium text-white">
                {plan ? `${plan.operator} ₹${plan.price}` : "Empty"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DragDropOverlay;
