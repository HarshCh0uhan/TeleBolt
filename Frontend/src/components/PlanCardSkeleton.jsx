export const PlanCardSkeleton = () => (
  <article className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#1f1f1f] animate-pulse">
    <div className="border-b border-white/10 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="h-5 w-24 rounded-full bg-[#262626]" />
          <div className="mt-4 h-8 w-3/4 bg-[#262626] rounded" />
          <div className="mt-1 h-4 w-1/2 bg-[#262626] rounded" />
        </div>
        <div className="shrink-0 h-20 w-24 rounded-2xl bg-[#262626]" />
      </div>
    </div>
    <div className="p-4 pb-0 sm:p-5 sm:pb-0">
      <div className="rounded-2xl bg-[#262626] p-4">
        <div className="h-3 w-3/4 bg-[#333] rounded" />
        <div className="mt-2 h-7 w-1/2 bg-[#333] rounded" />
      </div>
    </div>
    <div className="p-4 sm:p-5">
      <div className="h-3 w-1/4 bg-[#333] rounded mb-3" />
      <div className="space-y-2.5">
        <div className="h-12 w-full rounded-xl bg-[#262626]" />
        <div className="h-12 w-full rounded-xl bg-[#262626]" />
      </div>
    </div>
    <div className="mt-auto space-y-3 border-t border-white/10 p-4 sm:p-5">
      <div className="h-12 w-full rounded-2xl bg-[#262626]" />
      <div className="h-12 w-full rounded-2xl bg-[#262626]" />
    </div>
  </article>
);