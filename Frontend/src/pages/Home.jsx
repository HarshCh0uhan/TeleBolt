"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

import FilterBar from "../components/FilterBar";
import RankingPodium from "../components/RankingPodium";
import AdvancedDrawer from "../components/AdvancedDrawer";
import DraggablePlanCard from "../components/DraggablePlanCard";
import FormatSelect from "../components/FormatSelect";
import { getRankings, getRankingFormats } from "../api/plans.api";
import { DEFAULT_FILTERS, toApiParams } from "../utils/filterConfig";
import { useCompare, PODIUM_SIZE } from "../context/CompareContext";

export default function Home() {
  const [formats, setFormats] = useState([]);
  const [format, setFormat] = useState("best-value");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [rankings, setRankings] = useState([]);
  const [otherPlans, setOtherPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showArrow, setShowArrow] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const requestId = useRef(0);

  const { resetTo, slots } = useCompare();

  useEffect(() => {
    getRankingFormats()
      .then(({ data }) => {
        setFormats(data.formats || []);
        if (data.defaultFormat) setFormat(data.defaultFormat);
      })
      .catch(() => setFormats([]));
  }, []);

  // Format or filters changed -> re-rank, then reset slots to the new top 3.
  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    getRankings({ ...toApiParams(filters), format })
      .then(({ data }) => {
        if (id !== requestId.current) return;
        const list = data.rankings || [];
        setRankings(list);
        setOtherPlans(data.otherPlans || []);
        resetTo(list.slice(0, 3));
      })
      .catch((err) => {
        if (id !== requestId.current) return;
        setError(
          typeof err?.response?.data === "string"
            ? err.response.data
            : "Could not load rankings."
        );
        setRankings([]);
        setOtherPlans([]);
        resetTo([]);
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
  }, [format, filters, resetTo]);

  useEffect(() => {
    const handler = () => {
      setShowArrow(window.scrollY > 120);
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleDragStart = () => {
    setDrawerOpen(true);
  };

  // A plan sitting in a podium slot must not also appear in the tier list below.
  const podiumIds = useMemo(
    () => new Set(slots.filter(Boolean).map((p) => p._id)),
    [slots]
  );

  const remainder = useMemo(
    () => rankings.filter((p) => !podiumIds.has(p._id)),
    [rankings, podiumIds]
  );

  const third = Math.ceil(remainder.length / 3) || 0;
  const tiers = [
    { key: "strong", name: "Strong picks", plans: remainder.slice(0, third) },
    { key: "good", name: "Also good", plans: remainder.slice(third, third * 2) },
    { key: "rest", name: "The rest", plans: remainder.slice(third * 2) },
  ].filter((tier) => tier.plans.length > 0);

  const initialLoad = loading && rankings.length === 0;

  return (
    <div className="min-h-screen bg-[#181818]">
      {/* Arrow — centered, just below the sticky navbar */}
      {showArrow && (
        <button
          type="button"
          onClick={() => setDrawerOpen((v) => !v)}
          aria-label={drawerOpen ? "Close panel" : "Open panel"}
          className="fixed left-1/2 top-[72px] z-50 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-2xl border border-white/10 bg-[#1f1f1f] text-zinc-300 shadow-lg transition-all duration-300 hover:border-[#58c28d]/30 hover:text-white"
        >
          {drawerOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      )}

      {/* Advanced drawer */}
      <AdvancedDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        formats={formats}
        format={format}
        onFormatChange={setFormat}
        filters={filters}
        onApplyFilters={(next) => setFilters(next)}
        onClearFilters={() => setFilters(DEFAULT_FILTERS)}
      />

      <FilterBar
        filters={filters}
        onApply={(next) => setFilters(next)}
        onClear={() => setFilters(DEFAULT_FILTERS)}
        leadingSlot={
          <FormatSelect formats={formats} value={format} onChange={setFormat} />
        }
      />

      <main className="mx-auto max-w-7xl px-4 py-6 pb-24">
        {/* Podium */}
        {initialLoad ? (
          <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PODIUM_SIZE }).map((_, i) => (
              <div key={i} className="h-96 rounded-2xl bg-[#262626] animate-pulse" />
            ))}
          </div>
        ) : (
          <RankingPodium />
        )}

        {error && (
          <div className="mt-8 rounded-3xl border border-red-400/20 bg-red-500/10 p-6 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && rankings.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dashed border-white/10 bg-[#1f1f1f] p-12 text-center">
            <p className="font-medium text-zinc-400">No plans match this category</p>
            <p className="mt-2 text-sm text-zinc-500">
              Try a different category or widen the budget and validity ranges.
            </p>
          </div>
        )}

        {/* Tiers */}
        {tiers.map((tier) => (
          <section key={tier.key} className="mt-10">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
                {tier.name}
              </h2>
              <span className="text-xs text-zinc-600">{tier.plans.length}</span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {tier.plans.map((plan) => (
                <DraggablePlanCard
                  key={plan._id}
                  plan={plan}
                  onDragStart={handleDragStart}
                />
              ))}
            </div>
          </section>
        ))}

        {otherPlans.length > 0 && (
          <section className="mt-10 border-t border-white/10 pt-8">
            <div className="mb-4">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
                Other Plans
              </h2>
              <p className="mt-1 text-xs text-zinc-600">
                Plans that don't fit any recommendation category — shown by lowest price.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {otherPlans.map((plan) => (
                <DraggablePlanCard
                  key={plan._id}
                  plan={plan}
                  onDragStart={handleDragStart}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-4 z-40 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-[#1f1f1f] shadow-xl transition-all duration-200 hover:border-[#58c28d]/30 hover:bg-[#262626]"
          aria-label="Scroll to top"
        >
          <svg className="h-6 w-6 text-[#58c28d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
}