export const CompareSkeleton = ({ count = 2 }) => (
  <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
    <div className={`grid gap-6 ${count === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#1f1f1f] animate-pulse">
          <div className="absolute left-5 top-5 z-10">
            <div className="h-5 w-16 rounded-lg border border-white/10 bg-[#262626]" />
          </div>
          <button className="absolute right-5 top-5 z-20 grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-[#262626]" />
          <div className="border-b border-white/10 p-4 pt-14 sm:p-6 sm:pt-14">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <div className="h-5 w-20 rounded-full bg-[#262626]" />
                <div className="mt-4 h-10 w-3/4 bg-[#262626] rounded" />
                <div className="mt-1 h-4 w-1/2 bg-[#262626] rounded" />
              </div>
              <div className="shrink-0 h-24 w-24 rounded-2xl border border-white/10 bg-[#262626]" />
            </div>
            <div className="mt-4">
              <div className="h-3 w-1/4 bg-[#333] rounded" />
              <div className="mt-1 h-6 w-1/2 bg-[#333] rounded" />
            </div>
            <div className="mt-4">
              <div className="h-3 w-1/4 bg-[#333] rounded" />
              <div className="mt-1 h-6 w-1/2 bg-[#333] rounded" />
            </div>
          </div>
          <div className="px-4 pt-4 sm:px-6 sm:pt-5">
            <div className="rounded-2xl bg-[#262626] p-4">
              <div className="h-3 w-1/3 bg-[#333] rounded" />
              <div className="mt-2 h-7 w-1/2 bg-[#333] rounded" />
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="h-3 w-1/4 bg-[#333] rounded mb-3" />
            <div className="space-y-2.5">
              <div className="h-12 w-full rounded-xl bg-[#262626]" />
              <div className="h-12 w-full rounded-xl bg-[#262626]" />
              <div className="h-12 w-full rounded-xl bg-[#262626]" />
              <div className="h-12 w-full rounded-xl bg-[#262626]" />
              <div className="h-12 w-full rounded-xl bg-[#262626]" />
            </div>
          </div>
          <div className="mt-auto px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="h-3 w-1/4 bg-[#333] rounded mb-3" />
            <div className="flex flex-wrap gap-2">
              <div className="h-8 w-24 rounded-xl bg-[#262626]" />
              <div className="h-8 w-24 rounded-xl bg-[#262626]" />
            </div>
          </div>
          <div className="border-t border-white/10 p-4 sm:p-6">
            <div className="h-12 w-full rounded-2xl bg-[#262626]" />
          </div>
        </div>
      ))}
    </div>
  </main>
);