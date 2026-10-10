import { createContext, useCallback, useContext, useMemo, useState } from "react";

// The comparison zone has exactly three positional slots.
export const PODIUM_SIZE = 3;

// Kept as an alias so existing imports that expect MAX_COMPARE keep working.
export const MAX_COMPARE = PODIUM_SIZE;

const CompareContext = createContext(null);

/**
 * Sort filled slots by score (descending), then by yearly cost as a tie-break.
 * Empty slots move to the end. Every plan object that arrives from the ranking
 * API carries a `score`, so the crown always lands on the best plan regardless
 * of which slot the user dropped it into.
 */
const sortByScore = (arr) => {
  const filled = arr.filter(Boolean).sort((a, b) => {
    const sa = Number(a.score) || 0;
    const sb = Number(b.score) || 0;
    if (sb !== sa) return sb - sa;
    return (Number(a.yearlyCost) || 0) - (Number(b.yearlyCost) || 0);
  });
  const emptyCount = arr.length - filled.length;
  return [...filled, ...Array(emptyCount).fill(null)];
};

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

  // Place a plan in a specific slot, then re-sort so the best plan wins slot 1.
  const assignToSlot = useCallback((plan, index) => {
    if (!plan?._id) return false;
    if (index < 0 || index >= PODIUM_SIZE) return false;
    setSlots((prev) => {
      const next = [...prev];
      for (let i = 0; i < next.length; i++) {
        if (next[i] && next[i]._id === plan._id) next[i] = null;
      }
      next[index] = plan;
      return sortByScore(next);
    });
    return true;
  }, []);

  const removeFromSlot = useCallback((index) => {
    setSlots((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const next = [...prev];
      next[index] = null;
      return sortByScore(next);
    });
  }, []);

  const clearAll = useCallback(() => {
    setSlots(Array(PODIUM_SIZE).fill(null));
  }, []);

  // Seed the slots from the API's top 3, already ordered by the server.
  const resetTo = useCallback((plans = []) => {
    const next = Array(PODIUM_SIZE).fill(null);
    for (let i = 0; i < Math.min(PODIUM_SIZE, plans.length); i++) {
      next[i] = plans[i] || null;
    }
    setSlots(next);
  }, []);

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