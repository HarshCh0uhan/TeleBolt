import { useEffect, useRef, useState } from "react";
import PlanCard from "./PlanCard";
import { useCompare } from "../context/CompareContext";

const DRAG_THRESHOLD_PX = 8;
const LONG_PRESS_MS = 350;

/**
 * No visible drag handle. Drag activation:
 *   - Mouse / pen: pointerdown on card body, then move >= 8px.
 *   - Touch: hold still for 350ms, then drag. Moving > 8px before the
 *     timer fires cancels drag and lets the browser scroll.
 *
 * The wrapping <Link> is NOT treated as an interactive element to skip —
 * otherwise drag would be rejected everywhere on the card body. Instead a
 * capture-phase click listener suppresses navigation when a drag occurred.
 *
 * Drop targets, in order at pointerup / touchend:
 *   1. [data-podium-slot]        — the visible podium cards
 *   2. [data-mobile-podium-drop] — the floating MobilePodiumBar at the bottom
 */
const DraggablePlanCard = ({ plan, onDragStart, onDragEnd }) => {
  const { setDraggingPlan, assignToSlot, slots } = useCompare();
  const [dragging, setDragging] = useState(false);
  const cardRef = useRef(null);
  const ghostRef = useRef(null);
  const dragOccurredRef = useRef(false);

  // Suppress the wrapping Link's click when the gesture was a drag.
  // Capture phase runs before the child Link's click handler and before React's
  // synthetic onClick, so both native nav and React handlers are blocked.
  useEffect(() => {
    const node = cardRef.current;
    if (!node) return undefined;
    const onClickCapture = (e) => {
      if (dragOccurredRef.current) {
        e.preventDefault();
        e.stopPropagation();
        dragOccurredRef.current = false;
      }
    };
    node.addEventListener("click", onClickCapture, true);
    return () => node.removeEventListener("click", onClickCapture, true);
  }, []);

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

    ghostRef.current = {
      el: ghost,
      offsetX: (rect.width * 0.6) / 2,
      offsetY: (rect.height * 0.6) / 2,
    };
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
      const barEl = target?.closest("[data-mobile-podium-drop]");
      if (slotEl) {
        const idx = Number(slotEl.dataset.podiumSlot);
        if (Number.isInteger(idx)) assignToSlot(plan, idx);
      } else if (barEl) {
        const emptyIdx = slots.findIndex((p) => !p);
        assignToSlot(plan, emptyIdx === -1 ? 0 : emptyIdx);
      }
      g.el.remove();
    }
    ghostRef.current = null;
    setDragging(false);
    setDraggingPlan(null);
    onDragEnd?.(plan);
  };

  // Only skip actual buttons and form controls. The wrapping <Link> is NOT
  // skipped — that was the original bug that made drag impossible.
  const isButtonLike = (el) =>
    el?.closest("button, input, textarea, select, [role='button']");

  // Mouse and pen: immediate drag with 8px threshold.
  const handlePointerDown = (e) => {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    if (e.button !== 0) return;
    if (isButtonLike(e.target)) return;
    dragOccurredRef.current = false;

    const pointerId = e.pointerId;
    const startX = e.clientX;
    const startY = e.clientY;
    let active = false;

    const onMove = (ev) => {
      if (ev.pointerId !== pointerId) return;
      if (!active) {
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_THRESHOLD_PX) return;
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

  // Touch: long-press 350ms to activate drag.
  const handleTouchStart = (e) => {
    if (isButtonLike(e.target)) return;
    const touch = e.touches[0];
    if (!touch) return;
    dragOccurredRef.current = false;

    const startX = touch.clientX;
    const startY = touch.clientY;
    let active = false;
    let cancelled = false;

    const longPressTimer = setTimeout(() => {
      if (cancelled) return;
      active = true;
      dragOccurredRef.current = true;
      beginDrag(startX, startY);
    }, LONG_PRESS_MS);

    const onMove = (ev) => {
      const t = ev.touches[0];
      if (!t) return;
      if (!active) {
        if (Math.hypot(t.clientX - startX, t.clientY - startY) > DRAG_THRESHOLD_PX) {
          cancelled = true;
          clearTimeout(longPressTimer);
        }
      } else {
        ev.preventDefault();
        moveDrag(t.clientX, t.clientY);
      }
    };

    const onEnd = (ev) => {
      if (active) {
        const t = ev.changedTouches[0];
        if (t) finishDrag(t.clientX, t.clientY);
      }
      cleanup();
    };

    const cleanup = () => {
      clearTimeout(longPressTimer);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onEnd);
    };

    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);
    document.addEventListener("touchcancel", onEnd);
  };

  return (
    <div
      ref={cardRef}
      onPointerDown={handlePointerDown}
      onTouchStart={handleTouchStart}
      className={`relative select-none transition-opacity duration-150 ${
        dragging ? "opacity-40" : ""
      }`}
      style={{ touchAction: "pan-y", WebkitTouchCallout: "none" }}
    >
      <PlanCard plan={plan} />
    </div>
  );
};

export default DraggablePlanCard;
