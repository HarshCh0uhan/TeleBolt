import { useRef, useState } from "react";
import PlanCard from "./PlanCard";

// Wraps a PlanCard so it can be picked up and dragged onto a podium slot.
// Drag only activates after a short hold. A quick click does nothing.
const HOLD_MS = 250;

const DraggablePlanCard = ({ plan, onDragStart, onDragEnd }) => {
  const [armed, setArmed] = useState(false);
  const holdTimer = useRef(null);
  const armedRef = useRef(false);

  const clearHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    armedRef.current = false;
    setArmed(false);
  };

  const handlePointerDown = () => {
    clearHold();
    holdTimer.current = setTimeout(() => {
      armedRef.current = true;
      setArmed(true);
    }, HOLD_MS);
  };

  const handleDragStart = (e) => {
    if (!armedRef.current) {
      e.preventDefault();
      return;
    }

    // Small green pill as the drag preview, so the card visibly shrinks.
    const ghost = document.createElement("div");
    ghost.textContent = `${plan.operator} · ₹${plan.price}`;
    ghost.style.cssText =
      "position:absolute;top:-1000px;left:-1000px;padding:6px 12px;" +
      "background:#58c28d;color:#181818;border-radius:9999px;font-size:12px;" +
      "font-weight:600;font-family:system-ui,sans-serif;";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", plan._id);
    setTimeout(() => ghost.remove(), 0);

    onDragStart?.(plan);
  };

  const handleDragEnd = () => {
    clearHold();
    onDragEnd?.(plan);
  };

  return (
    <div
      draggable
      onPointerDown={handlePointerDown}
      onPointerUp={clearHold}
      onPointerLeave={clearHold}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`transition-opacity duration-200 ${armed ? "cursor-grab opacity-70 active:cursor-grabbing" : "cursor-pointer"}`}
    >
      <PlanCard plan={plan} />
    </div>
  );
};

export default DraggablePlanCard;