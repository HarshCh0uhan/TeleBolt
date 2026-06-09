

const PlanTracker = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="
            max-h-[90vh]
            w-full
            max-w-5xl
            overflow-y-auto
            rounded-3xl
            border
            border-white/10
            bg-[#1f1f1f]
            shadow-2xl
            scrollbar-thin
            scrollbar-track-[#1f1f1f]
            scrollbar-thumb-[#58c28d]/40
            hover:scrollbar-thumb-[#58c28d]/60
          ">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-white/10 bg-[#1f1f1f]/95 backdrop-blur-sm">
          <div className="flex items-start justify-between p-6">
            <div>
              <span className="inline-flex rounded-full bg-[#58c28d]/10 px-3 py-1 text-xs font-medium text-[#58c28d]">
                Jio
              </span>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <h1 className="text-4xl font-bold text-white">
                  ₹299
                </h1>

                <div className="h-8 w-px bg-white/10" />

                <p className="text-zinc-400">
                  28 Days Validity
                </p>

                <div className="h-8 w-px bg-white/10" />

                <p className="text-zinc-400">
                  2 GB/day
                </p>
              </div>
            </div>

            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:border-white/20 hover:text-white">
              ✕
            </button>

            {/* TODO:
                Close Modal Logic
            */}
          </div>
        </div>

        <div className="p-6">
          {/* Current Benefits */}
          <section className="mb-8">
            <h2 className="mb-5 text-xl font-semibold text-white">
              Current Benefits
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-[#262626] p-5">
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  Daily Data
                </p>

                <p className="mt-3 text-lg font-semibold text-white">
                  2 GB/day
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#262626] p-5">
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  SMS
                </p>

                <p className="mt-3 text-lg font-semibold text-white">
                  100/day
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#262626] p-5">
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  Calling
                </p>

                <p className="mt-3 text-lg font-semibold text-white">
                  Unlimited
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#262626] p-5">
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  OTT
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-300">
                    JioHotstar
                  </span>
                </div>
              </div>
            </div>

            {/* TODO:
                Populate benefit data from selected plan
            */}
          </section>

          {/* Price History */}
          <section className="mb-8 rounded-3xl border border-white/10 bg-[#262626] p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">
              Price History
            </h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-[#58c28d]" />
                  <div className="h-16 w-px bg-white/10" />
                </div>

                <div>
                  <p className="font-medium text-white">
                    ₹249
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    January 2025
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-[#58c28d]" />
                  <div className="h-16 w-px bg-white/10" />
                </div>

                <div>
                  <p className="font-medium text-white">
                    ₹279
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    March 2025
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-[#58c28d]" />
                </div>

                <div>
                  <p className="font-medium text-white">
                    ₹299
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    Current Price
                  </p>
                </div>
              </div>
            </div>

            {/* TODO:
                Fetch and render actual price history
            */}
          </section>

          {/* Detected Changes */}
          <section className="mb-8 rounded-3xl border border-white/10 bg-[#262626] p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">
              Detected Changes
            </h2>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-white">
                      Price Change
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      ₹279 → ₹299
                    </p>
                  </div>

                  <span className="rounded-full bg-[#58c28d]/10 px-3 py-1 text-xs font-medium text-[#58c28d]">
                    Approved
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-white">
                      Validity Change
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      24 Days → 28 Days
                    </p>
                  </div>

                  <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
                    Pending
                  </span>
                </div>
              </div>
            </div>

            {/* TODO:
                Fetch detected changes
            */}
          </section>

          {/* Activity Timeline */}
          <section className="mb-8 rounded-3xl border border-white/10 bg-[#262626] p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">
              Activity Timeline
            </h2>

            <div className="space-y-5">
              <div className="border-l-2 border-[#58c28d] pl-4">
                <p className="font-medium text-white">
                  Price Updated
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  June 2025
                </p>
              </div>

              <div className="border-l-2 border-[#58c28d] pl-4">
                <p className="font-medium text-white">
                  Validity Updated
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  April 2025
                </p>
              </div>

              <div className="border-l-2 border-[#58c28d] pl-4">
                <p className="font-medium text-white">
                  Plan Added
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  January 2025
                </p>
              </div>
            </div>

            {/* TODO:
                Generate timeline dynamically
            */}
          </section>

          {/* Future Analytics */}
          <section className="rounded-3xl border border-white/10 bg-[#262626] p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">
              Future Analytics
            </h2>

            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#1f1f1f]">
              <div className="text-center">
                <p className="font-medium text-zinc-400">
                  Analytics Dashboard
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  Price trends, operator insights, and plan analytics will appear here.
                </p>
              </div>
            </div>

            {/* TODO:
                Add charts
            */}

            {/* TODO:
                Add trend analysis
            */}

            {/* TODO:
                Add price prediction insights
            */}
          </section>
        </div>
      </div>
    </div>
  );
}

export default PlanTracker