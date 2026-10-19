import { useRef, useState } from "react";
import PlanCard from "./PlanCard";
import { useCompare } from "../context/CompareContext";

// Pointer events instead of HTML5 drag. Works on mouse, trackpad, stylus and
// touch without any media-query gating. `touch-action: none` on the wrapper
// prevents the browser from stealing the gesture for scroll — the user can
// still scroll by starting their touch anywhere that is not a card.
const DraggablePlanCard = ({ plan, onDragStart, onDragEnd }) => {
  const { setDraggingPlan, assignToSlot } = useCompare();
  const [dragging, setDragging] = useState(false);
  const cardRef = useRef(null);
  const ghostRef = useRef(null);

  const beginDrag = (clientX, clientY) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const ghost = document.createElement("div");
    ghost.style.cssText = `
      position: fixed;
      width: ${rect.width}px;
      height: ${rect.height}px;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.85;
      transform: scale(0.6);
      transform-origin: top left;
      will-change: left, top;
    `;
    ghost.appendChild(card.cloneNode(true));
    document.body.appendChild(ghost);

    ghost.style.left = `${clientX - (rect.width * 0.6) / 2}px`;
    ghost.style.top = `${clientY - (rect.height * 0.6) / 2}px`;

    ghostRef.current = { el: ghost, offsetX: (rect.width * 0.6) / 2, offsetY: (rect.height * 0.6) / 2 };
    setDragging(true);
    setDraggingPlan(plan);
    onDragStart?.(plan);
  };

  const moveDrag = (clientX, clientY) => {
    const g = ghostRef.current;
    if (!g) return;
    g.el.style.left = `${clientX - g.offsetX}px`;
    g.el.style.top = `${clientY - g.offsetY}px`;
  };

  const finishDrag = (clientX, clientY) => {
    const g = ghostRef.current;
    if (g) {
      const target = document.elementFromPoint(clientX, clientY);
      const slotEl = target?.closest("[data-podium-slot]");
      if (slotEl) {
        const idx = Number(slotEl.dataset.podiumSlot);
        if (Number.isInteger(idx)) assignToSlot(plan, idx);
      }
      g.el.remove();
    }
    ghostRef.current = null;
    setDragging(false);
    setDraggingPlan(null);
    onDragEnd?.(plan);
  };

  const handlePointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.target.closest("button, a, input, textarea, select, [role='button']")) return;

    const pointerId = e.pointerId;
    const startX = e.clientX;
    const startY = e.clientY;
    let active = false;

    const onMove = (ev) => {
      if (ev.pointerId !== pointerId) return;
      if (!active) {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (Math.hypot(dx, dy) < 8) return;
        active = true;
        beginDrag(startX, startY);
      }
      if (active) {
        ev.preventDefault();
        moveDrag(ev.clientX, ev.clientY);
      }
    };

    const finish = (ev) => {
      if (ev.pointerId !== pointerId) return;
      if (active) finishDrag(ev.clientX, ev.clientY);
      cleanup();
    };

    const cleanup = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", finish);
      document.removeEventListener("pointercancel", finish);
    };

    document.addEventListener("pointermove", onMove, { passive: false });
    document.addEventListener("pointerup", finish);
    document.addEventListener("pointercancel", finish);
  };

  return (
    <div
      ref={cardRef}
      onPointerDown={handlePointerDown}
      style={{ touchAction: "none" }}
      className={`transition-opacity duration-150 ${
        dragging ? "cursor-grabbing opacity-40" : "cursor-grab"
      }`}
    >
      <PlanCard plan={plan} />
    </div>
  );
};

export default DraggablePlanCard;
