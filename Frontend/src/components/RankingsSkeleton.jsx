export const RankingsSkeleton = ({ isPodium = false }) => {
  if (isPodium) {
    return (
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex min-w-0 flex-col rounded-3xl border border-white/10 bg-[#1f1f1f] p-5 animate-pulse sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="h-5 w-16 rounded-xl bg-[#262626]" />
              <div className="h-5 w-20 rounded-full bg-[#262626]" />
            </div>
            <div className="mt-5 min-w-0">
              <div className="h-10 w-3/4 bg-[#262626] rounded" />
              <div className="mt-1 h-4 w-1/2 bg-[#262626] rounded" />
            </div>
            <div className="mt-5 rounded-2xl bg-[#262626] p-4">
              <div className="h-3 w-1/4 bg-[#333] rounded" />
              <div className="mt-1 h-6 w-1/2 bg-[#333] rounded" />
            </div>
            <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
              <div className="h-10 w-full rounded-2xl bg-[#262626]" />
              <div className="h-10 w-full rounded-2xl bg-[#262626]" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="mt-8 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#1f1f1f] p-4 animate-pulse sm:flex-row sm:items-center sm:p-5">
          <div className="h-10 w-10 shrink-0 rounded-2xl border border-white/10 bg-[#262626]" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-4 w-16 rounded-full bg-[#262626]" />
              <div className="h-5 w-20 bg-[#262626] rounded" />
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
              <div className="h-3 w-20 bg-[#333] rounded" />
              <div className="h-3 w-24 bg-[#333] rounded" />
              <div className="h-3 w-20 bg-[#333] rounded" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:shrink-0 sm:justify-end">
            <div className="mr-auto text-left sm:mr-0 sm:text-right">
              <div className="h-2 w-12 bg-[#333] rounded" />
              <div className="h-4 w-20 bg-[#333] rounded" />
            </div>
            <div className="h-8 w-24 rounded-xl border border-white/10 bg-[#262626]" />
            <div className="h-8 w-20 rounded-xl bg-[#58c28d]/10" />
          </div>
        </div>
      ))}
    </div>
  );
};