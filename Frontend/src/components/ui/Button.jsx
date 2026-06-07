import { motion } from "framer-motion";

const variants = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20",

  secondary:
    "bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50",

  ghost:
    "bg-transparent text-neutral-700 hover:bg-white/60",
};

const Button = ({
  children,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
  ...props
}) => {
  return (
    <motion.button
      whileHover={{
        y: -2,
      }}
      whileTap={{
        scale: 0.98,
      }}
      type={type}
      disabled={disabled}
      className={`
        inline-flex
        items-center
        justify-center
        rounded-2xl
        px-5
        py-3
        text-sm
        font-medium
        transition-all
        duration-200
        focus:outline-none
        focus:ring-2
        focus:ring-indigo-500
        focus:ring-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;