import { Star } from "lucide-react";

const StarRating = ({ value = 0, size = "sm", showCount = false, count = 0 }) => {
  const sizeClass = size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5";
  const rounded = Math.round(value * 2) / 2;

  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${sizeClass} ${
            n <= rounded
              ? "fill-amber-400 text-amber-400"
              : "text-zinc-600"
          }`}
        />
      ))}
      {showCount && (
        <span className="ml-1 text-xs text-zinc-500">
          {value > 0 ? value.toFixed(1) : "—"}
          {count > 0 && ` (${count})`}
        </span>
      )}
    </span>
  );
};

export default StarRating;