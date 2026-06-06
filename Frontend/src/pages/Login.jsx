import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/TeleBolt Logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Placeholder UI state only
  const error = "";

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // UI-only loading simulation
    setTimeout(() => {
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6 sm:p-8 md:p-10 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <img
              src={logo}
              alt="TeleBolt"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Welcome Back
            </h1>
            <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed">
              Sign in to compare plans, track value, and manage your TeleBolt
              experience.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-zinc-400"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 w-full rounded-2xl border border-white/10 bg-[#262626] px-4 text-white outline-none transition-all placeholder:text-zinc-500 focus:border-[#58c28d]/60 focus:ring-2 focus:ring-[#58c28d]/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-zinc-400"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 w-full rounded-2xl border border-white/10 bg-[#262626] px-4 text-white outline-none transition-all placeholder:text-zinc-500 focus:border-[#58c28d]/60 focus:ring-2 focus:ring-[#58c28d]/20"
              />
            </div>

            {/* Error Area (reserved space to prevent layout shift) */}
            <div className="min-h-[24px]">
              {error && (
                <p className="text-sm text-red-400 font-medium">{error}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group flex h-14 w-full items-center justify-center rounded-2xl bg-[#58c28d] text-black font-semibold transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Register */}
          <div className="mt-8 border-t border-white/10 pt-6 text-center">
            <p className="text-sm text-zinc-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-[#58c28d] transition-colors hover:text-[#73d6a2]"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;