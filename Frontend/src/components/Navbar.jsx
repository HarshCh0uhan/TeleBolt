import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Search, X, LogOut, Map, ShieldCheck, Lightbulb, User as UserIcon } from "lucide-react";
import logo from "../assets/TeleBolt Logo.png";
import { useAuth } from "../context/AuthContext";
import { useFilters } from "../context/FiltersContext";
import NotificationBell from "./NotificationBell";
import {
  OPERATORS,
  CATEGORIES,
  OTT_APPS,
  DAILY_DATA_OPTIONS,
  LIMITS,
  DEFAULT_FILTERS,
  countActive,
} from "../utils/filterConfig";

const SearchInput = ({ value, onChange, onSubmit, onClear, className = "" }) => (
  <form onSubmit={onSubmit} role="search" className={`relative ${className}`}>
    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      enterKeyHint="search"
      autoComplete="off"
      aria-label="Search plans"
      placeholder="Search e.g. jio 299, vi 2gb hotstar"
      className="h-10 w-full rounded-xl border border-white/10 bg-[#181818] pl-9 pr-9 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-[#58c28d]/40"
    />
    {value ? (
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear search"
        className="absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-zinc-400 transition hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    ) : null}
  </form>
);

const DrawerChip = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
      active
        ? "border-[#58c28d]/50 bg-[#58c28d]/20 text-[#dff6ea]"
        : "border-white/10 bg-[#262626] text-zinc-300"
    }`}
  >
    {children}
  </button>
);

const FilterSection = ({ title, children }) => (
  <div>
    <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">{title}</h4>
    {children}
  </div>
);

const Navbar = () => {
  const { user, logoutUser, loading } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, setFilters, format, setFormat, formats, drawerOpen, setDrawerOpen } = useFilters();

  // Draft filters so the drawer respects Apply/Clear like the desktop FilterBar.
  const [draft, setDraft] = useState(filters);
  const [prevFilters, setPrevFilters] = useState(filters);
  if (prevFilters !== filters) {
    setPrevFilters(filters);
    setDraft(filters);
  }

  const onHome = pathname === "/" || pathname === "/plans";
  const urlQ = searchParams.get("q") || "";

  const [value, setValue] = useState(urlQ);
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);

  if (prevUrlQ !== urlQ) {
    setPrevUrlQ(urlQ);
    if (urlQ !== value.trim()) setValue(urlQ);
  }

  // On the home page results update as you type; elsewhere Enter navigates.
  useEffect(() => {
    if (!onHome) return undefined;
    if (value.trim() === urlQ.trim()) return undefined;
    const timer = setTimeout(() => {
      const next = value.trim();
      setSearchParams(next ? { q: next } : {}, { replace: true });
    }, 350);
    return () => clearTimeout(timer);
  }, [value, urlQ, onHome, setSearchParams]);

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen, setDrawerOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = value.trim();
    if (onHome) setSearchParams(next ? { q: next } : {});
    else navigate(next ? `/?q=${encodeURIComponent(next)}` : "/");
    setDrawerOpen(false);
  };

  const handleClear = () => {
    setValue("");
    if (onHome) setSearchParams({}, { replace: true });
  };

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const navLinkClass = ({ isActive }) =>
    `transition-colors duration-200 ${isActive ? "text-white" : "text-zinc-400 hover:text-[#58c28d]"}`;

  const isAdmin = user?.role === "admin";

  const drawerNavItems = [
    { label: "Coverage", to: "/coverage", icon: Map },
    ...(isAdmin ? [{ label: "Admin", to: "/admin", icon: ShieldCheck }] : []),
    ...(user
      ? [
          { label: "Suggest a Plan", to: "/suggest-plan", icon: Lightbulb },
          { label: "Profile", to: "/profile", icon: UserIcon },
        ]
      : []),
  ];

  const updateDraft = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const toggleInList = (key, item) =>
    updateDraft({
      [key]: draft[key].includes(item)
        ? draft[key].filter((x) => x !== item)
        : [...draft[key], item],
    });

  const setDraftCategory = (cat) =>
    updateDraft({
      category: draft.category === cat ? "" : cat,
      ...(cat === "Non-Daily" ? { dailyData: 0 } : {}),
    });

  const applyFilters = () => {
    setFilters(draft);
    closeDrawer();
  };

  const clearFilters = () => {
    setDraft(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
  };

  const activeFilterCount = countActive(draft);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#1f1f1f]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link to="/" className="flex min-w-0 shrink-0 items-center gap-3">
            <img src={logo} alt="TeleBolt" className="h-8 w-auto object-contain" />
            <span className="hidden sm:block text-lg font-semibold text-white">TeleBolt</span>
          </Link>

          {/* Desktop search */}
          <SearchInput
            value={value}
            onChange={setValue}
            onSubmit={handleSubmit}
            onClear={handleClear}
            className="hidden min-w-0 max-w-xl flex-1 lg:block"
          />

          <nav className="hidden shrink-0 items-center gap-6 lg:flex xl:gap-8">
            <NavLink to="/coverage" className={navLinkClass}>Coverage</NavLink>
            {loading ? (
              <div className="h-8 w-32 rounded-lg bg-white/10 animate-pulse" />
            ) : user ? (
              <>
                {isAdmin && <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>}
                <NavLink to="/suggest-plan" className={navLinkClass}>Suggest a Plan</NavLink>
                <NavLink to="/profile" className={navLinkClass}>Profile</NavLink>
                <NotificationBell />
                <button
                  onClick={logoutUser}
                  className="rounded-xl bg-[#58c28d] px-4 py-2 text-sm font-medium text-black transition hover:brightness-110"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>Login</NavLink>
                <Link
                  to="/register"
                  className="rounded-xl bg-[#58c28d] px-4 py-2 text-sm font-medium text-black transition hover:brightness-110"
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* Mobile: bell + hamburger */}
          <div className="flex shrink-0 items-center gap-1 lg:hidden">
            {user && <NotificationBell />}
            <button
              type="button"
              onClick={openDrawer}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-public-drawer"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-zinc-300 transition hover:bg-white/5"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile search row */}
        <div className="pb-3 lg:hidden">
          <SearchInput value={value} onChange={setValue} onSubmit={handleSubmit} onClear={handleClear} />
        </div>
      </div>

      {/* Mobile slide-over drawer — mirrors the admin console drawer */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden ${
          drawerOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!drawerOpen}
      >
        <div
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
            drawerOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeDrawer}
        />

        <aside
          id="mobile-public-drawer"
          className={`absolute inset-y-0 left-0 flex w-[88vw] max-w-[360px] flex-col border-r border-white/10 bg-[#181818] transition-transform duration-300 ease-out ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="" className="h-8 w-auto" />
              <span className="text-lg font-semibold text-white">TeleBolt</span>
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              aria-label="Close menu"
              className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-[#262626] text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto scrollbar-brand">
            <div className="border-b border-white/10 px-4 py-3">
              <SearchInput
                value={value}
                onChange={setValue}
                onSubmit={handleSubmit}
                onClear={handleClear}
              />
            </div>

            <nav className="space-y-1 border-b border-white/10 p-3">
              {drawerNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeDrawer}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "border border-[#58c28d]/20 bg-[#58c28d]/12 text-[#e9fff4]"
                          : "border border-transparent text-zinc-300 hover:border-white/10 hover:bg-[#262626] hover:text-white"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            {onHome && (
              <div className="space-y-5 border-b border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
                    Filters
                  </span>
                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-[#58c28d] px-2 py-0.5 text-[10px] font-bold text-[#181818]">
                      {activeFilterCount}
                    </span>
                  )}
                </div>

                <FilterSection title="Ranking format">
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#262626] px-3 py-2.5 text-sm text-white outline-none focus:border-[#58c28d]/40"
                  >
                    {formats.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </FilterSection>

                <FilterSection title="Operator">
                  <div className="flex flex-wrap gap-2">
                    {OPERATORS.map((op) => (
                      <DrawerChip
                        key={op}
                        active={draft.operators.includes(op)}
                        onClick={() => toggleInList("operators", op)}
                      >
                        {op}
                      </DrawerChip>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Category">
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <DrawerChip
                        key={cat}
                        active={draft.category === cat}
                        onClick={() => setDraftCategory(cat)}
                      >
                        {cat}
                      </DrawerChip>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="OTT apps">
                  <div className="flex flex-wrap gap-2">
                    {OTT_APPS.map((app) => (
                      <DrawerChip
                        key={app}
                        active={draft.ottApps.includes(app)}
                        onClick={() => toggleInList("ottApps", app)}
                      >
                        {app}
                      </DrawerChip>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Data / day">
                  <div className="flex flex-wrap gap-2">
                    {DAILY_DATA_OPTIONS.map((gb) => (
                      <DrawerChip
                        key={gb}
                        active={draft.dailyData === gb}
                        onClick={() => updateDraft({ dailyData: draft.dailyData === gb ? 0 : gb })}
                      >
                        {gb} GB
                      </DrawerChip>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Budget (₹)">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={LIMITS.price.min}
                      max={draft.maxPrice}
                      value={draft.minPrice}
                      onChange={(e) =>
                        updateDraft({
                          minPrice: Math.max(
                            LIMITS.price.min,
                            Math.min(Number(e.target.value) || LIMITS.price.min, draft.maxPrice)
                          ),
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-[#58c28d]/40"
                    />
                    <input
                      type="number"
                      min={draft.minPrice}
                      max={LIMITS.price.max}
                      value={draft.maxPrice}
                      onChange={(e) =>
                        updateDraft({
                          maxPrice: Math.min(
                            LIMITS.price.max,
                            Math.max(Number(e.target.value) || LIMITS.price.max, draft.minPrice)
                          ),
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-[#58c28d]/40"
                    />
                  </div>
                </FilterSection>

                <FilterSection title="Validity (days)">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={LIMITS.validity.min}
                      max={draft.maxValidity}
                      value={draft.minValidity}
                      onChange={(e) =>
                        updateDraft({
                          minValidity: Math.max(
                            LIMITS.validity.min,
                            Math.min(Number(e.target.value) || LIMITS.validity.min, draft.maxValidity)
                          ),
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-[#58c28d]/40"
                    />
                    <input
                      type="number"
                      min={draft.minValidity}
                      max={LIMITS.validity.max}
                      value={draft.maxValidity}
                      onChange={(e) =>
                        updateDraft({
                          maxValidity: Math.min(
                            LIMITS.validity.max,
                            Math.max(Number(e.target.value) || LIMITS.validity.max, draft.minValidity)
                          ),
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-[#58c28d]/40"
                    />
                  </div>
                </FilterSection>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex-1 rounded-xl border border-white/10 bg-[#262626] px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-red-400/30 hover:text-red-400"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={applyFilters}
                    className="flex-1 rounded-xl bg-[#58c28d] px-4 py-2.5 text-sm font-semibold text-[#181818] transition hover:brightness-110"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer: account or auth */}
          <div className="border-t border-white/10 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-xl bg-[#262626] px-3 py-2">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#58c28d]/20 bg-[#58c28d]/10 text-sm font-bold text-[#58c28d]">
                    {(user.username || "U").trim().charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-white">
                      {user.username}
                    </div>
                    <div className="truncate text-[11px] text-zinc-500">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logoutUser();
                    closeDrawer();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#262626] px-4 py-2.5 text-sm text-zinc-300 transition hover:border-red-400/30 hover:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={closeDrawer}
                  className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-[#262626] px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-[#58c28d]/30 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeDrawer}
                  className="flex w-full items-center justify-center rounded-xl bg-[#58c28d] px-4 py-2.5 text-sm font-semibold text-[#181818] transition hover:brightness-110"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </header>
  );
};

export default Navbar;
