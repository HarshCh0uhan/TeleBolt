import { createContext, useContext, useMemo, useState } from "react";
import { DEFAULT_FILTERS } from "../utils/filterConfig";

// Default format list so the drawer's select always has at least one option
// even if the API's format list fails to load on a cold start.
const FALLBACK_FORMATS = [{ id: "best-value", label: "Best Value", blurb: "" }];

const FiltersContext = createContext(null);

export const FiltersProvider = ({ children }) => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [format, setFormat] = useState("best-value");
  const [formats, setFormats] = useState(FALLBACK_FORMATS);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const value = useMemo(
    () => ({ filters, setFilters, format, setFormat, formats, setFormats, drawerOpen, setDrawerOpen }),
    [filters, format, formats, drawerOpen]
  );

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
};

export const useFilters = () => {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error("useFilters must be used inside FiltersProvider");
  return ctx;
};
