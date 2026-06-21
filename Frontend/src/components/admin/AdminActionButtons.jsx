import { Eye, PencilLine, Trash2, Check, Ban } from 'lucide-react';

const ActionBtn = ({ title, onClick, children, tone = 'neutral' }) => {
  const style =
    tone === 'success'
      ? 'border-[#58c28d]/20 bg-[#58c28d]/12 text-[#dff6ea] hover:border-[#58c28d]/35'
      : tone === 'danger'
      ? 'border-red-400/20 bg-red-500/10 text-red-100 hover:border-red-400/35'
      : 'border-white/10 bg-[#262626] text-zinc-300 hover:border-[#58c28d]/25 hover:text-white';

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`grid h-10 w-10 place-items-center rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 ${style}`}
    >
      {children}
    </button>
  );
};

const AdminActionButtons = ({ onView, onEdit, onDelete, onApprove, onReject, compact = false }) => {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? 'justify-end' : ''}`}>
      {onView ? (
        <ActionBtn title="View" onClick={onView}>
          <Eye className="h-4.5 w-4.5" />
        </ActionBtn>
      ) : null}
      {onEdit ? (
        <ActionBtn title="Edit" onClick={onEdit}>
          <PencilLine className="h-4.5 w-4.5" />
        </ActionBtn>
      ) : null}
      {onDelete ? (
        <ActionBtn title="Delete" onClick={onDelete} tone="danger">
          <Trash2 className="h-4.5 w-4.5" />
        </ActionBtn>
      ) : null}
      {onApprove ? (
        <ActionBtn title="Approve" onClick={onApprove} tone="success">
          <Check className="h-4.5 w-4.5" />
        </ActionBtn>
      ) : null}
      {onReject ? (
        <ActionBtn title="Reject" onClick={onReject} tone="danger">
          <Ban className="h-4.5 w-4.5" />
        </ActionBtn>
      ) : null}
    </div>
  );
};

export default AdminActionButtons;
