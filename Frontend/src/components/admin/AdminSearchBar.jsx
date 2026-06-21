import { Search, X } from 'lucide-react';

const AdminSearchBar = ({
  value,
  onChange,
  placeholder = 'Search plans, operators, prices…',
  onClear,
  className = '',
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-500" />
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-[#262626] py-3.5 pl-11 pr-11 text-sm text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-[#58c28d]/40 focus:bg-[#2b2b2b]"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onClear?.()}
          className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-xl border border-white/10 bg-[#1f1f1f] text-zinc-400 transition-all duration-300 hover:border-[#58c28d]/30 hover:text-white"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
};

export default AdminSearchBar;
