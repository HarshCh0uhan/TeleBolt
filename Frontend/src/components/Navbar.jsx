import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/TeleBolt Logo.png";
import {useAuth} from "../context/AuthContext"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {user, logoutUser, loading} = useAuth()

  const navLinkClass = ({ isActive }) =>
    `transition-colors duration-200 ${
      isActive
        ? "text-white"
        : "text-zinc-400 hover:text-[#58c28d]"
    }`;

  return (
    <header className="border-b border-white/10 bg-[#1f1f1f]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3"
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {/* <NavLink to="/plans" className={navLinkClass}>
              Plans
            </NavLink> */}

            <NavLink to="/compare" className={navLinkClass}>
              Compare
            </NavLink>

            {loading ? (
                <div className="h-8 w-32 rounded-lg bg-white/10 animate-pulse" />
            ) : user ? (
              <>
                <NavLink to="/profile" className={navLinkClass}>
                  Profile
                </NavLink>
                <button onClick={logoutUser} className="flex-1 rounded-2xl bg-[#58c28d] px-4 py-3 font-semibold text-black transition hover:brightness-110">
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
                  className="rounded-xl bg-[#58c28d] px-4 py-2 text-sm font-medium text-black transition hover:brightness-110"
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden rounded-lg p-2 text-zinc-300 hover:bg-white/5"
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="border-t border-white/10 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <NavLink to="/plans" className={navLinkClass}>
                Plans
              </NavLink>

              <NavLink to="/compare" className={navLinkClass}>
                Compare
              </NavLink>

              {user ? (
                <>
                  <NavLink to="/profile" className={navLinkClass}>
                    Profile
                  </NavLink>
                  <button onClick={logoutUser} className="flex-1 rounded-2xl bg-[#58c28d] px-4 py-3 font-semibold text-black transition hover:brightness-110">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={navLinkClass}>
                    Login
                  </NavLink>

                  <NavLink to="/register" className={navLinkClass}>
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