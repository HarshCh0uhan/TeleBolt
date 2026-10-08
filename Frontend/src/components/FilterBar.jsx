"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
  Minus,
  Plus,
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
  const thumbRefs = useMemo(() => [useRef(null), useRef(null)], []);
  const trackRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback((index, newVal) => {
    const arr = [...localValue];
    arr[index] = Math.max(min, Math.min(max, newVal));
    if (arr[0] > arr[1]) arr[1] = arr[0];
    setLocalValue(arr);
    onChange(arr);
  }, [localValue, min, max, onChange]);

  const getPercent = useCallback((val) => ((val - min) / (max - min)) * 100, [min, max]);

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

function ChipButton({ label, selected, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        selected
          ? "bg-[#58c28d]/20 border border-[#58c28d]/40 text-[#58c28d] ring-1 ring-[#58c28d]/20"
          : "bg-[#1f1f1f] border border-white/10 text-zinc-300 hover:border-[#58c28d]/30 hover:text-white hover:bg-[#262626]"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {label}
    </button>
  );
}

function RadioButton({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
        selected
          ? "bg-[#58c28d]/20 border border-[#58c28d]/40 text-[#58c28d]"
          : "bg-[#1f1f1f] border border-white/10 text-zinc-300 hover:border-[#58c28d]/30 hover:text-white"
      }`}
    >
      {label}
    </button>
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

  const hasActiveFilters = activeCount > 0;

  const toggleChip = useCallback((key, value) => {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange(key, updated);
  }, [filters, onFiltersChange]);

  const toggleRadio = useCallback((key, value) => {
    onFiltersChange(key, filters[key] === value ? "" : value);
  }, [filters, onFiltersChange]);

  const handleSliderChange = useCallback((key, value) => {
    onFiltersChange(key, value);
  }, [onFiltersChange]);

  const priceRange = useMemo(() => ({ min: filters.minPrice, max: filters.maxPrice }), [filters.minPrice, filters.maxPrice]);
  const validityRange = useMemo(() => ({ min: filters.minValidity, max: filters.maxValidity }), [filters.minValidity, filters.maxValidity]);
  const dataRange = useMemo(() => ({ min: filters.minData, max: filters.maxData }), [filters.minData, filters.maxData]);

  return (
    <div className="bg-[#181818] border-b border-white/10">
      {/* Compact Bar - Always Visible, NOT sticky */}
      <div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap items-center gap-3">
        {/* Filter Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1f1f1f] border border-white/10 shrink-0">
          <FilterIcon className="h-4 w-4 text-[#58c28d]" />
          <span className="text-sm font-medium text-zinc-300 hidden sm:inline">Filters</span>
          {activeCount > 0 && (
            <span className="ml-1 h-5 w-5 rounded-full bg-[#58c28d] flex items-center justify-center text-[10px] font-bold text-[#181818]">
              {activeCount}
            </span>
          )}
        </div>

        {/* Quick Operator Chips */}
        <div className="flex flex-wrap gap-2 flex-1 min-w-0">
          {operators.map((op) => (
            <ChipButton
              key={op}
              label={op}
              selected={filters.operators?.includes(op)}
              onClick={() => toggleChip("operators", op)}
            />
          ))}
        </div>

        {/* Expand Toggle */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1f1f1f] border border-white/10 text-sm text-zinc-400 transition hover:border-[#58c28d]/30 hover:text-white shrink-0"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <span className="hidden sm:inline">Advanced</span>
        </button>

        {/* Actions - Fixed alignment */}
        <div className="flex items-center gap-2 shrink-0">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-white/10 text-sm font-medium text-zinc-400 transition hover:border-red-400/30 hover:text-red-400"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Clear</span>
            </button>
          )}
          <button
            type="button"
            onClick={onApply}
            disabled={!hasActiveFilters}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#58c28d] text-sm font-semibold text-[#181818] transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="h-4 w-4" />
            <span>Apply</span>
          </button>
        </div>
      </div>

      {/* Expanded Advanced Filters */}
      {expanded && (
        <div className="border-t border-white/10 bg-[#181818] animate-slide-down p-4">
          <div className="mx-auto max-w-7xl grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <CollapsibleSection title="Category" icon={Tag} defaultOpen>
              <div className="flex gap-2">
                {categories.map((cat) => (
                  <RadioButton
                    key={cat}
                    label={cat}
                    selected={filters.category === cat}
                    onClick={() => toggleRadio("category", cat)}
                  />
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Budget" icon={DollarSign} defaultOpen>
              <RangeSlider
                label="Price Range"
                min={99}
                max={3000}
                value={priceRange}
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
                value={validityRange}
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
                  value={dataRange}
                  onChange={(v) => handleSliderChange("data", v)}
                  step={1}
                  unit=" GB"
                />
              )}
            </CollapsibleSection>

            <CollapsibleSection title="OTT Apps" icon={Sparkles} defaultOpen={false}>
              <div className="flex flex-wrap gap-2">
                {ottApps.map((app) => (
                  <ChipButton
                    key={app}
                    label={app}
                    selected={filters.ottApps?.includes(app)}
                    onClick={() => toggleChip("ottApps", app)}
                  />
                ))}
              </div>
            </CollapsibleSection>
          </div>
        </div>
      )}
    </div>
  );
}