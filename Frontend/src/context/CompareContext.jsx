import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// Comparison rules: at least 2 plans are required, at most 3 can be compared.
export const MIN_COMPARE = 2;
export const MAX_COMPARE = 3;

const STORAGE_KEY = "telebolt.compare.selection";

const CompareContext = createContext(null);

// Selection is persisted so it survives refreshes and navigation to /compare.
const readStoredSelection = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((plan) => plan && plan._id)
      .slice(0, MAX_COMPARE);
  } catch {
    return [];
  }
};

export const CompareProvider = ({ children }) => {
  const [selectedPlans, setSelectedPlans] = useState(readStoredSelection);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedPlans));
    } catch {
      // Storage can be unavailable (private mode); selection still works in memory.
    }
  }, [selectedPlans]);

  // Notices are transient feedback, e.g. "you can compare at most 3 plans".
  useEffect(() => {
    if (!notice) return undefined;

    const timer = setTimeout(() => setNotice(null), 3200);
    return () => clearTimeout(timer);
  }, [notice]);

  const selectedIds = useMemo(
    () => selectedPlans.map((plan) => plan._id),
    [selectedPlans]
  );

  const isSelected = useCallback(
    (planId) => selectedIds.includes(planId),
    [selectedIds]
  );

  const isFull = selectedPlans.length >= MAX_COMPARE;
  const canCompare = selectedPlans.length >= MIN_COMPARE;

  // Returns true when the plan ends up selected, false when the list is already full.
  const addPlan = useCallback(
    (plan) => {
      if (!plan?._id) return false;

      if (selectedPlans.some((item) => item._id === plan._id)) return true;

      if (selectedPlans.length >= MAX_COMPARE) {
        setNotice(`You can compare up to ${MAX_COMPARE} plans. Remove one to add another.`);
        return false;
      }

      // Decide from the current selection above, and keep the updater itself pure.
      setSelectedPlans((prev) => (prev.length >= MAX_COMPARE ? prev : [...prev, plan]));
      return true;
    },
    [selectedPlans]
  );

  const removePlan = useCallback((planId) => {
    setSelectedPlans((prev) => prev.filter((plan) => plan._id !== planId));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPlans([]);
  }, []);

  // Single entry point used by the plan cards.
  const togglePlan = useCallback(
    (plan) => {
      if (!plan?._id) return false;

      if (selectedIds.includes(plan._id)) {
        removePlan(plan._id);
        return false;
      }

      return addPlan(plan);
    },
    [addPlan, removePlan, selectedIds]
  );

  const remainingSlots = MAX_COMPARE - selectedPlans.length;

  const value = {
    selectedPlans,
    selectedIds,
    selectedCount: selectedPlans.length,
    remainingSlots,
    isSelected,
    isFull,
    canCompare,
    addPlan,
    removePlan,
    togglePlan,
    clearSelection,
    notice,
    setNotice,
  };

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
};

export const useCompare = () => {
  const context = useContext(CompareContext);

  if (!context) {
    throw new Error("useCompare must be used inside a CompareProvider");
  }

  return context;
};
