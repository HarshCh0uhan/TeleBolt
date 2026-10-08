"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";

import FilterBar from "../components/FilterBar";
import PlanCard from "../components/PlanCard";
import { PlanCardSkeleton } from "../components/PlanCardSkeleton";
import CompareBar from "../components/CompareBar";
import { getPlans } from "../api/plans.api";

const SKELETON_COUNT = 6;

export default function Home() {
  const [plans, setPlans] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    operators: [],
    category: "",
    dailyData: 0,
    minValidity: 1,
    maxValidity: 365,
    minData: 1,
    maxData: 500,
    ottApps: [],
    minPrice: 99,
    maxPrice: 3000,
  });
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const scrollTopBtnRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.operators?.length) count += filters.operators.length;
    if (filters.category) count++;
    if (filters.dailyData > 0) count++;
    if (filters.minData > 1 || filters.maxData < 500) count++;
    if (filters.minPrice > 99 || filters.maxPrice < 3000) count++;
    if (filters.minValidity > 1 || filters.maxValidity < 365) count++;
    if (filters.ottApps?.length) count += filters.ottApps.length;
    return count;
  }, [filters]);

  const buildParams = useCallback(() => {
    const params = { page, limit: 12 };
    if (filters.operators?.length) params.operator = filters.operators.join(",");
    if (filters.category) params.category = filters.category;
    if (filters.minPrice > 99) params.minPrice = filters.minPrice;
    if (filters.maxPrice < 3000) params.maxPrice = filters.maxPrice;
    if (filters.minData > 1) params.minData = filters.minData;
    if (filters.maxData < 500) params.maxData = filters.maxData;
    if (filters.dailyData > 0) params.dailyData = filters.dailyData;
    if (filters.minValidity > 1) params.minValidity = filters.minValidity;
    if (filters.maxValidity < 365) params.maxValidity = filters.maxValidity;
    if (filters.ottApps?.length) params.ottApps = filters.ottApps.join(",");
    return params;
  }, [filters, page]);

  const fetchPlans = useCallback(async (isNewSearch = false) => {
    const p = isNewSearch ? 1 : page;
    setLoading(true);
    try {
      const { data } = await getPlans({ ...buildParams(), page: p });
      const newPlans = data.plans || [];
      setPlans((prev) => (isNewSearch ? newPlans : [...prev, ...newPlans]));
      setHasMore(newPlans.length === (data.pagination?.limit || 12));
      setPage(p + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [buildParams, page]);

  useEffect(() => {
    fetchPlans(true);
  }, [filters]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) fetchPlans();
      },
      { rootMargin: "200px", threshold: 0.1 }
    );
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loading, fetchPlans]);

  // Scroll to top button
  useEffect(() => {
    const handler = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFiltersChange = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const handleApply = () => fetchPlans(true);
  const handleClear = () => {
    setFilters({
      operators: [],
      minPrice: 99,
      maxPrice: 3000,
      minData: 1,
      maxData: 500,
      dailyData: 0,
      minValidity: 1,
      maxValidity: 365,
      category: "",
      ottApps: [],
    });
    fetchPlans(true);
  };

  const renderGrid = () => (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {plans.map((plan) => (
        <PlanCard key={plan._id} plan={plan} />
      ))}
      {loading && plans.length === 0 &&
        Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <PlanCardSkeleton key={i} />
        ))}
      {hasMore && loading && plans.length > 0 &&
        Array.from({ length: 3 }).map((_, i) => (
          <PlanCardSkeleton key={`load-${i}`} />
        ))}
      <div ref={loadMoreRef} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#181818]">
      <FilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApply={handleApply}
        onClear={handleClear}
        activeCount={activeFilterCount}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 pb-56 sm:pb-48 lg:pb-40">
        {renderGrid()}
      </main>

      <CompareBar />

      {showScrollTop && (
        <button
          ref={scrollTopBtnRef}
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 z-50 grid h-12 w-12 place-items-center rounded-2xl bg-[#1f1f1f] border border-white/10 shadow-xl hover:border-[#58c28d]/30 hover:bg-[#262626] transition-all duration-200"
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