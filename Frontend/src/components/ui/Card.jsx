import { motion } from "framer-motion";

const Card = ({
  children,
  className = "",
  hover = false,
}) => {
  return (
    <motion.div
      whileHover={
        hover
          ? {
              y: -6,
            }
          : undefined
      }
      className={`
        rounded-[24px]
        border
        border-white/60
        bg-white/80
        backdrop-blur-xl
        shadow-[0_8px_40px_rgba(0,0,0,0.08)]
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default Card;