import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

// TODO: import useAuth when ready

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.5,
    },
  },
};

const fieldVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const Login = ({ isAdminLogin = false }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    adminSecretKey: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // TODO: validate form fields

    // TODO: call login() or adminLogin() from AuthContext based on isAdminLogin prop
    // TODO: handle loading state, errors, and success flow
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 font-['Plus_Jakarta_Sans',Inter,sans-serif] dark:bg-gradient-to-br dark:from-[#0f0c29] dark:via-[#302b63] dark:to-[#24243e]">
      {/* Gradient Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-purple-400/30 blur-3xl" />
        <div className="absolute right-[-120px] top-[10%] h-[380px] w-[380px] rounded-full bg-indigo-400/30 blur-3xl" />
        <div className="absolute bottom-[-120px] left-[25%] h-[420px] w-[420px] rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute right-[20%] bottom-[10%] h-[280px] w-[280px] rounded-full bg-orange-200/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            ease: "easeOut",
          }}
          className="w-full max-w-md rounded-3xl border border-white/20 bg-white/80 p-10 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
        >
          {/* TODO: Replace with TeleBolt logo */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/70 text-3xl shadow-lg backdrop-blur dark:bg-white/10">
              ⚡
            </div>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-[#121212] dark:text-white">
              {isAdminLogin ? "Admin Login" : "Welcome Back"}
            </h1>

            <p className="mt-3 text-sm text-gray-600 dark:text-white/70">
              {isAdminLogin
                ? "Sign in to manage the TeleBolt platform."
                : "Sign in to continue comparing telecom plans smarter."}
            </p>
          </div>

          <motion.form
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <motion.div variants={fieldVariants}>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#121212] dark:text-white/80"
              >
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                aria-invalid={!!error}
                className="w-full rounded-xl border border-gray-200 bg-white/60 px-4 py-3 text-sm text-[#121212] backdrop-blur outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#4F46E5] dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
                placeholder="you@example.com"
              />
            </motion.div>

            <motion.div variants={fieldVariants}>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#121212] dark:text-white/80"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  aria-invalid={!!error}
                  className="w-full rounded-xl border border-gray-200 bg-white/60 px-4 py-3 pr-12 text-sm text-[#121212] backdrop-blur outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#4F46E5] dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-[#4F46E5] dark:text-white/60"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </motion.div>

            {isAdminLogin && (
              <motion.div variants={fieldVariants}>
                <label
                  htmlFor="adminSecretKey"
                  className="mb-2 block text-sm font-medium text-[#121212] dark:text-white/80"
                >
                  Admin Secret Key
                </label>

                <input
                  id="adminSecretKey"
                  name="adminSecretKey"
                  type="password"
                  value={formData.adminSecretKey}
                  onChange={handleChange}
                  aria-invalid={!!error}
                  className="w-full rounded-xl border border-gray-200 bg-white/60 px-4 py-3 text-sm text-[#121212] backdrop-blur outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#4F46E5] dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
                  placeholder="Enter admin secret key"
                />
              </motion.div>
            )}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={fieldVariants}>
              <div className="flex items-center justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-[#4F46E5] transition-colors hover:text-[#4338CA]"
                >
                  Forgot Password?
                </Link>
              </div>
            </motion.div>

            <motion.div variants={fieldVariants}>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-[#4F46E5] py-3 font-semibold text-white shadow-lg shadow-indigo-300/20 transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-indigo-500"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : isAdminLogin ? (
                  "Login as Admin"
                ) : (
                  "Sign In"
                )}
              </motion.button>
            </motion.div>
          </motion.form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-white/70">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-[#4F46E5] transition-colors hover:text-[#4338CA]"
              >
                Create Account
              </Link>
            </p>
          </div>

          {isAdminLogin === false && (
            <div className="mt-4 text-center">
              <Link
                to="/register-admin"
                className="text-xs font-medium text-[#FF7A59] hover:underline"
              >
                Register as Admin
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Login;