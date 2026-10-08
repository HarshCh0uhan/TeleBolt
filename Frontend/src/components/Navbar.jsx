import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/TeleBolt Logo.png";
import {useAuth} from "../context/AuthContext"
import { useCompare } from "../context/CompareContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {user, logoutUser, loading} = useAuth()
  const { selectedCount } = useCompare()

  // Tapping any mobile link dismisses the menu, so it never hangs over the page
  // you just navigated to.
  const closeMenu = () => setIsMenuOpen(false);

  const navLinkClass = ({ isActive }) =>
    `transition-colors duration-200 ${
      isActive
        ? "text-white"
        : "text-zinc-400 hover:text-[#58c28d]"
    }`;

  const logoutButtonClass =
    "rounded-xl bg-[#58c28d] px-4 py-2 text-sm font-medium text-black transition hover:brightness-110";

  const countBadgeClass =
    "min-w-5 rounded-full bg-[#58c28d] px-1.5 py-0.5 text-center text-[11px] font-semibold text-[#181818]";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#1f1f1f]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Logo */}
          <Link
            to="/"
            className="flex min-w-0 items-center gap-3"
          >
            <img
              src={logo}
              alt="TeleBolt"
              className="h-8 w-auto object-contain"
            />

            <span className="hidden sm:block text-lg font-semibold text-white">
              TeleBolt
            </span>
          </Link>

          {/*
            Desktop Navigation
            Held back to lg: the full row needs ~1000px, so on a 768-1023px
            tablet it used to squash. Those widths now get the menu button.
          */}
          <nav className="hidden shrink-0 items-center gap-6 lg:flex xl:gap-8">
            {/* <NavLink to="/plans" className={navLinkClass}>
              Plans
            </NavLink> */}

            <NavLink to="/rankings" className={navLinkClass}>
              Rankings
            </NavLink>

            <NavLink to="/coverage" className={navLinkClass}>
              Coverage
            </NavLink>

            <NavLink to="/compare" className={navLinkClass}>
              <span className="flex items-center gap-2">
                Compare
                {selectedCount > 0 && (
                  <span className={countBadgeClass}>
                    {selectedCount}
                  </span>
                )}
              </span>
            </NavLink>

            {loading ? (
                <div className="h-8 w-32 rounded-lg bg-white/10 animate-pulse" />
            ) : user ? (
              <>
                <NavLink to="/suggest-plan" className={navLinkClass}>
                  Suggest a Plan
                </NavLink>
                <NavLink to="/profile" className={navLinkClass}>
                  Profile
                </NavLink>
                <button onClick={logoutUser} className={logoutButtonClass}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>
                  Login
                </NavLink>

                <Link
                  to="/register"
                  className={logoutButtonClass}
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* Mobile & tablet menu button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-zinc-300 transition hover:bg-white/5 lg:hidden"
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

        {/* Mobile & tablet Navigation */}
        {isMenuOpen && (
          <nav
            id="mobile-nav"
            className="max-h-[70vh] overflow-y-auto scrollbar-brand border-t border-white/10 py-4 lg:hidden"
          >
            <div className="flex flex-col gap-4">
              <NavLink to="/plans" className={navLinkClass} onClick={closeMenu}>
                Plans
              </NavLink>

              <NavLink to="/rankings" className={navLinkClass} onClick={closeMenu}>
                Rankings
              </NavLink>

              <NavLink to="/coverage" className={navLinkClass} onClick={closeMenu}>
                Coverage
              </NavLink>

              <NavLink to="/compare" className={navLinkClass} onClick={closeMenu}>
                <span className="flex items-center justify-between">
                  <span>Compare</span>
                  {selectedCount > 0 && (
                    <span className={countBadgeClass}>
                      {selectedCount}
                    </span>
                  )}
                </span>
              </NavLink>

              {user ? (
                <>
                  <NavLink to="/suggest-plan" className={navLinkClass} onClick={closeMenu}>
                    Suggest a Plan
                  </NavLink>
                  <NavLink to="/profile" className={navLinkClass} onClick={closeMenu}>
                    Profile
                  </NavLink>
                  <button onClick={logoutUser} className="w-full rounded-2xl bg-[#58c28d] px-4 py-3 font-semibold text-black transition hover:brightness-110">
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
}

export default Navbar
