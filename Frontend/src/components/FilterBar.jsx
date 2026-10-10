import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Layers3,
  RadioTower,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import {
  CATEGORIES,
  DAILY_DATA_OPTIONS,
  DEFAULT_FILTERS,
  LIMITS,
  OPERATORS,
  OTT_APPS,
  countActive,
  isPriceActive,
  isValidityActive,
  sameFilters,
} from "../utils/filterConfig";

/* ---------- small building blocks (module level, so they never remount) ---------- */

// Selected = green tint + green border. No tick icon.
const Chip = ({ active, disabled, onClick, children }) => (
  <button
    type="button"
    aria-pressed={active}
    disabled={disabled}
    onClick={onClick}
    className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
      active
        ? "border-[#58c28d]/50 bg-[#58c28d]/20 text-[#dff6ea]"
        : "border-white/10 bg-[#262626] text-zinc-300 hover:border-[#58c28d]/30 hover:text-white"
    } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
  >
    {children}
  </button>
);

const Section = ({ title, hint, children }) => (
  <div>
    <div className="mb-2.5 flex items-baseline justify-between gap-3">
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">{title}</h4>
      {hint && <span className="text-[11px] text-zinc-500">{hint}</span>}
    </div>
    {children}
  </div>
);

const Dropdown = ({ label, icon: Icon, count, open, onToggle, panelClass = "", children }) => (
  <div className="sm:relative">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-haspopup="true"
      className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
        count > 0 || open
          ? "border-[#58c28d]/40 bg-[#58c28d]/10 text-white"
          : "border-white/10 bg-[#1f1f1f] text-zinc-300 hover:border-[#58c28d]/30 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4 text-[#58c28d]" />
      <span>{label}</span>
      {count > 0 && (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#58c28d] px-1 text-[10px] font-bold text-[#181818]">
          {count}
        </span>
      )}
      <ChevronDown
        className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      />
    </button>

    {open && (
      <div
        className={`absolute left-4 right-4 top-full z-40 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#1f1f1f] p-4 shadow-2xl shadow-black/50 sm:left-0 sm:right-auto ${panelClass}`}
      >
        {children}
      </div>
    )}
  </div>
);

// Two native range inputs layered on one track: touch + keyboard work for free.
const RangeSlider = ({ label, min, max, step, value, onChange, format }) => {
  const [lo, hi] = value;
  const pct = (v) => ((v - min) / (max - min)) * 100;
  // When both thumbs sit at the far end, keep the low one on top so it stays draggable.
  const lowOnTop = lo > (min + max) / 2;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-300">{label}</span>
        <span className="font-mono text-[#58c28d]">
          {format(lo)} – {format(hi)}
        </span>
      </div>

      <div className="relative h-5">
        {/* Visual rail, inset by half a thumb so it lines up with native thumb travel */}
        <div className="absolute left-2.5 right-2.5 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/10">
          <div
            className="absolute h-full rounded-full bg-[#58c28d]"
            style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }}
          />
        </div>

        <input
          type="range"
          className={`dual-range absolute inset-0 h-5 w-full ${lowOnTop ? "z-20" : "z-10"}`}
          min={min}
          max={max}
          step={step}
          value={lo}
          aria-label={`${label} minimum`}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi - step), hi])}
        />
        <input
          type="range"
          className="dual-range absolute inset-0 z-10 h-5 w-full"
          min={min}
          max={max}
          step={step}
          value={hi}
          aria-label={`${label} maximum`}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + step)])}
        />
      </div>
    </div>
  );
};

/* ---------- the filter bar ---------- */

