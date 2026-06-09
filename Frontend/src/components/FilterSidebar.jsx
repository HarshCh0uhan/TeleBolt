import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

export default function FilterSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const operators = ["Jio", "Airtel", "VI"];

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="mb-4 lg:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#1f1f1f] px-4 py-3 text-sm text-white"
        >
          <SlidersHorizontal size={18} />
          Filters
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 lg:hidden">
          <div className="absolute left-0 top-0 h-full w-[300px] border-r border-white/10 bg-[#1f1f1f]">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h2 className="text-lg font-semibold text-white">
                Filters
              </h2>

              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <SidebarContent operators={operators} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden w-[260px] shrink-0 border-r border-white/10 bg-[#1f1f1f] lg:block">
        <SidebarContent operators={operators} />
      </aside>
    </>
  );
}

function SidebarContent({ operators }) {
  return (
    <div className="p-5">
      {/* Operators */}
      <div className="mb-8">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Operator
        </h3>

        <div className="space-y-3">
          {operators.map((operator) => (
            <label
              key={operator}
              className="flex cursor-pointer items-center gap-3 text-white"
            >
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#58c28d]"
              />

              <span>{operator}</span>
            </label>
          ))}
        </div>

        {/* TODO:
            Connect selected operators state
            Handle operator filtering
        */}
      </div>

      {/* Budget */}
      <div className="mb-8">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Budget
        </h3>

        <input
          type="range"
          min="99"
          max="3000"
          className="w-full"
        />

        <div className="mt-2 flex justify-between text-xs text-zinc-500">
          <span>₹99</span>
          <span>₹3000</span>
        </div>

        {/* TODO:
            Connect budget state
            Display selected budget
            Apply budget filtering
        */}
      </div>

      {/* Minimum Daily Data */}
      <div className="mb-8">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Min Data / Day
        </h3>

        <input
          type="range"
          min="0"
          max="5"
          step="0.5"
          className="w-full"
        />

        <div className="mt-2 flex justify-between text-xs text-zinc-500">
          <span>0 GB</span>
          <span>5 GB</span>
        </div>

        {/* TODO:
            Connect minimum data state
            Display selected data amount
            Apply data filtering
        */}
      </div>

      {/* Sort */}
      <div>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Sort By
        </h3>

        <select className="w-full rounded-xl border border-white/10 bg-[#262626] px-4 py-3 text-white outline-none">
          <option>Best Value (₹/GB)</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Highest Data</option>
          <option>Longest Validity</option>
        </select>

        {/* TODO:
            Connect sort state
            Implement sorting logic
        */}
      </div>
    </div>
  );
}