"use client";

import { useEffect, useRef, useState } from "react";

import FilterBar from "../components/FilterBar";
import PlanCard from "../components/PlanCard";
import RankingPodium from "../components/RankingPodium";
import CompareBar from "../components/CompareBar";
import { getRankings, getRankingFormats } from "../api/plans.api";
import { DEFAULT_FILTERS, toApiParams } from "../utils/filterConfig";

const PODIUM_COUNT = 3;

export default function Home() {
  const [formats, setFormats] = useState([]);
  const [format, setFormat] = useState("best-value");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const requestId = useRef(0);

  // Format list comes from the backend so the weights and the UI never drift.
  useEffect(() => {
    getRankingFormats()
      .then(({ data }) => {
        setFormats(data.formats || []);
        if (data.defaultFormat) setFormat(data.defaultFormat);
      })
      .catch(() => setFormats([]));
  }, []);

  // Format or filters changed -> re-rank the whole matching set.
  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    getRankings({ ...toApiParams(filters), format })
      .then(({ data }) => {
        if (id !== requestId.current) return;
        setRankings(data.rankings || []);
      })
      .catch((err) => {
        if (id !== requestId.current) return;
        setError(
          typeof err?.response?.data === "string"
            ? err.response.data
            : "Could not load rankings."
        );
        setRankings([]);
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
  }, [format, filters]);

  useEffect(() => {
    const handler = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const podium = rankings.slice(0, PODIUM_COUNT);
  const remainder = rankings.slice(PODIUM_COUNT);

  // Three tiers by position. Rank numbers stay hidden; the tiers are what
  // gives the list visible structure without the humiliation of "rank #47".
  const third = Math.ceil(remainder.length / 3) || 0;
  const tiers = [
    { key: "strong", name: "Strong picks", plans: remainder.slice(0, third) },
    { key: "good", name: "Also good", plans: remainder.slice(third, third * 2) },
    { key: "rest", name: "The rest", plans: remainder.slice(third * 2) },
  ].filter((tier) => tier.plans.length > 0);

  const initialLoad = loading && rankings.length === 0;

  return (
    <div className="min-h-screen bg-[#181818]">
      {/* Format chips */}
      <div className="border-b border-white/10 bg-[#181818]">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-brand pb-1">
            {formats.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFormat(item.id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  format === item.id
                    ? "border-[#58c28d]/40 bg-[#58c28d]/15 text-[#dff6ea]"
                    : "border-white/10 bg-[#262626] text-zinc-400 hover:border-[#58c28d]/30 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <FilterBar
        filters={filters}
        onApply={(next) => setFilters(next)}
        onClear={() => setFilters(DEFAULT_FILTERS)}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 pb-56 sm:pb-48 lg:pb-40">
        {/* Podium */}
        {initialLoad ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PODIUM_COUNT }).map((_, i) => (
              <div key={i} className="h-72 rounded-3xl bg-[#262626] animate-pulse" />
            ))}
          </div>
        ) : (
          <RankingPodium plans={podium} />
        )}

        {error && (
          <div className="mt-8 rounded-3xl border border-red-400/20 bg-red-500/10 p-6 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && rankings.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dashed border-white/10 bg-[#1f1f1f] p-12 text-center">
            <p className="font-medium text-zinc-400">No plans match these filters</p>
            <p className="mt-2 text-sm text-zinc-500">
              Try widening the budget or validity range.
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
                <PlanCard key={plan._id} plan={plan} />
              ))}
            </div>
          </section>
        ))}

      </main>

      <CompareBar />

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-24 right-4 z-50 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-[#1f1f1f] shadow-xl transition-all duration-200 hover:border-[#58c28d]/30 hover:bg-[#262626]"
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