export default function FilterBar({ filters, onApply, onClear, leadingSlot = null }) {
  const [draft, setDraft] = useState(filters);
  const [prevFilters, setPrevFilters] = useState(filters);
  const [openName, setOpenName] = useState(null);
  const rootRef = useRef(null);

  // If the applied filters change from outside, reset the draft to match.
  if (prevFilters !== filters) {
    setPrevFilters(filters);
    setDraft(filters);
  }

  // Close on outside click / Esc.
  useEffect(() => {
    if (!openName) return undefined;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpenName(null);
    };
    const onKey = (e) => e.key === "Escape" && setOpenName(null);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openName]);

  const update = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const toggleOpen = (name) => setOpenName((cur) => (cur === name ? null : name));

  const toggleInList = (key, value) =>
    update({
      [key]: draft[key].includes(value)
        ? draft[key].filter((v) => v !== value)
        : [...draft[key], value],
    });

  const setCategory = (cat) =>
    update({
      category: draft.category === cat ? "" : cat,
      // Daily-data only makes sense for Daily plans.
      ...(cat === "Non-Daily" ? { dailyData: 0 } : {}),
    });

  const dirty = !sameFilters(draft, filters);
  const hasAnything = countActive(draft) > 0 || countActive(filters) > 0;

  const othersCount =
    (draft.dailyData > 0 ? 1 : 0) + (isPriceActive(draft) ? 1 : 0) + (isValidityActive(draft) ? 1 : 0);

  const handleApply = () => {
    onApply(draft);
    setOpenName(null);
  };

  const handleClear = () => {
    setDraft(DEFAULT_FILTERS);
    setOpenName(null);
    onClear();
  };

  return (
    <div ref={rootRef} className="relative z-30 border-b border-white/10 bg-[#181818]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
        {leadingSlot}

        <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
          <SlidersHorizontal className="h-4 w-4 text-[#58c28d]" />
          <span className="hidden sm:inline">Filters</span>
        </div>

        {/* Operator – multi select */}
        <Dropdown
          label="Operator"
          icon={RadioTower}
          count={draft.operators.length}
          open={openName === "operator"}
          onToggle={() => toggleOpen("operator")}
          panelClass="sm:w-72"
        >
          <Section title="Operators" hint="Pick one or more">
            <div className="flex flex-wrap gap-2">
              {OPERATORS.map((op) => (
                <Chip key={op} active={draft.operators.includes(op)} onClick={() => toggleInList("operators", op)}>
                  {op}
                </Chip>
              ))}
            </div>
          </Section>
        </Dropdown>

        {/* Category – single select */}
        <Dropdown
          label="Category"
          icon={Layers3}
          count={draft.category ? 1 : 0}
          open={openName === "category"}
          onToggle={() => toggleOpen("category")}
          panelClass="sm:w-64"
        >
          <Section title="Category" hint="Pick one">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Chip key={cat} active={draft.category === cat} onClick={() => setCategory(cat)}>
                  {cat}
                </Chip>
              ))}
            </div>
          </Section>
        </Dropdown>

        {/* OTT – multi select */}
        <Dropdown
          label="OTT Apps"
          icon={Sparkles}
          count={draft.ottApps.length}
          open={openName === "ott"}
          onToggle={() => toggleOpen("ott")}
          panelClass="sm:w-80"
        >
          <Section title="OTT apps" hint="Pick one or more">
            <div className="flex flex-wrap gap-2">
              {OTT_APPS.map((app) => (
                <Chip key={app} active={draft.ottApps.includes(app)} onClick={() => toggleInList("ottApps", app)}>
                  {app}
                </Chip>
              ))}
            </div>
          </Section>
        </Dropdown>

        {/* Others – data/day, budget, validity */}
        <Dropdown
          label="Others"
          icon={SlidersHorizontal}
          count={othersCount}
          open={openName === "others"}
          onToggle={() => toggleOpen("others")}
          panelClass="sm:w-[24rem]"
        >
          <div className="space-y-5">
            <Section
              title="Data / day"
              hint={draft.category === "Non-Daily" ? "Daily plans only" : "Exact GB per day"}
            >
              <div className="flex flex-wrap gap-2">
                {DAILY_DATA_OPTIONS.map((gb) => (
                  <Chip
                    key={gb}
                    disabled={draft.category === "Non-Daily"}
                    active={draft.dailyData === gb}
                    onClick={() => update({ dailyData: draft.dailyData === gb ? 0 : gb })}
                  >
                    {gb} GB
                  </Chip>
                ))}
              </div>
            </Section>

            <div className="border-t border-white/10 pt-5">
              <Section title="Budget">
                <RangeSlider
                  label="Price"
                  {...LIMITS.price}
                  value={[draft.minPrice, draft.maxPrice]}
                  onChange={([a, b]) => update({ minPrice: a, maxPrice: b })}
                  format={(v) => `₹${v.toLocaleString("en-IN")}`}
                />
              </Section>
            </div>

            <div className="border-t border-white/10 pt-5">
              <Section title="Validity">
                <RangeSlider
                  label="Days"
                  {...LIMITS.validity}
                  value={[draft.minValidity, draft.maxValidity]}
                  onChange={([a, b]) => update({ minValidity: a, maxValidity: b })}
                  format={(v) => `${v}d`}
                />
              </Section>
            </div>
          </div>
        </Dropdown>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          {hasAnything && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-zinc-400 transition hover:border-red-400/30 hover:text-red-400"
            >
              <RotateCcw className="h-4 w-4" />
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={handleApply}
            disabled={!dirty}
            className="rounded-xl bg-[#58c28d] px-5 py-2 text-sm font-semibold text-[#181818] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}