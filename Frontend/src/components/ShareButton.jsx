import { useState } from "react";
import { Share2, Check, Loader2 } from "lucide-react";

const ShareButton = ({ planId, operator, price, compact = false, className = "" }) => {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    const url = `${window.location.origin}/plans/${planId}`;
    const title = `${operator} ₹${price} plan on TeleBolt`;

    setBusy(true);
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        window.prompt("Copy this link:", url);
      }
    } catch {
      // user cancelled the native share sheet, or clipboard denied. Silent.
    } finally {
      setBusy(false);
    }
  };

  const sizeClass = compact ? "h-7 w-7" : "h-9 w-9";
  const iconClass = compact ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Share plan"
      title={copied ? "Link copied" : "Share plan"}
      className={`grid ${sizeClass} shrink-0 place-items-center rounded-lg border border-white/10 bg-[#262626] text-zinc-400 transition hover:border-[#58c28d]/30 hover:text-white ${className}`}
    >
      {busy ? (
        <Loader2 className={`${iconClass} animate-spin`} />
      ) : copied ? (
        <Check className={`${iconClass} text-[#58c28d]`} />
      ) : (
        <Share2 className={iconClass} />
      )}
    </button>
  );
};

export default ShareButton;