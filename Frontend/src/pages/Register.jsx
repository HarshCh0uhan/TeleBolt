import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/TeleBolt Logo.png";

const Register = ({ isAdminRegister = false }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminSecretKey, setAdminSecretKey] = useState("");
  const [loading, setLoading] = useState(false);

  const error = "";

  const accent = isAdminRegister ? "#ef4444" : "#58c28d";

  const handleSubmit = (e) => {
    e.preventDefault();

    setLoading(true);

    // UI-only loading state
    setTimeout(() => {
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6 sm:p-8 md:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src={logo}
              alt="TeleBolt"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Admin Warning */}
          {isAdminRegister && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-red-500" />

                <div>
                  <h3 className="text-sm font-semibold text-red-400">
                    Restricted Administrator Registration
                  </h3>

                  <p className="mt-1 text-xs leading-relaxed text-red-300/80">
                    This area is reserved for authorized administrators only.
                    Registration requires a valid administrator secret key.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              {isAdminRegister
                ? "Create Admin Account"
                : "Create Your Account"}
            </h1>

            <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed">
              {isAdminRegister
                ? "Register a new administrator to manage telecom plans, detected changes, and platform operations."
                : "Join TeleBolt to compare plans, track value, and discover the best telecom offers."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-zinc-400"
              >
                Username
              </label>

              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-14 w-full rounded-2xl border border-white/10 bg-[#262626] px-4 text-white placeholder:text-zinc-500 outline-none transition-all"
                style={{
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              />
            </div>

            {/* Email */}
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
                className="h-14 w-full rounded-2xl border border-white/10 bg-[#262626] px-4 text-white placeholder:text-zinc-500 outline-none transition-all"
              />
            </div>

            {/* Password */}
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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 w-full rounded-2xl border border-white/10 bg-[#262626] px-4 text-white placeholder:text-zinc-500 outline-none transition-all"
              />
            </div>

            {/* Admin Secret Key */}
            {isAdminRegister && (
              <div>
                <label
                  htmlFor="adminSecret"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-red-400"
                >
                  Admin Secret Key
                </label>

                <input
                  id="adminSecret"
                  type="password"
                  placeholder="Enter administrator secret key"
                  value={adminSecretKey}
                  onChange={(e) => setAdminSecretKey(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-red-500/20 bg-[#262626] px-4 text-white placeholder:text-zinc-500 outline-none transition-all"
                />
              </div>
            )}

            {/* Error Area */}
            <div className="min-h-6">
              {error && (
                <p className="text-sm font-medium text-red-400">{error}</p>
              )}
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-14 w-full items-center justify-center rounded-2xl font-semibold text-black transition-all disabled:cursor-not-allowed disabled:opacity-70"
              style={{
                backgroundColor: accent,
              }}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <>
                  {isAdminRegister
                    ? "Create Admin Account"
                    : "Create Account"}
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 border-t border-white/10 pt-6 text-center">
            <p className="text-sm text-zinc-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium transition-colors"
                style={{ color: accent }}
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register