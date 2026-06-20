// Small status pill. `tone` picks the color; defaults to neutral zinc.
// tone: "mint" | "yellow" | "red" | "zinc"
const toneStyles = {
  mint: "bg-[#58c28d]/10 text-[#58c28d]",
  yellow: "bg-yellow-400/10 text-yellow-400",
  red: "bg-red-400/10 text-red-400",
  zinc: "bg-white/5 text-zinc-400",
};

const Badge = ({ children, tone = "zinc" }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneStyles[tone]}`}
  >
    {children}
  </span>
);

export default Badge;