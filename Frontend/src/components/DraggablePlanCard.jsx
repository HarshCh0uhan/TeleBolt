import { useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import PlanCard from "./PlanCard";
import { useCompare } from "../context/CompareContext";

/**
 * Drag is initiated from the small grip handle only. The card body remains
 * scrollable: `touch-action: pan-y` on the wrapper lets the browser handle
 * vertical pans, while the grip handle opts out with `touch-action: none`.
 *
 * Tapping the handle (no drag) toggles the plan in the podium — the mobile
 * equivalent of a drag, since dragging from a scrolled-down card cannot reach
 * the podium at the top of the page.
 *
 * On desktop (pointerType === "mouse") the whole card still supports dragging,
 * so existing muscle memory keeps working.
 */
const DraggablePlanCard = ({ plan, onDragStart, onDragEnd }) => {
  const { setDraggingPlan, assignToSlot, togglePlan } = useCompare();
  const [dragging, setDragging] = useState(false);
  const cardRef = useRef(null);
  const ghostRef = useRef(null);
  const dragOccurredRef = useRef(false);

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

  const startDrag = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragOccurredRef.current = false;

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
        dragOccurredRef.current = true;
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

  // Mouse users can still grab the whole card. Touch users must use the handle.
  const handleCardPointerDown = (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    if (e.target.closest("button, a, input, textarea, select, [role='button']")) return;
    startDrag(e);
  };

  const handleHandlePointerDown = (e) => {
    startDrag(e);
  };

  const handleHandleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragOccurredRef.current) return;
    togglePlan(plan);
  };

  return (
    <div
      ref={cardRef}
      onPointerDown={handleCardPointerDown}
      className="relative"
      style={{ touchAction: "pan-y" }}
    >
      <PlanCard plan={plan} />
      <button
        type="button"
        onPointerDown={handleHandlePointerDown}
        onClick={handleHandleClick}
        aria-label="Drag or tap to add to podium"
        title="Drag or tap to add to podium"
        style={{ touchAction: "none" }}
        className={`absolute right-1.5 top-1.5 z-10 grid h-7 w-7 place-items-center rounded-lg border border-white/20 bg-black/55 text-white/85 backdrop-blur transition hover:text-white sm:h-8 sm:w-8 ${
          dragging ? "opacity-0" : ""
        }`}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default DraggablePlanCard;
