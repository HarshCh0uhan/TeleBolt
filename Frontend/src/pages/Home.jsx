import Navbar from "../components/Navbar";
import FilterSidebar from "../components/FilterSidebar";
import PlanCard from "../components/PlanCard";
import CompareBar from "../components/CompareBar";
import mockPlans from "../data/mockPlans";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#181818]">
      {/* Navbar */}
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Search + Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Find the Best Mobile Plan
          </h1>

          <p className="mt-2 text-zinc-400">
            Compare Jio, Airtel, and VI plans side by side.
          </p>

          <div className="mt-6">
            <input
              type="text"
              placeholder="Search plans..."
              className="w-full rounded-2xl border border-white/10 bg-[#1f1f1f] px-5 py-4 text-white placeholder:text-zinc-500 outline-none focus:border-[#58c28d]/40"
            />

            {/* TODO:
                Search query state
                Search functionality
            */}
          </div>
        </div>

        {/* Validity Quick Filters */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button className="rounded-full border border-[#58c28d]/30 bg-[#58c28d]/10 px-4 py-2 text-sm text-[#58c28d]">
            All Plans
          </button>

          <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:border-[#58c28d]/20">
            28 Days
          </button>

          <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:border-[#58c28d]/20">
            56 Days
          </button>

          <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:border-[#58c28d]/20">
            84 Days
          </button>

          <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:border-[#58c28d]/20">
            365 Days
          </button>

          {/* TODO:
              Validity filter state
              Validity filtering logic
          */}
        </div>

        {/* Main Layout */}
        <div className="flex gap-6">
          {/* Sidebar */}
          <FilterSidebar />

          {/* Plans Section */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Available Plans
                </h2>

                <p className="text-sm text-zinc-500">
                  Showing telecom recharge plans
                </p>

                {/* TODO:
                    Show actual plan count
                */}
              </div>

              <div className="text-sm text-zinc-500">
                {/* TODO:
                    Active filters summary
                */}
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {mockPlans.map((plan) => (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                />
              ))}

              {/* TODO:
                  Empty state
              */}

              {/* TODO:
                  Loading state
              */}
            </div>
          </main>
        </div>
      </div>

      {/* Compare Bar */}

      {/* TODO:
          Show only when plans are selected
      */}

      <CompareBar />
    </div>
  );
}