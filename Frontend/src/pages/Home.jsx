"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";

import FilterBar from "../components/FilterBar";
import RankingPodium from "../components/RankingPodium";
import AdvancedDrawer from "../components/AdvancedDrawer";
import DraggablePlanCard from "../components/DraggablePlanCard";
import FormatSelect from "../components/FormatSelect";
import MobilePodiumBar from "../components/MobilePodiumBar";
import SlotPickerSheet from "../components/SlotPickerSheet";
import { getRankings, getRankingFormats } from "../api/plans.api";
import { DEFAULT_FILTERS, toApiParams } from "../utils/filterConfig";
import { useCompare, PODIUM_SIZE } from "../context/CompareContext";

export default function Home() {
  const [formats, setFormats] = useState([]);
  const [format, setFormat] = useState("best-value");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [rankings, setRankings] = useState([]);
  const [interpretation, setInterpretation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showArrow, setShowArrow] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [podiumVisible, setPodiumVisible] = useState(true);
  const requestId = useRef(0);
  const podiumRef = useRef(null);
  const prevFormatRef = useRef(format);

  const [searchParams, setSearchParams] = useSearchParams();
  const q = (searchParams.get("q") || "").trim();

  const { resetTo, slots } = useCompare();

  useEffect(() => {
    getRankingFormats()
      .then(({ data }) => {
        setFormats(data.formats || []);
        if (data.defaultFormat) setFormat(data.defaultFormat);
      })
      .catch(() => setFormats([]));
  }, []);

  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    getRankings({ ...toApiParams(filters), format, ...(q ? { q } : {}) })
      .then(({ data }) => {
        if (id !== requestId.current) return;
        const list = data.rankings || [];
        setRankings(list);
        setInterpretation(q ? data.search || null : null);
        // Reset the podium only when the format changed. A filter-only change
        // leaves whatever arrangement the user has made intact.
        if (prevFormatRef.current !== format) {
          resetTo(list.slice(0, 3));
          prevFormatRef.current = format;
        }
      })
      .catch((err) => {
        if (id !== requestId.current) return;
        setError(
          typeof err?.response?.data === "string"
            ? err.response.data
            : "Could not load rankings."
        );
        setRankings([]);
        setInterpretation(null);
        resetTo([]);
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
  }, [format, filters, q, resetTo]);

  useEffect(() => {
    const handler = () => {
      setShowArrow(window.scrollY > 120);
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const el = podiumRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setPodiumVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleDragStart = () => {
    setDrawerOpen(true);
  };

  const scrollToPodium = () => {
    podiumRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const clearSearch = () => setSearchParams({}, { replace: true });

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
  const barVisible = !podiumVisible && slots.some(Boolean);
  const chips = interpretation?.chips || [];
  const ignored = interpretation?.ignored || [];

  return (
    <div className="min-h-screen bg-[#181818]">
      {/* Scroll arrow — opens the drawer. Not gated on canDrag: filter UI in
          the drawer is useful on every device, and drag works on desktop. */}
      {showArrow && !drawerOpen && (
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open panel"
          className="fixed left-1/2 top-[72px] z-50 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-2xl border border-white/10 bg-[#1f1f1f] text-zinc-300 shadow-lg transition-all duration-300 hover:border-[#58c28d]/30 hover:text-white"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      )}

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

      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:py-6">
        {q && (
          <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-[#1f1f1f] px-4 py-3 text-sm">
            <span className="text-zinc-400">Results for</span>
            <span className="break-all font-medium text-white">“{q}”</span>
            {chips.map((chip, i) => (
              <span
                key={`${chip}-${i}`}
                className="rounded-full border border-[#58c28d]/25 bg-[#58c28d]/10 px-2.5 py-1 text-xs font-medium text-[#dff6ea]"
              >
                {chip}
              </span>
            ))}
            {ignored.length > 0 && chips.length > 0 && (
              <span className="text-xs text-zinc-500">ignored: {ignored.join(", ")}</span>
            )}
            <button
              type="button"
              onClick={clearSearch}
              className="ml-auto inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-zinc-400 transition hover:border-red-400/30 hover:text-red-400"
            >
              Clear search
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div ref={podiumRef} className="scroll-mt-32 lg:scroll-mt-20">
          {initialLoad ? (
            <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: PODIUM_SIZE }).map((_, i) => (
                <div key={i} className="h-56 rounded-2xl bg-[#262626] animate-pulse sm:h-96" />
              ))}
            </div>
          ) : (
            <RankingPodium />
          )}
        </div>

        {error && (
          <div className="mt-8 rounded-3xl border border-red-400/20 bg-red-500/10 p-6 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && rankings.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dashed border-white/10 bg-[#1f1f1f] p-8 text-center sm:p-12">
            {q ? (
              <>
                <p className="font-medium text-zinc-400">No plans match “{q}”</p>
                <p className="mt-2 text-sm text-zinc-500">
                  {interpretation?.matchNothing
                    ? `Could not understand: ${ignored.join(", ")}. `
                    : ""}
                  Try fewer words, for example “jio 299” or “2gb hotstar”.
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-zinc-400">No plans match this category</p>
                <p className="mt-2 text-sm text-zinc-500">
                  Try a different category or widen the budget and validity ranges.
                </p>
              </>
            )}
          </div>
        )}

        {tiers.map((tier) => (
          <section key={tier.key} className="mt-8 sm:mt-10">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
                {tier.name}
              </h2>
              <span className="text-xs text-zinc-600">{tier.plans.length}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
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
      </main>

      <MobilePodiumBar visible={barVisible} onView={scrollToPodium} />
      <SlotPickerSheet />

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`fixed right-4 z-40 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-[#1f1f1f] shadow-xl transition-all duration-200 hover:border-[#58c28d]/30 hover:bg-[#262626] ${
            barVisible ? "bottom-24 lg:bottom-6" : "bottom-6"
          }`}
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
