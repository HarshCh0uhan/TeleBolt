import { createContext, useCallback, useContext, useMemo, useState } from "react";

// The comparison zone has exactly three positional slots.
export const PODIUM_SIZE = 3;

// Kept as an alias so existing imports that expect MAX_COMPARE keep working.
export const MAX_COMPARE = PODIUM_SIZE;

const CompareContext = createContext(null);

export const CompareProvider = ({ children }) => {
  const [slots, setSlots] = useState(() => Array(PODIUM_SIZE).fill(null));
  const [draggingPlan, setDraggingPlan] = useState(null);

  const filledCount = useMemo(() => slots.filter(Boolean).length, [slots]);
  const isFull = filledCount >= PODIUM_SIZE;
  const firstEmptyIndex = useMemo(() => slots.findIndex((p) => !p), [slots]);

  const isSelected = useCallback(
    (planId) => slots.some((p) => p && p._id === planId),
    [slots]
  );

  // Place a plan in a specific slot. If the plan already occupies another slot,
  // it is removed from there first so it never appears twice.
  const assignToSlot = useCallback((plan, index) => {
    if (!plan?._id) return false;
    if (index < 0 || index >= PODIUM_SIZE) return false;
    setSlots((prev) => {
      const next = [...prev];
      for (let i = 0; i < next.length; i++) {
        if (next[i] && next[i]._id === plan._id) next[i] = null;
      }
      next[index] = plan;
      return next;
    });
    return true;
  }, []);

  const removeFromSlot = useCallback((index) => {
    setSlots((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSlots(Array(PODIUM_SIZE).fill(null));
  }, []);

  // Fill the slots from an ordered list (the auto top 3 from the ranking API).
  const resetTo = useCallback((plans = []) => {
    const next = Array(PODIUM_SIZE).fill(null);
    for (let i = 0; i < Math.min(PODIUM_SIZE, plans.length); i++) {
      next[i] = plans[i] || null;
    }
    setSlots(next);
  }, []);

  // Kept for the PlanCard Compare button. Adds to the first empty slot, or
  // removes the plan if it is already in any slot.
  const togglePlan = useCallback(
    (plan) => {
      if (!plan?._id) return false;
      const existingIndex = slots.findIndex((p) => p && p._id === plan._id);
      if (existingIndex !== -1) {
        removeFromSlot(existingIndex);
        return false;
      }
      if (firstEmptyIndex === -1) return false;
      assignToSlot(plan, firstEmptyIndex);
      return true;
    },
    [slots, firstEmptyIndex, assignToSlot, removeFromSlot]
  );

  const value = {
    slots,
    filledCount,
    isFull,
    isSelected,
    assignToSlot,
    removeFromSlot,
    togglePlan,
    clearAll,
    resetTo,
    draggingPlan,
    setDraggingPlan,
    // Legacy aliases used by PlanCard and other consumers
    selectedCount: filledCount,
    canCompare: filledCount >= 2,
  };

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
};

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used inside a CompareProvider");
  return ctx;
};