"use client";

import { useState, useRef, useEffect } from "react";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Filter as FilterIcon,
  Tag,
  DollarSign,
  Calendar,
  Database,
  Sparkles,
  RotateCcw,
  Check,
} from "lucide-react";

const operators = ["Jio", "Airtel", "VI", "BSNL"];
const categories = ["Daily", "Non-Daily"];
const ottApps = ["JioHotstar", "Prime", "Netflix", "SonyLiv", "Zee5"];

function RangeSlider({
  label,
  min,
  max,
  value,
  onChange,
  format = (v) => v,
  step = 1,
  unit = "",
  disabled = false,
}) {
  const [localValue, setLocalValue] = useState(value);
  const thumbRefs = [useRef(null), useRef(null)];
  const trackRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (index, newVal) => {
    const arr = [...localValue];
    arr[index] = Math.max(min, Math.min(max, newVal));
    if (arr[0] > arr[1]) arr[1] = arr[0];
    setLocalValue(arr);
    onChange(arr);
  };

  const getPercent = (val) => ((val - min) / (max - min)) * 100;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="font-medium text-zinc-300">{label}</span>
        <span className="text-[#58c28d] font-mono">
          {format(localValue[0])}{unit} – {format(localValue[1])}{unit}
        </span>
      </div>
      <div className="relative h-6" role="slider" aria-label={label} aria-valuemin={localValue[0]} aria-valuemax={localValue[1]} tabIndex={0}>
        <div
          ref={trackRef}
          className="absolute inset-0 h-1 bg-zinc-800 rounded-full overflow-hidden"
        >
          <div
            className="absolute h-full bg-[#58c28d] rounded-full"
            style={{
              left: `${getPercent(localValue[0])}%`,
              width: `${getPercent(localValue[1]) - getPercent(localValue[0])}%`,
            }}
          />
        </div>
        {[0, 1].map((i) => (
          <button
            key={i}
            ref={thumbRefs[i]}
            type="button"
            disabled={disabled}
            className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-[#58c28d] shadow-lg transition-transform focus:outline-none focus:ring-2 focus:ring-[#58c28d] focus:ring-offset-2 focus:ring-offset-[#181818] ${
              disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-110 active:scale-125"
            }`}
            style={{ left: `calc(${getPercent(localValue[i])}% - 12px)` }}
            onMouseDown={(e) => {
              e.preventDefault();
              if (disabled) return;
              const startX = e.clientX;
              const startVal = localValue[i];
              const move = (me) => {
                const dx = me.clientX - startX;
                const trackWidth = trackRef.current?.offsetWidth || 300;
                const stepPx = trackWidth / (max - min);
                const newVal = Math.round(startVal + dx / stepPx);
                handleChange(i, newVal);
              };
              const up = () => {
                window.removeEventListener("mousemove", move);
                window.removeEventListener("mouseup", up);
              };
              window.addEventListener("mousemove", move);
              window.addEventListener("mouseup", up);
            }}
            onKeyDown={(e) => {
              const step = (max - min) * 0.02;
              if (e.key === "ArrowRight" || e.key === "ArrowUp") handleChange(i, localValue[i] + step);
              if (e.key === "ArrowLeft" || e.key === "ArrowDown") handleChange(i, localValue[i] - step);
              if (e.key === "Home") handleChange(i, min);
              if (e.key === "End") handleChange(i, max);
            }}
            aria-label={`${label} ${i === 0 ? "minimum" : "maximum"}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
        <span>{format(min)}{unit}</span>
        <span>{format(max)}{unit}</span>
      </div>
    </div>
  );
}

function ChipGroup({ label, options, selected, onToggle, icon }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 mb-2">
        {icon && <icon className="h-3.5 w-3.5 text-[#58c28d]" />}
        <span className="uppercase tracking-wider">{label}</span>
        {selected.length > 0 && (
          <span className="ml-auto text-[10px] text-[#58c28d] font-mono">{selected.length}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              selected.includes(opt)
                ? "bg-[#58c28d]/20 border border-[#58c28d]/40 text-[#58c28d] ring-1 ring-[#58c28d]/20"
                : "bg-[#1f1f1f] border border-white/10 text-zinc-300 hover:border-[#58c28d]/30 hover:text-white hover:bg-[#262626]"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function CollapsibleSection({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(open ? contentRef.current.scrollHeight : 0);
    }
  }, [open]);

  return (
    <div className="border-t border-white/10">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 py-3 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          {icon && <icon className="h-4 w-4 text-[#58c28d] shrink-0" />}
          <span className="uppercase tracking-wider">{title}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-zinc-500 shrink-0" /> : <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />}
      </button>
      <div className="overflow-hidden transition-all duration-300 ease-out" style={{ height: `${height}px` }}>
        <div ref={contentRef} className="pb-3 pt-1">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function FilterBar({
  filters,
  onFiltersChange,
  onApply,
  onClear,
  activeCount,
}) {
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const hasActiveFilters = activeCount > 0;

  const toggleChip = (key, value) => {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange(key, updated);
  };

  const toggleRadio = (key, value) => {
    onFiltersChange(key, filters[key] === value ? "" : value);
  };

  const handleSliderChange = (key, value) => {
    onFiltersChange(key, value);
  };

  return (
    <div className="sticky top-16 z-40 bg-[#181818]/95 backdrop-blur-md border-b border-white/10">
      {/* Compact Bar - Always Visible */}
      <div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1f1f1f] border border-white/10 shrink-0">
          <FilterIcon className="h-4 w-4 text-[#58c28d]" />
          <span className="text-sm font-medium text-zinc-300 hidden sm:inline">Filters</span>
          {activeCount > 0 && (
            <span className="ml-1 h-5 w-5 rounded-full bg-[#58c28d] flex items-center justify-center text-[10px] font-bold text-[#181818]">
              {activeCount}
            </span>
          )}
        </div>

        {/* Quick Chips - Most Used */}
        <div className="flex flex-wrap gap-2 flex-1 min-w-0">
          {operators.map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => toggleChip("operators", op)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                filters.operators?.includes(op)
                  ? "bg-[#58c28d]/20 border border-[#58c28d]/40 text-[#58c28d]"
                  : "bg-[#1f1f1f] border border-white/10 text-zinc-300 hover:border-[#58c28d]/30 hover:text-white"
              }`}
            >
              {op}
            </button>
          ))}
        </div>

        {/* Expand Toggle */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1f1f1f] border border-white/10 text-sm text-zinc-400 transition hover:border-[#58c28d]/30 hover:text-white shrink-0"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <span className="hidden sm:inline">More</span>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClear}
              className="px-4 py-1.5 rounded-xl border border-white/10 text-sm font-medium text-zinc-400 transition hover:border-red-400/30 hover:text-red-400"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onApply}
            disabled={!hasActiveFilters}
            className="px-4 py-1.5 rounded-xl bg-[#58c28d] text-sm font-semibold text-[#181818] transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="h-4 w-4 mr-1.5" />
            Apply
          </button>
        </div>
      </div>

      {/* Expanded Advanced Filters */}
      {expanded && (
        <div className="border-t border-white/10 bg-[#181818] animate-slide-down">
          <div className="mx-auto max-w-7xl px-4 py-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <CollapsibleSection title="Category" icon={Tag} defaultOpen>
              <div className="flex gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleRadio("category", cat)}
                    className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      filters.category === cat
                        ? "bg-[#58c28d]/20 border border-[#58c28d]/40 text-[#58c28d]"
                        : "bg-[#1f1f1f] border border-white/10 text-zinc-300 hover:border-[#58c28d]/30 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Budget" icon={DollarSign} defaultOpen>
              <RangeSlider
                label="Price Range"
                min={99}
                max={3000}
                value={[filters.minPrice, filters.maxPrice]}
                onChange={(v) => handleSliderChange("price", v)}
                format={(v) => `₹${v.toLocaleString()}`}
                step={1}
              />
            </CollapsibleSection>

            <CollapsibleSection title="Validity" icon={Calendar} defaultOpen>
              <RangeSlider
                label="Validity (days)"
                min={1}
                max={365}
                value={[filters.minValidity, filters.maxValidity]}
                onChange={(v) => handleSliderChange("validity", v)}
                step={1}
                unit="d"
              />
            </CollapsibleSection>

            <CollapsibleSection title="Data" icon={Database} defaultOpen>
              {filters.category === "Daily" ? (
                <RangeSlider
                  label="Daily Data (GB/day)"
                  min={0}
                  max={5}
                  value={[filters.dailyData, 5]}
                  onChange={(v) => handleSliderChange("dailyData", [v[0], 5])}
                  step={0.5}
                  unit=" GB"
                  format={(v) => v.toFixed(1)}
                />
              ) : (
                <RangeSlider
                  label="Total Data (GB)"
                  min={1}
                  max={500}
                  value={[filters.minData, filters.maxData]}
                  onChange={(v) => handleSliderChange("data", v)}
                  step={1}
                  unit=" GB"
                />
              )}
            </CollapsibleSection>

            <CollapsibleSection title="OTT Apps" icon={Sparkles}>
              <div className="flex flex-wrap gap-2">
                {ottApps.map((app) => (
                  <button
                    key={app}
                    type="button"
                    onClick={() => toggleChip("ottApps", app)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                      filters.ottApps?.includes(app)
                        ? "bg-[#58c28d]/20 border border-[#58c28d]/40 text-[#58c28d]"
                        : "bg-[#1f1f1f] border border-white/10 text-zinc-300 hover:border-[#58c28d]/30 hover:text-white"
                    }`}
                  >
                    {app}
                  </button>
                ))}
              </div>
            </CollapsibleSection>
          </div>
        </div>
      )}
    </div>
  );
}