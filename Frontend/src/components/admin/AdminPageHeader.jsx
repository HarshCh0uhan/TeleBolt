import { ChevronRight } from 'lucide-react';

const AdminPageHeader = ({ eyebrow, title, description, actions }) => {
  return (
    <div className="mb-6 rounded-3xl border border-white/10 bg-[#1f1f1f] px-5 py-6 shadow-[0_1px_0_0_rgba(255,255,255,0.02)] transition-all duration-300 hover:border-[#58c28d]/20 sm:px-6">
      {eyebrow ? (
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#262626] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-400 transition-colors duration-300 hover:border-[#58c28d]/30 hover:text-zinc-300">
          <span>{eyebrow}</span>
          <ChevronRight className="h-3.5 w-3.5 text-[#58c28d]" />
        </div>
      ) : null}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl bg-linear-to-r from-white to-zinc-200 bg-clip-text">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-zinc-400 sm:text-base max-w-prose">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div>
        ) : null}
      </div>
    </div>
  );
};

export default AdminPageHeader;