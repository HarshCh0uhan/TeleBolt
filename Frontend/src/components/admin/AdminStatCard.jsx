import { ArrowUpRight, Sparkles } from 'lucide-react';

const AdminStatCard = ({ label, value, hint, icon: Icon, tone = 'default' }) => {
  const accent =
    tone === 'success'
      ? 'border-[#58c28d]/25 text-[#dff6ea]'
      : tone === 'warning'
      ? 'border-yellow-400/25 text-yellow-100'
      : tone === 'danger'
      ? 'border-red-400/25 text-red-100'
      : 'border-white/10 text-white';

  return (
    <div className={`group rounded-3xl border bg-[#1f1f1f] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#58c28d]/30 ${accent}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">{label}</div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</div>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-[#262626] text-[#58c28d] transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
          {Icon ? <Icon className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        </div>
      </div>
      {hint ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
          <ArrowUpRight className="h-4 w-4 text-[#58c28d]" />
          <span>{hint}</span>
        </div>
      ) : null}
    </div>
  );
};

export default AdminStatCard;
