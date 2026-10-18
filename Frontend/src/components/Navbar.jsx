import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import logo from "../assets/TeleBolt Logo.png";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

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

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logoutUser, loading } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const onHome = pathname === "/" || pathname === "/plans";
  const urlQ = searchParams.get("q") || "";

  const [value, setValue] = useState(urlQ);
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);

  // Keep the box in step with the URL (back button, "Clear search", links),
  // without fighting the user while they type.
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = value.trim();
    if (onHome) setSearchParams(next ? { q: next } : {});
    else navigate(next ? `/?q=${encodeURIComponent(next)}` : "/");
    setIsMenuOpen(false);
  };

  const handleClear = () => {
    setValue("");
    if (onHome) setSearchParams({}, { replace: true });
  };

  const closeMenu = () => setIsMenuOpen(false);

  const navLinkClass = ({ isActive }) =>
    `transition-colors duration-200 ${
      isActive ? "text-white" : "text-zinc-400 hover:text-[#58c28d]"
    }`;

  const logoutButtonClass =
    "rounded-xl bg-[#58c28d] px-4 py-2 text-sm font-medium text-black transition hover:brightness-110";

  const isAdmin = user?.role === "admin";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#1f1f1f]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link to="/" className="flex min-w-0 shrink-0 items-center gap-3">
            <img src={logo} alt="TeleBolt" className="h-8 w-auto object-contain" />
            <span className="hidden sm:block text-lg font-semibold text-white">
              TeleBolt
            </span>
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
            <NavLink to="/coverage" className={navLinkClass}>
              Coverage
            </NavLink>

            {loading ? (
              <div className="h-8 w-32 rounded-lg bg-white/10 animate-pulse" />
            ) : user ? (
              <>
                {isAdmin && (
                  <NavLink to="/admin" className={navLinkClass}>
                    Admin
                  </NavLink>
                )}
                <NavLink to="/suggest-plan" className={navLinkClass}>
                  Suggest a Plan
                </NavLink>
                <NavLink to="/profile" className={navLinkClass}>
                  Profile
                </NavLink>
                <NotificationBell />
                <button onClick={logoutUser} className={logoutButtonClass}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>
                  Login
                </NavLink>
                <Link to="/register" className={logoutButtonClass}>
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* Mobile: bell lives in the top bar so its panel is never clipped */}
          <div className="flex shrink-0 items-center gap-1 lg:hidden">
            {user && <NotificationBell />}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-zinc-300 transition hover:bg-white/5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile search row */}
        <div className="pb-3 lg:hidden">
          <SearchInput
            value={value}
            onChange={setValue}
            onSubmit={handleSubmit}
            onClear={handleClear}
          />
        </div>

        {isMenuOpen && (
          <nav
            id="mobile-nav"
            className="max-h-[70vh] overflow-y-auto scrollbar-brand border-t border-white/10 py-4 lg:hidden"
          >
            <div className="flex flex-col gap-4">
              <NavLink to="/coverage" className={navLinkClass} onClick={closeMenu}>
                Coverage
              </NavLink>

              {user ? (
                <>
                  {isAdmin && (
                    <NavLink to="/admin" className={navLinkClass} onClick={closeMenu}>
                      Admin
                    </NavLink>
                  )}
                  <NavLink to="/suggest-plan" className={navLinkClass} onClick={closeMenu}>
                    Suggest a Plan
                  </NavLink>
                  <NavLink to="/profile" className={navLinkClass} onClick={closeMenu}>
                    Profile
                  </NavLink>
                  <button
                    onClick={logoutUser}
                    className="w-full rounded-2xl bg-[#58c28d] px-4 py-3 font-semibold text-black transition hover:brightness-110"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={navLinkClass} onClick={closeMenu}>
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    onClick={closeMenu}
                    className="rounded-2xl bg-[#58c28d] px-4 py-3 text-center font-semibold text-black transition hover:brightness-110"
                  >
                    Register
                  </NavLink>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
