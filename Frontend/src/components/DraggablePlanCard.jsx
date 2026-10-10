import { useRef, useState } from "react";
import PlanCard from "./PlanCard";
import { useCompare } from "../context/CompareContext";

// Drag activates on press-and-move. A quick click does nothing. While dragging,
// the original card hides and a small scaled-down clone follows the cursor.
const DraggablePlanCard = ({ plan, onDragStart, onDragEnd }) => {
  const [dragging, setDragging] = useState(false);
  const wrapperRef = useRef(null);
  const { setDraggingPlan } = useCompare();

  const handleDragStart = (e) => {
    const card = wrapperRef.current?.querySelector("article");
    if (card) {
      const clone = card.cloneNode(true);
      const width = card.offsetWidth || 280;
      clone.style.width = `${width}px`;
      clone.style.transform = "scale(0.4)";
      clone.style.transformOrigin = "top left";
      clone.style.position = "absolute";
      clone.style.top = "-10000px";
      clone.style.left = "-10000px";
      clone.style.pointerEvents = "none";
      clone.style.opacity = "0.95";
      document.body.appendChild(clone);
      // Anchor the preview so the cursor sits near its top-left.
      e.dataTransfer.setDragImage(clone, 30, 40);
      setTimeout(() => clone.remove(), 0);
    }

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", plan._id);

    setDragging(true);
    setDraggingPlan(plan);
    onDragStart?.(plan);
  };

  const handleDragEnd = () => {
    setDragging(false);
    setDraggingPlan(null);
    onDragEnd?.(plan);
  };

  return (
    <div
      ref={wrapperRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`transition-opacity duration-150 ${
        dragging ? "cursor-grabbing opacity-0" : "cursor-grab"
      }`}
    >
      <PlanCard plan={plan} />
    </div>
  );
};

export default DraggablePlanCard;