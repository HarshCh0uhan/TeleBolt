import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { filter } from "framer-motion/client";

const FilterSidebar = ({ filters, onFiltersChange, onApply, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);

  const operators = ["Jio", "Airtel", "VI"];
  const categories = ["Daily", "Non-Daily"];
  const ottApps = ["JioHotstar", "Prime", "Netflix", "SonyLiv", "Zee5"];

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
          <div className="absolute left-0 top-0 h-full w-75 border-r border-white/10 bg-[#1f1f1f]">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h2 className="text-lg font-semibold text-white">Filters</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <SidebarContent
              operators={operators}
              categories={categories}
              ottApps={ottApps}
              filters={filters}
              onFiltersChange={onFiltersChange}
              onApply={onApply}
              onClear={onClear}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden w-65 shrink-0 border-r border-white/10 bg-[#1f1f1f] lg:block">
        <SidebarContent
          operators={operators}
          categories={categories}
          ottApps={ottApps}
          filters={filters}
          onFiltersChange={onFiltersChange}
          onApply={onApply}
          onClear={onClear}
        />
      </aside>
    </>
  );
};

function SidebarContent({ operators, categories, ottApps, filters, onFiltersChange, onApply, onClear }) {
  
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
                checked={filters.operators.includes(operator)}
                className="h-4 w-4 accent-[#58c28d]"
                onChange={() => {
                  const updated = filters.operators.includes(operator)
                    ? filters.operators.filter((o) => o !== operator)
                    : [...filters.operators, operator];
                  onFiltersChange("operators", updated);
                }}
              />
              <span>{operator}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="mb-8">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Category
        </h3>

        <div className="space-y-3">
          {categories.map((category) => (
            <label
              key={category}
              className="flex cursor-pointer items-center gap-3 text-white"
              onClick={() => {
                onFiltersChange('category', category)
                onIsDailyPlan(category)
              }}
            >
              <div className="h-4 w-4 rounded-full border-2 border-zinc-600 flex items-center justify-center shrink-0">
                {filters.category === category && (
                  <div className="h-2 w-2 rounded-full bg-[#58c28d]" />
                )}
              </div>
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Daily Data */}
      {filters.category === 'Daily' && <div className="mb-8">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Data / Day
        </h3>

        <input
          type="range"
          min="0"
          max="5"
          value={filters.dailyData}
          step="0.5"
          className="w-full"
          onChange={(e) => onFiltersChange("dailyData", e.target.value)}
        />

        <div className="mt-2 flex justify-between text-xs text-zinc-500">
          <span>0 GB</span>
          <span className="text-zinc-300">{filters.dailyData} GB</span>
          <span>5 GB</span>
        </div>
      </div>}

      {/* Total Data */}
      {filters.category === 'Non-Daily' && <div className="mb-8">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Total Data
        </h3>

        <Slider
          range
          min={1}
          max={500}
          value={[filters.minData, filters.maxData]}
          onChange={([min, max]) => {
            onFiltersChange('minData', min)
            onFiltersChange('maxData', max)
          }}
          styles={{
            track: { backgroundColor: '#58c28d' },
            handle: { borderColor: '#58c28d', backgroundColor: '#58c28d' },
            rail: { backgroundColor: '#3f3f46' }
          }}
        />

        <div className="mt-2 flex justify-between text-xs text-zinc-500">
          <span>{filters.minData} GB</span>
          <span>{filters.maxData} GB</span>
        </div>
      </div>}

      {/* Budget */}
      <div className="mb-8">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Budget
        </h3>

        <Slider
          range
          min={99}
          max={3000}
          value={[filters.minPrice, filters.maxPrice]}
          onChange={([min, max]) => {
            onFiltersChange('minPrice', min)
            onFiltersChange('maxPrice', max)
          }}
          styles={{
            track: { backgroundColor: '#58c28d' },
            handle: { borderColor: '#58c28d', backgroundColor: '#58c28d' },
            rail: { backgroundColor: '#3f3f46' }
          }}
        />

        <div className="mt-2 flex justify-between text-xs text-zinc-500">
          <span>₹{filters.minPrice}</span>
          <span>₹{filters.maxPrice}</span>
        </div>
      </div>

      {/* Validity Days */}
      <div className="mb-8">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Validity Days
        </h3>

        <Slider
          range
          min={1}
          max={365}
          value={[filters.minValidity, filters.maxValidity]}
          onChange={([min, max]) => {
            onFiltersChange('minValidity', min)
            onFiltersChange('maxValidity', max)
          }}
          styles={{
            track: { backgroundColor: '#58c28d' },
            handle: { borderColor: '#58c28d', backgroundColor: '#58c28d' },
            rail: { backgroundColor: '#3f3f46' }
          }}
        />

        <div className="mt-2 flex justify-between text-xs text-zinc-500">
          <span>{filters.minValidity} days</span>
          <span>{filters.maxValidity} days</span>
        </div>
      </div>

      {/* Ott Apps */}
      <div className="mb-8">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          OTT Apps
        </h3>

        <div className="space-y-3">
          {ottApps.map((ottApp) => (
            <label
              key={ottApp}
              className="flex cursor-pointer items-center gap-3 text-white"
            >
              <input
                type="checkbox"
                checked={filters.ottApps.includes(ottApp)}
                className="h-4 w-4 accent-[#58c28d]"
                onChange={() => {
                  const updated = filters.ottApps.includes(ottApp)
                    ? filters.ottApps.filter((o) => o !== ottApp)
                    : [...filters.ottApps, ottApp];
                  onFiltersChange("ottApps", updated);
                }}
              />
              <span>{ottApp}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-3">
        <button
          onClick={onClear}
          className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-medium text-zinc-400 transition hover:border-white/20 hover:text-white"
        >
          Clear
        </button>

        <button
          onClick={onApply}
          className="flex-1 rounded-xl bg-[#58c28d] py-3 text-sm font-semibold text-black transition hover:brightness-110"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}

export default FilterSidebar;