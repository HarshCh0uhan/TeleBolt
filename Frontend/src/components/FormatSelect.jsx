import { useEffect, useRef, useState } from "react";
import { ChevronDown, Layers3 } from "lucide-react";

const FormatSelect = ({ formats, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = formats.find((f) => f.id === value);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
          open
            ? "border-[#58c28d]/40 bg-[#58c28d]/10 text-white"
            : "border-white/10 bg-[#1f1f1f] text-zinc-300 hover:border-[#58c28d]/30 hover:text-white"
        }`}
      >
        <Layers3 className="h-4 w-4 text-[#58c28d]" />
        <span>{current?.label || "Category"}</span>
        <ChevronDown
          className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-2xl border border-white/10 bg-[#1f1f1f] p-2 shadow-2xl shadow-black/50">
          {formats.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onChange(item.id);
                setOpen(false);
              }}
              className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                value === item.id
                  ? "bg-[#58c28d]/15 text-[#dff6ea]"
                  : "text-zinc-300 hover:bg-[#262626] hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormatSelect;