export default function CompareBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#1a1a1a]/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left Section */}
          <div>
            <h3 className="text-lg font-semibold text-white">
              Compare Plans
            </h3>

            <p className="text-sm text-zinc-400">
              Select up to 3 plans to compare side by side
            </p>

            {/* TODO:
                Display selected plan count
                Example:
                2 of 3 plans selected
            */}
          </div>

          {/* Selected Plans Preview */}
          <div className="flex flex-wrap gap-3">
            {/* TODO:
                Map selected plans
            */}

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#262626] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">
                  Jio ₹299
                </p>

                <p className="text-xs text-zinc-500">
                  2 GB/day • 28 Days
                </p>
              </div>

              <button
                className="text-zinc-500 transition hover:text-red-400"
                aria-label="Remove plan"
              >
                ✕
              </button>

              {/* TODO:
                  Remove selected plan
              */}
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#262626] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">
                  Airtel ₹349
                </p>

                <p className="text-xs text-zinc-500">
                  2 GB/day • 28 Days
                </p>
              </div>

              <button
                className="text-zinc-500 transition hover:text-red-400"
                aria-label="Remove plan"
              >
                ✕
              </button>

              {/* TODO:
                  Remove selected plan
              */}
            </div>
          </div>

          {/* Action Button */}
          <div>
            <button className="w-full rounded-2xl bg-[#58c28d] px-6 py-3 font-semibold text-black transition hover:brightness-110 lg:w-auto">
              Compare Now
            </button>

            {/* TODO:
                Disable when less than 2 plans selected
            */}

            {/* TODO:
                Navigate to compare page
            */}
          </div>
        </div>
      </div>
    </div>
  );
}