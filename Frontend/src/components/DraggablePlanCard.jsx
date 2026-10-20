import { useEffect, useRef, useState } from "react";
import PlanCard from "./PlanCard";
import { useCompare } from "../context/CompareContext";

const DRAG_THRESHOLD_PX = 8;
const LONG_PRESS_MS = 100;

/**
 * The wrapping <Link> inside PlanCard renders as <a href>. Every modern browser
 * treats an <a href> as natively draggable — mousedown + move fires a native
 * HTML5 dragstart, and the browser then swallows the pointer events the custom
 * drag relies on. That was the reason desktop mouse drag "did nothing".
 *
 * The fix: preventDefault on the wrapper's dragstart (which cancels the native
 * drag for the whole subtree, including descendants' <a>) and set
 * `draggable={false}` so the wrapper itself is never picked up as a drag source.
 *
 * Activation:
 *   - Mouse / pen: pointerdown on the card body, then move >= 8px.
 *   - Touch: hold still for 100ms, then drag. Movement > 8px before the timer
 *     fires cancels the drag and lets the browser scroll normally.
 *
 * Drop lookup uses `elementsFromPoint` (plural), iterating from top to bottom,
 * so a ghost clone or child element sitting on top of a slot no longer hides it.
 */
const DraggablePlanCard = ({ plan }) => {
  const { setDraggingPlan, assignToSlot, slots } = useCompare();
  const [dragging, setDragging] = useState(false);
  const cardRef = useRef(null);
  const ghostRef = useRef(null);
  const dragOccurredRef = useRef(false);

  // Suppress the wrapping <Link>'s click when the gesture was a real drag.
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
      // elementsFromPoint (plural) returns every element at the point, top to
      // bottom. The ghost has pointer-events: none so it is skipped by the
      // browser, but any other overlapping overlay is not — iterating lets us
      // find the first element that is inside a drop target.
      const elements = document.elementsFromPoint(clientX, clientY);
      let slotEl = null;
      let barEl = null;
      for (const el of elements) {
        if (!slotEl) {
          const s = el.closest?.("[data-podium-slot]");
          if (s) slotEl = s;
        }
        if (!barEl) {
          const b = el.closest?.("[data-mobile-podium-drop]");
          if (b) barEl = b;
        }
        if (slotEl || barEl) break;
      }
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
  };

  const isButtonLike = (el) =>
    el?.closest("button, input, textarea, select, [role='button']");

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
        beginDrag(ev.clientX, ev.clientY);
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
      onDragStart={(e) => e.preventDefault()}
      draggable={false}
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
