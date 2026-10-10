import { useRef, useState } from "react";
import PlanCard from "./PlanCard";
import { useCompare } from "../context/CompareContext";

// Drag activates on press-and-move. The card visually disappears from the grid
// and a scaled-down clone of it follows the cursor. The cursor is anchored to
// the centre of the scaled clone.
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
      clone.style.transformOrigin = "top left";
      clone.style.transform = "scale(0.4)";
      clone.style.position = "absolute";
      clone.style.top = "-10000px";
      clone.style.left = "-10000px";
      clone.style.pointerEvents = "none";
      clone.style.opacity = "0.96";
      document.body.appendChild(clone);

      // getBoundingClientRect reflects the post-transform size, so half of it
      // puts the cursor at the visual centre of the scaled clone.
      const rect = clone.getBoundingClientRect();
      const offsetX = Math.max(1, Math.round(rect.width / 2));
      const offsetY = Math.max(1, Math.round(rect.height / 2));
      e.dataTransfer.setDragImage(clone, offsetX, offsetY);

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