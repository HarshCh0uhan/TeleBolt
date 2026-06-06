import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

// TODO: import useAuth when ready

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.3,
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

// ─── SVG Icons ────────────────────────────────────────────────────────────────
 
const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-[18px] h-[18px]"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);
 
const EyeSlashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-[18px] h-[18px]"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);
 
const ShieldIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-[18px] h-[18px]"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
  </svg>
);

const Register = ({ isAdminRegister = false }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminSecretKey: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // TODO: validate passwords match, check agreedToTerms, etc.

    // TODO: call register() or registerAdmin() from AuthContext based on isAdminRegister prop, handle errors
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
              {isAdminRegister
                ? "Admin Registration"
                : "Create an account"}
            </h1>

            <p className="mt-3 text-sm text-gray-600 dark:text-white/70">
              {isAdminRegister
                ? "Create an administrator account to manage the TeleBolt platform."
                : "Join TeleBolt and start comparing telecom plans smarter."}
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
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-[#121212] dark:text-white/80"
              >
                Username
              </label>

              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                aria-invalid={!!error}
                className="w-full rounded-xl border border-gray-200 bg-white/60 px-4 py-3 text-sm text-[#121212] backdrop-blur outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#4F46E5] dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
                placeholder="Enter your username"
              />
            </motion.div>

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
                  placeholder="Create a password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-[#4F46E5] dark:text-white/60"
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={fieldVariants}>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-[#121212] dark:text-white/80"
              >
                Confirm Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  aria-invalid={!!error}
                  className="w-full rounded-xl border border-gray-200 bg-white/60 px-4 py-3 pr-12 text-sm text-[#121212] backdrop-blur outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#4F46E5] dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
                  placeholder="Confirm your password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-[#4F46E5] dark:text-white/60"
                >
                  {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </motion.div>

            {isAdminRegister && (
              <motion.div variants={fieldVariants}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 tracking-widest uppercase">
                    <ShieldIcon />
                    Admin Only
                  </span>
                  <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
                </div>
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
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) =>
                    setAgreedToTerms(e.target.checked)
                  }
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#4F46E5] focus:ring-[#4F46E5]"
                />

                <span className="text-sm text-gray-600 dark:text-white/70">
                  I agree to the{" "}
                  <span className="font-medium text-[#4F46E5]">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="font-medium text-[#4F46E5]">
                    Privacy Policy
                  </span>
                </span>
              </label>
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
                ) : isAdminRegister ? (
                  "Register as Admin"
                ) : (
                  "Create account"
                )}
              </motion.button>
            </motion.div>
          </motion.form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-white/70">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#4F46E5] transition-colors hover:text-[#4338CA]"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;