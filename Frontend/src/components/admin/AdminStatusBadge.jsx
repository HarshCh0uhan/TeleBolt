const variants = {
  active: 'border-[#58c28d]/25 bg-[#58c28d]/12 text-[#dff6ea]',
  approved: 'border-[#58c28d]/25 bg-[#58c28d]/12 text-[#dff6ea]',
  pending: 'border-yellow-400/25 bg-yellow-400/10 text-yellow-100',
  draft: 'border-white/10 bg-[#262626] text-zinc-300',
  inactive: 'border-red-400/25 bg-red-500/10 text-red-100',
  rejected: 'border-red-400/25 bg-red-500/10 text-red-100',
  review: 'border-[#58c28d]/20 bg-[#58c28d]/8 text-[#dff6ea]',
};

const AdminStatusBadge = ({ status = 'Pending', className = '' }) => {
  const key = String(status).toLowerCase();
  const tone =
    key.includes('active')
      ? variants.active
      : key.includes('approve')
      ? variants.approved
      : key.includes('pending')
      ? variants.pending
      : key.includes('reject')
      ? variants.rejected
      : key.includes('inactive')
      ? variants.inactive
      : key.includes('review')
      ? variants.review
      : variants.draft;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide ${tone} ${className}`}
    >
      {status}
    </span>
  );
};

export default AdminStatusBadge;
