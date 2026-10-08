"use client";

import { useEffect, useRef, useState, useCallback } from "react";

import FilterBar from "../components/FilterBar";
import PlanCard from "../components/PlanCard";
import { PlanCardSkeleton } from "../components/PlanCardSkeleton";
import CompareBar from "../components/CompareBar";
import { getPlans } from "../api/plans.api";
import { DEFAULT_FILTERS, toApiParams } from "../utils/filterConfig";

const SKELETON_COUNT = 6;
const PAGE_SIZE = 12;

export default function Home() {
  const [plans, setPlans] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const loadMoreRef = useRef(null);
  const observerRef = useRef(null);
  const requestId = useRef(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const fetchPlans = useCallback(
    async (isNewSearch = false) => {
      const p = isNewSearch ? 1 : page;
      const id = ++requestId.current; // lets us ignore outdated responses
      setLoading(true);
      try {
        const { data } = await getPlans({ ...toApiParams(filters), page: p, limit: PAGE_SIZE });
        if (id !== requestId.current) return;
        const incoming = data.plans || [];
        setPlans((prev) => (isNewSearch ? incoming : [...prev, ...incoming]));
        setHasMore(incoming.length === (data.pagination?.limit || PAGE_SIZE));
        setPage(p + 1);
      } catch (e) {
        if (id === requestId.current) console.error(e);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [filters, page]
  );

  // Applying or clearing filters just changes `filters`; this effect does the fetch.
  useEffect(() => {
    fetchPlans(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Infinite scroll
  useEffect(() => {
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) fetchPlans();
      },
      { rootMargin: "200px", threshold: 0.1 }
    );
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loading, fetchPlans]);

  // Scroll-to-top button
  useEffect(() => {
    const handler = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#181818]">
      <FilterBar
        filters={filters}
        onApply={(next) => setFilters(next)}
        onClear={() => setFilters(DEFAULT_FILTERS)}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 pb-56 sm:pb-48 lg:pb-40">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard key={plan._id} plan={plan} />
          ))}

          {loading && plans.length === 0 &&
            Array.from({ length: SKELETON_COUNT }).map((_, i) => <PlanCardSkeleton key={i} />)}

          {hasMore && loading && plans.length > 0 &&
            Array.from({ length: 3 }).map((_, i) => <PlanCardSkeleton key={`load-${i}`} />)}

          <div ref={loadMoreRef} />
        </div>

        {!loading && plans.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-white/10 bg-[#1f1f1f] p-12 text-center">
            <p className="font-medium text-zinc-400">No plans match these filters</p>
            <p className="mt-2 text-sm text-zinc-500">Try widening the budget or validity range.</p>
          </div>
        )}
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